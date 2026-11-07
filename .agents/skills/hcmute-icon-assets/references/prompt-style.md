# HCM-UTE 3D Icon Prompt Style

Use these rules when writing or repairing prompts for HCM-UTE icon assets.

## Palette

Default palette:

- HCM-UTE blue: `#0072BC`
- HCM-UTE red: `#ED1C24`
- White: `#FFFFFF`
- Light gray: `#E5E7EB`
- Dark gray: `#374151`

Use HCM-UTE blue and red as the only chromatic colors. Blue and white usually carry the primary object; red should mark an action, direction, alert, or confirmation when meaningful. White and gray support panels, sheets, rings, seams, and neutral details. Do not impose fixed percentages when the subject reads better with another balance.

## Canonical Original 3D Style

Use `../assets/reference-course-registration.png` as the canonical visual reference:

- Slight three-quarter isometric front view with visible side depth and overlapping layers.
- Rounded, softly inflated molded-plastic or soft-clay forms with smooth generous bevels.
- Satin-gloss finish, broad soft highlights, and gentle ambient occlusion where pieces meet.
- One cohesive object cluster: one clear primary object plus zero to two meaningful support tokens such as an arrow, check badge, magnifier, pin, or notification bead.
- Bold friendly proportions and a readable silhouette at app-icon scale.
- Natural object-specific borders and rims. Do not add a universal rounded-square frame or a shared technical perimeter rim.
- No flat low-relief panel system, no anodized-metal engineering aesthetic, and no thin technical outline treatment.
- Keep PNGs transparent. The soft pink/red oval glow in card layouts should usually be created by the website/app UI, not baked into the exported icon.

## Meaning-Led Composition

Choose the composition independently for each icon while preserving the canonical 3D materials above:

- Begin with the smallest concrete object or object group that communicates the subject clearly. A single strong object is valid.
- Add zero to two supporting elements only when they add distinct semantic information. Never add a token merely to occupy a corner or complete a formula.
- Arrange relationships naturally: a part may be attached, inserted, embedded, stacked, wrapped around, leaning against, behind, in front, or beside the primary object.
- Vary the silhouette and reading flow to fit the subject. Symmetrical, centered, diagonal, vertical, horizontal, circular, or asymmetrical compositions are all valid when meaningful.
- Keep the result compact and cohesive. Use overlap and depth when multiple pieces belong together, but do not force overlap when one integrated object reads better.
- Treat the admissions reference-card arrangement as one optional example, not a universal template. Do not automatically copy its document, graduation cap, magnifier, check badge, or corner positions.
- Leave 16-20% transparent breathing room around the complete object or cluster. Do not bake UI card backgrounds, glows, orbit lines, text, borders, or page backgrounds into the PNG.

## Prompt Template

```text
Use case: hcmute-3d-icon
Asset type: transparent 3D icon asset for the HCM-UTE university web and mobile app
Primary request: visualize {english_label} for {category}
Subject: one cohesive polished 3D icon composition: {subject}. Use one clear primary object and at most two meaningful supporting tokens. The icon should read instantly as "{semantic_hint}".
Style/medium: match the supplied original course-registration reference: premium friendly 3D icon render, rounded molded-plastic and soft-clay forms, full soft volume, smooth generous bevels, layered interlocking parts, and a polished modern university-app aesthetic
Composition/framing: exact 1:1 square transparent asset; choose the arrangement that communicates this subject most clearly; keep one dominant semantic object and add zero to two supporting elements only when they materially improve recognition; use natural attachment, insertion, stacking, overlap, adjacency, or a single-object silhouette as appropriate; slight three-quarter depth; fully visible with 16-20% transparent padding; readable at 48 px
Layout behavior: derive placement and reading flow from this subject; no mandatory upper-left or lower-right token, no fixed three-part formula, and no mechanical copying of an example layout; keep every included part semantically necessary and visually cohesive
Lighting/mood: soft studio lighting from the upper left, broad glossy highlights, gentle ambient occlusion between overlapping parts, clean bright trustworthy academic mood; no environmental light, halo, vignette, or floor shadow
Color palette: use only HCM-UTE blue #0072BC and HCM-UTE red #ED1C24 as chromatic colors, with white #FFFFFF, light gray #E5E7EB, and dark gray #374151 as supporting colors; blue and white usually form the main object, red marks meaningful actions or status; no unapproved colors
Materials/edge treatment: satin-gloss molded polymer and soft clay, substantial but controlled rounded depth, smooth specular rolloff, soft chamfers, clean seams, and natural object-specific rims; match the reference's dimensional softness and layered construction; no universal frame or technical perimeter outline
Scene/backdrop: genuine transparent RGBA background with clean alpha from edge to edge; do not draw a transparency checkerboard, chroma key, canvas color, glow, or backdrop
Constraints: match the original rounded volumetric 3D style and slight isometric perspective; keep the cluster immediately understandable; no forced rounded-square tile, no shared perimeter frame, no flat low-relief treatment, no thin technical border, no photoreal metal, no full campus scene, no extra decorative props, no readable text, no letters, no numbers unless explicitly required, no official logo recreation, no watermark, no human people, faces, or hands, no flags, no floor plane, no cast shadow, no reflection, no background texture or gradient, crisp opaque object edges, no green spill
```

## Subject Guidance

Prefer concrete university and digital-service objects over abstract symbols. Each icon should have one main object:

- Academic: book, transcript sheet, graduation cap, calendar, certificate, exam paper.
- Engineering: gear, circuit board, robot arm, microchip, tool module, IoT node.
- Campus: building block, map pin, gate, classroom screen, library shelf, Wi-Fi node.
- Services: ID card, payment wallet, QR tile, inbox tray, notification bell, document folder.

Use at most two support tokens, such as one check badge, one arrow, one magnifier, or one red alert bead. Their presence and placement must follow the subject's meaning: attach, insert, stack, overlap, place beside, or omit them as appropriate. Avoid scattered objects, decorative tokens with no semantic role, or a full illustration scene.

Do not draw the HCM-UTE logo as an icon subject unless the user provides a licensed source asset and explicitly asks for logo-derived work. Brand colors are enough for normal product icons.

## Quality Checks

Reject or mark `review_needed` when an output has:

- Readable text or accidental letters.
- Wrong dominant palette.
- Cropped edges or too little padding.
- A human person, human face, or hand. A simple robot face is allowed only for AI assistant icons.
- Flat low-relief output, universal rounded-square frame, technical perimeter rim, photoreal metal, floor, reflection, or environment scene.
- Background that is not transparent or clean chroma green.
- Multiple disconnected objects, too many props, or a scene that does not read as one cohesive icon cluster.
- A mechanically repeated corner-token layout, or supporting elements included only to fill predetermined positions.
- The example card's pink glow, oval orbit, rounded UI border, page text, or background baked into the PNG.
