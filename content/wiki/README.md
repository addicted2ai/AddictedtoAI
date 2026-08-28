# content/wiki/

Wiki entries — the site's cornerstone substrate. One file per entry at
`content/wiki/<kind>/<slug>.md`, whose id is `<kind>/<slug>`, kebab-case,
unique, never reused or renamed (`specs/wiki`).

`kind` comes from this closed list and no other value: `model`, `org`,
`tool`, `concept`, `technique`, `benchmark`, `dataset`, `hardware`, `paper`,
`event`. There is deliberately no `person` kind.

Stub entries minted mechanically by the Pulse (`specs/pulse`) land here too —
data-only, `manual`-classed aliases, no prose.
