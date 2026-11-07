---
name: hcmute-icon-assets
description: Generate HCM-UTE 3D icon assets for university web and mobile apps from per-icon prompt text files.
---

# HCM-UTE Icon Assets

Use this skill when the user asks for HCM-UTE web/app 3D icon prompts or transparent PNG icon assets.

## Outcome

Produce a coherent HCM-UTE icon asset set using only:

- Source prompts in `icon-assets/prompts/<icon_id>.txt`.
- Generated transparent PNGs in `icon-assets/3d-icons/<icon_id>__hcmute-3d-icon.png`.

The prompt filename stem is the stable `icon_id` and the source of truth. Do not create or require a workbook, catalog, spreadsheet, CSV, or asset-map file unless the user explicitly asks for one.

## Brand Direction

Use [assets/reference-course-registration.png](assets/reference-course-registration.png) as the canonical visual reference. Match its original rounded glossy 3D language while translating subjects to HCM-UTE:

- Brand colors: HCM-UTE blue `#0072BC` and red `#ED1C24`; use white, light gray, and dark gray as supporting colors only.
- Style: premium friendly 3D icon render with rounded molded-plastic or soft-clay forms, smooth generous bevels, full soft volume, broad glossy highlights, and layered interlocking parts.
- View: slight three-quarter isometric front view, like the reference calendar, card, arrow, and check composition. Do not flatten the object into a front-facing low-relief tile.
- Composition: derive the arrangement from the icon's meaning. Start with one clear primary object; add zero to two supporting elements only when they materially improve recognition. Attach, insert, stack, overlap, place beside, or omit them according to the natural relationship between the objects. Do not require fixed upper-left or lower-right tokens, and do not repeat one layout across the set. The complete silhouette must read at thumbnail size.
- Depth: use substantial but controlled rounded depth and visible overlapping layers. Avoid a universal square enclosure, forced perimeter frame, thin technical rim, flat panel system, or photoreal metal treatment.
- Edge treatment: softly rounded molded edges with smooth specular rolloff, matching the reference. Borders belong to the depicted object's natural geometry rather than wrapping every icon in the same frame.
- Card integration: keep the PNG background transparent. Soft blush ellipses, card shadows, and hover backgrounds should normally be UI/CSS, not baked into the icon.
- Restrictions: no readable text, no unofficial logo redraws, no watermark, no human people or faces, no floor plane, no environmental scene, no baked checkerboard, and no heavy cast shadow.

Read [references/prompt-style.md](references/prompt-style.md) when creating, repairing, or generating from prompts.

## Workflow

1. Inspect `icon-assets/prompts/`. Generate the prompt files named by the user; when the user asks for all icons, generate prompt files whose matching PNG is absent or explicitly needs replacement.

2. Read each complete `icon-assets/prompts/<icon_id>.txt` file. If it is missing or weak, create or repair it using the style guide while preserving the stable filename.

3. Pass [assets/reference-course-registration.png](assets/reference-course-registration.png) as a style reference for each generation. Treat it as style-only; generate the semantic subject specified by the prompt.

4. Before generation, simplify the subject if needed. Remove decorative extras, campus scenery, repeated objects, and secondary metaphors until the icon reads as one cohesive cluster.

5. Generate a transparent PNG using this stable output filename:

   ```text
   <icon_id>__hcmute-3d-icon.png
   ```

6. Place the image in `icon-assets/3d-icons/` or a user-specified output folder. Keep prompt files in `icon-assets/prompts/`; do not scatter prompt text into the image folder.

7. If ImageGen returns an RGB checkerboard preview instead of true alpha, clean the exported PNG:

   ```bash
   python3 agent-skills/hcmute-icon-assets/scripts/remove_checkerboard_bg.py <input.png> <output.png>
   ```

8. Validate the result against the style reference: correct palette, rounded volumetric isometric construction, meaning-led composition, cohesive silhouette, clean transparent padding, no text, no universal frame, and no checkerboard. Regenerate once with a targeted correction if it fails a key rule.

9. Keep the prompt filename and PNG filename stable when replacing an icon. Preserve rejected drafts outside `icon-assets/3d-icons/` so the active folder contains only current assets.
