"use client"

import { Suspense, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, ArrowLeft, Loader2, ShieldCheck, Smartphone } from "lucide-react"
import { LiquidBackground } from "@/components/three/liquid-background"
import { Logo } from "@/components/layout/logo"
import { Surface } from "@/components/ui/surface"
import { Field } from "@/components/ui/field"
import { OtpInput } from "@/components/ui/otp-input"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { Eyebrow } from "@/components/ui/kinetic-text"
import { toast } from "@/components/ui/toaster"
import { authApi } from "@/lib/api/auth"
import { ease } from "@/lib/motion"

const PHONE_RE = /^09\d{9}$/

function AuthExperience() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/dashboard"

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const startTimer = () => setCountdown(60)

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!PHONE_RE.test(phone)) return
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.sendOtp({ phone })
      setStep("otp")
      startTimer()
      // The API returns the code in development to ease demoing.
      if (res?.code) toast.info(`Dev code: ${res.code}`)
      else toast.success("Code sent")
    } catch (err: any) {
      setError(err.message || "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  const verify = async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      await authApi.verifyOtp({ phone, code })
      toast.success("Welcome to Lumen")
      router.push(next)
    } catch (err: any) {
      setError(err.message || "Invalid code")
      setOtp("")
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (countdown > 0) return
    await sendOtp()
  }

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-10">
      <LiquidBackground intensity={0.7} />

      <div className="absolute left-4 top-6 sm:left-8">
        <Logo />
      </div>

      <Surface
        variant="chrome"
        glow
        initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: ease.out }}
        className="w-full max-w-md p-8 sm:p-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          {step === "phone" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: ease.out }}
            >
              <Eyebrow className="mb-6">
                <Smartphone className="size-3 text-[var(--iris-cyan)]" /> Secure sign-in
              </Eyebrow>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
                Enter the light.
              </h1>
              <p className="mt-2 text-sm text-[var(--text-mid)]">
                We&apos;ll text a one-time code to your phone. No passwords, ever.
              </p>

              <form onSubmit={sendOtp} className="mt-8 space-y-5">
                <Field
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  label="Phone number"
                  placeholder="09XXXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                    setError(null)
                  }}
                  icon={<Smartphone className="size-5" />}
                  error={error ?? undefined}
                />
                <MagneticButton
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading || !PHONE_RE.test(phone)}
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <>Send code <ArrowRight className="size-4" /></>}
                </MagneticButton>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: ease.out }}
            >
              <Eyebrow className="mb-6">
                <ShieldCheck className="size-3 text-[var(--iris-cyan)]" /> Verify
              </Eyebrow>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
                Enter your code.
              </h1>
              <p className="mt-2 text-sm text-[var(--text-mid)]">
                Sent to <span className="text-white">{phone}</span>
              </p>

              <div className="mt-8">
                <OtpInput
                  value={otp}
                  onChange={(v) => {
                    setOtp(v)
                    setError(null)
                  }}
                  onComplete={verify}
                  disabled={loading}
                  error={Boolean(error)}
                />
                {error && <p className="mt-3 text-center text-xs text-[var(--iris-magenta)]">{error}</p>}
              </div>

              <div className="mt-8 space-y-3">
                <MagneticButton
                  size="lg"
                  className="w-full"
                  disabled={loading || otp.length !== 6}
                  onClick={() => verify(otp)}
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <>Verify <ArrowRight className="size-4" /></>}
                </MagneticButton>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone")
                      setOtp("")
                      setError(null)
                    }}
                    className="inline-flex items-center gap-1 text-[var(--text-lo)] transition-colors hover:text-white"
                  >
                    <ArrowLeft className="size-3.5" /> Change number
                  </button>
                  <button
                    type="button"
                    onClick={resend}
                    disabled={countdown > 0 || loading}
                    className="text-[var(--text-mid)] transition-colors hover:text-white disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Surface>

      <p className="relative mt-8 max-w-xs text-center text-xs text-[var(--text-lo)]">
        By continuing you agree to bend a little light. Protected by one-time codes.
      </p>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthExperience />
    </Suspense>
  )
}
