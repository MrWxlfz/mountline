"use client"

import { FormEvent, useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react"
import { SignIn } from "@clerk/nextjs"
import { useSignIn } from "@clerk/nextjs/legacy"
import type {
  OauthFactor,
  SignInFirstFactor,
  SignInResource,
  SignInSecondFactor,
} from "@clerk/nextjs/types"
import Link from "next/link"
import { MountlineMark, Wordmark } from "@/components/brand/wordmark"

/*
  Mountline ID sign-in, styled from docs/design/id-reference.html (styles in
  app/(marketing)/marketing.css under .mk-id). The flow itself is unchanged: email first, then the
  account's password or a one-time code, an optional second step, and Clerk's own <SignIn> as the
  fallback for anything the custom flow can't handle.
*/

type MountlineIdFormProps = {
  redirectUrl: string
  useCustomFlow: boolean
}

type AuthStep = "identifier" | "password" | "code" | "secondFactor" | "unsupported"
type CodeStrategy = "email_code" | "phone_code"
type SecondFactorStrategy = "email_code" | "phone_code" | "totp" | "backup_code"

const oauthLabels: Record<string, string> = {
  oauth_apple: "Apple",
  oauth_discord: "Discord",
  oauth_facebook: "Facebook",
  oauth_github: "GitHub",
  oauth_gitlab: "GitLab",
  oauth_google: "Google",
  oauth_linkedin_oidc: "LinkedIn",
  oauth_microsoft: "Microsoft",
  oauth_slack: "Slack",
  oauth_x: "X",
}

const bookingHref = process.env.NEXT_PUBLIC_BOOKING_URL || "/#contact"

export function MountlineIdForm({ redirectUrl, useCustomFlow }: MountlineIdFormProps) {
  return (
    <div className="mk-id">
      {/* Soft brand-color light drifting behind the page. Decorative; still under reduced motion. */}
      <div className="aurora" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="page">
        <header className="top">
          <Link href="/" aria-label="Mountline home" className="logo hit">
            <Wordmark />
          </Link>
          <Link href="/" className="top-link hit">
            mountline.dev
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M4.5 9.5l5-5M5.5 4.5h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </header>
        <main>
          <div className="col">
            {useCustomFlow ? (
              <CustomMountlineSignIn redirectUrl={redirectUrl} />
            ) : (
              <StableClerkSignIn redirectUrl={redirectUrl} />
            )}
          </div>
        </main>
        <AuthFooter />
      </div>
    </div>
  )
}

/** The mark tile, title, and subtitle above the card. Text swaps instantly between steps. */
function AuthHead({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="head">
      <span className="tile" aria-hidden="true"><MountlineMark /></span>
      <h1>{title}</h1>
      <p className="sub">{sub}</p>
    </div>
  )
}

function CustomMountlineSignIn({ redirectUrl }: { redirectUrl: string }) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [step, setStep] = useState<AuthStep>("identifier")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [codeStrategy, setCodeStrategy] = useState<CodeStrategy>("email_code")
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<SecondFactorStrategy>("totp")
  const [safeIdentifier, setSafeIdentifier] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [handoffReason, setHandoffReason] = useState("")
  // Presentation only: green code boxes, then the "You're in" card while Clerk redirects.
  const [codeOk, setCodeOk] = useState(false)
  const [done, setDone] = useState(false)
  const resetPresentation = () => {
    setCodeOk(false)
    setDone(false)
  }

  const oauthFactors = useMemo(() => {
    if (!isLoaded) return []
    return (signIn.supportedFirstFactors || []).filter(isOauthFactor)
  }, [isLoaded, signIn])

  const fallbackHref = getFallbackHref(redirectUrl)

  async function completeIfReady(nextSignIn: SignInResource) {
    if (nextSignIn.status === "complete" && nextSignIn.createdSessionId) {
      if (!setActive) {
        setHandoffReason("Clerk is still loading the active session handler.")
        setStep("unsupported")
        return false
      }

      if (step === "code" || step === "secondFactor") {
        setCodeOk(true)
        await new Promise((resolve) => setTimeout(resolve, prefersReducedMotion() ? 0 : 350))
      }
      setDone(true)
      await setActive({ session: nextSignIn.createdSessionId, redirectUrl })
      return true
    }

    if (nextSignIn.status === "needs_second_factor") {
      await prepareSecondFactor(nextSignIn)
      return false
    }

    if (
      nextSignIn.status === "needs_new_password" ||
      nextSignIn.status === "needs_client_trust"
    ) {
      setHandoffReason("This account needs an additional Clerk-managed step.")
      setStep("unsupported")
      return false
    }

    return false
  }

  async function prepareSecondFactor(nextSignIn: SignInResource) {
    const factor = pickSecondFactor(nextSignIn.supportedSecondFactors)
    if (!factor) {
      setHandoffReason("This account requires a sign-in factor that is not available in the custom flow.")
      setStep("unsupported")
      return
    }

    setCode("")
    setSecondFactorStrategy(factor.strategy)

    if (factor.strategy === "email_code") {
      await nextSignIn.prepareSecondFactor({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      })
      setSafeIdentifier(factor.safeIdentifier)
    }

    if (factor.strategy === "phone_code") {
      await nextSignIn.prepareSecondFactor({
        strategy: "phone_code",
        phoneNumberId: factor.phoneNumberId,
      })
      setSafeIdentifier(factor.safeIdentifier)
    }

    setStep("secondFactor")
  }

  async function handleIdentifierSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLoaded || isSubmitting) return

    const identifier = email.trim()
    if (!identifier) {
      setError("Enter the email address for your Mountline account.")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      const nextSignIn = await signIn.create({ identifier })
      if (await completeIfReady(nextSignIn)) return

      const factor = pickFirstFactor(nextSignIn.supportedFirstFactors)
      if (!factor) {
        setHandoffReason("This account uses a sign-in method that needs the stable Clerk flow.")
        setStep("unsupported")
        return
      }

      if (factor.strategy === "password") {
        setPassword("")
        setStep("password")
        return
      }

      if (factor.strategy === "email_code") {
        await nextSignIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: factor.emailAddressId,
        })
        setCode("")
        setCodeStrategy("email_code")
        setSafeIdentifier(factor.safeIdentifier)
        setStep("code")
        return
      }

      if (factor.strategy === "phone_code") {
        await nextSignIn.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId: factor.phoneNumberId,
        })
        setCode("")
        setCodeStrategy("phone_code")
        setSafeIdentifier(factor.safeIdentifier)
        setStep("code")
      }
    } catch (err) {
      setError(getClerkErrorMessage(err))
      resetPresentation()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLoaded || isSubmitting) return
    if (!password) {
      setError("Enter your password.")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      const nextSignIn = await signIn.attemptFirstFactor({
        strategy: "password",
        password,
      })
      await completeIfReady(nextSignIn)
    } catch (err) {
      setError(getClerkErrorMessage(err))
      resetPresentation()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLoaded || isSubmitting) return
    if (!code.trim()) {
      setError("Enter the verification code.")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      const nextSignIn = await signIn.attemptFirstFactor({
        strategy: codeStrategy,
        code: code.trim(),
      })
      await completeIfReady(nextSignIn)
    } catch (err) {
      setError(getClerkErrorMessage(err))
      resetPresentation()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSecondFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLoaded || isSubmitting) return
    if (!code.trim()) {
      setError("Enter the verification code.")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      const nextSignIn = await signIn.attemptSecondFactor({
        strategy: secondFactorStrategy,
        code: code.trim(),
      })
      await completeIfReady(nextSignIn)
    } catch (err) {
      setError(getClerkErrorMessage(err))
      resetPresentation()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleOauth(strategy: OauthFactor["strategy"]) {
    if (!isLoaded || isSubmitting) return
    setIsSubmitting(true)
    setError("")
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/id",
        redirectUrlComplete: redirectUrl,
      })
    } catch (err) {
      setError(getClerkErrorMessage(err))
      resetPresentation()
      setIsSubmitting(false)
    }
  }

  async function goBackToIdentifier() {
    setError("")
    setPassword("")
    setCode("")
    setSafeIdentifier("")
    setHandoffReason("")
    resetPresentation()
    setStep("identifier")
  }

  const destination = redirectUrl.includes("redirect_url=") ? "your project" : "Mountline"

  if (!isLoaded) {
    return (
      <>
        <AuthHead title="Sign in to Mountline" sub="One account for your project portal and dashboard." />
        <div className="card" aria-busy="true">
          <div className="loading"><span className="spin dark" aria-hidden="true" />Loading Mountline ID</div>
        </div>
      </>
    )
  }

  if (done) {
    return (
      <>
        <AuthHead title="Welcome back" sub="Signing you in." />
        <div className="card" role="status">
          <div className="done">
            <span className="ok">
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M4 9.4 7.4 12.6 14 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <b>You&apos;re in</b>
            <span>Taking you to {destination}…</span>
          </div>
        </div>
      </>
    )
  }

  const sentTo = safeIdentifier || email
  const heads: Record<AuthStep, { title: string; sub: ReactNode }> = {
    identifier: { title: "Sign in to Mountline", sub: "One account for your project portal and dashboard." },
    password: { title: "Enter your password", sub: "Use the password for your Mountline account." },
    code: {
      title: codeStrategy === "phone_code" ? "Check your phone" : "Check your email",
      sub: codeStrategy === "phone_code" ? "Enter the 6-digit code sent to your phone." : "Enter the 6-digit code I just sent you.",
    },
    secondFactor: {
      title: "One more step",
      sub: secondFactorStrategy === "totp"
        ? "Enter the code from your authenticator app."
        : secondFactorStrategy === "backup_code"
          ? "Enter one of your backup codes."
          : `Enter the code sent to ${sentTo}.`,
    },
    unsupported: { title: "Use another sign-in method", sub: "This account needs a step the quick sign-in can't do." },
  }

  return (
    <>
      <AuthHead {...heads[step]} />

      {step === "identifier" && (
        <form className="card" key="identifier" onSubmit={handleIdentifierSubmit} noValidate>
          <label htmlFor="mountline-id-email">Email</label>
          <div className={error ? "field bad" : "field"}>
            <MailIcon />
            <input
              id="mountline-id-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@yourbusiness.com"
              disabled={isSubmitting}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "mountline-id-error" : undefined}
            />
          </div>
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting} loadingLabel="Checking">Continue</SubmitButton>
          <p className="hint">Next, you&apos;ll use your password or a one-time code.</p>
          <OauthButtons factors={oauthFactors} disabled={isSubmitting} onSelect={handleOauth} />
          <p className="alt">
            New here? Accounts are made when we start a project. <a className="linkish" href={bookingHref}>Book a call</a>
          </p>
        </form>
      )}

      {step === "password" && (
        <form className="card" key="password" onSubmit={handlePasswordSubmit} noValidate>
          <SentTo label="Signing in as" value={email} onEdit={goBackToIdentifier} disabled={isSubmitting} />
          <label htmlFor="mountline-id-password" className="spaced">Password</label>
          <div className={error ? "field bad" : "field"}>
            <input
              id="mountline-id-password"
              className="plain"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "mountline-id-error" : undefined}
            />
          </div>
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting} loadingLabel="Signing in">Sign in</SubmitButton>
        </form>
      )}

      {step === "code" && (
        <form className="card" key="code" onSubmit={handleCodeSubmit} noValidate>
          <SentTo label="Code sent to" value={sentTo} onEdit={goBackToIdentifier} disabled={isSubmitting} />
          <CodeBoxes value={code} onChange={setCode} disabled={isSubmitting} ok={codeOk} invalid={!!error} />
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting} loadingLabel="Verifying">Verify and sign in</SubmitButton>
          <p className="hint">Didn&apos;t get it? Check your spam folder, or edit the address above.</p>
        </form>
      )}

      {step === "secondFactor" && (
        <form className="card" key="secondFactor" onSubmit={handleSecondFactorSubmit} noValidate>
          <SentTo label="Signing in as" value={email} onEdit={goBackToIdentifier} disabled={isSubmitting} />
          {secondFactorStrategy === "backup_code" ? (
            <>
              <label htmlFor="mountline-id-mfa-code" className="spaced">Backup code</label>
              <div className={error ? "field bad" : "field"}>
                <input
                  id="mountline-id-mfa-code"
                  className="plain"
                  name="one-time-code"
                  type="text"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={error ? true : undefined}
                />
              </div>
            </>
          ) : (
            <CodeBoxes value={code} onChange={setCode} disabled={isSubmitting} ok={codeOk} invalid={!!error} />
          )}
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting} loadingLabel="Verifying">Continue</SubmitButton>
        </form>
      )}

      {step === "unsupported" && (
        <div className="card" key="unsupported">
          <SentTo label="Signing in as" value={email || "another account"} onEdit={goBackToIdentifier} disabled={isSubmitting} />
          <p className="note">{handoffReason || "This account requires an additional Clerk-managed step."}</p>
          <Link href={fallbackHref} className="btn">Continue with the standard sign-in</Link>
        </div>
      )}

    </>
  )
}

