# Meet the Court

You follow one conversation with the Queen. The court coordinates the agents
working on your request and brings back results, questions that need your
judgment, and blockers it cannot resolve within your instructions.

## Your conversation with the Queen

Start with the outcome you want. Ask for progress in the same thread. Change
priorities there too. The Queen keeps the overall request in view and delegates
the work through the Secretary.

You shouldn't need to find the right 00 Agent, forward a review, or explain the
same decision in several tabs. The Queen is responsible for carrying your
direction into the court and bringing the result back. Other sessions remain
available when you want to inspect the detail.

## What comes back to you

Routine coordination stays with the agents: choosing the next step within an
assignment, sharing context, arranging review, and following up on unfinished work.

A choice comes back when it needs your judgment or authority. For example, a fix
may require changing behavior outside the agreed scope, or work may need access
you haven't granted. The Queen explains the situation, presents the tradeoff,
recommends a path, and says what is waiting on your answer. She passes that answer
back through the court; you don't have to repeat it to each 00 Agent.

An update should tell you what changed and what it means. A final result should
say what was completed, what was checked, and what remains open. Evidence stays
linked so you can read it without turning every update into a technical report.

## Who does what

**The Queen** owns the conversation with you and keeps the goal in view. She
records the assignment, gathers the decisions that need you, and returns the
outcome. She delegates project code changes and their review.

**The Secretary** runs routine coordination. It tracks assignments, follows up
on blockers, arranges independent reviews, and manages handoffs. It sends the
Queen important decisions and outcomes, rather than forwarding every status event.

The Secretary keeps the task records current and brings decisions to the Queen
when they need the user's attention.

**00 Agents** build, investigate, and review in isolated task workspaces. Each gets
a brief and a completion condition. They report through the Secretary instead
of asking you to coordinate with the next agent.

## Follow one request

Suppose you ask the Queen to fix a broken CSV export and prepare a PR.

1. You describe the problem and the result you want in the Queen's thread.
2. Behind the scenes, the court assigns the fix, checks it, and arranges a fresh
   review. 00 Agents resolve routine questions within the brief.
3. If a decision exceeds that brief, the Queen brings it back with context and a
   recommendation. You answer in her thread.
4. The court carries on within that answer's scope. The Queen returns the
   reviewed PR, verification results, and any remaining limits.

Small changes can go through Build and Review; uncertain work starts with Plan.
Findings go through Fix and fresh Review. Each project's own checks and delivery
rules still apply. Preparing a PR doesn't authorize deployment.

## Keep one point of contact through a handoff

An agent session can run out of context or stop. The court's records preserve the
request, decisions, current owner, and next action so the successor can take over
without asking you to reconstruct the work.

[Succession](succession.md) supports this experience. It doesn't promise one
physically permanent chat thread or automatic recovery from every interruption.
A replacement Queen verifies and accepts the handoff before continuing.

The [runtime](runtime.md) keeps the assignments and receipts, handles reports,
and delivers work only through explicit commands. Its inbox lets the Queen pick
up decisions and checked results without a stream of routine messages. The
[twelve skills](skills.md) guide the court through that work.

Each runtime command exits after a bounded pass. The separate
[observer](observer.md) reads session and PR changes. An active Secretary still
arranges the next check; see [the limits](limits.md) before relying on unattended
operation.
