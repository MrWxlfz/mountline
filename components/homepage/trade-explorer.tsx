"use client"

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import type { Trade } from "@/lib/homepage/content"

export function TradeExplorer({ trades, intro }: { trades: readonly Trade[]; intro?: ReactNode }) {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const trade = trades[active]

  const select = (index: number, focus = false) => {
    const next = (index + trades.length) % trades.length
    setActive(next)
    if (focus) tabRefs.current[next]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: trades.length - 1 }
    if (!(event.key in keys)) return
    event.preventDefault()
    select(keys[event.key], true)
  }

  return (
    <div className="ml-trades">
      <div className="ml-trades__side">
        {intro}
        <div className="ml-trades__tabs" role="tablist" aria-label="Type of business" aria-orientation="vertical">
          {trades.map((item, index) => {
            const selected = index === active
            return (
              <button
                key={item.name}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`trade-tab-${index}`}
                aria-selected={selected}
                aria-controls="trade-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={onKeyDown}
                className="ml-trades__tab"
              >
                <span className="ml-trades__name">{item.name}</span>
                <span className="ml-trades__moment" aria-hidden="true">
                  <span>{item.moment}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="ml-trades__panel" role="tabpanel" id="trade-panel" aria-labelledby={`trade-tab-${active}`}>
        <div className="ml-trades__scene" key={trade.name}>
          <p className="ml-trades__panel-moment">{trade.moment}</p>
          <div className="ml-trades__call">
            <p className="ml-trades__label">A caller says</p>
            <blockquote>“{trade.caller}”</blockquote>
          </div>
          <div className="ml-trades__grid">
            <div className="ml-trades__asks">
              <p className="ml-trades__label">Mountline asks</p>
              <ol>
                {trade.asks.map((ask, index) => (
                  <li key={ask} style={{ "--i": index } as React.CSSProperties}>
                    <span aria-hidden="true">{index + 1}</span>
                    {ask}
                  </li>
                ))}
              </ol>
            </div>
            <div className="ml-slip" role="group" aria-label={`Example ${trade.name} request`}>
              <div className="ml-slip__head">
                <span>{trade.name} request</span>
                <span className="ml-slip__tag">Example</span>
              </div>
              <dl>
                {trade.request.map(([label, value], index) => (
                  <div key={label} style={{ "--i": index } as React.CSSProperties}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="ml-slip__status">
                <i aria-hidden="true" />
                {trade.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
