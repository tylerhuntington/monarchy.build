# Documentation sources

The site builds from these checked-in files. It never downloads toolkit docs at
build time. `docs-manifest.json` pins the toolkit repository and full revision,
each page's SHA-256, and the hash of its upstream source.

Pages marked `imported` retain the upstream bytes. Fix those pages in the toolkit
first, then sync. Pages marked `adapted` keep the toolkit's instructions and
examples, with prose edited for the website. Pages marked `authored` are website
introductions or references. Both edited kinds list their primary evidence in
`derivedFrom`; their source links point to that toolkit evidence, not to an exact
copy of the website's Markdown. Commands, record fields and filenames retain the
spelling the toolkit expects, including older terminology in technical names.

To update the snapshot, run this from the website checkout. Replace the source
path and full revision with the toolkit checkout and revision you reviewed:

```sh
node scripts/sync-docs.mjs --source /path/to/monarchy --revision FULL_SOURCE_SHA
npm test
```

The sync preserves the local text of adapted and authored pages. If a source
used by either kind changed, the script stops before writing.
Review and update that page, then rerun with `--reviewed-curated`. The flag records
your review by updating its source hashes; it does not verify the prose for you.
For a website-only prose edit, run the command against the existing revision to
refresh the page hash.

Review the diff and run the website build before publishing. The loader refuses
a page whose bytes no longer match its manifest. Link tests check local guide
destinations and heading anchors. Runtime behavior still needs the toolkit's own
tests and qualification; a documentation build cannot establish it.
