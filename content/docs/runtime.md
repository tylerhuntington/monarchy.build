# Run the court

The Secretary has a desk now: one private SQLite journal for assignments,
reports, decisions and delivery receipts. Each command does one job and exits.
Nothing starts just because you clone the repo.

This is an opt-in runtime for Conductor cloud. See [qualification](planning/firstmate-adoption.md)
before relying on it unattended. The existing watcher remains read-only.

## Give the Secretary a brief

Run commands from this checkout with Python 3.9 or newer. Keep the database and
input files in a private directory outside the repository. The examples use
`/path/to/private/court.db`; replace it with your own path.

Write a task JSON file with these fields:

```json
{
  "task_id": "investigate-tests",
  "repository": "example/project",
  "owner": "22222222-2222-4222-8222-222222222222",
  "metadata": {
    "authority_ref": "reference-to-the-original-user-request",
    "agent_name": "Investigate tests",
    "brief": "Investigate the failing test. Report evidence. Do not change files.",
    "court_id": "my-court",
    "binding": {
      "workspace_id": "11111111-1111-4111-8111-111111111111",
      "session_id": "22222222-2222-4222-8222-222222222222",
      "repo": "example/project",
      "profile": {"agent": "codex", "model": "explicitly-selected-model", "effort": "high", "fast_mode": false}
    },
    "secretary_binding": {
      "workspace_id": "33333333-3333-4333-8333-333333333333",
      "session_id": "44444444-4444-4444-8444-444444444444",
      "repo": "example/project",
      "profile": {"agent": "codex", "model": "explicitly-selected-model", "effort": "high", "fast_mode": false}
    }
  }
}
```

For a new task session, `metadata.agent_name` supplies its readable descriptor.
`"Investigate tests"` becomes `00-investigate-tests`; `"00-docs"` keeps a single
prefix. Omit it to derive the name from the task ID. Existing session names and
native identities are preserved when sending another assignment.

Use actual native IDs and the profile the user selected. The 00 agent binding must
match the task owner and repository. The Secretary may live in another workspace
or repository. Give the 00 agent the court ID, task ID, assignment generation and
Secretary destination, plus the project's own rules and selected
[skill package](skills.md). A reference to permission does not broaden it.

```sh
python3 -m monarchy --state /path/to/private/court.db register /path/to/private/task.json
python3 -m monarchy --state /path/to/private/court.db prepare-dispatch investigate-tests
python3 -m monarchy --state /path/to/private/court.db deliver OPERATION_ID
```

Preparation only journals the intent. `deliver` is the explicit external action.
For a fresh session in an existing workspace, reserve a new session UUID in the
binding and add `--new-session` to `prepare-dispatch`. The current CLI cannot
explicitly turn fast mode off for a new session, so that profile is held before
creation. Existing sessions with fast mode off can still receive messages.
Creating workspaces remains
a host action; the adapter does not pretend an ambiguous workspace create is safe
to repeat.

## Keep the chatter off the throne

00 Agents send the [native report envelope](conductor-transport.md) to the Secretary.
The Secretary ingests its native event ID, then takes one bounded pass:

```sh
python3 -m monarchy --state /path/to/private/court.db ingest investigate-tests NATIVE_EVENT_ID
python3 -m monarchy --state /path/to/private/court.db tick investigate-tests
python3 -m monarchy --state /path/to/private/court.db status investigate-tests
```

Explicit routine progress stays quiet. Blockers, failures, uncertain reports and
completion claims go to the Secretary's inbox. Decisions go to the Queen.
Unfamiliar reports stay visible for diagnosis. A report from another assignment
cannot take over the current task.

```sh
python3 -m monarchy --state /path/to/private/court.db inbox --actor secretary
python3 -m monarchy --state /path/to/private/court.db inbox
```

Opening an inbox does not clear it. When you have handled specific outcomes, use
`ack PRESENTATION_ID OUTCOME_ID...`, with the same actor. Acknowledging a displayed
question does not answer its decision record.

The runtime uses a pull inbox. It does not inject routine messages into the
Queen's conversation. A host that adds notifications must hold them while the
owner has an open prompt, or while prompt state is unknown. The current native
CLI does not prove that prompt state.

## Take an answer back to the 00 agent

The Queen obtains your answer through the host's trusted owner conversation.
She records a JSON answer and that message's reference:

```sh
python3 -m monarchy --state /path/to/private/court.db answer DECISION_ID /path/to/private/answer.json --revision 1 --owner-message TRUSTED_OWNER_REFERENCE
python3 -m monarchy --state /path/to/private/court.db prepare-answer DECISION_ID
python3 -m monarchy --state /path/to/private/court.db deliver OPERATION_ID
```

`answer.json` is an object, for example `{"text": "Keep the original scope."}`.
The journal retains it; it does not authenticate a person. A native message with
no sender metadata is not proof that the user approved anything. Never turn a
00 agent's claimed permission into an answer.

An answer is tied to the decision revision and 00 agent generation. After a handoff,
the Secretary must reconcile the old obligation explicitly. It cannot quietly
send the old answer to a replacement 00 agent.

## Check the work before calling it done

A 00 agent's completion report needs a full source revision. An independent
reviewer checks that exact revision, reads the current revision back from the
repository, and supplies an evidence file:

```json
{
  "source_revision": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "observed_revision": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "reviewer": "independent-review-session",
  "evidence": {"checks": ["Exact command, result and durable evidence link"]}
}
```

```sh
python3 -m monarchy --state /path/to/private/court.db verify investigate-tests /path/to/private/review.json
```

Verification refuses a stale source, a review by the assigned 00 agent, unanswered
decisions, undigested reports, or unfinished delivery. Accepted evidence creates
a result in the Queen inbox. These checks validate the record contract; the
reviewer still has to run the checks and supply honest evidence.

## Pick up where you left off

Use the same database after a restart. `tick` resumes an unfinished event claim.
`inbox` returns the unprocessed presentation. `deliver` reconciles an uncertain
operation using its original native identity; it does not send it again.

An unknown result stays unknown until readback proves otherwise. Do not delete
it, replace its ID, or start a second 00 agent to make the warning go away. Session
idle status alone proves neither completion nor that subprocesses have stopped.
Keep one Secretary writer for a court. These cooperative records do not isolate
hostile processes running as the same operating-system user.
