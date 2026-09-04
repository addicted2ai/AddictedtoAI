---
id: concept/openai-daybreak
kind: concept
display_name: "OpenAI Daybreak"
status: active
maintenance: living
aliases:
  - name: "OpenAI Daybreak"
    class: exclusive
  - name: "Daybreak"
    class: manual
  - name: "Daybreak Blue"
    class: manual
  - name: "Daybreak Red"
    class: manual
facts:
  - field: blue_definition
    source: cited
    value: "Daybreak Blue supports common defensive work with our mainline models"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
    accessed: "2026-09-04"
    volatility: slow
  - field: red_definition
    source: cited
    value: "Daybreak Red gives approved organizations access to specialized cyber models for more sensitive and technically demanding work"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
    accessed: "2026-09-04"
    volatility: slow
  - field: blue_base
    source: cited
    value: "GPT-5.6 Sol; API stable alias gpt-daybreak-blue-latest"
    source_url: "https://help.openai.com/en/articles/20001258-openai-daybreak-trusted-access-for-cyber-overview"
    accessed: "2026-09-04"
    volatility: slow
  - field: red_base
    source: cited
    value: "GPT-5.6 Cyber; API stable alias gpt-daybreak-red-latest"
    source_url: "https://help.openai.com/en/articles/20001258-openai-daybreak-trusted-access-for-cyber-overview"
    accessed: "2026-09-04"
    volatility: slow
  - field: governance
    source: cited
    value: "Daybreak Access is OpenAI's Trusted Access for Cyber program; it does not remove all safeguards or all refusals"
    source_url: "https://help.openai.com/en/articles/20001258-openai-daybreak-trusted-access-for-cyber-overview"
    accessed: "2026-09-04"
    volatility: slow
  - field: approved_organizations
    source: cited
    value: "2,000 approved organizations and workspaces"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
    accessed: "2026-09-04"
    volatility: slow
  - field: frontline_defenders_commitment
    source: cited
    value: "US$1 billion"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
    accessed: "2026-09-04"
    volatility: dated
  - field: ms_isac_pilot
    source: cited
    value: "a pilot with the Multi-State Information Sharing and Analysis Center (MS-ISAC) pairing Daybreak access with guided training for an initial group of public sector and water system defenders"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
    accessed: "2026-09-04"
    volatility: slow
  - field: defense_network_scale
    source: cited
    value: "more than 35 products and partner-operated services across the Daybreak Defense Network"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
    accessed: "2026-09-04"
    volatility: slow
  - field: water_sector_support
    source: cited
    value: "up to US$1 million in no-cost API credits, Daybreak access and technical assistance, offered to affected states and utilities after attacks on U.S. water systems"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
    accessed: "2026-09-04"
    volatility: dated
timeline:
  - date: "2026-06-22"
    event: "expansion announced: the full GPT-5.5-Cyber release, an update to the Codex Security plugin, the Daybreak Cyber Partner Program and Patch the Planet, founded with Trail of Bits"
    source_url: "https://openai.com/index/daybreak-securing-the-world/"
  - date: "2026-09-01"
    event: "Path to Astra names Daybreak Blue as the access channel for Astra's advanced cyber workflows after alpha testers, and states Astra's evaluation results reflect Daybreak Blue access"
    source_url: "https://openai.com/index/path-to-astra/"
  - date: "2026-09-03"
    event: "Daybreak for Frontline Defenders announced: a $1 billion commitment, the MS-ISAC pilot, and more than 35 products and partner-operated services across the Daybreak Defense Network"
    source_url: "https://openai.com/index/daybreak-for-frontline-defenders/"
  - date: "2026-09-03"
    event: "GPT-6 Astra release page names Daybreak as the channel for less restrictive cyber safeguards \"in the coming weeks\""
    source_url: "https://openai.com/index/gpt-6-astra/"
mentions:
  - org/openai
  - model/openai-gpt-5-6-sol
---

OpenAI Daybreak is the access program through which OpenAI's frontier cyber
capability reaches defenders. It is the same thing as the Trusted Access for
Cyber program, OpenAI's governance layer for approved cyber work: it lets
"verified public and private sector defenders" use advanced AI "for authorized
cyber defense", applying more precise safeguards while usage policies and
access controls stay in force. OpenAI dates the launch only loosely. The
3 September 2026 announcement says Daybreak was launched "earlier this year";
the earliest dated OpenAI announcement this entry can cite is "Daybreak: Tools
for securing every organization in the world" (22 June 2026), which already
describes an expansion — the full GPT-5.5-Cyber release, an update to the Codex
Security plugin, the Daybreak Cyber Partner Program, and Patch the Planet, the
open-source patching initiative founded with Trail of Bits.

Two access levels carry the program's name. {{fact:concept/openai-daybreak#blue_definition}};
{{fact:concept/openai-daybreak#red_definition}}. The models behind the levels
are documented on OpenAI's help center — Blue:
{{fact:concept/openai-daybreak#blue_base}}; Red:
{{fact:concept/openai-daybreak#red_base}}. Red requires approval beyond Blue's,
and approval is never automatic: OpenAI reviews each applicant's organization,
workflows and verification before enabling access. The levels sit inside the
governance layer rather than replacing it — {{fact:concept/openai-daybreak#governance}}.

Daybreak is the gate through which frontier cyber capability passes. The
1 September 2026 Path to Astra announcement designated Astra Critical under the
Preparedness Framework and named Daybreak Blue as the access channel for the
model's advanced cyber workflows — "with access through Daybreak Blue expanding
afterward to support defensive use" — then footnoted the announcement's
capability numbers with "Astra results shown reflect capabilities with Daybreak
Blue access, not the default production configuration". The GPT-6 Astra release
page, dated 3 September, shipped Astra refusing proof-of-concept exploit
creation, with less restrictive safeguards planned "in the coming weeks"
through Daybreak. The help center is blunter about the near term: "Reduced
refusals aren't available on Astra for most Daybreak customers."

On 3 September 2026 OpenAI committed {{fact:concept/openai-daybreak#frontline_defenders_commitment}}
in subsidized Daybreak access, training, technical support and partnerships —
Daybreak for Frontline Defenders — "targeting it to be consumed over the next
six months", starting in the United States. The priorities are defenders
without large budgets: water and wastewater systems, electric grid operators,
state and local governments, community and regional banks, nonprofits and
open-source maintainers. Delivery has two announced mechanisms:
{{fact:concept/openai-daybreak#ms_isac_pilot}} and
{{fact:concept/openai-daybreak#defense_network_scale}}.

The program's scale predates the commitment: {{fact:concept/openai-daybreak#approved_organizations}}
already use Daybreak, per the announcement, and the water-sector offer came
earlier — after attacks on U.S. water systems, OpenAI offered affected states
and utilities {{fact:concept/openai-daybreak#water_sector_support}}. The
six-month consumption target puts the end of the window around early March
2027.