---
id: concept/unbound
kind: concept
display_name: "Unbound"
status: active
maintenance: stable
aliases:
  - name: "Unbound"
    class: manual
timeline: []
mentions: []
---

A record joins this piece and carries no hash at all. Every record written
before the binding existed is in this state, which is why it must fail nothing:
a mechanism that failed on every pre-existing record could not land.