function StableClerkSignIn({ redirectUrl }: { redirectUrl: string }) {
  return (
    <>
      <AuthHead title="Sign in to Mountline" sub="One account for your project portal and dashboard." />
      <div className="card clerk-card">
        <SignIn
          path="/id"
          routing="path"
          forceRedirectUrl={redirectUrl}
          fallbackRedirectUrl={redirectUrl}
          withSignUp={false}
          signUpUrl={undefined}
          appearance={{
            variables: {
              borderRadius: "10px",
              colorBackground: "#FFFFFF",
              colorDanger: "#C2362B",
              colorPrimary: "#141518",
              colorForeground: "#141518",
              colorMutedForeground: "#575B63",
              colorInput: "#FFFFFF",
              colorInputForeground: "#141518",
              colorNeutral: "#141518",
              fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
              fontSize: "15px",
            },
            elements: {
              rootBox: "clerk-root",
              cardBox: "clerk-cardbox",
              card: "clerk-inner",
              header: "clerk-header",
              formFieldLabel: "clerk-label",
              formFieldInput: "clerk-input",
              formButtonPrimary: "clerk-button",
              socialButtonsBlockButton: "clerk-social",
              footer: "clerk-footer",
              footerAction: "clerk-hidden",
              identityPreview: "clerk-identity",
              alert: "clerk-alert",
              dividerLine: "clerk-divider",
            },
          }}
        />
      </div>
    </>
  )
}

