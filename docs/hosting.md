# Hosting the fleet

Cloudflare Workers Static Assets serves [monarchy.build](https://monarchy.build)
from the Next.js export. There is no server runtime. This keeps the setup small and avoids
function charges. [Static-asset requests and storage are free](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

The same deployment is available at
[monarchy-build.monarchy-build.workers.dev](https://monarchy-build.monarchy-build.workers.dev).
Netlify's GitHub publishing trigger is disabled; its last deployment is retained
as a fallback. [Issue #13](https://github.com/tylerhuntington/monarchy.build/issues/13)
records the cutover, DNSSEC verification and fallback cleanup status.

## Connect publishing

In the repository's GitHub Actions secrets, set `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN`. Use a token scoped to the hosting account with Workers
Scripts edit permission. Configure domains separately; routine publishing does
not need permission to change registrar settings. Keep token values out of Git,
logs, and chat. See [Cloudflare's GitHub Actions guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).

The existing checks workflow builds once, validates the export in Wrangler's
local runtime, then publishes on pushes to `main`. Pull requests only run checks.
Do not enable a second automatic build in Cloudflare or Netlify.
The Custom Domain and `www` redirect are configured separately in Cloudflare;
routine deployments preserve those bindings.

For a manual deployment, start from a clean, reviewed commit. Sign in locally
with `npx wrangler login`, run the repository checks, then deploy with its source
annotation:

```sh
npm run deploy -- --message "$(git rev-parse HEAD)"
```

Check the returned `workers.dev` URL, including direct docs links, search and code copying.
`npm run check:hosting -- https://<deployment-host>` also checks a deployed site
without changing it.

Read back the active deployment with `npx wrangler deployments list --json`, then
inspect its version with `npx wrangler versions view VERSION_ID --json`. Confirm
that the active version's `annotations["workers/message"]` equals the full Git
SHA from the successful workflow or reviewed manual deployment. A version existing
in the account does not establish that it is serving traffic. Keep the version ID
and source revision with the deployment result.

## Move the domain

1. Export the current Spaceship DNS records and nameservers. Record the old DS
   TTL from the authoritative `.build` nameservers, plus the current parent and
   child NS TTLs. If a DS record exists, remove it through Spaceship's dashboard
   while the old nameservers still serve the domain. Query the authoritative
   `.build` nameservers directly with `dig @PARENT_NS monarchy.build DS +norecurse`.
   Confirm they all return successful responses without the DS record; a timeout
   or `SERVFAIL` is not absence. Start the wait at that confirmed authoritative
   absence, not the dashboard click. Wait at least the full old DS TTL before
   changing nameservers. [Cloudflare's preparation guide](https://developers.cloudflare.com/learning-paths/dns-best-practices/concepts/phase-2/)
   describes the cache window.
2. Add `monarchy.build` to Cloudflare on the Free plan. Copy every existing DNS
   record and compare the result with the export. Initially keep the Netlify
   records serving the site.
3. Set the domain's nameservers at Spaceship to the exact pair Cloudflare assigns.
   Registration stays at Spaceship. Confirm the new delegation at the authoritative
   parent nameservers and wait until Cloudflare reports the zone active. Keep the
   old DNS service available while cached delegations expire.
4. Attach `monarchy.build` to the `monarchy-build` Worker as a Custom Domain. Replace
   only the conflicting website record. Give `www.monarchy.build` a proxied DNS
   record and a redirect to `https://monarchy.build`, preserving the path and query
   string for both HTTP and HTTPS requests. [Redirect Rules require proxied traffic](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/);
   a DNS-only record bypasses them. Wait for valid certificates on both hostnames.
5. Verify HTTPS, both hostnames, direct documentation links, redirects, missing-page
   status, security headers, and client navigation. Confirm the deployed version
   belongs to the reviewed source revision using the deployment and source-annotation
   readback above. Check a `www` URL with both a path and query string.
6. Before publishing Cloudflare's new DS record, wait out the old parent and child
   NS TTLs from the confirmed delegation change. Verify the assigned Cloudflare
   nameservers at the parent and through independent recursive resolvers. A zone
   marked active alone does not prove old delegations have expired. Enable DNSSEC
   in Cloudflare, then enter its exact new DS details in Spaceship's dashboard.
   Verify the authoritative DS record matches Cloudflare's DNSKEY and that
   validating resolvers return authenticated answers without `SERVFAIL`.
7. Disable Netlify's GitHub deployment trigger to stop automatic builds without
   sending notification emails. Keep the last deploy and domain bindings available through
   DNS propagation. Remove the old domain bindings only after propagation and live
   verification finish.

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
