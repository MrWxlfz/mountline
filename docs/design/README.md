# Mountline design references

Source of truth for the redesign on `redesign/personal-site`. Open the HTML files in a browser; they're complete working pages.

| File | What it is |
|---|---|
| `site-reference.html` | Homepage `/`, including the intro, the rebrand bubble, the tabs and every section. |
| `id-reference.html` | Sign-in `/id`: the email step, then the code step (type any 6 digits), then done. |
| `card-reference.html` | Business-card page `/luke`, which people reach by scanning the printed card. |
| `choreography.md` | Every animation with exact timings and easings. |
| `logo/` | The new logo. **The mark is the 5-point ridge line; the wordmark is Figtree 600.** |
| `screenshots/` | Renders of the reference files (desktop 1440, mobile 390 @2x) plus motion frame sheets. |

## Logo files

- `mountline-mark.svg`: the ridge mark alone, in `currentColor` (viewBox `0 0 22 18`, path `M1.5 16 6.8 7.6 9.6 11.2 14 2.6 20.5 16`, stroke 2, round caps and joins).
- `mountline-logo.svg` / `-white.svg` / `-currentcolor.svg`: the lockup, with the wordmark already outlined (no font needed). Use these wherever an `<img>` or a static file is needed (OG image, emails, PDFs).
- `mountline-app-icon.svg`, `icon-512.png`, `apple-icon-180.png`, `icon-32.png`, `favicon.ico`: the app and browser icons, a white ridge on an ink rounded square.
- `old-mark.svg`: the old triangle mark. **Use it only inside the rebrand bubble.**

In the UI itself, render the lockup as the inline mark plus live text: `Figtree 600 19px, letter-spacing −0.03em, gap 8px, mark 22×18`. That keeps it crisp and selectable.

## Screenshots

- `site-desktop-full.png`, `site-desktop-hero@2x.png`, `site-mobile-full@2x.png`
- `site-what-i-do-tabs.png`: all four tab states
- `rebrand-bubble@2x.png`
- `choreo-intro-and-rebrand.png`: the first-visit sequence at 8 moments
- `choreo-tab-steps.png`: the steps ticking in a tab
- `login-desktop-email.png`, `login-desktop-code.png`, `login-mobile@2x.png`
- `card-desktop.png`, `card-mobile-full@2x.png`

Oak & Ember Bakery and "Dana" are an example business, labeled as such in the footer. Never present them as a client.
