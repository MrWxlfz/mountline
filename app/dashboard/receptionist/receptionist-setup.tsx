"use client"

import { useMemo, useState } from "react"
import { Copy, Download } from "lucide-react"
import { SectionPanel, SecondaryAction, StateNotice, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { parseReceptionistProfile } from "@/lib/receptionist/config"
import { customerProfileTemplate, northTexasDemoProfile } from "@/lib/receptionist/profiles"
import { buildReceptionistPrompt } from "@/lib/receptionist/prompt"

export function ReceptionistSetup() {
  const [source, setSource] = useState(() => JSON.stringify(northTexasDemoProfile, null, 2))
  const [status, setStatus] = useState<{ error: boolean; text: string } | null>(null)
  const [copying, setCopying] = useState(false)
  const validation = useMemo(() => parseReceptionistProfile(source), [source])
  const prompt = useMemo(() => validation.success ? buildReceptionistPrompt(validation.profile) : "", [validation])

  function loadTemplate(template: unknown) {
    setSource(JSON.stringify(template, null, 2))
    setStatus(null)
  }

  function download(contents: string, filename: string, type: string) {
    const url = URL.createObjectURL(new Blob([contents], { type }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus({ error: false, text: `Download requested: ${filename}. Nothing was sent to a provider.` })
  }

  async function copyPrompt() {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(prompt)
      setStatus({ error: false, text: "Prompt copied. Review it before applying it in Retell; no provider settings have changed." })
    } catch {
      setStatus({ error: true, text: "Clipboard access is unavailable. Download the prompt or select and copy the preview below." })
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="space-y-5">
      <StateNotice tone="info" title="A local draft, with no automatic saving">
        <p>Edits stay in this tab until downloaded. Keep customer profiles in approved private storage; do not paste credentials or caller records here. Booking, texting, and live transfers are disabled.</p>
      </StateNotice>
      <SectionPanel
        title="Business profile"
        description="Start with the fictional HVAC example or a blank customer draft. Replace the business facts, then download a reusable profile. Loading a template replaces the current draft."
        action={<div className="flex flex-wrap gap-2"><SecondaryAction onClick={() => loadTemplate(northTexasDemoProfile)}>Load demo</SecondaryAction><SecondaryAction onClick={() => loadTemplate(customerProfileTemplate)}>Start customer draft</SecondaryAction></div>}
      >
        <label htmlFor="receptionist-profile" className="text-sm font-medium">Profile JSON</label>
        <p id="profile-help" className="mt-1 text-xs leading-5 text-muted-foreground">Required: business name, timezone, services, and service area. Set hours to null when unverified; within a weekly schedule, a null day means closed. The example hours and service area are fictional.</p>
        <textarea
          id="receptionist-profile"
          aria-describedby="profile-help profile-validation"
          aria-invalid={!validation.success}
          spellCheck={false}
          value={source}
          onChange={(event) => { setSource(event.target.value); setStatus(null) }}
          className="mt-3 min-h-[360px] w-full rounded-md border border-border bg-background p-3 font-mono text-xs leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
        />
        <div id="profile-validation" className="mt-4" aria-live="polite">
          {validation.success ? (
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone="green">Valid {validation.profile.mode} draft</StatusBadge>
              <p className="text-sm text-muted-foreground">{validation.profile.business.name} · Structure checked; business facts and provider behavior still need review.</p>
            </div>
          ) : (
            <StateNotice tone="warning" title="Complete or correct the profile before exporting a prompt">
              <ul className="mt-2 list-disc space-y-1 pl-4">{validation.errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul>
            </StateNotice>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryAction icon={Download} disabled={!validation.success} onClick={() => {
            if (validation.success) download(JSON.stringify(validation.profile, null, 2) + "\n", `${validation.profile.id}.json`, "application/json")
          }}>Download profile</SecondaryAction>
          <SecondaryAction icon={Download} onClick={() => download(source, "receptionist-draft.json", "application/json")}>Save unfinished draft</SecondaryAction>
        </div>
      </SectionPanel>
      <SectionPanel
        title="Generated call-handling prompt"
        description="Shared safety and conversation rules plus this business's facts. This is a review draft for manual application, not a Retell import format or a live agent status."
        action={<div className="flex flex-wrap gap-2"><SecondaryAction icon={Copy} disabled={!validation.success || copying} onClick={copyPrompt}>{copying ? "Copying…" : "Copy prompt"}</SecondaryAction><SecondaryAction icon={Download} disabled={!validation.success} onClick={() => {
          if (validation.success) download(prompt, `${validation.profile.id}-prompt.txt`, "text/plain")
        }}>Download prompt</SecondaryAction></div>}
      >
        <label htmlFor="receptionist-prompt" className="sr-only">Generated prompt preview</label>
        <textarea id="receptionist-prompt" readOnly value={prompt} placeholder="A prompt appears after the profile passes validation." className="min-h-[340px] w-full rounded-md border border-border bg-background p-3 font-mono text-xs leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm" />
        <p className="mt-3 text-xs leading-5 text-muted-foreground">This draft cannot book an appointment, send a message, transfer a call, or prove that a callback request reached anyone.</p>
      </SectionPanel>
      {status && <div role="status"><StateNotice tone={status.error ? "error" : "success"} title={status.text} /></div>}
    </div>
  )
}
