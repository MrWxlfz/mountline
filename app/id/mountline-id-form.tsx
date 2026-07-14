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
import { MountlineLogo } from "@/components/mountline-logo"
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
    <div className="mountline-id relative min-h-dvh overflow-hidden bg-black text-white">
      <AuthBackground />
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8">
          <AppearanceSelector compact syncServer={false} />
        </div>
        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16">
          <AuthIntro />
          <section className="motion-safe:animate-scale-in w-full max-w-[440px] justify-self-center lg:justify-self-end">
            <div className="relative overflow-hidden rounded-lg border border-white/12 bg-zinc-950/88 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.62)] backdrop-blur-2xl sm:p-6">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
              />
              <AuthPanelHeader />
              {useCustomFlow ? (
                <CustomMountlineSignIn redirectUrl={redirectUrl} />
              ) : (
                <StableClerkSignIn redirectUrl={redirectUrl} />
              )}
            </div>
          </section>
        </div>
        <AuthFooter />
      </main>
    </div>
  )
}

function AuthBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-background" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.17]"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(circle at 52% 38%, black 0%, transparent 72%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 72% 18%, rgba(255,255,255,0.075), transparent 30%), radial-gradient(circle at 16% 82%, rgba(255,255,255,0.055), transparent 28%), linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.84) 86%)",
        }}
      />
      <div
        aria-hidden="true"
        className="auth-vignette pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_48%,rgba(0,0,0,0.72)_100%)]"
      />
      <div
        aria-hidden="true"
        className="motion-safe:animate-glow-pulse absolute left-[-20%] right-[-20%] top-[22%] hidden h-px bg-gradient-to-r from-transparent via-white/16 to-transparent lg:block"
      />
    </>
  )
}

function AuthIntro() {
  return (
    <section className="motion-safe:animate-fade-up mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
      <div className="flex justify-center lg:justify-start">
        <MountlineLogo
          size="lg"
          showWordmark
          className="text-foreground"
        />
      </div>

      <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
        MOUNTLINE ID
      </p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.45rem] lg:leading-[0.98]">
        One account. Every Mountline workspace.
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-7 text-zinc-400 sm:text-lg lg:mx-0">
        Sign in to continue to your team dashboard or client portal.
      </p>

      <div className="mx-auto mt-9 h-px max-w-md bg-gradient-to-r from-transparent via-white/18 to-transparent lg:mx-0 lg:bg-gradient-to-r lg:from-white/24 lg:via-white/8 lg:to-transparent" />

      <p className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-500">
        <LockKeyhole className="size-4 text-zinc-400" />
        Secure access powered by Clerk.
      </p>
    </section>
  )
}

function AuthPanelHeader() {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <p className="text-sm font-medium text-white">Mountline ID</p>
        <p className="mt-1 text-xs text-zinc-500">Unified workspace access</p>
      </div>
      <div className="flex size-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.035]">
        <LockKeyhole className="size-4 text-zinc-300" />
      </div>
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
      <div className="flex min-h-[268px] items-center justify-center text-sm text-zinc-500">
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
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
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
          <p className="text-sm leading-6 text-zinc-400">
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
          <p className="text-sm leading-6 text-zinc-400">
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
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
            <p className="text-sm font-medium text-white">Use the stable sign-in flow</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
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
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid gap-2">
            {oauthFactors.map((factor) => (
              <button
                key={factor.strategy}
                type="button"
                onClick={() => handleOauth(factor.strategy)}
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.035] px-4 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.065] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {oauthLabels[factor.strategy] || factor.strategy.replace("oauth_", "")}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs leading-5 text-zinc-600">
        Mountline ID uses the authentication methods configured for this workspace.
        <Link href={fallbackHref} className="ml-1 text-zinc-400 underline-offset-4 hover:text-white hover:underline">
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
              "!h-11 !rounded-md !border !border-white/10 !bg-white/[0.035] !text-white !shadow-none transition-all hover:!border-white/20 hover:!bg-white/[0.065] focus:!ring-2 focus:!ring-white/20",
            socialButtonsBlockButtonText: "!text-sm !font-medium !text-zinc-100",
            formFieldLabel:
              "!mb-2 !text-xs !font-medium !uppercase !tracking-[0.14em] !text-zinc-400",
            formFieldInput:
              "!h-11 !rounded-md !border !border-white/10 !bg-black/35 !px-3 !text-base !text-white !shadow-none placeholder:!text-zinc-600 hover:!border-white/18 focus:!border-white/35 focus:!ring-2 focus:!ring-white/10",
            formFieldInputGroup:
              "!h-11 !rounded-md !border !border-white/10 !bg-black/35",
            formButtonPrimary:
              "!h-11 !rounded-md !bg-white !text-sm !font-semibold !text-black !shadow-none transition-all hover:!-translate-y-0.5 hover:!bg-zinc-200 focus:!ring-2 focus:!ring-white/30 active:!translate-y-0",
            footerAction: "!hidden",
            footerActionLink: "!font-medium !text-white hover:!text-zinc-200",
            identityPreview:
              "!rounded-md !border !border-white/10 !bg-white/[0.035] !text-white",
            alert:
              "!rounded-md !border !border-red-400/25 !bg-red-500/10 !text-red-100",
            dividerLine: "!bg-white/10",
            dividerText: "!text-xs !font-medium !text-zinc-500",
          },
        }}
      />
    </div>
  )
}

function AuthFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-white/10 pt-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-white">
        <ArrowLeft className="size-3.5" />
        Back to Mountline Studio
      </Link>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href="mailto:hello@mountline.dev?subject=Privacy%20request"
          className="transition-colors hover:text-white"
        >
          Privacy
        </a>
        <a
          href="mailto:hello@mountline.dev?subject=Mountline%20ID%20support"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
        >
          <HelpCircle className="size-3.5" />
          Support
        </a>
      </div>
    </footer>
  )
}

function FieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium uppercase tracking-[0.14em] text-zinc-400"
    >
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
      className="inline-flex min-h-9 max-w-full items-center gap-2 text-left text-sm text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
    >
      <ChevronLeft className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null

  return (
    <div role="alert" className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
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
  return `min-h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-base text-white shadow-none transition placeholder:text-zinc-600 hover:border-white/18 focus:border-white/35 focus:outline-none focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-55 ${extra}`
}

const buttonClassName =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"

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
