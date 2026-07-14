export type SignalSalesSituation =
  | "brand_new_cold"
  | "weak_website"
  | "strong_website_skip"
  | "facebook_first"
  | "missing_booking"
  | "missing_contact_form"
  | "owner_busy"
  | "employee_answered"
  | "concept_ready"
  | "prior_contact"
  | "demo_sent"
  | "no_response_after_demo"
  | "interested_hesitant"
  | "price_asked_early"
  | "send_link_requested"
  | "declined"
  | "proposal_stage"
  | "won"
  | "lost"

export type SignalSalesStageInput = {
  businessName: string
  verifiedFact: string
  pipelineStage?: string | null
  outreachStatus?: string | null
  websiteStrength?: "unknown" | "weak" | "strong"
  facebookFirst?: boolean
  missingBooking?: boolean
  missingContactForm?: boolean
  ownerBusy?: boolean
  employeeAnswered?: boolean
  conceptReady?: boolean
  demoSent?: boolean
  demoIgnored?: boolean
  interestedButHesitant?: boolean
  priceAskedEarly?: boolean
  sendLinkRequested?: boolean
  explicitlyDeclined?: boolean
}

export type SignalSalesStageGuidance = {
  situation: SignalSalesSituation
  objective: string
  opener: string
  nextStep: string
  gracefulExit: string
  qualifiesForOutreach: boolean
}

function normalizedFact(value: string) {
  return value.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "") || "the public customer path"
}

export function resolveSignalSalesSituation(input: SignalSalesStageInput): SignalSalesSituation {
  const stage = input.pipelineStage || "found"
  const status = input.outreachStatus || "not_contacted"
  if (stage === "lost") return "lost"
  if (stage === "won") return "won"
  if (input.explicitlyDeclined || status === "do_not_contact") return "declined"
  if (stage === "proposal" || status === "proposal_sent") return "proposal_stage"
  if (input.priceAskedEarly) return "price_asked_early"
  if (input.sendLinkRequested || status === "permission_to_send_demo") return "send_link_requested"
  if (input.demoIgnored) return "no_response_after_demo"
  if (input.demoSent || status === "demo_sent") return "demo_sent"
  if (input.interestedButHesitant || stage === "interested" || status === "interested") return "interested_hesitant"
  if (input.ownerBusy) return "owner_busy"
  if (input.employeeAnswered) return "employee_answered"
  if (stage === "contacted" || status === "contacted" || status === "awaiting_reply") return "prior_contact"
  if (input.conceptReady || stage === "concept_ready") return "concept_ready"
  if (input.websiteStrength === "strong") return "strong_website_skip"
  if (input.missingBooking) return "missing_booking"
  if (input.missingContactForm) return "missing_contact_form"
  if (input.facebookFirst) return "facebook_first"
  if (input.websiteStrength === "weak") return "weak_website"
  return "brand_new_cold"
}

