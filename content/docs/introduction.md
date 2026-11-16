# One conversation. An entire empire.

Monarchy lets you rule an empire of coding agents through one conversation.
Talk to the Queen. Her Secretary divides the work, follows up with the 00 Agents
and arranges reviews. Results and decisions that need your input come back to
the throne for sign-off.

You can still open the other sessions. You shouldn't have to carry messages
between them.

## Meet your team

| Role | The job |
| --- | --- |
| Queen | Your point of contact. Keeps the goal in view and brings back results and decisions. |
| Secretary | Runs the coordination: assignments, progress, reviews and handoffs. |
| 00 Agents | Build, investigate and review, each with a brief and a separate task workspace. |

Names tell you what an agent does: `00-tests`, `00-docs`, `00-build-fix`.
The two zeros are a small nod to the
[disputed royal-spy legend behind 007](https://www.rcp.ac.uk/news-and-media/news-and-opinion/code-making-and-code-breaking-john-dee-and-the-art-of-cryptography/).
The actual job is less dramatic. Finish the assignment. Bring receipts.

## Keep the conversation going

*"The Queen is dead, long live the Queen."*

Even Queens run out of context. A handoff preserves what you asked for, the
decisions you've made and the work still in flight. The successor checks those
records before taking over. You keep directing the work through the Queen,
without reconstructing the whole conversation for every new session.

[Succession](/docs/succession) describes that transfer. It doesn't promise a
physically permanent chat thread or automatic recovery from every interruption.

## What you're setting up

Monarchy is a repository of role instructions, twelve orchestration skills and
an opt-in Python runtime. Conductor cloud is its first runtime integration.
The runtime keeps assignments, reports, decisions and delivery receipts in a
private SQLite journal. Each command does one job and exits; an active Secretary
still has to arrange the next check.

Cloning the repository starts nothing. You'll need your own agent access,
explicit model choices and Conductor cloud sessions to run the live quickstart.
Your project's review, delivery and permission rules stay in force.

The bundled First Mate source is a pinned reference and compatibility fixture.
It helped shape the single-conversation approach and the coordination contracts;
it isn't the engine behind Monarchy.

## Start with one assignment

[Build your empire](/docs/quickstart) with a small read-only investigation. Follow the
result back to the Queen, then add build work and independent review.

For the machinery, read [Run your empire](/docs/runtime) and the
[CLI reference](/docs/cli). Keep the [current limits](/docs/limits) close by as
you decide how much to delegate.
