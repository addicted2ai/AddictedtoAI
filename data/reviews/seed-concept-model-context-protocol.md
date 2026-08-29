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

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

Every technical identifier in the body's removal inventory re-confirmed by
literal substring against freshly fetched bytes. `specification/2026-07-28/
changelog` (295,501 B) contains all thirteen of: `server/discover`,
`UnsupportedProtocolVersionError`, `io.modelcontextprotocol/protocolVersion`,
`io.modelcontextprotocol/clientCapabilities`, `Mcp-Session-Id`,
`Multi Round-Trip Request`, `input_required`, `inputRequests`,
`inputResponses`, `subscriptions/listen`, `Last-Event-ID`, `logging/setLevel`,
`notifications/roots/list_changed`.

Semantics checked, not just presence. The changelog reads: "Make MCP
stateless: remove the initialize / notifications/initialized handshake";
"Add server/discover : servers MUST implement this RPC"; "servers MUST NOT
emit notifications/message for requests that did not include this field";
"Clients MUST treat results from earlier-protocol servers that omit the field
as \"complete\""; "clients MUST re-issue it as a new request with a new
request ID". The four **MUST**/**MUST NOT** claims in the entry are the
specification's own modal verbs, not the entry's emphasis.

Deprecation trio verbatim: "Deprecate the Roots, Sampling, and Logging
features ( SEP-2577 )" with "Suggested migrations: pass directories or files
via tool parameters, resource URIs, or server configuration instead of Roots;
integrate directly with LLM provider APIs instead of Sampling; log to stderr
(stdio) or use OpenTelemetry instead of Logging" — the entry's three
migrations are this sentence, compressed. "The deprecated features registry
tracks every feature currently in the Deprecated state" and "Reclassify the
HTTP+SSE transport (deprecated since protocol version 2025-03-26) as
Deprecated under the feature lifecycle policy" both present.

Facts. Versioning page (now served at `/docs/2026-07-28/learn/versioning`;
the cited `/specification/versioning` redirects there): "The current protocol
version is 2026-07-28."; "string-based version identifiers following the
format YYYY-MM-DD , to indicate the last date backwards incompatible changes
were made" plus "The protocol version will not be incremented when the
protocol is updated, as long as the changes maintain backwards compatibility";
"remain in the specification for at least twelve months, or at least ninety
days under the policy's expedited-removal exception". Searching
`backwards-incompatible` hyphenated returns ABSENT — the source writes it
unhyphenated; that is a false absence.

The three-state lifecycle is on `/community/feature-lifecycle`: "How
individual MCP specification features move through Active, Deprecated, and
Removed states" — the entry's "Active, Deprecated, Removed" is exact.

`base_protocol` and the three roles come from `/specification/2026-07-28`:
"The protocol uses JSON-RPC 2.0 messages to establish communication between:
Hosts : LLM applications that initiate connections Clients : Connectors
within the h[ost]... Servers". `announced`: the Anthropic post is dated
"Nov 25, 2024" ("November 25, 2024" is ABSENT — format variant) and reads
"Today, we're open-sourcing the Model Context Protocol (MCP)", listing "The
Model Context Protocol specification and SDKs / Local MCP server support in
the Claude Desktop apps / An open-source repository of MCP servers" and
"pre-built MCP servers for popular enterprise systems like Google Drive,
Slack, GitHub, Git, Postgres, and Puppeteer" — the entry's six-server list is
the post's own, in the post's own order.

Timeline entry 2025-03-26 confirmed at that revision's changelog: "Added a
comprehensive authorization framework based on OAuth 2.1" and "Replaced the
previous HTTP+SSE transport with a more flexible Streamable HTTP transport".

**One imprecision noted, not corrected.** The body says "the two revisions
that removed it" — the 2026-07-28 changelog states it lists changes "since
the previous revision, 2025-11-25", so there are intervening revisions the
entry's timeline does not carry. The two it names are the two that did the
removing, so the sentence is true as written; the timeline is selective
rather than wrong. Filed as addictedtoai-9df.
