# Skills for the Royal Court

The Queen takes the request. The Secretary keeps the work moving. 00 Agents do the
work. Skills give each of them a repeatable way to handle the moments where
coordination tends to fall apart.

There are twelve core skills. They cover the orchestration loop; your project's
own skills still handle its planning, code, tests, reviews and delivery.

| Skill | When it earns its keep | What comes back |
| --- | --- | --- |
| `monarchy-intake` | A new request arrives | A scoped brief with an observable endpoint |
| `monarchy-adopt` | The owner hands over existing work | An inventory with verified custody |
| `monarchy-compose` | Work needs to be divided | A small task graph with clear write boundaries |
| `monarchy-dispatch` | A task is ready for a 00 agent | A session binding and pinned package receipt |
| `monarchy-supervise` | A 00 agent reports or a check comes due | A durable outcome, with routine coordination handled quietly |
| `monarchy-decide` | A real choice needs the owner | One answerable question, then an answer bound to it |
| `monarchy-steer` | The owner changes direction | A revised brief the 00 agent has acknowledged |
| `monarchy-checkpoint` | Context is getting full or work reaches a useful boundary | A continuation record with evidence and open questions |
| `monarchy-handoff` | Another session must take over | A verified transfer of responsibility |
| `monarchy-recover` | A session, delivery or external operation becomes uncertain | A diagnosis and one bounded, checked repair |
| `monarchy-verify` | Someone claims a result | Evidence tied to the actual endpoint |
| `monarchy-complete` | The requested endpoint is satisfied | A saved completion receipt and a result for the Queen |

The boundaries matter. A checkpoint saves context; a handoff transfers custody.
A delivery receipt says a question arrived; it does not answer it. A merged pull
request finishes a task only when that was the task's endpoint.

## One source, several ways to read it

The canonical skills live in [`.agents/skills`](../.agents/skills). Each folder
contains a `SKILL.md`, a small output reference, optional-client metadata in
`agents/openai.yaml`, and evaluation scenarios in `evals.json`. The
[registry](../.agents/skills/registry.json) pins every declared file with SHA-256
and records each skill's version. There are no separate copies for each client.

Some clients discover `.agents/skills` directly. That is a convention, not a
promise that every harness supports it. If yours does not, explicitly give the
agent its selected `SKILL.md` and referenced files. Reading these files starts
no processes and changes no host settings. The OpenAI metadata permits implicit
invocation where supported; it is not an integration test for other clients.

Every skill names its inputs, steps, output, authority and failure conditions. It
also explains when doing nothing is the correct result. An unchanged task can
be a no-op. An unreadable task is unknown.

## Your project keeps its own rules

Before using a skill, read the target project's instructions and
`.agents/config.md` when present. Use its native planning, review and delivery
workflows. Preserve the paths and versions selected for the task. Monarchy does
not import another project's grants or replace a required gate with a generic
checklist.

The skills describe workflow contracts. Their output examples are not a second
database schema. Record those facts through the installed Monarchy runtime's
supported Python API, or use operator-controlled orchestration when a runtime
operation is unavailable. Do not invent a CLI command, edit the store directly,
or claim a local draft was persisted.

Only dispatch, steering and other explicitly authorized steps can change live
work. A 00 agent package carries the brief's authority references; it cannot grant
new authority itself. 00 Agents report through the Secretary, and the Queen keeps
the owner's conversation in one place.

## Pack a 00 agent's bag

A 00 agent in another checkout needs more than the name of a skill. It needs the
selected version, its references, and the project's actual instructions. The
standard-library package builder in [`monarchy/skills.py`](../monarchy/skills.py)
collects only explicitly declared files into a self-contained ZIP.

This example runs from the Monarchy checkout. Set the project and destination
paths to existing directories. Select the target project's required policies;
the builder cannot decide which files your task needs or whether they are safe
to share.

