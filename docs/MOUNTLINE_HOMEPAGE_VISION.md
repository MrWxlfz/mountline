# Mountline Homepage Vision

The working brief for the public homepage at `/`. Read it before changing copy, layout, or motion on the site. When the code and this document disagree, fix one of them; don't let them drift.

## What the page has to do

Mountline builds AI receptionists for service businesses. The whole product fits in four lines:

1. A customer calls.
2. The business can't answer.
3. Mountline answers, using only what the business approved, and asks useful questions.
4. The business gets a clear request to follow up on.

A visitor should understand that after the hero, hear it for themselves within a minute, and never wonder what to do next.

**The promise:** the receptionist for the calls you can't take.

**The idea that must be impossible to miss:** you keep your number, we set it up with you, you call it and test it, and it doesn't answer a real customer until you approve it.

## Who it's for

Owner-operators of service businesses: HVAC, plumbing, electrical, roofing, cleaning, and similar trades. Picture a 52-year-old HVAC owner who doesn't care about AI.

They care about:

- missed calls and the customers who go elsewhere
- after-hours calls
- knowing what the caller actually needed
- keeping their existing phone number
- controlling what the receptionist says, and knowing it won't make things up
- hearing it before any customer does

They don't care about models, agents, orchestration, or anything that sounds like a pitch deck. Never lead with the technology.

## Positioning

Mountline is a small, founder-led company in Keller, Texas. It should read as highly competent, local, straightforward, and accountable. It is **not** an enterprise AI platform, and the page should never imply scale it doesn't have.

The honesty is part of the product. We would rather demonstrate with an openly fictional business than borrow credibility we haven't earned.

## The page, section by section

Each section answers one question. If two sections start answering the same question, cut one of the repeats.

| # | Section | `id` | Question it answers | Built from |
| - | --- | --- | --- | --- |
| 1 | Hero + three-step flow | — | What is this? | `mountline-homepage.tsx`, `flow` in `lib/homepage/content.ts`, `glyph-field.tsx` |
| 2 | Watch it take a call. | `product` | Show me. | `call-demo.tsx`, `demoCall` |
| 3 | Built around the phone line you already have. | `how` | How does this fit my business? | `call-stack.tsx`, `layers` |
| 4 | You decide what it can say. (paper) | `control` | What control do I have? | `controls` |
| 5 | Every trade gets different calls. | `trades` | Will it work for my kind of company? | `trade-explorer.tsx`, `trades` |
| 6 | Don't take our word for it. Call it. | `demo` | Can I try it myself? | `tryPrompts`, `demo-qr.tsx`, `landscape.tsx` |
| 7 | And yeah, we test it. | `testing` | Can I trust it? | `test-round.tsx`, `testScenarios` |
| 8 | Here's the gap Mountline is built to cover. | `gap` | Why does this matter? | `call-gap.tsx`, `lib/homepage/benchmarks.ts` |
| 9 | How a pilot works | `pilot` | What happens if I try it? | `pilotSteps` |
| 10 | Built by the people you'll talk to. | `company` | Who am I working with? | `principles`, `/luke-nordin.jpg` |
| 11 | Questions | `faq` | What else is holding me back? | `questions` |
| 12 | Tell us what happens when nobody can answer. | `contact` | How do I start? | `pilot-request-form.tsx` |

Notes on the sections that are easiest to break:

- **How it fits (3)** is about plumbing: which number, when it answers, what gets written down, who follows up. It does not re-explain what the receptionist is allowed to say; that belongs to section 4.
- **Control (4)** is the only place that walks through information, boundaries, asking for a person, and approval in detail.
- **Pilot (9)** carries the key idea as four steps: we set it up with you, call it until you trust it, you say when it goes live, we review real calls. It ends with the exit: turn call forwarding off and the phone works the way it does today.
- **FAQ (11)** handles the objections the sections don't settle: keeping the number, when it answers, replacing a receptionist, unknown answers, prices, booking, reaching a person, setup effort, stopping, and cost. Keep it near ten questions. Don't add an FAQ entry for something a section above already explains.

## Calls to action

There are three actions, and only three:

| Action | Label | Where |
| --- | --- | --- |
| Hear the receptionist | "Try the demo line" (hero, mobile menu), "Try the demo" (header bar) | Scrolls to `#demo` |
| Dial it | "Call the demo" | `tel:` link in the demo section, plus the QR code for desktop visitors |
| Start a conversation | "Ask about a pilot" (hero), "Send request" (form) | `#contact` |

- The header bar label stays short enough to sit next to the logo and menu button on a 360px phone.
- "Log in" goes to Mountline ID at `/id`. Never call it "client login", and never promote public signup.
- Don't add new CTA variants. If a section needs a next step, point it at one of these three.
- Mountline should sound confident enough not to beg: no urgency, no countdowns, no "limited spots."

