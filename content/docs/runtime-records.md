# The court keeps its receipts

`monarchy.records.CourtRecords` keeps task assignments, incoming reports,
decisions, results, and external-operation receipts in one private SQLite
database. It uses only Python's standard library. Opening the database starts
no agents, installs no hooks, and sends no messages.

```python
from monarchy.records import CourtRecords

with CourtRecords("/private/court/records.sqlite3") as records:
    task = records.create_task(
        "export-17", "example/project", "worker-4",
        metadata={"brief": "Fix the CSV export", "source": "full-source-revision"},
    )
    records.record_event(
        "report-91", task["task_id"], task["generation"], "worker-4",
        "needs_decision", {"question": "Should the export include archived rows?"},
    )
    claim = records.claim_events("secretary", task["task_id"])
    # Save the resulting decision or outcome before acknowledging its input.
    records.open_decision("decision-91", task["task_id"], claim["events"][0]["payload"])
    records.ack_events(claim["claim_id"], "secretary", claim["event_ids"])
```

Keep this file outside the repository and in a private directory. New database
files use mode `0600`; newly created parent directories use `0700`. An existing
database with group or other permissions is rejected, as is a database symlink
on platforms with `O_NOFOLLOW`. Existing directory permissions are not changed.
Use one `CourtRecords` instance per thread or process.

## What survives a handoff

A task has one owner and a monotonically increasing assignment generation.
`assign_task` compares the caller's expected generation before changing the
owner. Old 00 agents cannot append new reports, and old claims cannot acknowledge
reports after that change. An exact retry of an already recorded report remains
harmless. Reassignment releases unfinished claims so the next Secretary can
read their events. It does not stop a native 00 agent or prove that its commands
have stopped; the host must establish that before handing work over.

Event IDs identify immutable envelopes: task, generation, actor, kind, and JSON
payload. Reusing an ID with different content raises `Conflict`. Claims contain
an exact set of at most 100 events. Only the named actor can acknowledge members
of that set. A later report is not swept up by an earlier acknowledgment.
An active claim is returned again after restart until processed or released by
reassignment. Stable logical actors such as `secretary` allow session succession;
the host must bind the current session to that actor.

Outcomes have their own stable IDs and explicit recipients. Presenting a batch
records what was shown; it does not mark those outcomes processed. Processing
requires the presentation ID, its actor, and explicit outcome IDs. Both steps
survive restart. Recording a result, acknowledging an event, or receiving a
00 agent's `done` report never answers a pending decision.

Decisions retain an independent revision history. An answer names the expected
revision and the owner's message reference. Revising the question creates a new
pending revision, preserving the old answer without carrying its authority
forward. An owner-message reference is evidence supplied by the caller, not
proof of a human sender. The supervisor must verify the native source and bind
the decision to the appropriate task generation.

Replaying `open_decision` compares the original task and payload against revision
one, then returns the current revision without changing it. This lets a report
recover after a crash even when its question has since been clarified or answered.
Reusing its ID with different creation content still fails.

## Before an external action

Prepare an operation with a stable ID and immutable request before calling an
external service. The request should retain the native target, message or
session ID, exact content, and assignment `generation`. The record layer does
not invent a new native ID when recovering an operation.

```text
prepared → in_flight → confirmed
                    ↘ unknown → confirmed or failed
prepared or in_flight → failed
```

Admission from `prepared` to `in_flight` is exclusive. Two callers cannot both
receive permission to perform the same operation. If `request.generation` is
present, admission checks it against the task assignment in the same database
transaction. Reassignment is blocked while any operation on the task is
`in_flight` or `unknown`. These fences prevent a concurrent reassignment and send
from both proceeding. Callers must include the generation for assignment-bound
actions; requests without it retain only the operation and reassignment fences.

For an answer delivery, also include `decision_id` and `decision_revision` in the
request. They must appear together and refer to a decision on that task. Admission
checks the current revision is still answered in the same transaction. Revising
that decision is blocked while its delivery is `in_flight` or `unknown`. A
concurrent question revision and send therefore cannot both proceed. Callers
must include these fields for decision-bound actions; text containing an answer
does not establish that binding by itself.

After a timeout or lost response, mark the operation `unknown` and read the
native service to reconcile its stable ID. An `in_flight` operation found after
restart needs the same reconciliation. Neither state can return to `prepared`
or enter `in_flight` again. A retry of `prepare_operation` returns the existing
state without resetting it. Terminal receipts can be repeated with exactly the
same content. Records do not establish that an external action happened: the
adapter must supply readback evidence, and must not send after admission fails.

## Python interface

Methods return dictionaries with the stored fields and UTC timestamps. IDs use
1–128 ASCII letters, digits, dots, colons, underscores, or hyphens, starting with
a letter or digit. Repository names use `owner/repository`. JSON object payloads
are limited to 64 KiB, 16 nesting levels, and 4,096 values; unsupported values,
nonfinite numbers, and oversized integers are rejected. Stored IDs and JSON are
validated when read. This is a record API, not an arbitrary instruction or SQL
import interface; databases containing triggers or views are rejected.

