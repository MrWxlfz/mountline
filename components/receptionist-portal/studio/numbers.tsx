"use client"

import { useState } from "react"
import { setNumberAgent, setNumberNickname } from "@/app/(marketing)/receptionist/studio-actions"
import type { AgentOption, StudioNumber } from "@/lib/receptionist/studio/service"

/**
 * The account's Retell numbers and who answers each one. Any agent can go on any number (so the main
 * demo agent can always be put back), and the selected Studio receptionist is one click away. Changes
 * apply to the next call; a call already in progress keeps its agent.
 */
export function NumbersPanel({
  numbers,
  agents,
  current,
  onNumbers,
}: {
  numbers: StudioNumber[]
  agents: AgentOption[]
  current: { id: string; name: string } | null
  onNumbers: (numbers: StudioNumber[]) => void
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [nickname, setNickname] = useState("")

  const nameOf = (id: string | null) => (id ? agents.find((agent) => agent.id === id)?.name ?? id : "Nobody")

  async function assign(line: StudioNumber, agentId: string) {
    if (!agentId || agentId === line.inboundAgentId) return
    setBusy(line.number)
    setStatus(null)
    const result = await setNumberAgent(line.number, agentId)
    setBusy(null)
    if (!result.ok) return setStatus({ tone: "error", text: result.error })
    onNumbers(result.data)
    setStatus({ tone: "ok", text: `${formatPhone(line.pretty)} now rings ${nameOf(agentId)}. The next call uses it.` })
  }

  async function rename(line: StudioNumber) {
    setBusy(line.number)
    setStatus(null)
    const result = await setNumberNickname(line.number, nickname)
    setBusy(null)
    if (!result.ok) return setStatus({ tone: "error", text: result.error })
    onNumbers(result.data)
    setEditing(null)
  }

  return (
    <section className="pt-card">
      <div className="pt-card-h">
        <h2>Phone numbers</h2>
        <span className="pt-muted small">Let them call it themselves</span>
      </div>
      {numbers.length ? (
        <ul className="st-lines">
          {numbers.map((line) => {
            const here = current && line.inboundAgentId === current.id
            return (
              <li key={line.number} className={here ? "st-line on" : "st-line"}>
                <div className="st-line-top">
                  <a className="st-line-num" href={`tel:${line.number}`}>{formatPhone(line.pretty)}</a>
                  {editing === line.number ? (
                    <form
                      className="st-line-name-edit"
                      onSubmit={(event) => {
                        event.preventDefault()
                        rename(line)
                      }}
                    >
                      <input className="pt-input st-small-input" value={nickname} maxLength={60} autoFocus onChange={(event) => setNickname(event.target.value)} aria-label="Nickname" placeholder="Nickname" />
                      <button className="pt-btn small" type="submit" disabled={busy === line.number}>Save</button>
                      <button className="pt-btn light small" type="button" onClick={() => setEditing(null)}>Cancel</button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="st-line-name"
                      onClick={() => {
                        setEditing(line.number)
                        setNickname(line.nickname)
                      }}
                    >
                      {line.nickname || "Add a nickname"}
                    </button>
                  )}
                </div>
                <div className="st-line-row">
                  <label className="pt-muted small" htmlFor={`line-${line.number}`}>Answered by</label>
                  <select
                    id={`line-${line.number}`}
                    className="pt-input st-small-input"
                    value={line.inboundAgentId ?? ""}
                    disabled={busy === line.number}
                    onChange={(event) => assign(line, event.target.value)}
                  >
                    {line.inboundAgentId ? null : <option value="">Nobody yet</option>}
                    {line.inboundAgentId && !agents.some((agent) => agent.id === line.inboundAgentId) ? <option value={line.inboundAgentId}>{line.inboundAgentId}</option> : null}
                    <optgroup label="Studio receptionists">
                      {agents.filter((agent) => agent.studio).map((agent) => <option key={agent.id} value={agent.id}>{agent.name.replace(/^Studio · /, "")}</option>)}
                    </optgroup>
                    <optgroup label="Other agents">
                      {agents.filter((agent) => !agent.studio).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                    </optgroup>
                  </select>
                  {current && !here ? (
                    <button type="button" className="pt-btn light small" disabled={busy === line.number} onClick={() => assign(line, current.id)}>
                      {busy === line.number ? <><span className="pt-spin dark" aria-hidden="true" />Moving</> : `Use ${current.name}`}
                    </button>
                  ) : here ? <span className="pt-chip good">On this number</span> : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="pt-muted">No phone numbers on the Retell account yet. Buy one in Retell (Phone Numbers), then reload.</p>
      )}
      {status ? <p className={status.tone === "error" ? "pt-error" : "pt-ok"} role="status">{status.text}</p> : null}
    </section>
  )
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "")
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  return national.length === 10 ? `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}` : value
}
