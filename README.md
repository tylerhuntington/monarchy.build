# monarchy.build

Keep calm and DM the Queen.

Monarchy’s public website and reference docs, built with Next.js.
The [Monarchy toolkit](https://github.com/tylerhuntington/monarchy) lives
in its own repository. This one owns the site.

## Run it locally

Use Node.js 22 or later. From this repository:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The homepage shows how a request moves from the Queen
through the Secretary and 00-Agents, then back to your conversation. `/docs/`
contains the guides and CLI reference.

## Check a change

From this repository:

```sh
npm test
npm run build
npm run typecheck
npm run check:hosting
```

The build writes a static site to `out/`. `check:hosting` starts Cloudflare's local
runtime and checks page routes, redirects, missing pages, headers, and assets.
Use `npm run preview` to browse that runtime yourself at http://localhost:8787.
Documentation tests verify source hashes, navigation, and links. Before publishing
UI changes, also check narrow screens, keyboard navigation, search, code copying,
and reduced motion in a real browser. CI runs the same source checks and build;
it does not claim browser coverage.

## Keep the docs honest

Guides are checked into `content/docs/`, with their toolkit revision and hashes in
`content/docs-manifest.json`. Production builds never pull from a moving branch.
The website’s introduction and CLI reference cite the toolkit sources they were
written against. See [the content guide](content/README.md) to update them.

## Deploy to Cloudflare

Cloudflare Workers Static Assets hosts [monarchy.build](https://monarchy.build).
The [hosting guide](docs/hosting.md) covers publishing, domain setup and recovery.

`wrangler.jsonc` serves the static export in `out/`. There is no server, database,
or function to run. Local fonts ship with the build. Cloudflare serves static
assets without request charges; [OpenNext](https://opennext.js.org/cloudflare)
is an option if the site later needs server features.

The GitHub workflow checks each change. Pushes to `main` deploy the exact build
that passed those checks to Cloudflare. For a manual deployment, follow the
[hosting guide](docs/hosting.md) so the deployed version records its source.

`monarchy.build` is the canonical domain. Spaceship remains the registrar;
Cloudflare manages DNS. Keep credentials outside this repository,
and preserve unrelated DNS records.
