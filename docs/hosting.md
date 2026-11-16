# Moving the empire to Cloudflare

Monarchy is a static Next.js site. Cloudflare can serve the existing export;
there is no server runtime to migrate. This keeps the setup small and avoids
function charges. [Static-asset requests and storage are free](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

## Connect publishing

In the repository's GitHub Actions secrets, set `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN`. Use a token scoped to the hosting account with Workers
Scripts edit permission. Configure domains separately; routine publishing does
not need permission to change registrar settings. Keep token values out of Git,
logs, and chat. See [Cloudflare's GitHub Actions guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).

The existing checks workflow builds once, validates the export in Wrangler's
local runtime, then publishes on pushes to `main`. Pull requests only run checks.
Do not enable a second automatic build in Cloudflare or Netlify.
Configure and verify both GitHub secrets before merging this migration.

Before the first merge, sign in locally with `npx wrangler login` and run
`npm run deploy`. Check the returned `workers.dev` URL, including direct docs
links, search, and code copying. `npm run check:hosting -- https://<deployment-host>`
also checks a deployed site without changing it.

## Move the domain

1. Export the current Spaceship DNS records and nameservers. Check for a DNSSEC
   delegation before changing nameservers; an old DS record must not survive a
   change to a provider that cannot serve its keys.
2. Add `monarchy.build` to Cloudflare on the Free plan. Copy every existing DNS
   record and compare the result with the export. Initially keep the Netlify
   records serving the site.
3. Set the domain's nameservers at Spaceship to the exact pair Cloudflare assigns.
   Registration stays at Spaceship. Wait until Cloudflare reports the zone active.
4. Attach `monarchy.build` to the `monarchy-build` Worker as a Custom Domain. Replace
   only the conflicting website record. Add a Cloudflare redirect from
   `www.monarchy.build` to the apex, preserving the path and query string.
5. Verify HTTPS, both hostnames, direct documentation links, redirects, missing-page
   status, security headers, and client navigation. Confirm the deployed version
   belongs to the reviewed source revision.
6. Re-enable DNSSEC with Cloudflare's new signing details at Spaceship. Verify the
   new DS record and successful resolution before considering DNS migration done.
   Spaceship's public API does not currently document DNSSEC management; use its
   domain dashboard for the old and new DS records.
7. Stop Netlify builds and remove its GitHub deployment hook. Keep the last deploy
   available through DNS propagation, then remove the old domain bindings. Update
   the README and agent guide once Cloudflare is actually serving the domain.

Workers Custom Domains require an [active Cloudflare zone](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
Cloudflare's DNS scan may miss records, so compare against the registrar export.
The apex binding does not also configure `www`.

## Recover a deployment

Keep the last known-good Cloudflare version ID with the source revision. Use
`npx wrangler rollback <version-id>` to restore it, then verify the live site.
Fix or revert the source before the next merge so automation does not redeploy
the broken version.

During migration, the retained Netlify deploy is also a fallback. If needed,
detach the Cloudflare Custom Domain and restore the saved website records in
Cloudflare DNS. Do not delete unrelated records or switch nameservers back as
the first response to a website problem.
