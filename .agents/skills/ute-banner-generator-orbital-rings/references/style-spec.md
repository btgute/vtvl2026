# Style A — Orbital Rings — Smooth Porcelain White

Use this specification for both new banners and cleanup of existing DVCN banners.

## Canvas and layout

- Exact final canvas: 3000 × 1000 px, opaque RGB PNG, 3:1.
- Left title-safe region: x = 0–1650 px. Keep it calm, pale, and free of objects.
- Main visual region: approximately x = 1700–2850 px and y = 100–900 px.
- Keep at least 100 px of clear space around the icon cluster.
- Match the compact scale shown in the canonical reference. When converting a legacy full-size banner, uniformly scale the complete right-side visual system to 80% around its current visual center; do not translate the center.
- The complete visual system includes the main object, support tokens, glass tiles or pedestal, both orbital rings, and their soft shadows.
- The cluster may vary by subject, but its visual center and reduced overall scale should remain consistent across a banner set.

## Background

Use a continuous porcelain-white field with very pale icy-blue gradients. Add broad, low-contrast flowing ribbons that enter from the left and visually guide toward the right cluster. The ribbons must stay soft enough for dark-blue HTML text to remain readable.

The background must cover all four corners. Reject black, transparent, gray-feathered, noisy, or visibly tiled edges.

## Orbital system

Use exactly two thin elliptical rings in HCM-UTE blue. They should pass naturally behind and around the cluster. Keep them clean, continuous, light, and subordinate to the subject. Avoid duplicate reflection arcs and white glare rings.

## 3D subject language

- One dominant semantic object.
- Zero to two supporting tokens when they add distinct meaning.
- Slight three-quarter isometric view.
- Rounded molded-polymer or soft-clay volume.
- Smooth generous bevels and broad satin-gloss highlights.
- Gentle ambient occlusion between joined parts.
- Clear glass may support the object through a tile or low pedestal, but should not become the subject.
- Crystal must show clean transparent-white thickness, smooth planar faces, crisp continuous pale-blue bevels, controlled refraction, and one restrained broad edge highlight.
- Avoid cloudy or milky plastic, melted geometry, striped or rippled caustics, zigzag reflections, duplicate highlight bands, bloom, and sparkles.
- Vary silhouette and arrangement according to meaning; avoid a mechanical repeated card template.

## Palette

- Primary blue: #0072BC.
- Accent red: #ED1C24.
- White: #FFFFFF.
- Supporting neutrals: pale cool gray only.

Blue and white form the main object. Red should mark one meaningful action, selected item, alert, ribbon, or confirmation. Do not introduce unrelated colors.

## Standardization prompt

```text
Use case: style-transfer.
Asset type: HCM-UTE university website hero banner, exact 3000x1000 px.
Input images: Image 1 is the edit target and source of truth for subject and composition. Image 2 is the canonical Orbital Rings banner reference. Image 3 is style-only reference for rounded HCM-UTE 3D material and palette.
Primary request: Refine Image 1 without redesigning it. Preserve its subject, semantic objects, visual center, two orbital rings, porcelain-white background flow, and empty left title area. Uniformly scale the complete right-side visual system to 80% around its existing visual center.
Color correction: standardize blue to #0072BC and red to #ED1C24; remove cyan cast and muddy gray.
Line cleanup: sharpen important silhouettes, connectors, symbols, and restrained glass bevels; improve local contrast moderately.
Crystal treatment: use clean transparent-white crystal thickness, smooth planar faces, crisp continuous pale-blue bevels, controlled refraction and one restrained broad edge highlight; avoid cloudy plastic, rippled caustics, duplicate highlight bands and bloom.
Background: fully opaque edge-to-edge Smooth Porcelain White with subtle pale-blue flow; left 55% remains calm and empty.
Constraints: do not add, remove, reorder, or relocate meaningful objects; no text, letters, numbers, logos, watermark, crop, black corners, transparency, grain, streaky glass, repeated caustics, or excessive glow.
```

## New-banner prompt

```text
Use case: ads-marketing.
Asset type: HCM-UTE university website hero banner, exact 3000x1000 px.
Primary request: create a Style A – Orbital Rings – Smooth Porcelain White banner for {topic}.
Subject: one cohesive polished 3D composition built around {primary object}, with at most two meaningful supporting tokens: {supporting tokens}.
Composition: keep left 55% calm and empty for an HTML heading; place the complete cluster in the right 38–40%, vertically centered, with safe margins; match the compact 80% scale and center position of the canonical reference; exactly two thin blue elliptical orbital rings.
Style: rounded molded-plastic and soft-clay volume, generous smooth bevels, broad satin-gloss highlights, slight three-quarter depth, gentle ambient occlusion.
Crystal treatment: clean transparent-white thickness, smooth planar faces, crisp continuous pale-blue bevels, controlled refraction and one restrained broad edge highlight; no cloudy plastic, rippled caustics or bloom.
Palette: HCM-UTE blue #0072BC and red #ED1C24, with white and pale neutral gray only.
Background: fully opaque porcelain white with restrained icy-blue gradients and broad soft flowing ribbons.
Constraints: no baked-in title, readable text, letters, numbers, watermark, unofficial logo, realistic people, faces, hands, floor plane, black corners, transparency, grain, streaky glass, repeated caustics, excessive glare, or cropped objects.
```

## Quality gate

Reject or correct an output when any of these is true:

- dimensions are not 3000 × 1000 px;
- the file has transparency or dark/unfinished corners;
- objects intrude into the left 55%;
- the cluster is visibly larger than the compact scale in the canonical reference or its center has shifted;
- the main cluster is cropped or too close to an edge;
- blue/red visibly depart from the HCM-UTE palette;
- more than two orbital rings appear;
- connectors or semantic symbols are broken or blurry;
- accidental text, letters, numbers, or a distorted logo appears;
- excessive glass glare or background detail competes with the title area.
