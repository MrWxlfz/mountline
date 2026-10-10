"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ComponentProps, type ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowUpRight, X } from "lucide-react"
import { mailtoHref, site, smsHref } from "@/content/site"

/**
 * "Book a call" everywhere on the public site. On a computer the booking page opens in a modal;
 * on phones and tablets it's a normal link, because booking iframes are cramped on small screens.
 * Without NEXT_PUBLIC_BOOKING_URL the buttons fall back to the contact section.
 */

const BookingContext = createContext<{ open: () => void } | null>(null)

const DESKTOP = "(min-width: 768px) and (pointer: fine)"

/** Google appointment pages need gv=true to render inside an iframe. Cal.com links pass through. */
export function bookingEmbedUrl(raw: string) {
  try {
    const url = new URL(raw)
    if (url.hostname === "calendar.google.com" && !url.searchParams.has("gv")) url.searchParams.set("gv", "true")
    return url.toString()
  } catch {
    return raw
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const url = site.contact.bookingUrl
  const open = useCallback(() => setOpen(true), [])
  const value = useMemo(() => ({ open }), [open])

  useEffect(() => {
    if (!isOpen) return
    // If the page refuses to load in a frame, offer the new-tab link prominently instead of a blank box.
    const timer = window.setTimeout(() => setSlow(true), 8000)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  const sms = smsHref()

  return (
    <BookingContext.Provider value={value}>
      {children}
      {url ? (
        <Dialog.Root
          open={isOpen}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) {
              setLoaded(false)
              setSlow(false)
            }
          }}
        >
          {/* No portal: the modal stays inside .mk so it keeps the site's tokens. */}
          <Dialog.Overlay className="mk-modal__overlay" />
          <Dialog.Content className="mk-modal" aria-describedby={undefined}>
            <div className="mk-modal__bar">
              <Dialog.Title className="mk-modal__title">Book a 15-minute call</Dialog.Title>
              <div className="mk-modal__tools">
                <a href={url} target="_blank" rel="noopener noreferrer" className="mk-modal__tool">
                  Open in new tab <ArrowUpRight aria-hidden="true" />
                </a>
                <Dialog.Close className="mk-modal__close" aria-label="Close">
                  <X aria-hidden="true" />
                </Dialog.Close>
              </div>
            </div>
            <div className="mk-modal__frame" data-loaded={loaded}>
              {!loaded ? (
                <div className="mk-modal__loading" aria-hidden={slow ? undefined : true}>
                  {slow ? (
                    <p>
                      Taking a while?{" "}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="mk-link">Open the booking page in a new tab</a>.
                    </p>
                  ) : (
                    <>
                      <span />
                      <span />
                      <span />
                    </>
                  )}
                </div>
              ) : null}
              <iframe src={bookingEmbedUrl(url)} title="Booking calendar" onLoad={() => setLoaded(true)} />
            </div>
            <p className="mk-modal__foot">
              Rather not book online?{" "}
              {sms ? <><a href={sms} className="mk-link">Text me</a> or </> : null}
              <a href={mailtoHref} className="mk-link">email {site.contact.email}</a>.
            </p>
          </Dialog.Content>
        </Dialog.Root>
      ) : null}
    </BookingContext.Provider>
  )
}

type BookButtonProps = Omit<ComponentProps<"a">, "href"> & { children: ReactNode }

/** A link to the booking page that opens the modal on desktop. */
export function BookButton({ children, onClick, ...props }: BookButtonProps) {
  const booking = useContext(BookingContext)
  const url = site.contact.bookingUrl
  return (
    <a
      {...props}
      href={url || "#contact"}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || !url || !booking) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        if (!window.matchMedia(DESKTOP).matches) return
        event.preventDefault()
        booking.open()
      }}
    >
      {children}
    </a>
  )
}
