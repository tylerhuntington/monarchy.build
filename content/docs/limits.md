# What This Version Does

Monarchy supplies role instructions, twelve core skills, and an opt-in court
runtime. You still need an active Secretary to coordinate the work. Installing
the package starts no agents, hooks, or background service.

| Included | Boundary |
| --- | --- |
| Queen, Secretary, and 00 Agent instructions | Agents must follow them; they are not access controls. |
| Twelve core skills and checked 00 agent packages | Package tests check integrity and contracts; model-driven skill scenarios remain unrun. |
| Private SQLite records for tasks, reports, decisions, and outcomes | Survive local process restarts; host-loss recovery needs a separate backup or durable volume. |
| Assignment generations and operation admission | Fence stale writes through the record API; do not stop native sessions or subprocesses. |
| Conductor message delivery and native report ingestion | Require explicit commands and verified court membership; do not authenticate new owner authority. |
| Queen and Secretary pull inboxes | Presenting a result does not acknowledge it. No automatic prompt-safe forwarding. |
| Source-bound completion review | Checks the submitted evidence contract; the reviewer must perform the actual checks. |
| Conductor session and GitHub PR observation | Does not verify test results, merge queues, deployment health, or completion. |
| Pinned First Mate source and isolated compatibility test | Reference distribution, not the engine that runs the Monarchy court. |

The [runtime](runtime.md) processes one bounded command at a time. Preparing a
dispatch saves an intent; `deliver` performs or reconciles the native action.
After an uncertain result, it reads the original identities rather than sending
again. The separate observer only polls. Neither command keeps supervision alive
after it exits.

The current [Conductor adapter](conductor-transport.md) targets cloud sessions.
It cannot verify the agent type from session readback, prove human authority from
missing sender markers, or observe whether the Queen has an open decision prompt.
The CLI can enable fast mode but cannot explicitly disable it, so new-session
requests with `fast_mode=False` are held. Workspace creation remains a host action.

Offline tests use controlled transport fixtures and local databases. The upstream
compatibility test runs First Mate's real outcome store in an isolated home.
The separate [native pilot](native-qualification.md) covers message delivery,
cross-workspace reports and a verified read-only result. It does not qualify
unattended operation or native owner authentication. These remain separate gates
in [the adoption plan](planning/firstmate-adoption.md).

The PISCES implementation has additional reporting, forwarding, hook, and delivery
integrations. Those remain in PISCES. This release neither replaces them nor carries
over their authority grants, credentials, model choices, staging limits, or
production permissions.

Keep the runtime database outside the source checkout and retain it with a
SQLite-consistent backup procedure. Private handoffs and the observer's
`.monarchy/` files also need deliberate retention. Public Git history is not the
place for private task state.

No production release, infrastructure change, model subscription, or personal
outreach is authorized by installing Monarchy. Those permissions belong to the
owner and each project.
