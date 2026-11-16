# The first live court run

The read-only pilot passed on November 16, 2026 (UTC). A real worker in a separate
Conductor workspace received an assignment, sent progress and completion reports,
and returned an immutable source check. The Secretary kept routine progress quiet,
checked the result independently, and put the verified result in the Queen inbox.

The [public receipt](verification/native-readonly-2026-11-16.json) records the
versions, profile, message identity, source hash and observed results. It contains
no raw transcripts, account identities, credentials or host configuration.
Workspace and session identifiers are fingerprinted.

## What ran

| Item | Value |
| --- | --- |
| Monarchy source | `9118e3927218cd248c5bc2f99e70005cca985c55` |
| Conductor CLI | `0.1.0`; exact CLI artifact hash retained in the receipt |
| Selected profile | Codex, `gpt-6-astra`, `ultra`, fast mode enabled |
| Observable native profile | Model, effort and fast mode matched; agent type was not exposed by session readback |
| Project | PISCES, in a fresh Conductor cloud workspace |
| Assignment | Read the exact Git revision and README bytes, report their hash, and leave tracked files unchanged |
| Source checked | `54df6526125a2377ad8884e4116cee387819aaed` |

Conductor first rejected a Monarchy workspace because that repository was absent
from the machine's repository list. The exact-name readback found no created
workspace. The pilot then used an allowed PISCES workspace and cloned the exact
Monarchy source under `.context`. No machine settings were changed.

The worker read the checkpoint and verification skills and used
`monarchy.conductor.report_text` to validate its reports. This exercises those
instructions in a real assignment; it is not a scored evaluation of the skill pack.

## The receipts tell the story

1. Dispatch recorded its intent before sending. Immediate readback did not yet
   show the message, so the operation stayed `unknown`.
2. A fresh process reopened the journal. Readback found the original request ID
   and confirmed delivery. Recovery did not issue another send.
3. The progress report arrived with native sender metadata. Ingestion verified
   both workspace bindings and the active assignment. Triage consumed the routine
   event and left the Queen inbox empty.
4. The completion report passed the same sender checks. It created work for the
   Secretary and left the task incomplete, pending verification.
5. The maintainer independently read the reported Git object from another
   checkout. Its README had 11,686 bytes and the same SHA-256 as the worker's
   report. A separate review repeated that check and reread the native report.
6. Verification created a result for the Queen. Reopening the database returned
   the same unprocessed presentation. Explicit acknowledgment, followed by another
   reopen, returned an empty inbox.

The worker reported the same full revision and a clean tracked tree before and
after its work. The independent content check confirms the immutable README
bytes. It does not independently observe every filesystem action inside the
worker's VM.

## Keep the scope of the proof clear

This run qualifies native message dispatch, delayed readback recovery, reports
across separate workspaces, quiet routine triage and a reviewed result. It did not
exercise a new human decision or prove how a host authenticates owner permission.
The full decision-and-answer lifecycle remains covered by the
[offline integration scenarios](qualification.md).

The session was created through the native workspace command. The adapter's
separate `create_session` path was not exercised live. Explicit fast mode off
remains held because this CLI cannot express it during creation. The run also
did not inject a native process crash, restore a lost host, run application tests,
install a background service, or evaluate the 72 skill scenarios.

The runtime remains opt-in. Native owner input, automatic prompt protection,
additional profiles and unattended operation each need their own qualification.
Reading one successful receipt should make the court's limits easier to see.
