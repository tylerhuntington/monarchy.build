# Documentation sources

The site builds from these checked-in files. It never downloads toolkit docs at
build time. `docs-manifest.json` pins the toolkit repository and full revision,
each page's SHA-256, and the hash of its upstream source.

Pages marked `imported` retain the upstream bytes. Fix those pages in the toolkit
first, then sync. Pages marked `authored` are website introductions or references;
their `derivedFrom` entries identify the primary files used to check their claims.
The source link on an authored page points to the toolkit evidence, not the
website's Markdown file.

To update the snapshot, run this from the website checkout. Replace the source
path and full revision with the toolkit checkout and revision you reviewed:

```sh
node scripts/sync-docs.mjs --source /path/to/monarchy --revision FULL_SOURCE_SHA
npm test
```

If a source used by an authored page changed, the script stops before writing.
Review and update that page, then rerun with `--reviewed-curated`. The flag records
your review by updating its source hashes; it does not verify the prose for you.
For a website-only prose edit, run the command against the existing revision to
refresh the page hash.

Review the diff and run the website build before publishing. The loader refuses
a page whose bytes no longer match its manifest. Link tests check local guide
destinations and heading anchors. Runtime behavior still needs the toolkit's own
tests and qualification; a documentation build cannot establish it.
