# Working on monarchy.build

This repository owns Monarchy's public Next.js site. The toolkit lives at
https://github.com/tylerhuntington/monarchy. Use Queen, Secretary and 00-Agents
(singular: 00-Agent). Use “Meet the Royalty” for the roles guide and “build an
empire” for the wider framing. Keep the Queen as the reader’s single conversation;
the Secretary coordinates work behind the scenes. Preserve real command, API and
file identifiers even when they use older terminology. Keep the wit light and the
instructions direct.

Keep the design spare and accessible. Use the real toolkit interfaces; never invent
an installer, hosted service or unattended capability. Pin imported docs and retain
source links. Historical claims stay qualified. Preserve user-written copy.

Run npm run typecheck, npm test, npm run build and the relevant browser checks.
Check mobile, keyboard navigation and reduced motion for interface changes.
No credentials, raw transcripts or private project data belong here. Do not contact
or assign people without explicit user authorization.

Production hosting is Cloudflare Workers Static Assets. Keep Next.js static export
and use the pinned Wrangler CLI. OpenNext is only needed if server features are
introduced. Run `npm run check:hosting` after the build when changing hosting configuration.
Inspect existing DNS before changing nameservers or website records; preserve
unrelated mail and verification records. Domain ownership does not supply
registrar access. Follow `docs/hosting.md` for DNSSEC and propagation checks.
Report actual deployment and DNS evidence separately.