| Work | Methods |
| --- | --- |
| Assignments | `create_task(task_id, repository, owner, metadata=None)`, `get_task(task_id)`, `assign_task(task_id, owner, expected_generation=..., metadata=None)` |
| Reports | `record_event(event_id, task_id, generation, actor, kind, payload)`, `get_event(event_id)`, `claim_events(actor, task_id, limit=100)`, `ack_events(claim_id, actor, event_ids)` |
| Results | `record_outcome(outcome_id, task_id, payload, recipient="queen")`, `get_outcome(outcome_id)`, `present_outcomes(actor, limit=100)`, `process_outcomes(presentation_id, actor, outcome_ids)` |
| Decisions | `open_decision(decision_id, task_id, payload)`, `get_decision(decision_id, revision=None)`, `answer_decision(decision_id, answer, expected_revision=..., owner_message=...)`, `revise_decision(decision_id, payload, expected_revision=...)` |
| Operations | `prepare_operation(operation_id, task_id, kind, request)`, `get_operation(operation_id)`, `set_operation_state(operation_id, state, expected_state=..., result=None)` |

The metadata, recipient, expected generation/revision/state, owner-message, and
result arguments shown above are keyword-only. Task metadata stays unchanged
until a successful reassignment; supplying new metadata replaces the whole object.
Generation and revision counters start at one. Claim and presentation IDs are
generated once with UUIDs and persisted; other IDs come from the caller.

`list_tasks`, `list_events`, `list_outcomes`, `list_decisions`, and
`list_operations` accept keyword-only `limit` (1–100) and `offset` (default zero).
Events and outcomes can filter by `task_id` and `processed`; outcomes also by
`recipient`. Decisions list only their current revision, with optional `task_id`
and `state` (`pending` or `answered`). Operations accept `task_id` and a `states`
list. Task and decision lists sort by ID; events and outcomes by insertion
sequence; operations by ID.

An offset is pagination, not a snapshot. Avoid changing the filtered set while
paging it. To check for an outstanding obligation, query the appropriate filter
with `limit=1`; do not interpret a full page as the complete set. Empty claim or
presentation requests return `None`. Invalid inputs raise `RecordError`;
conflicting identities or state raise `Conflict`; stale assignment generations
raise its subclass `StaleGeneration`.

## Durability has a boundary

Each mutation commits in a SQLite `BEGIN IMMEDIATE` transaction with foreign
keys and `synchronous=FULL`. SQLite serializes writers; readers and writers use
the same canonical database. Its rollback journal may exist alongside the
database during writes. No separate JSON checkpoint can override these records.
Save derived records before acknowledging their source event; stable IDs make
repeating that sequence after a crash safe.

The tests cover concurrent writers, conflicting duplicates, exact acknowledgment
sets, exclusive send admission, reassignment races, process exit without a clean
close, pending decisions, and replay of presented outcomes. They prove local
record behavior, not delivery through a native Conductor session. SQLite's
durability depends on the filesystem and storage honoring its synchronization
contract. A lost cloud VM or deleted disk can lose the database. Host-loss
recovery needs a separate backup or durable-volume policy and a tested restore;
this module supplies neither. Do not copy a live database file without a
SQLite-consistent backup procedure.

Actors and recipients are trusted caller assertions. The store does not
authenticate native sessions, inspect owner authority, verify code, enforce
project policy, or determine whether a task is complete. File permissions also
do not isolate another process running as the same OS user. Do not treat an
untrusted database file as a safe import format.

## Where the contracts came from

This is a Python/SQLite implementation of selected First Mate behavior, reviewed
at commit `427056c4181c41074ad24f051f79919330df0fa5`. It is not a claim that shell
and native Conductor transports are interchangeable:

- [Wake queue](https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/bin/fm-wake-lib.sh): retain exact event ownership and generation fences.
- [Wake queue tests](https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/tests/fm-wake-queue.test.sh): preserve reports arriving after a drain and reject stale acknowledgments.
- [Task inbox](https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/bin/fm-task-inbox-lib.sh): deduplicate stable deliveries without treating changed content as a retry.
- [Branch outcomes](https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/bin/fm-branch-outcome.sh): keep presentation separate from processing.
- [Captain holds](https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/bin/fm-captain-hold.sh): keep operator decisions separate from 00 agent lifecycle reports.

SQLite replaces local file-and-shell record mechanics so independent cloud
processes can share one transactional record layer. Native message provenance,
prompt handling, and reconciliation remain adapter responsibilities. The tests
exercise the preserved contracts against this implementation; they do not claim
verbatim reuse or live First Mate/Conductor verification.
