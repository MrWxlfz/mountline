"use client"

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { industryCategories, searchIndustries, getIndustry } from "@/lib/receptionist/studio/industries"

/** A searchable business-type combobox, grouped by category. Arrow keys move, Enter picks, Escape closes. */
export function IndustryPicker({ value, onChange, invalid }: { value: string; onChange: (id: string) => void; invalid?: boolean }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()
  const input = useRef<HTMLInputElement>(null)
  const results = useMemo(() => searchIndustries(query), [query])
  const groups = industryCategories
    .map((category) => ({ ...category, items: results.filter((industry) => industry.category === category.id) }))
    .filter((group) => group.items.length)
  const flat = groups.flatMap((group) => group.items)
  const selected = value ? getIndustry(value) : null

  function pick(id: string) {
    onChange(id)
    setQuery("")
    setOpen(false)
    input.current?.blur()
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActive((index) => Math.min(flat.length - 1, index + 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((index) => Math.max(0, index - 1))
    } else if (event.key === "Enter" && open) {
      event.preventDefault()
      if (flat[active]) pick(flat[active].id)
    } else if (event.key === "Escape") {
      setOpen(false)
      setQuery("")
    }
  }

  return (
    <div className="st-combo">
      <input
        ref={input}
        className={invalid ? "pt-input bad" : "pt-input"}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && flat[active] ? `${listId}-${flat[active].id}` : undefined}
        aria-invalid={invalid || undefined}
        placeholder={selected ? selected.label : "Search: barber, dental, HVAC…"}
        value={open ? query : selected?.label ?? query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          setActive(Math.max(0, flat.findIndex((industry) => industry.id === value)))
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKey}
      />
      <span className="st-combo-caret" aria-hidden="true" />
      {open ? (
        <div className="st-combo-list" id={listId} role="listbox" aria-label="Business types">
          {groups.length ? (
            groups.map((group) => (
              <div key={group.id} role="group" aria-label={group.label}>
                <div className="st-combo-group" aria-hidden="true">{group.label}</div>
                {group.items.map((industry) => {
                  const index = flat.indexOf(industry)
                  return (
                    <div
                      key={industry.id}
                      id={`${listId}-${industry.id}`}
                      role="option"
                      aria-selected={industry.id === value}
                      className={index === active ? "st-combo-opt on" : "st-combo-opt"}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        pick(industry.id)
                      }}
                      onMouseEnter={() => setActive(index)}
                    >
                      {industry.label}
                      {industry.id === value ? <span aria-hidden="true">✓</span> : null}
                    </div>
                  )
                })}
              </div>
            ))
          ) : (
            <div className="st-combo-empty">No match. Try a broader word, like “salon” or “repair.”</div>
          )}
        </div>
      ) : null}
    </div>
  )
}
