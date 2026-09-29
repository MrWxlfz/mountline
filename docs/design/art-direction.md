# Mountline public site — art direction

Written before the September 2026 rebuild, and kept as the reference for any new public section.
The message stays: *A better website for the business you’ve built.* What changes is how it looks,
moves, and proves itself.

## One idea: a studio lit by one lamp

A near-black room, graphite surfaces, warm ivory type, and a single warm light. Amber is never a
second theme colour; it is the light itself. It sits behind or on the one thing to look at in each
composition: the example website in the hero, the activity light on the call console, the active
path in the Build → Test → Refine scene, the highlight moving through the word-built mark. Every
gradient on the page follows that logic — broad, soft, anchored to a focal object, falling off to
the page colour. No free-floating rainbow glows.

Green belongs to Bramble (the fictional groomer) and stays inside its frame. Blue is not used.

## Palette (semantic tokens, `app/homepage.css` `.ml-site`)

| Token | Value | Use |
| --- | --- | --- |
| `--page` | `#0A0B0C` | page background |
| `--surface-1` | `#121416` | panels: console, form, evidence |
| `--surface-2` | `#191C1F` | controls and inset areas inside a panel |
| `--surface-3` | `#22262A` | hover / pressed |
| `--fg` | `#F4F0E8` | primary text |
| `--fg-2` | `#B1B2AF` | secondary text |
| `--fg-3` | `#8E908C` | meta text (≥ 4.5:1 on every surface) |
| `--accent` | `#DCA96B` | the lamp: focus, active state, one highlight per view |
| `--rule` / `--rule-2` | ivory at 8% / 14% | the only border family |
| `--danger` | `#E8907C` | form errors only |

Surfaces get depth from light, not outlines: a 1px ivory top highlight at 6–8%, a soft long shadow,
and at most one rule. Never a border inside a border inside a border.

## Type

- **Instrument Sans** (variable weight and width) carries everything Mountline says. Display sizes
  use weight 600, width ~92%, tracking −0.035em, line-height ~0.98. Hero 76–80px desktop, 42–44px
  phone. Body 17px / 1.6 (16px on phones). Section heads 44–60px.
- **Geist Mono** only for small useful labels: chapter numbers, call status, units in results.
- The word-built mark uses mono microtype; it is the one place type is decoration.
- Bramble keeps its own Instrument Serif inside its frame.

## System

- Container 1240px + gutters (40 / 28 / 20px). 12-column grid.
- Section rhythm `--section: clamp(96px, 11vw, 152px)`; related blocks 48–64px apart.
- Radii 10 (fields, chips), 16 (cards, devices' inner), 24 (panels). Buttons are pills, 48px tall
  (44px small, 52px on phones).
- Focus: 2px amber outline, 3px offset, everywhere. Icons: lucide at 1.75 stroke.

## Compositions

1. **Hero** — the promise at full scale, left aligned, with the example website lit from behind.
   The label "Design example" lives in the browser's address bar, where it is read with the image.
2. **What customers find** — four short views (Services, Hours & directions, Booking, On a phone).
   Each is one answer and one readable crop of the example. Click and it changes. No scroll pinning.
3. **Build → Test → Refine** — the page's one sticky scene (desktop, ~2 extra viewports). Real
   details from this site become a page, the page becomes a phone and gets used like a customer
   would, then an actual issue we found gets fixed. Results come from the recorded test file.
   It lands on the evidence panel: *And yes, we tested it.*
4. **Capture (optional)** — one storyboard frame becoming the photo on the page.
5. **Receptionist (optional)** — an original call console: graphite, precise, one amber activity
   light. Two paths: talk to the demo in the browser, or play a short example with no audio.
6. **Luke** — portrait and three sentences.
7. **Questions**, then **the invitation** with the word-built arch set into it.

## Motion

Motion shows a relationship or a change; nothing loops for decoration.

- Transitions carry position: the thing you clicked is where the result appears.
- Easing `cubic-bezier(0.16, 1, 0.3, 1)` for arrivals, `cubic-bezier(0.65, 0, 0.35, 1)` for morphs.
  260–700ms, never slower than the reader.
- Paths draw once, from a detail to where it lives on the page. A highlight may travel them once.
- The word-built mark gathers along its own strokes as it enters and then stays still.
- Reduced motion gets finished, selectable states — never a blank waiting for animation.
- Every frame should look composed with motion paused.