export function buildSignalSalesStageGuidance(input: SignalSalesStageInput): SignalSalesStageGuidance {
  const business = input.businessName.trim() || "the business"
  const fact = normalizedFact(input.verifiedFact)
  const situation = resolveSignalSalesSituation(input)
  const gracefulExit = "Thanks for the clarity. Mountline will leave it there and will not keep following up."

  const guidance: Record<SignalSalesSituation, Omit<SignalSalesStageGuidance, "situation" | "gracefulExit">> = {
    brand_new_cold: {
      objective: "Earn permission for one short, relevant conversation.",
      opener: `Hi, Mountline here. ${business} stood out because ${fact}. We have one focused question about that customer path. Is now a reasonable time for thirty seconds?`,
      nextStep: "Ask one discovery question or identify the right owner and time.",
      qualifiesForOutreach: true,
    },
    weak_website: {
      objective: "Validate whether the visible website friction matters operationally.",
      opener: `Hi, Mountline here. We verified ${fact} for ${business}. There may be one small way to make that path clearer without a large rebuild. Is it worth a quick question?`,
      nextStep: "Confirm the friction before offering a focused concept.",
      qualifiesForOutreach: true,
    },
    strong_website_skip: {
      objective: "Avoid manufacturing a problem that public evidence does not support.",
      opener: `No outreach recommended for ${business}. The public presence already handles ${fact} well, and there is no verified pain worth forcing into a pitch.`,
      nextStep: "Record the skip reason and revisit only if new evidence appears.",
      qualifiesForOutreach: false,
    },
    facebook_first: {
      objective: "Learn whether customers need a stable path beyond social posts.",
      opener: `Hi, Mountline here. ${business} keeps ${fact} active on Facebook. Do customers ever struggle to find current services, trust details, or the right next step outside the feed?`,
      nextStep: "If the owner confirms friction, show one durable customer-path concept.",
      qualifiesForOutreach: true,
    },
    missing_booking: {
      objective: "Confirm whether booking friction creates calls or lost intent.",
      opener: `Hi, Mountline here. We verified ${fact} for ${business}, but could not find a clear booking step. How do customers normally move from interest to an appointment?`,
      nextStep: "Map the existing booking workflow before recommending a tool or change.",
      qualifiesForOutreach: true,
    },
    missing_contact_form: {
      objective: "Understand whether the current inquiry route fits the team.",
      opener: `Hi, Mountline here. ${business} clearly communicates ${fact}, but the public inquiry path appears phone-only. Is that intentional, or does the team lose after-hours requests?`,
      nextStep: "Confirm the preferred inquiry channel before suggesting a form.",
      qualifiesForOutreach: true,
    },
    owner_busy: {
      objective: "Protect the relationship and secure a better time.",
      opener: `Understood—we will keep this short. Mountline noticed ${fact} at ${business}. Would Tuesday or Wednesday be better for one focused question?`,
      nextStep: "Agree on a specific time or exit without continuing the pitch.",
      qualifiesForOutreach: true,
    },
    employee_answered: {
      objective: "Find the correct decision-maker without pitching through staff.",
      opener: `Thanks. Mountline has one specific question about ${fact} at ${business}. Who handles the website or customer inquiry process, and when is a respectful time to reach them?`,
      nextStep: "Record the owner route and avoid asking the employee to sell the idea internally.",
      qualifiesForOutreach: true,
    },
    concept_ready: {
      objective: "Get a reaction to one evidence-grounded concept.",
      opener: `Hi, Mountline here. We prepared one focused concept for ${business} around ${fact}. It is easier to show than explain. Would you be open to a quick look?`,
      nextStep: "Show the strongest screen, pause, and ask what feels useful or wrong.",
      qualifiesForOutreach: true,
    },
    prior_contact: {
      objective: "Continue the existing thread without pretending it is a cold introduction.",
      opener: `Hi, Mountline following up on the ${business} idea around ${fact}. Did it raise a useful question, or should we leave it there for now?`,
      nextStep: "Resolve the open question or close the loop respectfully.",
      qualifiesForOutreach: true,
    },
    demo_sent: {
      objective: "Learn what the owner thought about the concept.",
      opener: `Hi, Mountline following up on the ${business} concept around ${fact}. What felt useful, what missed, and is there anything worth adjusting?`,
      nextStep: "Use the reaction to earn a scoped review, not to force a proposal.",
      qualifiesForOutreach: true,
    },
    no_response_after_demo: {
      objective: "Make one low-pressure close-the-loop attempt.",
      opener: `Hi, Mountline here. We sent the ${business} concept around ${fact}. No reply is completely fine—should we close the loop, or would one specific adjustment make it worth another look?`,
      nextStep: "Honor silence after this attempt and stop automated follow-up.",
      qualifiesForOutreach: true,
    },
    interested_hesitant: {
      objective: "Isolate the real decision concern before adding more persuasion.",
      opener: `Thanks for the honest reaction to the ${business} idea around ${fact}. Is the hesitation mainly value, price, timing, scope, or another decision-maker?`,
      nextStep: "Address only the named concern, then ask for the smallest supported commitment.",
      qualifiesForOutreach: true,
    },
    price_asked_early: {
      objective: "Answer the price concern honestly without inventing scope.",
      opener: `Fair question. Mountline should not guess before understanding the smallest useful scope for ${business} around ${fact}. Can we ask two quick questions, then put a clear range in writing?`,
      nextStep: "Confirm scope, state any real range, and send the assumptions in writing.",
      qualifiesForOutreach: true,
    },
    send_link_requested: {
      objective: "Confirm delivery details and a permission-based follow-up.",
      opener: `Absolutely. Mountline will send the ${business} concept around ${fact}. What is the best number or email, and would Wednesday be alright for one brief check-back?`,
      nextStep: "Send only what was promised and record the agreed follow-up time.",
      qualifiesForOutreach: true,
    },
    declined: {
      objective: "Respect the decline and preserve trust.",
      opener: gracefulExit,
      nextStep: "Mark do not contact and do not reopen the pitch.",
      qualifiesForOutreach: false,
    },
    proposal_stage: {
      objective: "Resolve the remaining decision point in the existing scope.",
      opener: `Hi, Mountline following up on the ${business} scope around ${fact}. Is the remaining question mainly value, price, timing, exact scope, or another decision-maker?`,
      nextStep: "Resolve the named issue or agree on a clear no-decision date.",
      qualifiesForOutreach: true,
    },
    won: {
      objective: "Move the agreed work forward without reselling it.",
      opener: `${business} is already won. Confirm the agreed next project step around ${fact}, the owner, and the due date instead of reopening the pitch.`,
      nextStep: "Record the delivery handoff and next milestone.",
      qualifiesForOutreach: false,
    },
    lost: {
      objective: "Keep the closed outcome closed.",
      opener: `${business} is closed as lost. Do not restart outreach around ${fact}; retain the reason and revisit only if the business initiates a new conversation.`,
      nextStep: "Preserve the loss reason and remove active follow-ups.",
      qualifiesForOutreach: false,
    },
  }

  return { situation, gracefulExit, ...guidance[situation] }
}
