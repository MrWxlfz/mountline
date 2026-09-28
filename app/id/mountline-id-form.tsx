"use client"

import { FormEvent, useMemo, useState } from "react"
import { SignIn } from "@clerk/nextjs"
import { useSignIn } from "@clerk/nextjs/legacy"
import type {
  OauthFactor,
  SignInFirstFactor,
  SignInResource,
  SignInSecondFactor,
} from "@clerk/nextjs/types"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  HelpCircle,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"
import { AppearanceSelector } from "@/components/dashboard/appearance-selector"

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

export function MountlineIdForm({ redirectUrl, useCustomFlow }: MountlineIdFormProps) {
  return (
    <div className="mountline-id relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="relative z-10 border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Mountline home" className="text-foreground transition-opacity hover:opacity-75">
            <Wordmark size={18} />
          </Link>
          <AppearanceSelector compact syncServer={false} />
        </div>
      </header>
      <main className="relative z-10 flex flex-1 items-center px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-[400px]">
          <AuthIntro />
          <section className="mt-9 rounded-lg border border-border bg-card p-5 shadow-[0_24px_60px_-24px_var(--shadow-color)] sm:p-6 motion-safe:animate-[fade-up_700ms_cubic-bezier(0.16,1,0.3,1)_120ms_both]">
            <AuthPanelHeader />
            {useCustomFlow ? (
              <CustomMountlineSignIn redirectUrl={redirectUrl} />
            ) : (
              <StableClerkSignIn redirectUrl={redirectUrl} />
            )}
          </section>
        </div>
      </main>
      <AuthFooter />
    </div>
  )
}

function AuthIntro() {
  return (
    <section className="text-center motion-safe:animate-[fade-up_700ms_cubic-bezier(0.16,1,0.3,1)_both]">
      <p className="ml-eyebrow">Mountline ID</p>
      <h1 className="font-display mt-4 text-balance text-[2.6rem] leading-[1.05] sm:text-5xl">Sign in to Mountline</h1>
      <p className="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-6 text-muted-foreground">
        One account for your team dashboard and client portal.
      </p>
    </section>
  )
}

