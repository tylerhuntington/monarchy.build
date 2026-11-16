# Run the Court in Conductor

Use one Monarchy cloud workspace for the Queen and Secretary, and one isolated
project workspace per independent task. Sequential stages can share a task
workspace after a verified handoff.

This guide uses the Conductor CLI. Check `conductor --help` and `conductor model`
on the host before dispatch. Local Mac workspaces require the app's own controls;
this CLI integration is for cloud workspaces.

Use [the runtime guide](runtime.md) for journaled dispatch, report ingestion,
decisions, and delivery recovery. The steps here establish the native sessions
that guide binds to. Cloning Monarchy creates none of them.

## Establish the leadership

The owner starts the Queen. Under that assignment, establish a Secretary session
in the same Monarchy workspace with the selected profile, its role instructions,
and the court's scope. Record both native session IDs in `.monarchy/leadership.md`
and have the Secretary verify its assignment.

The current CLI can enable fast mode but cannot explicitly disable it. The
runtime therefore holds new-session requests with `fast_mode=False`. For that
profile, use a separately created session and verify its observed fields before
dispatch. Do not treat an omitted flag as proof of the requested setting.

A new Queen or Secretary follows [succession](succession.md). Do not take over a
session because its title resembles a role, or supervise an existing workspace
without a direct assignment or an authorized handover.

## Send a complete assignment

In the Monarchy workspace, prepare `.monarchy/task.md` from
`templates/brief.md`. Include the contents of `roles/worker.md` and all needed
project references. A task workspace cannot assume access to the Monarchy
checkout or the Queen's conversation.

Name each new task session `00-<descriptor>`, with two numeric zeros and a short
job description: `00-tests`, `00-docs`, or `00-build-fix`. The name is a label;
keep using the recorded native ID to address the session.

Workspace creation remains an explicit host action. Record the intended task,
chosen profile, and create attempt before using the host's controls. Retain the
returned workspace and session IDs. If creation has an uncertain result, search
before another attempt. With `TASK_NAME` set to the recorded workspace name:

```bash
conductor --json workspace list --name "$TASK_NAME" --limit 100
```

List results are paginated. Follow `hasMore` using `--offset` and inspect every
plausible match. Workspace creation is not idempotent; a missing first-page match
is not evidence that it failed.

With `WORKSPACE_ID` and `SESSION_ID` set to the recorded identities, read them back:

```bash
conductor --json workspace get "$WORKSPACE_ID"
conductor --json session get "$SESSION_ID"
conductor --json session status "$SESSION_ID"
```

Verify the repository, workspace/session relationship, observable profile fields,
and task scope before registering the task in the runtime journal. The native
readback does not expose the agent type; missing fields remain unobserved. Native
title or model labels do not prove billing entitlement or approval provenance.
The observer's `.monarchy/court.json` is an optional watch list, not the runtime
record. Do not change a model or billing route after failure without applicable
authority.

## Move to the next stage

Complete the handoff through predecessor quiescence and successor assignment.
Keep the successor's first message limited to validation before writing. Prepare
`.monarchy/next-stage.md` with the role, brief, exact source, handoff, and checks.

Bind the successor through the supervised handoff, then use the runtime's
dispatch preparation and explicit delivery. For a supported new-session profile,
preparation retains the session and initial-message UUIDs before creation. An
uncertain delivery stays in the journal and receives readback, not another create
call. Verify the new session independently, retain its acceptance, and update any
watch register. A fresh review session checks the exact current source.

## Reports and decision prompts

Put the report destination in the brief. Prefer the project's existing durable
record for routine updates, subject to its publication rules. Agent-to-agent
messages must stay within the authorized court and task scope. They carry facts
and instructions within existing authority, not new owner approvals.

The runtime verifies structured reports against the native sender and current
assignment. Its pull inbox holds decisions and checked results for the Queen;
it does not forward routine messages into her conversation. The native CLI
cannot prove whether a decision prompt is open. Any host-added notification
route must hold when that state is open or unknown. Missing or ambiguous human
provenance must not authorize expanded scope.

The [observer](observer.md) returns changes to the active caller; it doesn't
install a re-arm hook or wake a stopped agent. The Secretary must arrange the
next bounded check and report degraded or interrupted supervision.

## Retire a workspace

Follow the project's retention and archival rules. First verify the endpoint,
retain useful artifacts, settle outstanding processes and external actions, and
complete any succession. Native archival is a separate action requiring applicable
authority. A merged PR alone is not evidence that the workspace can be discarded.

Command reference: [Conductor workspaces and branches](https://conductor.build/docs/concepts/workspaces-and-branches).
