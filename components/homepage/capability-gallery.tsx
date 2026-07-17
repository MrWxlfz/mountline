import Image from "next/image"
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  FileCheck2,
  Headphones,
  LayoutDashboard,
  MessageSquareText,
  PhoneCall,
  PhoneMissed,
  Send,
  Sparkles,
  Workflow,
} from "lucide-react"

function CallbackVisual() {
  return (
    <div className="mtl-cap-callback" aria-hidden="true">
      <div><PhoneMissed className="size-4" /><span><small>Missed call</small><strong>New service question</strong></span><time>Now</time></div>
      <span className="mtl-cap-line"><i /><i /><i /></span>
      <div><MessageSquareText className="size-4" /><span><small>Response sent</small><strong>Callback details collected</strong></span><Check className="size-4" /></div>
      <div><PhoneCall className="size-4" /><span><small>Assigned</small><strong>Team callback</strong></span><b>Open</b></div>
    </div>
  )
}

function SupportVisual() {
  return (
    <div className="mtl-cap-support" aria-hidden="true">
      <div className="is-customer">Do you work in my area?</div>
      <div className="is-answer">
        <span><Sparkles className="size-3.5" /> From business information</span>
        Yes—your address is inside the listed service area. Want help with a request?
      </div>
      <div className="mtl-cap-handoff"><Headphones className="size-4" /> Hand off to your team <ChevronRight className="size-4" /></div>
    </div>
  )
}

function BookingVisual() {
  return (
    <div className="mtl-cap-booking" aria-hidden="true">
      <div className="mtl-cap-progress"><i className="is-done" /><i className="is-active" /><i /></div>
      <small>Request details</small>
      <strong>What do you need?</strong>
      <div className="mtl-cap-options"><span className="is-selected"><Check className="size-3" /> Consultation</span><span>Service visit</span></div>
      <div className="mtl-cap-date"><CalendarDays className="size-4" /><span><small>Preferred day</small><strong>Tuesday afternoon</strong></span></div>
      <button type="button" tabIndex={-1}>Continue <ArrowRight className="size-3.5" /></button>
    </div>
  )
}

function OperationsVisual() {
  return (
    <div className="mtl-cap-operations" aria-hidden="true">
      <div><span>Needs reply</span><article><BellRing className="size-3.5" /><strong>New inquiry</strong><small>Owner · Today</small></article></div>
      <div><span>Next action</span><article><PhoneCall className="size-3.5" /><strong>Callback</strong><small>After 3:00 PM</small></article></div>
      <div><span>In progress</span><article><FileCheck2 className="size-3.5" /><strong>Estimate sent</strong><small>Waiting for reply</small></article></div>
    </div>
  )
}

function SoftwareVisual() {
  return (
    <div className="mtl-cap-software" aria-hidden="true">
      <div><LayoutDashboard className="size-4" /><span><small>Request</small><strong>Customer details</strong></span></div>
      <ArrowRight className="size-4" />
      <div><Workflow className="size-4" /><span><small>Workflow</small><strong>Right next step</strong></span></div>
      <ArrowRight className="size-4" />
      <div><Send className="size-4" /><span><small>Result</small><strong>Clear handoff</strong></span></div>
    </div>
  )
}

export function CapabilityGallery() {
  return (
    <div className="mtl-capability-grid">
      <article className="mtl-capability mtl-capability--callback" tabIndex={0} aria-labelledby="cap-callback-title">
        <div className="mtl-cap-copy">
          <p><PhoneCall className="size-4" /> Calls</p>
          <h3 id="cap-callback-title">Receptionist and callback systems</h3>
          <span>Capture missed calls, answer common questions, and make sure the right person gets called back.</span>
        </div>
        <CallbackVisual />
        <small className="mtl-cap-reveal">The team stays in control of the handoff.</small>
      </article>

      <article className="mtl-capability mtl-capability--support" tabIndex={0} aria-labelledby="cap-support-title">
        <div className="mtl-cap-copy">
          <p><MessageSquareText className="size-4" /> Answers</p>
          <h3 id="cap-support-title">Customer support</h3>
          <span>Give customers useful answers from your real services, policies, and business information—with a clear handoff to a person.</span>
        </div>
        <SupportVisual />
        <small className="mtl-cap-reveal">Grounded answers, with a person close by.</small>
      </article>

      <article className="mtl-capability mtl-capability--booking" tabIndex={0} aria-labelledby="cap-booking-title">
        <div className="mtl-cap-copy">
          <p><CalendarDays className="size-4" /> Requests</p>
          <h3 id="cap-booking-title">Booking and intake</h3>
          <span>Collect the right details, route the request, and make scheduling less chaotic.</span>
        </div>
        <BookingVisual />
        <small className="mtl-cap-reveal">Ask only for the details the business uses.</small>
      </article>

      <article className="mtl-capability mtl-capability--portal" tabIndex={0} aria-labelledby="cap-portal-title">
        <div className="mtl-cap-copy">
          <p><LayoutDashboard className="size-4" /> One place</p>
          <h3 id="cap-portal-title">Client portals</h3>
          <span>Give customers one place for updates, files, approvals, payments, and support.</span>
        </div>
        <div className="mtl-cap-portal-image">
          <Image
            src="/work-previews/client-portal.png"
            alt="Mountline client portal preview with project status, next step, and payment information"
            fill
            className="object-cover object-top"
            sizes="(max-width: 767px) 94vw, 58vw"
          />
          <span><CircleDot className="size-3.5" /> Current phase: Design</span>
        </div>
        <small className="mtl-cap-reveal">Actual Mountline portal experience.</small>
      </article>

      <article className="mtl-capability mtl-capability--operations" tabIndex={0} aria-labelledby="cap-operations-title">
        <div className="mtl-cap-copy">
          <p><Workflow className="size-4" /> Team view</p>
          <h3 id="cap-operations-title">Internal operations</h3>
          <span>Keep leads, tasks, projects, and next actions visible without another impossible spreadsheet.</span>
        </div>
        <OperationsVisual />
        <small className="mtl-cap-reveal">Clear ownership beats another crowded dashboard.</small>
      </article>

      <article className="mtl-capability mtl-capability--software" tabIndex={0} aria-labelledby="cap-software-title">
        <div className="mtl-cap-copy">
          <p><Sparkles className="size-4" /> Built to fit</p>
          <h3 id="cap-software-title">Custom software</h3>
          <span>Dashboards, integrations, workflows, and purpose-built tools for problems that should not still be manual.</span>
        </div>
        <SoftwareVisual />
        <small className="mtl-cap-reveal">No giant rebuild required.</small>
      </article>
    </div>
  )
}
