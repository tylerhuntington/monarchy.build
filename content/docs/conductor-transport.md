# Conductor transport

`monarchy/conductor.py` provides explicit Python operations for Conductor cloud.
Importing it starts nothing. It creates no workspaces, hooks, services, or model
defaults. It does not archive or cancel sessions.

The caller owns the private operation journal, court membership, and authority
to act. The adapter checks native identities and delivery evidence. A confirmed
message means Conductor accepted the matching message; it does not mean the
agent ran it, understood it, or finished the task.

## Native contract

The contract was inspected in the installed Conductor CLI's help and bundled
public schemas on 2026-11-16, with read-only native probes. The adapter uses
`conductor --json` and an argument array, never a shell command string.

| Native read | Fields used |
| --- | --- |
| `workspace get` | `id`, `repoUrl` |
| `session status` | `sessionId`, `workspaceId`, `status` |
| `session get` | `id`, `model`, `resolvedModel`, `effort`, `fastMode` |
| `session message` | `data`, `offset`, `hasMore`; each event's `id`, `sessionId`, `type`, `content` |
| `message get` | One native event with the same message-event shape |

The session read does not expose its agent type. An expected `agent` therefore
appears in `profile_unobserved`, and `profile_verified` stays false. Missing
model, effort, or fast-mode fields also remain unobserved. An observed mismatch
fails the binding check. The requested model is compared to `model`; a separate
`resolvedModel` is recorded without treating it as permission to change models.

The initial repository binding supports GitHub `owner/repository` identities,
with native HTTPS or `git@github.com:` URLs. Other forges need an explicit identity
adapter; they do not silently match a GitHub repository by path.

### Request IDs and event IDs differ

A native transcript event has a top-level `id` matching `content.eventId`.
For a `userMessage` event, `content.id` is the retained user-message UUID.
`message get` addresses the native event ID; a read-only probe did not resolve
the user-message UUID through that command.

Reconciliation therefore scans the intended session's transcript for the original
`content.id`, then checks its recipient and exact text. If the caller supplies
an expected sender session, that native sender must match too. It never invents
a new message ID after a timeout.

## Python API

`ConductorTransport(runner=None, timeout=15, max_pages=5,
max_output_bytes=2097152)` accepts a `subprocess.run`-compatible runner. Every
public operation has one wall-clock deadline shared across its CLI calls. Each
transcript page is capped at 100 events; page count and accepted JSON size are
bounded. The subprocess runner captures output before the JSON size check.
Callers needing a stricter streaming output limit can inject such a runner.

The runner receives `shell=False`, a remaining timeout, and message text on
standard input through `--message-file -`. Native stdout, stderr, and message
bodies are never included in transport diagnostics.

A session binding is a plain dictionary:

```python
binding = {
    "workspace_id": "recorded-workspace-id",
    "session_id": "recorded-session-id",
    "repo": "example/project",
    "profile": {
        "agent": "chosen-agent",
        "model": "chosen-model",
        "effort": "chosen-effort",
        "fast_mode": False,
    },
}
```

`read_binding(binding)` reads the workspace, native membership, and observable
profile. It returns the observations with `profile_unobserved` and
`profile_verified`. Native idle status is reported as status, never completion.

The intent factories perform no I/O:

- `prepare_message(task_id, binding, text, *, operation_id=None,
  message_id=None, sender_session_id=None)`
- `prepare_session(task_id, workspace_id, repo, profile, name, text, *,
  operation_id=None, session_id=None, message_id=None, sender_session_id=None)`

They return `{operation_id, task_id, kind, request, state, result}` with state
`prepared`. The request contains the binding, original text and stable message
UUID. Session creation also retains its session UUID and name and requires all
four requested profile fields. Generated IDs must be persisted with the intent
before executing it. Do not rebuild a factory result to retry an earlier intent.

The installed CLI can explicitly enable fast mode with `--fast-mode`, but it has
no flag to explicitly disable it. Omitting the flag leaves the value to the host.
Consequently, a prepared session request with `fast_mode=False` is held with a
`TransportError` before any native create or journal transition. Use a separately
created session whose observed profile matches for message delivery, or wait for
an adapter with a verified way to send false. Existing uncertain session requests
still receive read-only reconciliation. No typed Conductor session-creation tool
is available in the inspected environment as an alternative.

Explicit writes are `send_message(operation, persist)` and
`create_session(operation, persist)`. `persist` must synchronously save the
entire passed operation or raise. It receives a separate dictionary, so changing
it cannot rewrite the adapter's in-memory request.

## Journal transitions

