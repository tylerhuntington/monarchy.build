# Watch the Court

The observer gives the Secretary a current view of registered task sessions and
pull requests. It reads Conductor and GitHub, then prints JSON. It never launches
agents, sends messages, changes a PR, or decides that a task is done.

This observer is separate from [the court runtime](runtime.md). Its JSON watch
list and baseline do not replace the runtime's SQLite journal of assignments,
decisions, and deliveries.

You need Python 3.9 or later on macOS or Linux. Live reads also need an
authenticated Conductor CLI with access to the registered cloud sessions, and
an authenticated GitHub CLI when a task has a PR. Local Conductor workspaces
aren't covered by this adapter.

## Register the work

From your Monarchy checkout, create a private working directory and copy the
empty example:

```bash
mkdir -p .monarchy
cp examples/court.json .monarchy/court.json
```

The empty file is valid and makes no network requests. Before adding a task,
replace every example identifier below with a real value. Put this shape in
`.monarchy/court.json`:

```json
{
  "version": 1,
  "tasks": [
    {
      "id": "search-fix",
      "repo": "example/catalog",
      "workspace_id": "workspace-id",
      "session_id": "session-id",
      "stage": "Build",
      "brief": "https://github.com/example/catalog/issues/42",
      "endpoint": "Reviewed PR with the search regression test passing",
      "pr": null
    }
  ]
}
```

The court supports up to 100 tasks, each with its own repository. Task IDs and
session IDs must be unique within the file. Set `pr` to a positive PR number when
one exists. Keep every field; unknown fields are rejected to catch typos.
`stage`, `brief`, and `endpoint` must contain text. The observer retains their
identity but doesn't open the brief or verify the endpoint.

This is a watch list, not an ownership grant. Before changing `session_id`,
complete the supervised handoff and retain its evidence. The observer checks the
session's native session and workspace IDs. It does not establish that the
workspace belongs to `repo`; verify that binding when registering the task.

## Check once

From the Monarchy checkout, validate the court without contacting either service:

```bash
python3 bin/monarchy.py check --court .monarchy/court.json
```

A valid file returns `"valid": true` and its task count. To read live state:

```bash
python3 bin/monarchy.py status --court .monarchy/court.json
```

The result has one row per task. Each row contains the session status, optional
PR state, and any read errors. A failed session read doesn't hide that task's PR
or the other tasks. Native timestamps, transcripts and raw command errors are
excluded from the output.

An `idle` session needs inspection: its last turn ended. Its work, background
processes and external effects may still be unfinished. A merged PR likewise
doesn't prove a deployment or an acceptance test passed.

## Wait for a change

From the same checkout, run a bounded watch:

```bash
python3 bin/monarchy.py watch \
  --court .monarchy/court.json \
  --state .monarchy/watch.json \
  --interval 30 \
  --timeout 600
```

`--interval` is the delay in seconds between observations; `--timeout` bounds
the watch in seconds. Defaults are 30 and 600. Each external command also has a
15-second timeout, reduced to the remaining watch time. Slow reads can exhaust
the watch deadline; unread rows are then reported as errors.

The first run saves a baseline. It returns immediately for a task already idle,
errored (`error`), cancelled, or unreadable. Subsequent runs return when a session
status, PR head, PR state, error, or task registration changes. A changed task
binding includes changes to its repository, session, stage, brief or endpoint.
Changing the session can't inherit the previous session's unchanged baseline.

The watch reloads the court every cycle. An empty court returns immediately.
Otherwise, a quiet watch returns at its deadline. Persistent errors remain in
the result without producing the same change event every cycle. Recovery
produces a new change event.

A timeout returns the latest completed observation. Its `observed_at` stays at
the time those reads finished, even when the watch then waited before returning.
It doesn't imply a fresh read at the deadline; use `status` when you need another
snapshot.

`watch` writes only the selected local state file and its adjacent `.lock` file,
creating their parent directory if needed. State writes replace the file
atomically. A lock prevents two watchers from using the same state at once.
Use a separate state file for each court. Malformed or mismatched state produces
an error instead of silently starting over.

The Secretary reads the result and chooses the next authorized action. The
watch doesn't wake a stopped agent or install a background service. After a
crash, read current status and compare it with retained task and handoff records:
the state file is a change baseline, not a durable message queue or acceptance
record. Keep it on persistent storage if the working machine is disposable.

## Read the result

| Field | Meaning |
|---|---|
| `reason` | `snapshot`, `changed`, `timeout`, or `empty` |
| `observed_at` | UTC timestamp of the completed observation |
| `tasks` | Observations keyed by your stable task ID |
| `changes` | Task IDs with `initial-attention`, `configuration-changed`, or `observation-changed` |
| `degraded` | At least one native read failed |

Each task has a full SHA-256 `binding` for its registration, `session` (status
or null), `pr` (state, merged flag, full head SHA, or null), and `errors`.
An error never becomes a successful observation. Native session status strings
are reported as supplied; unfamiliar states need inspection.

Exit codes are `0` for a healthy result (including an empty court or timeout),
`1` for invalid input, state/file errors or degraded observations, `2` for command
usage errors, and `130` for interruption. Successful commands and operational
errors print JSON to standard output; usage errors use argparse's standard error
output.

The observer doesn't read CI checks, review verdicts, merge queues, deployments,
00 agent reports or owner decisions. Project-specific verification still belongs
in the brief and handoff. The lock protects the observer's state file; it doesn't
fence 00 agent processes or enforce exclusive execution.
