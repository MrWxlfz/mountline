/*
 * Voice personality presets. Each one sets how the receptionist talks (prompt) and how it sounds and
 * takes turns (Retell agent settings). Field names follow Retell's create-agent reference
 * (docs.retellai.com/api-references/create-agent, checked October 2026).
 */

export const personalityIds = ["warm", "polished", "casual"] as const
export type PersonalityId = (typeof personalityIds)[number]

export type Personality = {
  id: PersonalityId
  label: string
  blurb: string
  /** Prompt guidance on tone, on top of the shared conversation rules. */
  tone: string[]
  /** Retell LLM model_temperature (0–1). A little variety keeps replies from sounding canned. */
  temperature: number
  voice: {
    voice_temperature: number
    voice_speed: number
    responsiveness: number
    interruption_sensitivity: number
    enable_backchannel: boolean
    backchannel_frequency: number
    backchannel_words: string[]
  }
  /** Used only with Retell platform voices, the only ones that support expressive mode. */
  expressiveTags: Array<"empathetic" | "excited" | "happy" | "curious" | "surprised" | "pause">
  /** Retell's Agent Handbook tone preset: Professional (default_personality) or Professional + Conversational. */
  handbookTone: "default_personality" | "conversational_personality"
}

export const personalities: Record<PersonalityId, Personality> = {
  warm: {
    id: "warm",
    label: "Warm & Friendly",
    blurb: "Welcoming, relaxed, still professional",
    tone: [
      "Warm and welcoming, like someone who genuinely likes their job and the people who call.",
      "Relaxed pace. A friendly acknowledgment when it fits (\"Oh, good.\" \"No problem at all.\"), never gushing.",
      "Professional underneath: you're efficient and you know the business.",
    ],
    temperature: 0.35,
    voice: {
      voice_temperature: 1,
      voice_speed: 1,
      responsiveness: 0.9,
      interruption_sensitivity: 0.8,
      enable_backchannel: true,
      backchannel_frequency: 0.6,
      backchannel_words: ["mm-hmm", "okay", "sure", "got it"],
    },
    expressiveTags: ["empathetic", "happy", "pause"],
    handbookTone: "conversational_personality",
  },
  polished: {
    id: "polished",
    label: "Polished & Professional",
    blurb: "Composed and articulate. Dental, medical, hotels",
    tone: [
      "Composed, articulate, and confident, like the front desk of a well-run practice or a good hotel.",
      "Courteous without being stiff. Complete, clean sentences; no slang.",
      "Calm and reassuring when someone is worried. You never sound rushed.",
    ],
    temperature: 0.25,
    voice: {
      voice_temperature: 0.8,
      voice_speed: 0.98,
      responsiveness: 0.85,
      interruption_sensitivity: 0.75,
      enable_backchannel: true,
      backchannel_frequency: 0.4,
      backchannel_words: ["mm-hmm", "I see", "of course"],
    },
    expressiveTags: ["empathetic", "pause"],
    handbookTone: "default_personality",
  },
  casual: {
    id: "casual",
    label: "Casual & Personable",
    blurb: "Easygoing but sharp. Barbershops, local trades",
    tone: [
      "Easygoing and personable, like a regular at the shop who also runs the front desk well.",
      "Plain, everyday words. Contractions. Short sentences. It's fine to say \"Hey\" or \"Yeah, for sure.\"",
      "Still competent and quick: casual never means sloppy or overly familiar.",
    ],
    temperature: 0.45,
    voice: {
      voice_temperature: 1.1,
      voice_speed: 1.03,
      responsiveness: 1,
      interruption_sensitivity: 0.85,
      enable_backchannel: true,
      backchannel_frequency: 0.7,
      backchannel_words: ["yeah", "mm-hmm", "okay", "gotcha"],
    },
    expressiveTags: ["happy", "curious", "pause"],
    handbookTone: "conversational_personality",
  },
}
