# CLI reference

Monarchy has two command-line entry points. The orchestration runtime keeps the private
journal and explicitly delivers work. The observer reads session and PR status.
Neither starts a background service.

Run these commands from the cloned Monarchy repository, with Python 3.9 or later.
Replace `/path/to/private/court.db` with a path outside the checkout. For a first
assignment, follow [Run your empire](/docs/runtime) before using this reference.

## Orchestration runtime

The runtime requires `--state` before the subcommand:

```sh
python3 -m monarchy --state /path/to/private/court.db COMMAND
```

Commands return JSON on standard output. Opening the runtime may create the
private database; reading `--help` does not. There is no default state path.

| Command | Arguments and options | Effect |
| --- | --- | --- |
| `register` | `FILE` | Reads a task JSON object and records its assignment and native bindings. |
| `prepare-dispatch` | `TASK` · optional `--new-session` | Saves a dispatch intent. Does not send or launch. |
| `deliver` | `OPERATION_ID` | Performs an admitted operation, or reconciles an uncertain result using its original native identity. |
| `ingest` | `TASK EVENT_ID` | Reads a native report, verifies its sender and records it. |
| `tick` | `TASK` | Processes one bounded pass through the task's incoming reports. |
| `status` | `TASK` | Returns the task's current journal state. |
| `inbox` | optional `--actor queen\|secretary` | Presents pending outcomes. The default actor is `queen`. Does not consume them. |
| `ack` | `PRESENTATION_ID OUTCOME_ID...` · optional `--actor queen\|secretary` | Acknowledges only the named outcomes from that actor's presentation. |
| `answer` | `DECISION_ID FILE --revision INTEGER --owner-message REFERENCE` | Records an answer obtained from the trusted owner conversation. Both options are required. |
| `prepare-answer` | `DECISION_ID` | Saves a scoped answer-delivery intent without sending it. |
| `verify` | `TASK FILE` | Records independent evidence tied to the task's exact source revision. |

`FILE` inputs must contain a JSON object no larger than 64 KiB. The runtime guide
provides the [task, answer and review document formats](/docs/runtime). Task and
operation IDs come from those records; the uppercase names above are placeholders.

Native delivery and report ingestion use the authenticated Conductor CLI. They
need valid native session bindings, not just a task name. The current CLI cannot
explicitly disable fast mode while creating a session, so that new-session
profile is held. An existing matching session can still receive an assignment.

### Read an inbox

From the Monarchy checkout, inspect the Secretary's pending outcomes:

```sh
python3 -m monarchy --state /path/to/private/court.db inbox --actor secretary
```

Use the returned presentation and outcome IDs after handling the outcomes:

```sh
python3 -m monarchy --state /path/to/private/court.db ack PRESENTATION_ID OUTCOME_ID --actor secretary
```

Reading the inbox again after a restart returns an unprocessed presentation.
Acknowledging a question does not answer its decision record. Answers use the
separate `answer` command and must come from the trusted owner conversation.

### Prepare, then deliver

For a registered task named `investigate-tests`, prepare the brief from the
Monarchy checkout:

```sh
python3 -m monarchy --state /path/to/private/court.db prepare-dispatch investigate-tests
```

Preparation returns a journaled operation. Inspect it, then use its actual ID:

```sh
python3 -m monarchy --state /path/to/private/court.db deliver OPERATION_ID
```

An uncertain delivery stays uncertain until native readback resolves it. Keep
the original operation ID. Replacing it to try again risks sending the same work
twice. The [transport reference](/docs/conductor-transport) explains the receipts.

### Errors and help

Handled input, record and transport failures exit with code `1` and a generic
diagnostic. The command deliberately omits private input from that message.
Argument parsing errors exit with code `2`. A successful command exits with `0`;
inspect its JSON result for the actual operation state.

From the Monarchy checkout, inspect command syntax without opening state:

```sh
python3 -m monarchy --help
python3 -m monarchy --state /path/to/private/court.db answer --help
```

The runtime parses no environment-variable configuration of its own. Native
Conductor authentication and host configuration remain the responsibility of
that CLI and the host.

## Read-only observer

The observer uses a JSON watch list, not the runtime database. It can read
Conductor session status and GitHub PR state; it cannot determine whether work
passed review or authorize the next action.

| Command | Required options | Optional options |
| --- | --- | --- |
| `check` | `--court FILE` | None |
| `status` | `--court FILE` | None |
| `watch` | `--court FILE --state FILE` | `--interval SECONDS` (default `30`), `--timeout SECONDS` (default `600`) |

`check` validates the local watch list without network access. `status` reads
the configured sessions and PRs once. `watch` polls for a change, saves its local
observation state and exits on a change, an empty task list or the deadline. Interval
and timeout must be positive finite numbers. The watch list and state must be
different files; only one watcher may own a state file at a time.

From the Monarchy checkout, validate the included empty example:

```sh
python3 bin/monarchy.py check --court examples/court.json
```

It returns `"valid": true` with zero tasks. For a configured team, take one
snapshot:

```sh
python3 bin/monarchy.py status --court .monarchy/court.json
```

An observation with errors is marked `degraded` and exits `1`. Validation and
local file errors also exit `1`; interruption exits `130`. A healthy snapshot or
bounded watch exits `0`, including an ordinary timeout. Argument parsing errors
exit `2`.

Live session reads need Conductor access. PR reads need an authenticated `gh`
CLI. An idle session means its turn ended, not that the requested result passed.
See [Watch your agents](/docs/observer) for the watch-list schema and output fields.
