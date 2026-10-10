"use client"

import { useRef } from "react"
import { Clock, MapPin, Menu, Phone } from "lucide-react"
import { m, useInView, useReducedMotion, type Variants } from "motion/react"
import { PhoneFrame } from "@/components/site/phone-frame"
import { EASE_OUT } from "@/components/site/reveal"

type Demo = { business: string; tagline: string; hours: string; call: string; directions: string; menu: readonly string[] }

const screen: Variants = {
  hidden: {},
  shown: { transition: { delayChildren: 0.35, staggerChildren: 0.28 } },
}
const block: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}
const pop: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  shown: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
}

/**
 * A small local-business site putting itself together on a phone: header, photo, name,
 * Call now, then today's hours. About two seconds, then it floats while it's on screen.
 */
export function HeroBuild({ demo }: { demo: Demo }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "-10% 0px" })

  return (
    <div ref={ref} className="mk-hero__visual" role="img" aria-label={`A phone showing a small website for ${demo.business}, with a Call now button and today's hours.`}>
      <m.div
        className="mk-hero__float"
        animate={!reduced && inView ? { y: [0, -8, 0] } : { y: 0 }}
        transition={!reduced && inView ? { duration: 6, ease: "easeInOut", repeat: Infinity, delay: 2.4 } : { duration: 0.4 }}
      >
        <PhoneFrame>
          <m.div className="mk-site" variants={screen} initial={reduced ? false : "hidden"} animate="shown" aria-hidden="true">
            <m.div className="mk-site__bar" variants={block}>
              <span className="mk-site__logo">{demo.business}</span>
              <Menu />
            </m.div>
            <m.div className="mk-site__photo" variants={block}>
              <BreadArt />
            </m.div>
            <m.div className="mk-site__intro" variants={block}>
              <strong>{demo.tagline}</strong>
              <span className="mk-site__line" />
              <span className="mk-site__line mk-site__line--short" />
            </m.div>
            <m.div className="mk-site__actions" variants={pop}>
              <span className="mk-site__call"><Phone />{demo.call}</span>
              <span className="mk-site__dir"><MapPin />{demo.directions}</span>
            </m.div>
            <m.div className="mk-site__hours" variants={block}>
              <Clock />
              <span><i />{demo.hours}</span>
            </m.div>
            <m.div className="mk-site__menu" variants={block}>
              {demo.menu.map((item, index) => (
                <span key={item}>
                  <b data-tone={index} />
                  {item}
                </span>
              ))}
            </m.div>
          </m.div>
        </PhoneFrame>
      </m.div>
      <span className="mk-hero__shadow" aria-hidden="true" />
    </div>
  )
}

/** A flat little illustration of loaves on a shelf. Stylized on purpose: it's not anyone's bakery. */
function BreadArt() {
  return (
    <svg viewBox="0 0 240 132" fill="none" preserveAspectRatio="xMidYMid slice">
      <rect width="240" height="132" fill="#f1e4d0" />
      <rect y="92" width="240" height="40" fill="#e3cfb1" />
      <rect y="90" width="240" height="4" fill="#cdb48f" />
      <ellipse cx="68" cy="80" rx="40" ry="18" fill="#c98a4b" />
      <path d="M44 74c8-6 16-6 24 0M60 70c8-6 16-6 24 0M76 74c6-4 10-4 14 0" stroke="#f3d6a8" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="150" cy="82" rx="30" ry="15" fill="#b9773c" />
      <path d="M134 80c6-5 12-5 18 0M148 78c6-5 12-5 18 0" stroke="#efcd98" strokeWidth="3" strokeLinecap="round" />
      <circle cx="200" cy="80" r="16" fill="#d49a5c" />
      <path d="M192 76c5-3 11-3 16 0" stroke="#f3d6a8" strokeWidth="3" strokeLinecap="round" />
      <rect x="22" y="22" width="56" height="34" rx="6" fill="#fbf6ee" />
      <rect x="30" y="31" width="30" height="4" rx="2" fill="#d6bf9c" />
      <rect x="30" y="40" width="20" height="4" rx="2" fill="#e3cfb1" />
    </svg>
  )
}