```python
from hashlib import sha256
from pathlib import Path
from monarchy.skills import build_package, inspect_package

monarchy_root = Path.cwd()
project_root = Path("/path/to/target-project")
destination = Path("/path/to/private-handoff/worker.zip")

policy_paths = ["AGENTS.md"]  # Include relevant nested instructions and config.
policy_pins = {
    path: sha256((project_root / path).read_bytes()).hexdigest()
    for path in policy_paths
}
registry_path = ".agents/skills/registry.json"
registry_pin = sha256((monarchy_root / registry_path).read_bytes()).hexdigest()

manifest = build_package(
    monarchy_root,
    ["monarchy-checkpoint", "monarchy-verify"],
    destination,
    expected_hashes={registry_path: registry_pin},
    context_root=project_root,
    context_files=policy_pins,
)
package_pin = sha256(destination.read_bytes()).hexdigest()

# The receiving side checks the pin from the authorized task brief.
verified = inspect_package(destination, expected_sha256=package_pin)
assert verified == manifest
```

The archive holds selected skills under `skills/`, explicit project files under
`project/`, the source registry, and a manifest of paths, sizes and hashes. It
does not include unlisted files. The same inputs produce the same bytes.

The builder rejects changed pins, unsafe paths, symlinks, hard-linked source
files, file/directory collisions and case-colliding names. It never overwrites
an existing destination. It opens paths beneath explicit roots without following
links, publishes the complete archive atomically, and sets files to read-only.
Use real directory paths rather than symlink aliases. The implementation targets
POSIX systems with `dir_fd` and `O_NOFOLLOW`, including the Linux runtime; Windows
is not qualified.

The inspector reads an archive without extracting or running it. It rejects
undeclared members, duplicate entries, unsafe paths, invalid modes and hash
mismatches. Limits are 256 members, 2 MiB per file, 16 MiB expanded contents and
20 MiB archive size. Packages are for bounded skill context, not whole checkouts.

Hashes catch drift. They are not signatures: someone who replaces a package can
also replace its internal hashes. Keep the full archive SHA-256 in the authorized
brief and pass it to `inspect_package` on receipt. Read-only modes are a handling
convention, not a sandbox. Nothing here installs a skill, executes its contents,
proves its instructions trustworthy or verifies the host can launch a 00 agent.

## Changing a skill

Edit its canonical folder, update its version in the registry when its behavior
changes, then recompute the SHA-256 entries for changed declared files. Add every
new referenced resource to that same registry entry. Keep changes and refreshed
pins together so a package cannot silently mix revisions.

Run the repository checks:

```sh
python3 -m unittest discover -s tests -v
git diff --check
```

The tests exercise package integrity and portability without a shared source
checkout. They also check the core skill contracts and scenario structure.
Each skill has six scenarios: two positive, two negative and two boundary cases.
Their status is **not run**. Passing Python tests does not establish that a model
will follow a skill correctly.

For an agent evaluation, give a fresh agent the scenario input, the selected
skill and the minimum realistic task artifacts. Keep the expected output hidden
from that agent. An independent reviewer compares its actions and receipts with
`expected_output` and `must_not`, records the model, runtime and source pins, and
marks the result passed, failed or inconclusive. Use isolated fixtures for any
scenario involving writes. Leave the scenario status alone until those runs
actually exist.

## Where the design comes from

First Mate helped establish the useful split between one owner conversation and
background coordination. Its [internal skills][firstmate-skills],
[supervision host][firstmate-host] and [supervision branch][firstmate-branch]
informed the distinction between an event, a handling outcome, a delivered
question and an answer. These skills are written for Monarchy; they do not copy
First Mate's home-directory helpers or assume its runtime is installed.

Monarchy keeps Queen, Secretary and 00 Agents. The point of the court is fewer
conversations for you to manage. The paperwork should earn its place.

[firstmate-skills]: https://github.com/kunchenguid/firstmate/tree/427056c4181c41074ad24f051f79919330df0fa5/.agents/skills
[firstmate-host]: https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/docs/supervision-host.md
[firstmate-branch]: https://github.com/kunchenguid/firstmate/blob/427056c4181c41074ad24f051f79919330df0fa5/docs/pi-supervision-branch.md
