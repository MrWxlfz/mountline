"use client"

import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft, HelpCircle, LockKeyhole } from "lucide-react"
import { NorthlineLogo } from "@/components/northline-logo"

export function MountlineIdForm({ redirectUrl }: { redirectUrl: string }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-black" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(circle at 50% 38%, black 0%, transparent 74%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.09), transparent 34%), radial-gradient(circle at 50% 105%, rgba(255,255,255,0.05), transparent 28%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 82%)",
        }}
      />
      <div
        aria-hidden="true"
        className="motion-safe:animate-glow-pulse absolute left-[-20%] right-[-20%] top-[21%] hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.035] to-transparent"
      />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1fr_440px] lg:gap-16">
          <section className="motion-safe:animate-fade-up mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center border border-white/10 bg-white/[0.035] px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <NorthlineLogo size="md" showWordmark inverted className="text-white" />
              </div>
            </div>

            <p className="mt-9 text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
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

          <section className="mountline-id-auth motion-safe:animate-scale-in w-full max-w-[440px] justify-self-center lg:justify-self-end">
            <div className="relative overflow-hidden border border-white/12 bg-zinc-950/85 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.62)] backdrop-blur-2xl sm:p-6">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
              />
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-medium text-white">Mountline ID</p>
                  <p className="mt-1 text-xs text-zinc-500">Unified workspace access</p>
                </div>
                <div className="flex size-9 items-center justify-center border border-white/10 bg-white/[0.035]">
                  <LockKeyhole className="size-4 text-zinc-300" />
                </div>
              </div>

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
                    colorDanger: "#fb7185",
                    colorInputBackground: "rgba(9,9,11,0.62)",
                    colorInputText: "#fafafa",
                    colorPrimary: "#ffffff",
                    colorText: "#f5f5f5",
                    colorTextSecondary: "#a1a1aa",
                    fontFamily: "var(--font-sans), system-ui, sans-serif",
                  },
                  elements: {
                    rootBox: "w-full [&_*]:font-sans",
                    card: "!w-full !bg-transparent !p-0 !shadow-none",
                    headerTitle: "!text-[1.15rem] !font-semibold !tracking-tight !text-white",
                    headerSubtitle: "!text-sm !leading-6 !text-zinc-400",
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
          </section>
        </div>

        <footer className="flex flex-col gap-4 border-t border-white/10 pt-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors hover:text-white"
          >
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
      </main>
    </div>
  )
}