1. The caller saves the immutable `prepared` intent under its unique operation ID.
2. The adapter checks native target bindings. It calls `persist` with
   `state="in_flight"` before the first native write. A failed save prevents it.
3. The adapter makes at most one create call for that prepared intent, retaining
   the original session/message IDs. It reads back the result even if the write
   command failed or timed out, when the operation's deadline still permits it.
4. It calls `persist` with `confirmed` only when the original message is observed
   with matching binding and content. Otherwise it saves `unknown` with a safe
   reason. Unknown includes unavailable reads, profile mismatches, scan limits,
   missing messages, and unfinished session admission.

Calling a write method with a restored `in_flight` or `unknown` record performs
only reconciliation reads. `reconcile(operation)` also performs only reads and
returns the new record for the caller to save. A missing result is not evidence
that the write failed, and never triggers another create call.

`confirmed` and caller-established `failed` records are terminal and are returned
without another native operation. The adapter does not infer a definitive failure
from a network error. The caller must enforce immutable request fields, compare-
and-swap transitions, and one executor per operation through its journal.

If the process dies after the write or the final save fails, the durable record
remains `in_flight`. Reconcile that record. Do not reset it to `prepared`.

Session admission is confirmed only after the retained initial message is found
in the expected session. Its result still lists profile fields the native CLI
cannot verify; confirmation is not a claim of complete profile verification.

## Reports between workspaces

00 Agents send a JSON report as ordinary message text. They do not need access to
the Queen's checkout. `report_text(envelope)` validates and serializes this shape:

```json
{
  "version": 1,
  "kind": "monarchy.report",
  "court_id": "court-1",
  "task_id": "task-1",
  "attempt_id": "attempt-1",
  "report_id": "33333333-3333-4333-8333-333333333333",
  "sender_session_id": "recorded-worker-session",
  "recipient_session_id": "recorded-secretary-session",
  "report": {
    "status": "progress",
    "summary": "The requested check completed.",
    "evidence": [{"source": "retained-artifact"}],
    "next_action": "Review the result."
  }
}
```

Report statuses are `progress`, `blocked`, `complete`, `failed`, and `decision`.
Those are 00 agent claims for the coordinator to evaluate. A `decision` report
requires a nonempty `question` and may include a `recommendation`. It requests a
decision; it cannot grant approval. The report schema has no approval or
authority-grant message kind.

Only a `progress` report may include `routine`, and it must be an explicit
boolean. Missing `routine` is not permission to quiet a report. A `complete`
report may include `source_revision`, which must be a full 40- or 64-character
lowercase hexadecimal Git object ID. The coordinator verifies the evidence
against that revision before accepting completion.

`accept_report(event_id, court_id, recipient_binding, members)` fetches the native
event itself. `members` maps currently assigned sender session IDs to a binding
plus `court_id`, `task_id`, `attempt_id`, and role (`worker` or `secretary`). The
caller builds this map from its canonical current assignments, excluding retired
attempts. The adapter checks:

- The native destination matches the recorded recipient session.
- `content.senderSessionId` matches the envelope and active membership.
- Court, task, and attempt match the sender's assignment.
- The sender's native session still belongs to its recorded workspace and repo.

The result contains the envelope and native provenance with
`owner_authority=False`. The caller records `report_id` and native event ID to
deduplicate report processing and supplies the durable acknowledgement route.
The transport alone does not run a report poller or acknowledgement service.

## Authority remains explicit

`classify_provenance` examines only native message metadata. A sender session
marks an agent message; API-key and external-source markers identify those
origins. A bare `senderId`, a `userMessage` label, or the absence of agent markers
does not prove that a person supplied new authorization. Such messages remain
`unverified`. This CLI contract has no verified positive human-authority marker,
so the adapter never grants owner authority.

Names or approval claims inside message text cannot change that classification.
An owner decision needs the separately verified owner-input path and its exact
scope. A valid 00 agent report cannot widen its assignment.

## Verification and limits

The unit suite injects a runner for every transport call. It covers wrong
bindings and profiles, uncertain write outcomes, retained IDs, pagination limits,
persistence failure before a write, cross-workspace sender checks, stale
assignments, and absent human provenance. It makes no native mutations.

Run it from the repository root:

```bash
python3 -m unittest discover -s tests -v
git diff --check
```

Native create/send/report qualification is separate. A compatible CLI, configured
credentials, and passing offline tests do not prove a live transport. Long session
histories may exhaust the bounded transcript scan; the operation stays unknown
until a separately bounded reconciliation observes the retained request.
