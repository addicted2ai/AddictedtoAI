---
job: seed-concept-model-context-protocol
verdict: approve
reasons: []
would-cite: >-
  Anyone whose MCP knowledge dates from the 2024 launch gets sent this page
  when their server breaks — it inventories exactly what the 2026-07-28
  revision removed and what replaced each piece, and "the two revisions
  were pursuing one decision: make MCP stateless" is the one-line answer to
  "what happened to initialize?".
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched; the removal inventory was checked
item by item against the changelog.

**Verified by fetching:**
- modelcontextprotocol.io/specification/versioning — current revision
  2026-07-28; version strings "indicate the last date backwards
  incompatible changes were made" and are not bumped for compatible
  changes; deprecated features "remain in the specification for at least
  twelve months, or at least ninety days under the policy's
  expedited-removal exception". Also confirms `server/discover` as "a
  mandatory RPC", the `_meta` protocolVersion key, and
  UnsupportedProtocolVersionError "listing the versions it does support".
- modelcontextprotocol.io/specification/2026-07-28/changelog — every bullet
  in the body's removal list is a numbered major change there, verified
  with quotes: sessions and Mcp-Session-Id removed with list endpoints no
  longer per-connection and server-minted handles as ordinary tool
  arguments (change 1); initialize/notifications-initialized removed with
  both `_meta` keys named (change 2); server/discover MUST (change 3);
  subscriptions/listen replacing the GET endpoint and resources/subscribe
  (change 4); ping, logging/setLevel, notifications/roots/list_changed
  removed, per-request log level, "servers MUST NOT emit
  notifications/message for requests that did not include this field"
  (change 5); MRTR replacing roots/list, sampling/createMessage,
  elicitation/create with resultType input_required / inputRequests /
  inputResponses (change 7); required resultType with omission read as
  complete (change 8); SSE resumability and Last-Event-ID removed with
  re-issue under a new request id (change 9). Roots/Sampling/Logging
  deprecated with exactly the three migrations the body names; HTTP+SSE
  (deprecated since 2025-03-26) reclassified under the lifecycle policy.
- anthropic.com/news/model-context-protocol — dated Nov 25, 2024; the spec
  and SDKs, local server support in Claude Desktop apps, and the server
  repository; pre-built servers for "Google Drive, Slack, GitHub, Git,
  Postgres, and Puppeteer" — the body's list is exact.

**Also checked:** transclusions resolve; "MCP" as a manual alias is the
right classing for a three-letter collision magnet; no volatile literals —
the current-revision value is a cited fact the body transcludes.

This is the piece the launch-vintage MCP content everywhere else fails to
be: the sampling-inversion observation and the version-string explanation
are judgment on top of a verified inventory, not a summary of one. The
would-cite answer was the easiest of the sixteen to write. Approve.
