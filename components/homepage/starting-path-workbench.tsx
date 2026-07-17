"use client"

import { useState, type KeyboardEvent, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CircleDot,
  Clock3,
  MessageSquareText,
  PhoneCall,
  Workflow,
} from "lucide-react"
import { ReviewLink } from "@/components/homepage/review-link"

const paths = [
  {
    id: "website",
    number: "A",
    title: "Look better online",
    short: "A clear website that earns trust and makes the next action obvious.",
    copy: "A clear, mobile-first website that shows what you do, builds trust, and makes calling, visiting, booking, or ordering easy.",
    examples: [
      "Website design and build",
      "Services, menu, or product pages",
      "Location, hours, calls, and booking",
      "Contact, quote, and search setup",
      "Ongoing updates when useful",
    ],
    cta: "Explore websites",
    interest: "website-launch" as const,
  },
  {
    id: "leads",
    number: "B",
    title: "Stop losing good inquiries",
    short: "Make the first response happen and keep the next action visible.",
    copy: "Make the first response happen, keep follow-up moving, and give your team a clear next action.",
    examples: [
      "Lead recovery",
      "Missed-call text response",
      "Callback and estimate follow-up",
      "Simple pipeline visibility",
      "CRM connection where suitable",
    ],
    cta: "Explore lead recovery",
    href: "/lead-recovery",
  },
  {
    id: "workflow",
    number: "C",
    title: "Fix a messy workflow",
    short: "Replace scattered messages and spreadsheets with one focused system.",
    copy: "Replace scattered texts, spreadsheets, and repetitive work with one focused system built around the way the business operates.",
    examples: [
      "Client portals",
      "Intake and request flows",
      "Internal dashboards and approvals",
      "Status tracking and integrations",
      "Focused custom tools",
    ],
    cta: "Discuss a system",
    interest: "custom-systems" as const,
  },
] as const

function WebsiteScene() {
  return (
    <div className="mtl-bench-visual mtl-bench-visual--website" aria-label="Example local business website">
      <div className="mtl-bench-browser">
        <div><i /><i /><i /><span>Clear business website</span></div>
        <figure>
          <Image
            src="/demo-previews/restaurant.jpg"
            alt="Served Sliders concept showing a clear restaurant website"
            fill
            className="object-cover object-top"
            sizes="(max-width: 767px) 90vw, 50vw"
          />
        </figure>
      </div>
      <div className="mtl-bench-action">
        <PhoneCall className="size-4" aria-hidden="true" />
        <span><small>Customer action</small><strong>Call, visit, or order</strong></span>
        <i />
      </div>
    </div>
  )
}

function LeadScene() {
  return (
    <div className="mtl-bench-visual mtl-bench-visual--leads" aria-label="Example lead response workflow">
      <div className="mtl-bench-call">
        <span className="mtl-bench-icon"><PhoneCall className="size-4" /></span>
        <span><small>Missed call</small><strong>New estimate inquiry</strong></span>
        <time>10:42</time>
      </div>
      <div className="mtl-bench-flow-line" aria-hidden="true"><i /><i /><i /></div>
      <div className="mtl-bench-message">
        <MessageSquareText className="size-4" aria-hidden="true" />
        <span><small>First response</small><strong>Sent with the next step</strong></span>
        <Check className="size-4" aria-hidden="true" />
      </div>
      <div className="mtl-bench-owner">
        <Clock3 className="size-4" aria-hidden="true" />
        <span><small>Team view</small><strong>Callback ready</strong></span>
        <span className="mtl-bench-status">Open</span>
      </div>
    </div>
  )
}

function WorkflowScene() {
  return (
    <div className="mtl-bench-visual mtl-bench-visual--workflow" aria-label="Example focused client workflow">
      <div className="mtl-bench-workflow-head">
        <span><Workflow className="size-4" /> Client request</span>
        <small>One useful view</small>
      </div>
      <div className="mtl-bench-workflow-body">
        <div className="mtl-bench-request">
          <small>Current status</small>
          <strong>Ready for approval</strong>
          <p>Details, files, and the next action stay together.</p>
        </div>
        <ol>
          <li className="is-complete"><Check className="size-3.5" /> Request received</li>
          <li className="is-active"><CircleDot className="size-3.5" /> Review and approve</li>
          <li><CircleDot className="size-3.5" /> Work begins</li>
        </ol>
      </div>
    </div>
  )
}

const scenes: Record<(typeof paths)[number]["id"], ReactNode> = {
  website: <WebsiteScene />,
  leads: <LeadScene />,
  workflow: <WorkflowScene />,
}

export function StartingPathWorkbench() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activePath = paths[activeIndex]

  function moveSelection(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? paths.length - 1
        : (index + (forward ? 1 : -1) + paths.length) % paths.length
    setActiveIndex(nextIndex)
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')
    buttons?.[nextIndex]?.focus()
  }

  return (
    <div className="mtl-workbench">
      <div className="mtl-bench-topbar" aria-hidden="true">
        <span><i /> Mountline starting point</span>
        <span>Choose the closest problem</span>
      </div>

      <div className="mtl-bench-layout">
        <div className="mtl-bench-modes" role="tablist" aria-label="Choose a starting point">
          {paths.map((path, index) => (
            <button
              key={path.id}
              id={`starting-path-tab-${path.id}`}
              type="button"
              className={index === activeIndex ? "is-active" : undefined}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => moveSelection(event, index)}
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls="starting-path-panel"
              tabIndex={index === activeIndex ? 0 : -1}
            >
              <span className="mtl-bench-switch" aria-hidden="true"><i /></span>
              <span className="mtl-bench-mode-copy">
                <small>Path {path.number}</small>
                <strong>{path.title}</strong>
                <span>{path.short}</span>
              </span>
              <span className="mtl-bench-light" aria-hidden="true" />
            </button>
          ))}
        </div>

        <div
          id="starting-path-panel"
          className="mtl-bench-active"
          role="tabpanel"
          aria-labelledby={`starting-path-tab-${activePath.id}`}
          aria-live="polite"
        >
          <div key={`${activePath.id}-scene`} className="mtl-bench-scene-wrap">
            {scenes[activePath.id]}
          </div>

          <div className="mtl-bench-detail">
            <div>
              <p>Start here</p>
              <h3>{activePath.title}</h3>
              <span>{activePath.copy}</span>
            </div>
            <ul>
              {activePath.examples.map((example) => (
                <li key={example}><Check className="size-3.5" aria-hidden="true" /> {example}</li>
              ))}
            </ul>
            {'href' in activePath ? (
              <Link href={activePath.href} className="mtl-inline-link">
                {activePath.cta}<ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <ReviewLink interest={activePath.interest} className="mtl-inline-link">
                {activePath.cta}<ArrowRight className="size-4" aria-hidden="true" />
              </ReviewLink>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
