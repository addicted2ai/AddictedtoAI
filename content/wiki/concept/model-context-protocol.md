---
id: concept/model-context-protocol
kind: concept
display_name: "Model Context Protocol"
status: active
maintenance: stable
aliases:
  - name: "Model Context Protocol"
    class: exclusive
  - name: "MCP"
    class: manual
facts:
  - field: current_revision
    source: cited
    value: "2026-07-28"
    source_url: "https://modelcontextprotocol.io/specification/versioning"
    accessed: "2026-08-28"
    volatility: slow
  - field: base_protocol
    source: cited
    value: "JSON-RPC, version 2.0"
    source_url: "https://modelcontextprotocol.io/specification/2026-07-28"
    accessed: "2026-08-28"
    volatility: static
  - field: version_string_meaning
    source: cited
    value: "the date of the last backwards-incompatible change, not a release date"
    source_url: "https://modelcontextprotocol.io/specification/versioning"
    accessed: "2026-08-28"
    volatility: static
  - field: announced
    source: cited
    value: "2024-11-25, open-sourced by Anthropic"
    source_url: "https://www.anthropic.com/news/model-context-protocol"
    accessed: "2026-08-28"
    volatility: dated
  - field: deprecation_window
    source: cited
    value: "at least twelve months before a deprecated feature may be removed, or ninety days under the expedited exception"
    source_url: "https://modelcontextprotocol.io/specification/versioning"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2024-11-25"
    event: "open-sourced with the specification, SDKs, local server support in the Claude desktop apps and a repository of reference servers"
    source_url: "https://www.anthropic.com/news/model-context-protocol"
  - date: "2025-03-26"
    event: "revision replaces HTTP+SSE with the Streamable HTTP transport and adds an OAuth-2.1-based authorization framework"
    source_url: "https://modelcontextprotocol.io/specification/2025-03-26/changelog"
  - date: "2026-07-28"
    event: "revision removes the initialize handshake and protocol-level sessions; roots, sampling and logging are deprecated"
    source_url: "https://modelcontextprotocol.io/specification/2026-07-28/changelog"
mentions: []
---

MCP is a JSON-RPC protocol (version 2.0) for connecting an LLM application to
outside data and tools. Anthropic open-sourced it on 2024-11-25 with a
specification, SDKs, local server support in the Claude desktop apps, and a
repository of reference servers for Google Drive, Slack, GitHub, Git, Postgres
and Puppeteer. It names three roles: **hosts** are the LLM applications,
**clients** are the connectors inside them, **servers** expose context and
capabilities.

Nearly all working knowledge of MCP dates from that launch. As of the current
revision — {{fact:concept/model-context-protocol#current_revision}} — most of the
launch protocol is gone, and the two revisions that removed it were pursuing one
decision: make MCP stateless.

The timeline above shows those two and not the others, which is a choice and
worth naming as one. The specification keeps its own complete history: the
[versioning page](https://modelcontextprotocol.io/specification/versioning)
lists every revision, and each revision's changelog opens by naming the one it
follows. Revisions sit between the two named here. They are absent because they
are not part of this entry's argument, not because the history stops.

What was removed, and what replaced it:

- **The handshake.** The `initialize` / `notifications/initialized` exchange no
  longer exists. Every request now carries its own protocol version and client
  capabilities in `_meta` (`io.modelcontextprotocol/protocolVersion`,
  `io.modelcontextprotocol/clientCapabilities`), and a version the server cannot
  serve comes back as `UnsupportedProtocolVersionError` listing what it does
  support. A new RPC, `server/discover`, which servers **MUST** implement, is
  how a client asks up front instead of negotiating.
- **Sessions.** Protocol-level sessions and the `Mcp-Session-Id` header are gone
  from Streamable HTTP, and `tools/list`, `resources/list` and `prompts/list` no
  longer vary per connection. A server needing cross-call state now mints an
  explicit handle and receives it back as an ordinary tool argument — state
  became data the client can see rather than a connection property it cannot.
- **Server-initiated requests.** `roots/list`, `sampling/createMessage` and
  `elicitation/create` are replaced by the Multi Round-Trip Request pattern: the
  server returns a result whose `resultType` is `input_required`, carrying an
  `inputRequests` list, and the client retries the original request with
  `inputResponses` attached. Every result now carries a `resultType`, and results
  from older servers that omit it **MUST** be read as complete.
- **Stream resumability.** SSE event ids and `Last-Event-ID` redelivery are gone:
  a broken response stream loses the in-flight request and the client must
  re-issue it under a new request id. The HTTP GET endpoint and
  `resources/subscribe` are replaced by one opt-in `subscriptions/listen` stream.
- **`ping`, `logging/setLevel` and `notifications/roots/list_changed`** are
  removed outright; log level is now set per request in `_meta`, and a server
  **MUST NOT** emit log messages for a request that did not ask for them.

Three features are deprecated in the same revision rather than removed: **Roots**,
**Sampling** and **Logging**, each with a migration named in the changelog — pass
directories as tool parameters or resource URIs instead of Roots, call the model
provider's API directly instead of Sampling, log to stderr or OpenTelemetry
instead of Logging. Sampling was the one capability inversion in the launch
protocol — the primitive that let a server ask the host to run an inference on
its behalf — and it is now on a removal path.

Two things worth knowing about how the specification versions itself. The version
string is a date that marks the last backwards-incompatible change, not a
release: a revision that stays compatible does not bump it, so "the current
version" moves rarely and abruptly. And the latest revision added a written
feature lifecycle — Active, Deprecated, Removed — with a stated removal clock
({{fact:concept/model-context-protocol#deprecation_window}}) and a registry page
listing every feature currently deprecated. HTTP+SSE, deprecated in prose since
2025-03-26, was reclassified under that policy, which is the first time MCP's
removals have carried a published schedule rather than a note.