## Voice

Write as if a very good copywriter sat with the founder. Short, specific, confident, human.

Lines that set the bar:

- "The receptionist for the calls you can't take."
- "Don't take our word for it. Call it."
- "Built by the people you'll talk to."
- "Tell us what happens when nobody can answer."
- "No new number to put on the trucks."
- "Callers can ask for a person anytime. It won't argue, and it won't pretend to be one."

Rules:

- Use "we", "our", and "Mountline". Never "I", "me", or "my". The logo may stay lowercase; copy always says "Mountline".
- Never mention age, school, summer, friends, or side hustle.
- Be precise without sounding like product documentation. "Tell us your hours, services, and the questions customers usually ask" beats "it answers from information you approved."
- Don't repeat the same sentence in two sections. Say it once, where it matters most.
- Don't write: leverage, seamless(ly), revolutionize, AI-powered, cutting-edge, intelligent automation, transform, unlock, next-generation, streamline, empower, tailored solutions, innovative platform.
- No fake friendliness either: no "Hey there!", "We've got you covered!", or emoji.
- Full-sentence headlines end with a period. Label headings ("How a pilot works", "Questions") don't.
- Phone numbers are written `817-632-6909`. Times are written `6:48 PM`. Use curly quotes and apostrophes in copy.

## Truthfulness

Honesty beats persuasion on this site. These rules are not style preferences.

- **The demo business is fictional.** North Texas Air & Heat must be labeled fictional wherever a reasonable visitor could read it as a real customer: the demo section, the call demo's request ticket, the caption, page metadata, and link previews.
- **Illustrations are labeled.** The call demo, the trade examples, and the test round are examples, and each says so before or beside the content, not only in a footnote.
- **No invented numbers.** No customer counts, call counts, conversion rates, testimonials, logos, or "trusted by." Only add a Mountline result when real, reviewable records exist.
- **Third-party figures live in `lib/homepage/benchmarks.ts`** with the publisher, title, URL, and date. The 28% unanswered rate comes from CallRail customer data, so the copy says "CallRail reports that…". The 78% and 21% come from a CallRail survey of 1,000 U.S. consumers whose fieldwork year isn't stated, so never write "2025 survey." The chart is labeled an illustrative model, not a measured Mountline result.
- **Tense follows evidence.** "We test it" stays present tense until logged acceptance-call results exist (see `docs/receptionist-pilot.md`).
- **Capabilities follow the code.** Calendar booking, text messages, live transfers, and verified callback delivery are not built. The page may say they're added once connected and tested, never that they work today.
- `lib/stabilization/__tests__/public-claims.test.ts` enforces the required disclaimers and bans unsupported claims. If copy changes break it, fix the copy, not the test, unless the new wording is equally honest.

Claims the founder should keep confirming as the service changes:

- "We walk you through turning on call forwarding."
- "If it gets something wrong, we go through the call with you and fix it."
- "Only the prices you approve, like a standard service-call fee."
- "Turn call forwarding off and your phone works exactly the way it does today." This holds only while pilots use forwarding, not number porting.
- "Tells them it's an AI receptionist." Disclosure is reviewed per deployment.

## Design system

The site is dark and editorial with one warm paper section. It should feel like a senior team kept removing things until only the important parts were left.

### Color (`app/homepage.css`, on `.ml-site`)

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0d0d0c` | Page |
| `--bg-raised` | `#131312` | Panels, form card |
| `--bg-sunk` | `#0a0a09` | Glyph band |
| `--fg` / `--fg-2` / `--fg-3` | `#edebe5` / `#afada6` / `#8d8b85` | Text, secondary text, labels |
| `--fg-4` | `#4d4b47` | Shapes only, never text |
| `--line` / `--line-2` | 9% / 16% cream | Dividers, borders |
| `--accent` | `#e4a853` | Amber signal |
| `--paper` / `--ink` | `#efebe3` / `#171613` | Paper surfaces |
| `--danger` | `#f09585` | Form errors |

- **Paper means "this belongs to the business":** the control section, the service-request ticket, and the trade request slips. Don't use paper decoratively.
- **Amber is a signal, never decoration.** It marks the one thing to notice or something that just happened: a filled field, a missed call, the active step. If two amber things compete on one screen, remove one.
- The demo section is the only place with its own palette: a night ridgeline drawn in SVG (`landscape.tsx`), not a photo or a gradient.

### Type

