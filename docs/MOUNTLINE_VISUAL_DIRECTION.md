# Mountline Visual Direction

Decision record for the homepage art-direction reset. Written after the mandatory three-concept sprint, before full implementation.

## Concept sprint

Three prototypes were built as internal routes using real Mountline demo assets (Served Sliders, Ruff Scrub, Rick's Barbering, Nomad Auto Spa) and rendered at 1440px and 390px:

| Concept | Route | Desktop render | Mobile render |
| --- | --- | --- | --- |
| A — Linear precision | `/internal/home-concepts/a` | `docs/visual-review/concept-a-1440.png` | `docs/visual-review/concept-a-mobile.png` |
| B — Product studio with Notion warmth | `/internal/home-concepts/b` | `docs/visual-review/concept-b-1440.png` | `docs/visual-review/concept-b-mobile.png` |
| C — Mountline signature | `/internal/home-concepts/c` | `docs/visual-review/concept-c-1440.png` | `docs/visual-review/concept-c-mobile.png` |

### Concept A — Linear precision

Centered editorial hero on deep graphite, a full-bleed work band with a framed browser scene, a two-up work grid, and an editorial row-list capability section.

- Strengths: confident type scale, the row-list capability treatment reads calm and premium, quiet accent use.
- Weaknesses: the centered hero is the most generic composition of the three; chapter silhouettes are the least differentiated; at thumbnail size it reads as "another dark SaaS page." Scores lowest on visual originality and section variety.

### Concept B — Product studio with Notion warmth

Left-aligned hero with capability pill tags, tinted work-preview cards (tan / sky / mint), and a lavender conversational panel.

- Strengths: friendliest of the three; tinted card surfaces give the work section personality; the conversation panel demonstrates a real job.
- Weaknesses: the palette sprawls — tan, sky, mint, lavender plus the ember accent exceeds a controlled system, and the large lavender panel dominates a full chapter. The tinted-card grid edges toward "portfolio collage," which the brief excludes. Scores lowest on premium feeling and resemblance-to-AI-marketing risk.

### Concept C — Mountline signature

Split editorial hero with an integrated device stage (framed desktop + real mobile render + one customer-action chip) and a project selector; a numbered sticky-index work explorer driving one large project scene; a capability split pairing one warm clay panel with a dark portal card.

- Strengths: the device stage with a working project selector is the strongest hero idea — the real demo work supplies the color and the proof; the numbered index explorer is a distinctive, ownable motif that shows one project prominently at a time; the clay/dark capability split shows how supporting color can appear as controlled surfaces; mobile holds up with a readable stacked stage.
- Weaknesses: needs Concept A's editorial list rhythm in places to avoid every chapter becoming a "panel"; the customer-action chip needs tighter integration into the stage.

## Evaluation against criteria

| Criterion | A | B | C |
| --- | --- | --- | --- |
| Clarity to a local owner | Good | Good | Good |
| Visual originality | Low | Medium | High |
| Readability | High | High | High |
| Section variety | Low | Medium | High |
| Mobile quality | Good | Good | Good |
| Premium feeling | High | Medium | High |
| Scales across full page | Medium | Medium | High |
| Resembles AI marketing | Highest risk | Medium risk | Lowest risk |

## Decision

**Concept C is the direction, deliberately borrowing Concept A's editorial list rhythm.**

Why it wins:

1. The hero device stage answers the brief's core demand — real desktop + real mobile + one customer action, composed as one scene rather than two rectangles — and the project selector makes the real work the first interaction on the page.
2. The numbered index explorer gives Mountline an ownable visual motif (an "index → one large scene" grammar) that is neither a Linear clone nor a screenshot-card grid, and scales naturally to six projects.
3. Its surfaces already demonstrate the layered palette: graphite page, quiet sections, raised stage, one warm paper/clay interruption. That solves both the "exhausting dark mode" and "endless beige light mode" failures.
4. It scored highest on section variety and lowest on AI-marketing resemblance — the two failures this reset exists to fix.

What is borrowed from A: the editorial row-list rhythm (used where a chapter needs calm, not another panel — e.g. parts of the capability mosaic and process). What is rejected from B: the sprawling tint palette and the lavender chapter; supporting colors are kept but demoted to small controlled surfaces inside the mosaic only.

## Final palette (dark foundation)

- Page `#0B0B0D` · quiet section `#101013` · surface `#151519` · raised `#1B1B20`
- Strong text `#F1EFEA` · body `#C4C0B8` · muted `#918D86`
- Borders `rgba(255,255,255,.075)` / strong `rgba(255,255,255,.14)`
- Accent: refined ember `#E2603D` family — reserved for active controls, primary CTA, small state indicators, progress, important links
- Warm paper `#F3EEE4` for the founder interruption and light-mode surfaces
- Mosaic supporting surfaces (desaturated, small areas only): soft coral, soft sky, pale lemon, gentle mint, muted graphite-lavender

Light mode is a related personality, not an inversion: warm neutral page, near-white surfaces, dark product canvases kept dark, the same ember accent.

## Typography

Two families: the existing sans for UI/body, with a tighter editorial scale — large headlines set wide (not narrow four-line stacks), body at comfortable sizes (≥15px), muted text never below readable contrast. No decorative faces.

## Compositional system

Seven movements, each with a distinct silhouette: split hero with device stage → sticky index explorer → tactile workbench → horizontal inquiry timeline → varied mosaic → process line + integrated portal scene + warm founder interruption → dark conversational form. No repeated eyebrow/heading/screenshot grammar; the accent is not used for section furniture.

## Concept routes

The `/internal/home-concepts/*` routes are temporary sprint artifacts and are removed after implementation (this document and the renders in `docs/visual-review/` preserve them).
