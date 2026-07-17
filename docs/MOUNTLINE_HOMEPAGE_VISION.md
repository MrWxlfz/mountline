# Mountline Homepage Vision

## Purpose

The homepage should make Mountline understandable in one glance and increasingly capable as the visitor scrolls. Websites lead the story. Practical systems appear as useful extensions of a strong customer experience, never as technical products a business owner must decode.

The experience should feel like a world-class product studio speaking in the plain, responsible language of a local partner.

## Target audience

### Primary: owner-led local businesses and small teams

Owners of restaurants, groomers, barbershops, cleaners, photographers, retailers, churches, appointment businesses, and other local companies should understand within ten seconds that Mountline builds excellent, appropriately scoped websites. The page should emphasize legitimacy, clarity, calls, visits, bookings, orders, inquiries, easy updates, and direct communication.

### Secondary: lead-heavy local services

Roofers, HVAC companies, remodelers, pool companies, landscapers, contractors, restoration companies, and other high-value service businesses should discover that Mountline can also help with missed calls, first response, callbacks, follow-up, estimate booking, ownership, and existing-tool connections.

### Tertiary: ambitious and technical teams

Companies needing portals, intake, workflows, dashboards, integrations, or focused software should infer technical depth from the quality of the interface scenes, the capability gallery, and the delivery story. This audience should not control the hero.

## Positioning

Mountline builds exceptional websites and practical systems for businesses.

The public promise is: **look better, respond better, and run smoother.** The website is usually the front door. Additional systems are introduced only when they solve a clear business problem.

The governing principle is: **Start with what the business actually needs. Build more only where it creates clear value.**

## Final content hierarchy

1. **Hero — immediate promise**
   - Eyebrow: “Websites + practical systems for real businesses”
   - Headline: “Make your business easier to choose—and easier to run.”
   - Plain supporting copy, two actions, Keller trust line
   - Integrated desktop, mobile, and customer-action scene using four real concepts
2. **Real work — visual proof**
   - Six-project work browser showing one large concept at a time
   - Immediate selector, desktop/mobile view control, concise challenge and direction, truthful disclaimer
3. **What Mountline builds — three starting paths**
   - Selectable workbench for website, lead-recovery, and workflow needs
   - Tactile controls and one changing functional scene
   - All copy remains available without interaction
4. **What happens after the click — lead response**
   - Five-step inquiry story in normal language
   - Illustrative missed-call, text, callback, notification, and outcome scene
5. **And yeah—we do a lot more — capability gallery**
   - Receptionist and callback systems
   - Customer support
   - Booking and intake
   - Client portals
   - Internal operations
   - Custom software
6. **How working with Mountline feels**
   - One flowing four-stage process
   - Large real portal preview with readable project status and next step
   - Warm founder interruption using Luke’s real photo
7. **Final business review**
   - Low-pressure, progressively disclosed inquiry form
   - Structured interest selection preserved in the existing lead record
   - Explicit smallest-useful-starting-point reassurance

## Design tokens

### Color

- Dark page: `#080806`
- Dark raised: `#11100e`
- Dark soft: `#191713`
- Dark panel: `#201d18`
- Warm paper: `#f1eadf`
- Paper raised: `#fbf7f0`
- Ink: `#18140f`
- Dark text: `#f6f0e7`
- Muted dark text: `#aaa399`
- Muted paper text: `#696057`
- Warm signal: `#e7814f`
- Warm signal bright: `#f1b16f`
- Neutral borders: 12–22% opacity depending on elevation
- Project colors come from the concept captures and update only local accents

### Typography

- Geist Sans for all marketing and interface copy
- Geist Mono only for short functional labels, sequence numbers, and status metadata
- Hero: `clamp(3.5rem, 6.4vw, 6rem)`
- Section headings: `clamp(2.6rem, 4.5vw, 4.4rem)`
- Body: 17–20px with 1.55–1.7 line height
- Functional labels: 11–13px, never used as a substitute for readable copy

### Shape and spacing

- Controls: 7–9px radius
- Small panels: 10–14px radius
- Major scenes: 18–22px radius
- Shared content width: 1280px
- Section spacing is rhythmic rather than uniform; proof scenes get more room than explanatory copy
- Thin edges and tonal elevation replace visible page-wide grids

## Motion rules

- Shared easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Buttons: 100–150ms
- Selectors: 150–220ms
- Small scene changes: 180–260ms
- Large work transitions: 240–360ms
- Motion must identify selection, state, or hierarchy; no autoplay carousel, particles, scroll-jacking, tilt, magnetic controls, or endless floating
- Pointer light is local, requestAnimationFrame-throttled, limited to a few pixels, and disabled for touch and reduced motion
- Reduced-motion mode is complete and immediate, with transitions effectively removed

## Selected demos

- **Served Sliders** — bold restaurant concept; primary hero and work-explorer proof
- **Ruff Scrub** — warm dog-grooming concept; demonstrates personality and reassurance
- **Rick’s Barbering** — precise black-and-white barbershop concept; demonstrates range
- **Nomad Auto Spa** — restrained dark detailing concept; demonstrates premium service clarity
- **Elevation** — image-led church/community concept; demonstrates emotional and informational range
- **Squeaky Cleaning** — editorial commercial-cleaning concept; demonstrates service-business trust

All are labeled: **Concept preview by Mountline — not the official website.** No revenue, conversion, booking, review, client-status, or performance claim is attached to the concepts.

The existing client-portal capture and Luke Nordin founder photo are used as real Mountline assets.

## Acceptance criteria

- A nontechnical local owner can explain what Mountline does after the hero.
- Websites are unmistakably the starting point.
- Lead Recovery is visible and useful without dominating the story.
- Callback, support, intake, portals, operations, and custom software are discoverable in normal business language.
- Each major scene explains a job without a technical diagram or invented metric.
- The page reads as one narrative with seven visually distinct movements.
- Real work is the primary proof; no fake customer, testimonial, outcome, or metric appears.
- Desktop and mobile compositions are intentionally different where scale requires it.
- Dark and light themes are both art-directed.
- Keyboard, touch, focus, and reduced-motion behavior remain complete.
- Only the first hero image is prioritized; inactive and below-the-fold imagery loads lazily through `next/image`.
- Layout dimensions remain stable during selections.
- The existing lead-storage action retains loading, success, and error states and records interest structurally.
- Existing public concepts, Lead Recovery, Mountline ID, dashboard, portal, Clerk, and Supabase behavior remain intact.
- Type checking and the production build complete, and the requested viewport renders are visually inspected.
