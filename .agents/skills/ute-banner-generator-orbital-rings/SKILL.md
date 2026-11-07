---
name: ute-banner-generator-orbital-rings
description: Create or standardize 3000 × 1000 HCM-UTE website banners in the “Orbital Rings – Smooth Porcelain White” visual system. Use for DVCN banner generation, visual cleanup, palette correction, consistent right-side 3D icon composition, or batch normalization. Do not use for standalone transparent icons or unrelated banner styles.
---

# UTE Banner Generator — Orbital Rings

Create a coherent banner family for HCM-UTE while preserving each banner's meaning.

## Required outcome

- Export a fully opaque PNG at exactly **3000 × 1000 px**.
- Reserve the left **55%** as calm negative space for an HTML title. Do not bake a title into the image.
- Place one compact semantic 3D cluster in the right **38–40%**, vertically centered and inside safe margins. Match the reduced scale in the canonical reference: about **80% of the earlier full-size cluster**, anchored on the same visual center.
- Use exactly two thin blue elliptical orbital rings to unify the cluster.
- Use a smooth porcelain-white background with restrained icy-blue gradients and broad soft flowing ribbons.
- Use HCM-UTE blue **#0072BC** and red **#ED1C24** as the only chromatic colors. White and pale neutral gray support the composition.
- Keep the result bright, legible, institutional, and consistent at thumbnail size.
- Render clear crystal parts with visible transparent-white thickness, smooth planar faces, crisp continuous pale-blue bevels, controlled refraction, and one restrained broad edge highlight.

Use [assets/style-a-orbital-rings-reference.png](assets/style-a-orbital-rings-reference.png) as the canonical banner reference. Use [assets/hcmute-3d-icon-reference.png](assets/hcmute-3d-icon-reference.png) only for the rounded 3D material, bevel, lighting, and palette.

Read [references/style-spec.md](references/style-spec.md) before generating or standardizing a banner.

## Choose the mode

### Create a new banner

Derive the subject from the user's topic. Use one dominant object and at most two meaningful supporting tokens. Arrange them as one cohesive cluster; do not repeat a fixed three-card formula when the topic reads better another way.

### Standardize an existing banner

Treat the source banner as the truth for subject and composition. Preserve its symbols, hierarchy, right-side center position, rings, background flow, and empty left area unless the user explicitly requests a redesign. For legacy full-size banners, uniformly scale the complete visual system to 80% around its existing visual center.

Limit ordinary standardization to:

- correct blue and red toward the HCM-UTE palette;
- sharpen silhouettes, connectors, symbols, and restrained glass bevels;
- upgrade crystal to clean transparent-white thickness with continuous pale-blue bevels and low glare;
- remove cyan cast, muddy gray, grain, excessive glare, streaks, and broken edges;
- restore a fully opaque porcelain-white background across all four corners.

## Workflow

1. Inspect the source banner or topic and identify the single primary meaning.
2. For a local edit target, view it before calling the image tool.
3. Pass the source banner first when standardizing, then the canonical banner and icon references as style-only inputs.
4. Use the built-in image generation/edit tool. State explicitly which input is the edit target and which inputs are style references.
5. Ask for one complete 3000 × 1000 banner, without text, logos, or watermark.
6. Inspect the output. Regenerate once with one targeted correction if a key invariant fails.
7. Resize/export to exactly 3000 × 1000 px when the generator returns a proportional intermediate size.
8. Validate pixel dimensions and ensure the final image has no transparency.
9. Save non-destructively. Use the user's destination; otherwise use `Banner DVCN/standardized-orbital-rings-a/`. Preserve existing banners unless replacement was explicitly requested.
10. Save the final prompt beside the PNG as `<banner-name>.prompt.txt`.

## Hard constraints

- No readable text, letters, numbers, watermark, border, or UI chrome.
- No unofficial reconstruction of the HCM-UTE logo. If a supplied official logo must remain, preserve it exactly instead of regenerating it.
- No realistic people, faces, or hands. Abstract bust or team symbols are allowed.
- No black corners, transparent fade, dark vignette, floor plane, noisy caustics, repeated reflections, sparkles, heavy bloom, or streaky glass.
- Do not crowd the left title area or crop the right-side cluster.
- Do not add decorative objects that do not improve recognition.