function AuthFooter() {
  return (
    <footer className="quiet">
      <nav aria-label="Help">
        <a className="hit" href="mailto:hello@mountline.dev?subject=Mountline%20ID%20support">Support</a>
        <span aria-hidden="true">·</span>
        <a className="hit" href="mailto:hello@mountline.dev?subject=Privacy%20request">Privacy</a>
        <span aria-hidden="true">·</span>
        <span>© {new Date().getFullYear()} Mountline</span>
      </nav>
    </footer>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.8" y="3.2" width="12.4" height="9.6" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="m2.5 4.5 5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function SentTo({ label, value, onEdit, disabled }: { label: string; value: string; onEdit: () => void; disabled: boolean }) {
  return (
    <div className="sent">
      <span>{label} <b>{value}</b></span>
      <button className="linkish hit" type="button" onClick={onEdit} disabled={disabled}>Edit</button>
    </div>
  )
}

/**
 * Six boxes for a 6-digit code (choreography.md §6): typing advances, backspace in an empty box goes
 * back, pasting (or the phone's one-time-code autofill) fills every box. The first box is focused
 * only on devices with a mouse, so a phone keyboard doesn't jump up uninvited.
 */
function CodeBoxes({
  value,
  onChange,
  disabled,
  ok,
  invalid,
}: {
  value: string
  onChange: (code: string) => void
  disabled: boolean
  ok: boolean
  invalid: boolean
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "")

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) boxes.current[0]?.focus()
  }, [])

  const fill = (from: number, text: string) => {
    const incoming = text.replace(/\D/g, "")
    if (!incoming) return
    const next = digits.slice()
    for (let index = 0; index < incoming.length && from + index < 6; index++) next[from + index] = incoming[index]
    onChange(next.join(""))
    boxes.current[Math.min(from + incoming.length, 5)]?.focus()
  }

  const onInput = (index: number, raw: string) => {
    if (raw.replace(/\D/g, "").length > 1) return fill(index, raw)
    const digit = raw.replace(/\D/g, "").slice(-1)
    const next = digits.slice()
    next[index] = digit
    onChange(next.join(""))
    if (digit && index < 5) boxes.current[index + 1]?.focus()
  }

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) boxes.current[index - 1]?.focus()
  }

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text")
    if (!text.replace(/\D/g, "")) return
    event.preventDefault()
    fill(index, text)
  }

  return (
    <div className={ok ? "code ok" : invalid ? "code bad" : "code"} role="group" aria-label="6-digit code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            boxes.current[index] = el
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={index === 0 ? 6 : 1}
          aria-label={`Digit ${index + 1}`}
          value={digit}
          disabled={disabled}
          onChange={(event) => onInput(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
        />
      ))}
    </div>
  )
}

