# monarchy.build

Keep calm and DM the Queen.

Monarchy’s public website and reference docs, built with Next.js and hosted on
Netlify. The [Monarchy toolkit](https://github.com/tylerhuntington/monarchy) lives
in its own repository. This one owns the site.

## Run it locally

Use Node.js 22 or later. From this repository:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The homepage includes an interactive example of the
court at work; `/docs/` contains the guides and CLI reference.

## Check a change

From this repository:

```sh
npm test
npm run build
npm run typecheck
```

The build writes a static site to `out/`. Check it with any static HTTP server.
Documentation tests verify source hashes, navigation, and links. Before publishing
UI changes, also check narrow screens, keyboard navigation, search, code copying,
and reduced motion in a real browser. CI runs the same source checks and build;
it does not claim browser coverage.

## Keep the docs honest

Guides are checked into `content/docs/`, with their toolkit revision and hashes in
`content/docs-manifest.json`. Production builds never pull from a moving branch.
The website’s introduction and CLI reference cite the toolkit sources they were
written against. See [the content guide](content/README.md) to update them.

## Deploy to Netlify

`netlify.toml` sets the build command to `npm run build` and the publish directory
to `out`. This site uses static export: no server, database, functions, or runtime
secrets. Local fonts ship with the build.

Link the checkout to the existing Netlify project, then publish the checked build
from this repository:

```sh
npx netlify-cli link
npx netlify-cli deploy --dir=out --prod --no-build
```

`monarchy.build` is the canonical domain. Keep domain credentials outside this
repository. DNS remains at Spaceship; change only the website’s records and
preserve mail, verification, and other unrelated records.
