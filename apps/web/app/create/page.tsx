"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  Check,
  Link2,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react"
import { AppNav } from "@/components/layout/app-nav"
import { Surface } from "@/components/ui/surface"
import { Field } from "@/components/ui/field"
import { MagneticButton, MagneticLink } from "@/components/ui/magnetic-button"
import { Eyebrow } from "@/components/ui/kinetic-text"
import { Badge, CopyButton } from "@/components/ui/bits"
import { toast } from "@/components/ui/toaster"
import { useRequireAuth } from "@/lib/hooks/use-auth"
import { linksApi } from "@/lib/api/links"
import type { CreateLinkResponse } from "@/lib/api/types"
import { qrSrc, shortDisplay } from "@/lib/format"
import { ease, reveal } from "@/lib/motion"

const URL_RE = /^https?:\/\/.+\..+/

function ProLock() {
  return (
    <Badge tone="iris">
      <Sparkles className="size-3" /> Pro
    </Badge>
  )
}

function CreateExperience() {
  const params = useSearchParams()
  const { ready, user } = useRequireAuth()
  const isPro = Boolean(user?.isPro)

  const [url, setUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [password, setPassword] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<CreateLinkResponse | null>(null)

  useEffect(() => {
    const initial = params.get("url")
    if (initial) setUrl(initial)
  }, [params])

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[var(--iris-azure)]" />
      </div>
    )
  }

  const valid = URL_RE.test(url.trim())

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) {
      toast.error("Enter a valid http(s) URL")
      return
    }
    setLoading(true)
    try {
      const payload: any = { original_url: url.trim() }
      if (isPro) {
        if (alias.trim()) payload.custom_alias = alias.trim()
        if (password) payload.password = password
        if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString()
      }
      const res = await linksApi.createLink(payload)
      setCreated(res)
      toast.success("Link forged")
    } catch (err: any) {
      toast.error(err.message || "Could not create link")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setCreated(null)
    setUrl("")
    setAlias("")
    setPassword("")
    setExpiresAt("")
  }

  return (
    <>
      <AppNav />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-12">
        <motion.div variants={reveal} initial="hidden" animate="show" className="mb-10">
          <Eyebrow className="mb-4">
            <Wand2 className="size-3 text-[var(--iris-cyan)]" /> The forge
          </Eyebrow>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            Forge a new link.
          </h1>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ---- Form ---- */}
          <Surface variant="chrome" className="p-7 sm:p-9">
            <AnimatePresence mode="wait">
              {!created ? (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Field
                    name="url"
                    type="url"
                    label="Destination URL"
                    placeholder="https://example.com/a/very/long/path"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    icon={<Link2 className="size-5" />}
                    autoFocus
                  />

                  <div className="h-px bg-white/[0.06]" />

                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-lo)]">
                      Pro controls
                    </p>
                    {!isPro && (
                      <span className="text-xs text-[var(--text-lo)]">Upgrade to unlock</span>
                    )}
                  </div>

                  <fieldset disabled={!isPro} className={!isPro ? "opacity-55" : undefined}>
                    <div className="space-y-5">
                      <Field
                        name="alias"
                        label={<span className="flex items-center gap-2">Custom slug <ProLock /></span>}
                        placeholder="my-launch"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        icon={<Wand2 className="size-5" />}
                        hint={isPro ? "lowercase, numbers and hyphens" : undefined}
                      />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          name="password"
                          type="password"
                          label={<span className="flex items-center gap-2">Password <ProLock /></span>}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          icon={<Lock className="size-5" />}
                        />
                        <Field
                          name="expires"
                          type="datetime-local"
                          label={<span className="flex items-center gap-2">Expires <ProLock /></span>}
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          icon={<Calendar className="size-5" />}
                        />
                      </div>
                    </div>
                  </fieldset>

                  {!isPro && (
                    <div className="iris-border rounded-2xl bg-[var(--ink-800)] p-4 text-sm text-[var(--text-mid)]">
                      <span className="text-white">Custom slugs, passwords and expiry</span> are Pro
                      features.{" "}
                      <Link href="/pricing" className="text-[var(--iris-cyan)] underline-offset-2 hover:underline">
                        Upgrade to Pro
                      </Link>{" "}
                      for unlimited links and full control.
                    </div>
                  )}

                  <MagneticButton type="submit" size="lg" className="w-full" disabled={loading || !valid}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <>Forge link <ArrowRight className="size-4" /></>}
                  </MagneticButton>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: ease.out }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                    className="flex size-16 items-center justify-center rounded-2xl bg-iris glow-iris"
                  >
                    <Check className="size-8 text-[#06070c]" />
                  </motion.div>
                  <h2 className="mt-6 font-display text-2xl font-semibold text-white">Your link is live</h2>
                  <p className="mt-1 text-sm text-[var(--text-mid)]">Share it anywhere — analytics start now.</p>

                  <div className="mt-7 w-full">
                    <div className="iris-border flex items-center justify-between gap-3 rounded-2xl bg-[var(--ink-800)] px-4 py-3">
                      <span className="truncate font-mono text-sm text-[var(--iris-cyan)]">
                        {created.shortUrl}
                      </span>
                      <CopyButton value={created.shortUrl} />
                    </div>
                  </div>

                  <div className="mt-6 flex w-full gap-3">
                    <MagneticButton variant="outline" size="md" className="flex-1" onClick={reset}>
                      <RotateCcw className="size-4" /> New link
                    </MagneticButton>
                    <MagneticLink href="/dashboard" size="md" className="flex-1">
                      Dashboard <ArrowRight className="size-4" />
                    </MagneticLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Surface>

          {/* ---- Live preview ---- */}
          <Surface variant="glass" className="relative flex flex-col items-center justify-center overflow-hidden p-7 sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-iris opacity-20 blur-3xl" />
            <span className="relative mb-6 text-xs uppercase tracking-[0.2em] text-[var(--text-lo)]">
              {created ? "Scan to open" : "Preview"}
            </span>

            <AnimatePresence mode="wait">
              {created && qrSrc(created.qrCode) ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  className="relative rounded-3xl bg-white p-4 glow-soft"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrSrc(created.qrCode)!} alt="QR code" className="size-48 rounded-xl" />
                </motion.div>
              ) : (
                <motion.div
                  key="mock"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex w-full flex-col items-center"
                >
                  <div className="animate-float relative grid size-44 place-items-center rounded-3xl glass refract">
                    <Link2 className="size-12 text-[var(--text-lo)]" />
                  </div>
                  <div className="mt-7 w-full rounded-2xl glass px-4 py-3 text-center">
                    <span className="font-mono text-sm text-[var(--text-mid)]">
                      {valid ? shortDisplay(alias.trim() || "••••••") : "lumen.link/••••••"}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[16rem] text-center text-xs text-[var(--text-lo)]">
                    {valid ? "Looks good — forge it to generate your QR." : "Enter a destination to begin."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Surface>
        </div>
      </main>
    </>
  )
}

export default function CreateLinkPage() {
  return (
    <Suspense fallback={null}>
      <CreateExperience />
    </Suspense>
  )
}
