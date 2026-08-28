---
id: tool/comfyui-manager
kind: tool
display_name: "ComfyUI Manager"
status: active
maintenance: stable
aliases:
  - name: "ComfyUI Manager"
    class: exclusive
  # "Comfy" is claimed as `exclusive` by tool/comfyui and as `shared` here.
  # That is not a collision (only two `exclusive` claims fail the build) but
  # it does make the name ambiguous, so the linker must refuse it.
  - name: "Comfy"
    class: shared
facts: []
timeline: []
mentions: []
---
