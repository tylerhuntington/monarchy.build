# Pass the Crown

A handoff transfers responsibility. Copying a summary into another chat is only
part of it.

The goal is continuous ownership even when context is finite. Keep the current
owner, intended successor, unfinished work, and next action in a durable record.
When execution must pause, say so; a pause with an accountable recovery owner is
better than two agents writing under the same authority.

## Before a planned handoff

The current session fills in [the handoff](../templates/handoff.md). Record the
actual request and its authority reference, decisions, full source revisions,
checks, unfinished work, and every running command or unresolved external action.
Do this before context exhaustion, not after it.

The Secretary arranges a successor under the existing assignment. For a Queen
or Secretary replacement, record the outgoing and incoming session identities in
[the leadership record](../templates/leadership.md). Authority to take over must
come from the owner or an existing, explicit succession grant. A 00 Agent cannot
appoint itself Queen.

## Transfer in this order

1. **Prepare.** Save the handoff where the successor can access it. Confirm that
   needed artifacts will survive the old workspace being removed.
2. **Settle.** Stop the predecessor's writes and account for background commands,
   deployments, and uncertain requests. Native “idle” or cancellation acceptance
   alone doesn't establish that they stopped.
3. **Assign.** Record the exact successor and the authority for the transfer.
   Until acceptance, the designated coordinator owns recovery and the task stays held.
4. **Verify.** The successor reads the brief, source, current platform state, open
   decisions, and unresolved effects. It checks its assignment independently.
5. **Accept.** Record acceptance and the next action. Update the task register's
   session binding, then let the successor act. A returning predecessor must read
   the ownership record and stay stopped.

For a Queen transition, open questions remain open. Previous approvals keep their
original scope. A new conversation doesn't turn a pending decision into consent
or make an old answer approve a changed proposal.

## If the old session disappears

The Secretary takes the task into recovery. If the Secretary disappeared too,
the Queen coordinates recovery; if leadership itself is unavailable, the owner
designates the replacement through the trusted owner channel.

Read the last durable record, then inspect the actual branch, sessions, processes,
and external operations. Distinguish observations from assumptions. If a create,
push, cancellation, or deployment may have succeeded, reconcile it before retrying.
Keep unresolved work held with a named role responsible for the next check.

Reconstruct the handoff and follow Assign, Verify, and Accept. Ask the owner only
when needed authority or a decision cannot be recovered from the records.

## Continuity has an implementation boundary

These steps are a supervised protocol. The [record layer](runtime-records.md)
increments the assignment generation, rejects new reports from the old owner,
and blocks reassignment while a delivery remains in flight or unknown. These
checks apply to operations using that record layer. They do not stop an old
native session or enforce exclusive writes across tools.

Monarchy does not authenticate human approvals or elect a replacement. Its
observer tracks changes to session bindings; that is observation, not authority
transfer. Use the [checkpoint, handoff, and recovery skills](skills.md) to preserve
the evidence needed for the supervised steps.

A future automatic succession mechanism must prove those boundaries before it
can replace the supervised steps. Monarchy's purpose is seamless continuity;
it does not claim an uninterrupted service guarantee today.