function OauthButtons({
  factors,
  disabled,
  onSelect,
}: {
  factors: OauthFactor[]
  disabled: boolean
  onSelect: (strategy: OauthFactor["strategy"]) => void
}) {
  if (!factors.length) return null
  return (
    <div className="oauth">
      {factors.map((factor) => (
        <button key={factor.strategy} type="button" className="btn light" disabled={disabled} onClick={() => onSelect(factor.strategy)}>
          Continue with {oauthLabels[factor.strategy] || factor.strategy.replace("oauth_", "")}
        </button>
      ))}
    </div>
  )
}

function SubmitButton({ children, loading, loadingLabel }: { children: string; loading: boolean; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading} className="btn">
      {loading ? (
        <>
          <span className="spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  )
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="err" id="mountline-id-error" role="alert">
      {message}
    </p>
  )
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function pickFirstFactor(factors: SignInFirstFactor[] | null) {
  if (!factors?.length) return null

  return (
    factors.find((factor) => factor.strategy === "password") ||
    factors.find((factor) => factor.strategy === "email_code") ||
    factors.find((factor) => factor.strategy === "phone_code") ||
    null
  )
}

function pickSecondFactor(factors: SignInSecondFactor[] | null) {
  if (!factors?.length) return null

  return (
    factors.find((factor) => factor.strategy === "totp") ||
    factors.find((factor) => factor.strategy === "email_code") ||
    factors.find((factor) => factor.strategy === "phone_code") ||
    factors.find((factor) => factor.strategy === "backup_code") ||
    null
  )
}

function isOauthFactor(factor: SignInFirstFactor): factor is OauthFactor {
  return factor.strategy.startsWith("oauth_")
}

function getClerkErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "errors" in error) {
    const errors = (error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors
    const message = errors?.[0]?.longMessage || errors?.[0]?.message
    if (message) return message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Unable to continue sign-in. Try again or use support."
}

function getFallbackHref(redirectUrl: string) {
  const params = new URLSearchParams({ mountline_id_fallback: "clerk" })
  const nestedRedirect = redirectUrl.match(/[?&]redirect_url=([^&]+)/)?.[1]

  if (nestedRedirect) {
    params.set("redirect_url", nestedRedirect)
  }

  return `/id?${params.toString()}`
}
