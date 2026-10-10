# Mountline motion choreography

Every timing below is taken from the reference files (`site-reference.html`, `id-reference.html`, `card-reference.html`). Match them. Frame sheets of the real thing are in `screenshots/choreo-intro-and-rebrand.png` and `screenshots/choreo-tab-steps.png`.

**Easing names used below**
- `out` = `cubic-bezier(.22,1,.36,1)`: the default for everything.
- `pop` = `cubic-bezier(.34,1.6,.64,1)`: the intro dots.
- `bubble` = `cubic-bezier(.34,1.56,.64,1)`: rebrand bubble entrance.
- `snap` = `cubic-bezier(.34,1.8,.64,1)`: the new logo popping in.
- `glide` = `cubic-bezier(.7,0,.2,1)`: dots flying from center into the hero.

**Rules**
- Animate `transform` and `opacity` only. The one exception is the overlay's `background-color` fade.
- Nothing that carries meaning waits on JavaScript. The H1, lead and buttons are server-rendered and visible underneath the intro overlay, so LCP is not delayed.
- `prefers-reduced-motion: reduce` means no intro, no bob, no reveals, the tabs don't auto-advance, and the rebrand bubble appears static with both logos already shown.

---

## 1. Homepage first visit (once per browser session)

| t (ms) | What happens | Duration · easing |
|---|---|---|
| 0 | A full-screen overlay in `--bg` covers the page. The four dots sit at center, scaled to 0. Hero text sits at opacity 0, 10px low. Stage windows and the toast sit at opacity 0, 24px low. | — |
| 60 | The dots pop in one by one, 90ms apart (web, Google, ads, "L"). | 500 · pop |
| 820 | The dots glide from center to their exact hero position (measure both rects; translate only, no scale). The overlay background fades to transparent at the same time. | 700 · glide; overlay 500 · out |
| 1240 | The hero text rises in: H1, lead, buttons, trust row, each 70ms after the last. Each moves from 10px low, opacity 0, to its final place. | opacity 700, transform 800 · out |
| 1540 | The overlay is removed. The stage windows rise from 24px low: browser window first, Google window 150ms later, "New order" toast 900ms later. | opacity 700, transform 900 · out |
| ~2240 | **Rebrand bubble** (see §2) starts 700ms after the intro finishes. | — |
| loop | The hero dots bob 4px up and back over 3.2s, staggered 180ms, forever. | keyframes · out |

- **Tap or click anywhere** on the overlay to skip straight to the final state.
- **Second page load in the same session:** no overlay. The stage windows still do their 24px rise.
- Store "intro seen" in `sessionStorage`, wrapped in try/catch.

## 2. Rebrand bubble ("Notice something new?")

It appears on `/` (in the hero's top row, right-aligned beside the dots) and on `/luke` (under the header, full width). It's a white pill with the `--ring` shadow and 13px text, reading:

**Notice something new?** We changed our branding from [old mark] → [new mark]! with a close X.

| t (ms after trigger) | What happens | Duration · easing |
|---|---|---|
| 0 | The bubble enters from `scale(.86) translateY(-6px)`, opacity 0. Transform origin is right-center on desktop and top-center on mobile. Only the old mark is visible inside the logo chip. | transform 600 · bubble; opacity 250 · out |
| 650 | The old mark dims to opacity .55. The arrow slides in from −4px. The new mark pops from `scale(.2)` to 1. | old 300 · out; arrow 250/350 · out, delay 100; new 550 · snap, delay 250 |
| dismiss | Scale to .9 and fade, then remove the bubble from layout. | 200–250 · out |

**When it shows:**
- On `/`, 700ms after the intro (or 700ms after load if the intro is skipped). On `/luke`, 600ms after load.
- Once dismissed, it never shows again: `localStorage` key `ml-rebrand-2026`, wrapped in try/catch.
- It stops showing for everyone after `REBRAND_NOTICE_UNTIL` (a date constant in `content/site.ts`, default `2027-01-31`).

**Accessibility:**
- `role="status"`.
- The logo chip has `role="img"` with `aria-label="the old triangle logo to the new mountain-line logo"`.
- The X is a real `<button aria-label="Dismiss">`.

## 3. Scrolling

- **Nav:** a 1px bottom border fades in once `scrollY > 8`. 200ms.
- **Reveal:** only elements that *start below the first screen* rise 18px and fade in, once, when they cross 8% above the bottom of the viewport. Opacity 800, transform 900 · out. Nothing on the first screen is ever hidden.
- **Anchor links:** smooth scroll with `scroll-margin-top: 80px` on sections. Turn smooth scrolling off under reduced motion.

## 4. "What I do" tabs (see `choreo-tab-steps.png`)

- **Auto-advance:** every 7000ms, only while the app frame is at least 35% visible. A 2px progress bar under the active tab fills linearly over those 7000ms. It pauses when the frame is off-screen.
- **On every tab change:** all step rows reset to opacity 0, 4px low. Wait 350ms. Then, for each step: show a spinner (an outline ring, 700ms per rotation) for 520ms, swap it for the green check, and wait 90ms before the next step. After the last step, the result line fades in over 400ms.
- **Clicking a tab** stops auto-advance permanently for that page view. Arrow keys move between tabs and focus follows.

## 5. Small interactions

- **Buttons:** background transition 150ms; `:active` is `scale(.97)` (`.985` on full-width buttons).
- **FAQ:** native `<details>`. The plus icon rotates 45° when open, 250ms · out.
- **Announcement bar X:** hides immediately. Remembered in `sessionStorage`.

## 6. `/id` sign-in

- **Step change** (email → code → done): the card enters from 8px low, opacity 0. Opacity 300, transform 400 · out. The title and subtitle text swap instantly.
- **Submit:** the button shows a 14px spinner plus "Sending code" / "Verifying". It's disabled while loading.
- **Code inputs:**
  - Typing a digit auto-advances to the next box.
  - Backspace in an empty box moves back.
  - Pasting a 6-digit code fills every box.
  - On success, all six boxes turn green (`--green-soft` fill, green ring) for 350ms before the done state.
  - Autofocus the first box only on fine-pointer devices.
- **Error:** the input ring turns `--err` and one line of text appears below it. No shake, no toast.

## 7. `/luke` card page

No intro. The rebrand bubble follows §2. Sections below the first screen use the §3 reveal. Nothing else moves.