- **Newsreader (serif)** for display: headlines, spoken lines, big numbers. Light weights (300–360) with tight tracking.
- **Geist (sans)** for everything you read: body, labels, forms.
- **Geist Mono** only for data and interface detail: step numbers, timestamps, phone numbers in UI, button labels.
- Body text is 16–18px at 1.55–1.65 line height; paragraphs max out around 31–38em.
- Headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`. Check for orphans at every breakpoint anyway.
- On phones, rework the layout rather than shrinking everything. Display sizes step down at 860px and 560px, and body text stays at 16px or larger.

### Shape

- Panels use a 12px radius and fields use 8px. Buttons are pills; there are two sizes, 44px and 34px (48–52px on touch layouts).
- Borders are thin, 1px lines. There's no glassmorphism except the header's blur once you've scrolled.
- Content width is 1240px plus gutters. Gutters are 40px, dropping to 32, 24, and 20px as the screen narrows.

### What never goes on this page

Gradient blobs, glowing purple or blue backgrounds, orbs, bento grids, glass cards, floating UI cards, fake dashboards, fake logos or testimonials, particle fields, neural-network imagery, animated gradient text, oversized pills everywhere, cursor followers, scroll hijacking, gratuitous parallax, and arbitrary 3D.

## Motion

Motion explains state. It never decorates.

What moves, and why:

- **Hero:** the headline rises line by line once, then the glyph band sweeps in. The band keeps moving quietly only while it's on screen.
- **Section reveals:** a 16px rise and fade, once per element (`homepage-motion.tsx`). Anything already on screen at load stays put.
- **Call demo:** plays when scrolled into view, pauses when it leaves, and has Pause, Play, and Replay controls. Highlighted words underline as they fill the request.
- **Phone-line stack:** the plates follow the step you're reading. Steps you haven't reached yet are dimmed.
- **Test round:** each test call runs, gets checked, and the one that missed gets run again. It ends at "Ready for your sign-off."
- **Gap chart:** the calls land, then the missed ones fill in amber.
- **Pilot timeline:** the line draws through each step.

Rules:

- Use the ease-out curves from the tokens. No bounce and no overshoot.
- Nothing loops forever unless it represents something live on screen, like a ringing call or a speaking voice. The hero demo-line dot is static on purpose.
- Every sequence has a complete resting state. The server render and `prefers-reduced-motion` both show the final state immediately.
- Canvas and scroll work is throttled with `requestAnimationFrame` and paused off screen or in a hidden tab.

## Responsive behavior

| Breakpoint | What changes |
| --- | --- |
| ≤1180px | Tighter gutters; the trade panel and control rows restack |
| ≤1024px | The call demo transcript goes single-column; the gap chart drops its arrow; the test table merges columns |
| ≤860px | Mobile header and menu; the stack visual becomes a sticky strip; tabs scroll sideways; the timeline turns vertical; the founder photo stacks above the copy |
| ≤700px | The hero flow becomes a list |
| ≤560px | Hero buttons go full width; the form goes single-column and full-bleed |
| ≤380px | The smallest demo-number size; the gap findings stack |

Check every change at 1440+, a 1280–1366px laptop, a 768px tablet, and 390px and 360px phones. There must be no horizontal scroll at any width.

## Accessibility

- A skip link is the first tab stop. Every interactive element shows the amber focus ring (ink on paper).
- The trade explorer is a real tablist with arrow-key, Home, and End support.
- The FAQ uses native `<details>`, so it works with a keyboard and without JavaScript.
- The mobile menu closes on Escape, returns focus to the toggle, locks page scroll, and is `inert` while closed.
- Form errors are tied to their fields with `aria-describedby`. The first invalid field gets focus, a failed save offers a pre-filled email, and success moves focus to the confirmation.
- Decorative graphics (glyph band, stack, landscape) are `aria-hidden`. Charts carry a text equivalent.

## The contact form

`components/receptionist/pilot-request-form.tsx` posts through `app/actions/request-receptionist-pilot.ts` into the Supabase `leads` table. It must keep:

- validation on blur and on submit, using the same Zod schema the server uses
- a disabled, "Sending…" state that blocks double submits
- an error state that keeps what the visitor typed and offers the email fallback
- a success message that confirms nothing has been booked or changed
- the honeypot field

Never submit the real form during QA. `.env.local` points at a live Supabase project.

## Before you ship a change

1. `npm run typecheck`, `npx eslint .`, `npm run test:stabilization`, and `npm run build` all pass.
2. Look at it at the widths listed above, with and without reduced motion.
3. Walk the three reviews:
   - **The HVAC owner:** is it obvious why this matters and what to do next?
   - **The senior designer:** is there anything generic, inconsistent, or decorative?
   - **The skeptic:** could anything be read as a claim we can't back up?
4. Check that every number has a source, every example is labeled, and the fictional business is called fictional.
