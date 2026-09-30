# Mountline public site — art direction

Rewritten for the September 2026 "precision" pass; the reference for any new public section or
service page. The message stays: *A better website for the business you’ve built.*

## One idea: precise, connected, human

Vercel’s visual precision, Giga’s connected motion, a small studio’s clarity. Swiss-influenced: strong
type, a deliberate grid, confident asymmetry, fine rules, and a few substantial compositions instead
of many cards. The page itself works in black and white. **Color comes from photography and from the
example business**, never from gradients laid over the page.

What a local business owner should think: *these people could make my business look good, I
understand what they do, and getting in touch is easy.* The site never explains its own
implementation.

## Tokens (`app/homepage.css`, `.ml-site`)

| Token | Value | Use |
| --- | --- | --- |
| `--page` | `#09090A` | page background |
| `--surface-1/2/3` | `#111112` / `#171719` / `#1F1F22` | the few real surfaces (form, console), selected tabs |
| `--fg` | `#EDEDED` | primary text |
| `--fg-2` | `#A3A3A3` | secondary text |
| `--fg-3` | `#8D8D8D` | meta text (≥ 4.5:1 on every surface) |
| `--rule` / `--rule-2` / `--rule-3` | white at 8% / 13% / 24% | the only border family |
| `--accent` | `#62A6FF` | the one accent: focus, the active tab or item, a real live call. Never a wash |
| `--danger` | `#F2877A` | form errors only |
| `--light` | white at 7% | the only glow: a little light behind the one object that matters |

Radii: 4 (tags), 6 (buttons, fields, tabs), 10 (cards), 14 (frames and panels). Devices (phone
frames) and circular controls (the before/after handle, close buttons) are the only round things.
Buttons are 44px (48px full-width on phones). Focus: 2px accent outline, 3px offset, everywhere.

Motion: `--ease-out` for arrivals, `--ease-in-out` for state changes; `--t-quick` 180ms, `--t-state`
360ms, `--t-move` 900ms.

## Type

- **Geist** (already loaded in `app/layout.tsx`) for everything Mountline says. Display weight 600,
  tracking about −0.045em (−0.055em for the hero), line-height 0.95–1.02. Body 16px/1.6, ledes 18px.
- **Geist Mono** only for indexes (01, 02…) and a call’s status line.
- **Instrument Serif** belongs to Bramble, the example business, inside its own frames.
- Phone numbers are contact information: Geist 500, lining figures, normal spacing.

## The example business

**Bramble**, a made-up dog groomer in Keller, is followed through the whole page: hero → what
customers look for → Build/Test/Refine → before/after → Capture. Its photos are free Unsplash images
listed with credits in `lib/homepage/sample-photos.ts`. Label: **“Example business · Design
demonstration”** (Capture: **“Sample imagery · Website concept”**), visible wherever it appears; the
paragraph explaining that it’s fictional appears once, in the hero caption. No reviews, awards,
history, or growth figures. 555-01xx numbers only.

## Compositions

1. **Hero** — the promise at full scale on a faint six-column grid; Bramble’s site in a quiet browser
   frame with the phone beside it.
2. **Customers find what they came for** — four customer questions; each moves both views to the
   part of the page that answers it.
3. **Build → Test → Refine** — one composition changing state (sticky on wide, tall screens; tabs
   elsewhere and with reduced motion). Build: a photo, hours, contact, and services travel along 60°
   paths into Bramble’s page. Test: the same page is masked down to a phone; a customer picks a
   service, asks for a visit, and sees a confirmation. Refine: a tighter photo, today’s hours up top,
   booking one tap away; then the browser returns beside the phone. It demonstrates the customer
   experience. It never shows pass marks or claims a server checked anything.
4. **The difference** — Bramble’s old site and new site in one frame with a divider (a real range
   input). Four differences; choosing one moves both pages. The receptionist point is conditional.
   Measured client results (`lib/case-study/client-results.ts`) render below only once a client has
   approved real numbers.
5. **Capture** — five photographs as a short edit (the work, the room, the way in, the care, the
   result), then the same photos moving into their places on Bramble’s site.
6. **Receptionist** — the call console in graphite with fine rules. The accent light is reserved for
   a real browser call; the scripted example uses a plain light and says “text only, no audio”. The
   demo number in Geist 500; QR secondary on desktop, a tap-to-call button on phones.
7. **Luke**, **Questions**, then **the invitation**, signed with the word-built mark beside the text,
   never over the form.

## Motion rules

- The same composition changes state; things keep their position and identity across states.
- Choreography lives in transitions with delays on *entering* a state, so leaving, reversing, or
  jumping always lands on a finished state.
- Masking before swapping: when a frame changes shape, the old content is clipped to the new shape
  first, then the new layout fades in. Never two outlines at full strength.
- Nothing loops for decoration. Reduced motion gets finished, selectable states.

## Keep internal

Test runs, accessibility scans, performance measurements, and debugging stories belong in
`docs/case-study`, not on the public page.
