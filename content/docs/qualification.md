# What the court has proved

Monarchy's integration suite follows a request through the Secretary and back to
the Queen. It uses the real SQLite record layer, the real Conductor adapter and
the real supervision code. A fixture supplies native CLI responses so the tests
can drop a reply or kill a process at the awkward moment.

That is offline qualification. It does not launch a coding agent or prove that
a live Conductor host behaves exactly like the fixture. A separate
[read-only native pilot](native-qualification.md) passed on November 16, 2026 (UTC).
Its receipt records the narrower guarantees observed on the actual host.

## The roundtrip

[`tests/test_qualification.py`](../tests/test_qualification.py) registers the
owner's request with a task, brief, authority reference and existing 00 agent
binding. From there it exercises:

1. Prepare a dispatch without sending it, then deliver it through the adapter.
2. Read the matching native message back and retain its original identifiers.
3. Ingest a 00 agent report from a different workspace using native sender identity.
4. Let the Secretary handle routine progress quietly and save a decision for the
   Queen when the 00 agent needs a choice.
5. Restart the court, reopen the same pending presentation, record the owner's
   answer and prepare its delivery as a separate obligation.
6. Restart again, deliver the answer, ingest the 00 agent's completion report and
   check independent review evidence against the exact source revision.
7. Restart once more and find the verified result in the Queen's inbox. Reading
   it leaves it pending; explicit processing clears that presentation.

The fixture's owner and reviewer references stand in for trusted host inputs.
The test checks their record lifecycle. It does not authenticate a human or
assess the quality of a real code review.

## The failures that matter

| Scenario | Required result |
| --- | --- |
| The process dies after native acceptance, before saving the receipt | The saved operation remains `in_flight`; restart reads the original message back without sending again |
| A send times out and its message is temporarily invisible | The operation stays `unknown` until later readback confirms it; repeated recovery sends nothing |
| The Queen misses a notification | The durable outcome still appears when she opens the inbox |
| A presentation is reopened after restart | It has the same identity and remains unprocessed |
| The same native report arrives again | Its immutable report identity produces one stored event, decision and outcome |
| Triage saves an outcome and fails before acknowledging its event | The next pass resumes the claim and reuses the saved outcome |
| A review belongs to an older source revision | Verification refuses it, even when another completion report exists |
| A 00 agent says done while an owner question is unanswered | Completion and presentation acknowledgment leave the decision pending |
| An answer is recorded but has no delivery operation yet | Verification remains blocked until the answer has been delivered |
| An answered question is revised before its prepared message is sent | The old answer cannot be sent as current authority |
| A question changes during native preflight | The record layer refuses send admission before the native write |
| A report comes from a retired assignment | Native validation rejects it before it enters the current inbox |
| A 00 agent receives a skill archive without the source checkout | Selected skills, references and exact project policy files remain readable and hash-verifiable |

The process-death case uses a separate Python process and `os._exit` after the
fixture persists native acceptance. It deliberately skips the clean database
close and the adapter's final receipt. The native fixture keeps its own file so
it survives independently of the court process.

Duplicate report handling is an identity guarantee inside the court. It is not
a claim of exactly-once execution across a network or inside an agent.

## Run it

From the repository root, with Python 3.9 or newer. The full suite also needs
Bash and jq for the isolated upstream outcome test:

```sh
python3 -m unittest discover -s tests -p test_qualification.py -v
python3 -m unittest discover -s tests -v
git diff --check
```

The focused command runs the integration scenarios. The full command also runs
the observer, record, transport, supervision, package and upstream-contract
tests. All fixtures use temporary directories. No native mutation, credentials,
model call or shared project state is required.

The regression tests were written before their corresponding fixes. In the
first assembled run, the full roundtrip passed, while three tests exposed gaps:
an undelivered answer did not block verification, a superseded answer could
still be sent, and a revision change during preflight did not fence the send.
Keep those cases when changing either the supervisor or the record layer.

## What comes from First Mate

These are behavioral contracts adopted from First Mate at
`427056c4181c41074ad24f051f79919330df0fa5`, with a different record and transport
implementation:

| Upstream contract | Monarchy check |
| --- | --- |
| [Actor-scoped wake claims and acknowledgment][wake] | Save the outcome before consuming the claimed event; replay after a crash preserves the obligation |
| [Separate presentation and processing][outcomes] | Opening the Queen inbox does not acknowledge its contents |
| [Durable delivery before the notification][inbox] | A missing notification or uncertain reply cannot erase the pending work or justify another send |
| [Decision holds separate from task completion][holds] | 00 Agent completion and inbox processing cannot supply an owner answer |

Monarchy intentionally keeps unanswered decisions after a 00 agent reports
completion. It does not copy First Mate's task-type-specific terminal clearing
rules. The integration fixture exercises Monarchy's equivalent contracts. A
separate upstream test runs First Mate's pinned outcome store in an isolated
temporary home and checks that presentation leaves processing outstanding.
Neither test certifies compatibility with its Pi or tmux hosts. The
[adoption plan](planning/firstmate-adoption.md) records the broader boundary.

## What still needs a live host

The [native pilot](native-qualification.md) records actual dispatch, cross-workspace
reports, delayed readback recovery and independent result verification. The native
owner decision and answer path still needs qualification with trusted host input.
The fixture covers that record lifecycle without supplying human authentication.

The CLI cannot express explicit fast mode off during session creation. The
adapter therefore holds that creation path; existing-session reads and recovery
remain available. A live test must use a profile the adapter can express and
must record any native fields it cannot verify. It must not silently choose a
different profile to make the test pass.

The current Queen inbox is a pull interface. These tests verify that pending
outcomes survive a missed notification, and that `open` or `unknown` prompt state
requests a hold. They do not establish an automatic native prompt latch or a
notification service. Such a host integration needs its own qualification.

The [skill scenarios](skills.md) are also separate: their `not_run` status means
no model has been evaluated against them. Package tests prove that the selected
instructions arrive intact, not that an agent will follow them.

Finally, process restart is not machine-loss recovery. SQLite receipts depend
on the underlying storage. Backup, restore to a new host, unattended scheduling,
real project acceptance and authorization for external actions remain separate
requirements. The court should know what it has proved before it takes the throne.

[wake]: https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/tests/fm-wake-queue.test.sh
[outcomes]: https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/bin/fm-branch-outcome.sh
[inbox]: https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/tests/fm-send-inbox.test.sh
[holds]: https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/tests/fm-captain-hold-lifecycle.test.sh