function AuthPanelHeader() {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
      <p className="ml-eyebrow text-foreground">Continue with email</p>
      <LockKeyhole className="size-3.5 text-muted-foreground" aria-hidden="true" />
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
      setIsSubmitting(false)
    }
  }

  async function goBackToIdentifier() {
    setError("")
    setPassword("")
    setCode("")
    setSafeIdentifier("")
    setHandoffReason("")
    setStep("identifier")
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading Mountline ID
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {step === "identifier" && (
        <form onSubmit={handleIdentifierSubmit} className="space-y-4">
          <FieldLabel htmlFor="mountline-id-email">Email</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="mountline-id-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName("pl-10")}
              placeholder="name@example.com"
              disabled={isSubmitting}
            />
          </div>
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting}>Continue</SubmitButton>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <StepBackButton onClick={goBackToIdentifier} disabled={isSubmitting} label={email} />
          <FieldLabel htmlFor="mountline-id-password">Password</FieldLabel>
          <input
            id="mountline-id-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName()}
            disabled={isSubmitting}
          />
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting}>Sign in</SubmitButton>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <StepBackButton onClick={goBackToIdentifier} disabled={isSubmitting} label={email} />
          <p className="text-sm leading-6 text-muted-foreground">
            Enter the code sent to {safeIdentifier || email}.
          </p>
          <FieldLabel htmlFor="mountline-id-code">Verification code</FieldLabel>
          <input
            id="mountline-id-code"
            name="one-time-code"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={inputClassName("tracking-[0.28em]")}
            disabled={isSubmitting}
          />
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting}>Verify code</SubmitButton>
        </form>
      )}

      {step === "secondFactor" && (
        <form onSubmit={handleSecondFactorSubmit} className="space-y-4">
          <StepBackButton onClick={goBackToIdentifier} disabled={isSubmitting} label={email} />
          <p className="text-sm leading-6 text-muted-foreground">
            Enter the additional verification code
            {safeIdentifier ? ` sent to ${safeIdentifier}` : ""}.
          </p>
          <FieldLabel htmlFor="mountline-id-mfa-code">Security code</FieldLabel>
          <input
            id="mountline-id-mfa-code"
            name="one-time-code"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={inputClassName("tracking-[0.28em]")}
            disabled={isSubmitting}
          />
          <ErrorMessage message={error} />
          <SubmitButton loading={isSubmitting}>Continue</SubmitButton>
        </form>
      )}

      {step === "unsupported" && (
        <div className="space-y-4">
          <StepBackButton onClick={goBackToIdentifier} disabled={isSubmitting} label="Try another account" />
          <div className="rounded-md border border-border bg-surface-muted p-4">
            <p className="text-sm font-medium text-foreground">Use the stable sign-in flow</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {handoffReason || "This account requires an additional Clerk-managed step."}
            </p>
          </div>
          <Link href={fallbackHref} className={buttonClassName}>
            Continue with stable sign-in
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {oauthFactors.length > 0 && step === "identifier" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="ml-eyebrow">Or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2">
            {oauthFactors.map((factor) => (
              <button
                key={factor.strategy}
                type="button"
                onClick={() => handleOauth(factor.strategy)}
                disabled={isSubmitting}
                className="ml-pill ml-pill-line w-full min-h-11"
              >
                {oauthLabels[factor.strategy] || factor.strategy.replace("oauth_", "")}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Mountline ID uses the sign-in methods configured for this workspace.
        <Link href={fallbackHref} className="ml-1 text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground">
          Use another sign-in method.
        </Link>
      </p>
    </div>
  )
}

function StableClerkSignIn({ redirectUrl }: { redirectUrl: string }) {
  return (
    <div className="mountline-id-auth">
      <SignIn
        path="/id"
        routing="path"
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
        withSignUp={false}
        signUpUrl={undefined}
        appearance={{
          variables: {
            borderRadius: "8px",
            colorBackground: "transparent",
            colorDanger: "var(--error)",
            colorPrimary: "var(--foreground)",
            fontFamily: "var(--font-sans), system-ui, sans-serif",
          },
          elements: {
            rootBox: "w-full [&_*]:font-sans",
            card: "!w-full !bg-transparent !p-0 !shadow-none",
            headerTitle: "!hidden",
            headerSubtitle: "!hidden",
            socialButtonsBlockButton:
              "!h-11 !rounded-full !border !border-border-strong !bg-transparent !text-foreground !shadow-none transition-colors hover:!bg-hover",
            socialButtonsBlockButtonText: "!text-sm !font-medium !text-foreground",
            formFieldLabel:
              "!mb-2 !font-mono !text-[11px] !font-normal !uppercase !tracking-[0.08em] !text-muted-foreground",
            formFieldInput:
              "!h-11 !rounded-lg !border !border-input !bg-input-background !px-3.5 !text-base !text-foreground !shadow-none placeholder:!text-muted-foreground hover:!border-border-strong focus:!border-muted-foreground focus:!ring-[3px] focus:!ring-[rgb(228_168_83/0.2)]",
            formFieldInputGroup:
              "!h-11 !rounded-lg !border !border-input !bg-input-background",
            formButtonPrimary:
              "!h-11 !rounded-full !bg-foreground !font-mono !text-[11px] !font-medium !uppercase !tracking-[0.08em] !text-background !shadow-none transition-opacity hover:!opacity-90",
            footerAction: "!hidden",
            footerActionLink: "!font-medium !text-foreground",
            identityPreview:
              "!rounded-lg !border !border-border !bg-surface-muted !text-foreground",
            alert:
              "!rounded-lg !border !border-error-border !bg-error-soft !text-error-foreground",
            dividerLine: "!bg-border",
            dividerText: "!font-mono !text-[11px] !uppercase !tracking-[0.08em] !text-muted-foreground",
          },
        }}
      />
    </div>
  )
}

function AuthFooter() {
  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Back to mountline.dev
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href="mailto:hello@mountline.dev?subject=Privacy%20request" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a
            href="mailto:hello@mountline.dev?subject=Mountline%20ID%20support"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <HelpCircle className="size-3.5" />
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}

function FieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="ml-eyebrow block">
      {children}
    </label>
  )
}

function SubmitButton({
  children,
  loading,
}: {
  children: string
  loading: boolean
}) {
  return (
    <button type="submit" disabled={loading} className={buttonClassName}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

function StepBackButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-9 max-w-full items-center gap-1.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-55"
    >
      <ChevronLeft className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null

  return (
    <div role="alert" className="rounded-lg border border-error-border bg-error-soft px-3.5 py-2.5 text-sm leading-5 text-error-foreground">
      {message}
    </div>
  )
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

function inputClassName(extra = "") {
  return `ml-field-input disabled:cursor-not-allowed disabled:opacity-55 ${extra}`
}

const buttonClassName = "ml-pill ml-pill-solid w-full min-h-11"

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
