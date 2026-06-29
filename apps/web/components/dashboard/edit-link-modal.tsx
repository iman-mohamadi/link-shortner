"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Link2, Loader2, Lock, Sparkles, Wand2 } from "lucide-react"
import { Surface } from "@/components/ui/surface"
import { Field } from "@/components/ui/field"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { Badge } from "@/components/ui/bits"
import { toast } from "@/components/ui/toaster"
import { linksApi } from "@/lib/api/links"
import type { Link as LinkModel, UpdateLinkInput } from "@/lib/api/types"

const URL_RE = /^https?:\/\/.+\..+/

/** ISO timestamp -> value for <input type="datetime-local"> (local time). */
function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function ProLock() {
  return (
    <Badge tone="iris">
      <Sparkles className="size-3" /> Pro
    </Badge>
  )
}

interface Props {
  link: LinkModel
  isPro: boolean
  onClose: () => void
  onSaved: (link: LinkModel) => void
}

export function EditLinkModal({ link, isPro, onClose, onSaved }: Props) {
  const [url, setUrl] = useState(link.originalUrl)
  const [slug, setSlug] = useState(link.slug)
  const [active, setActive] = useState(link.isActive)

  const hadPassword = Boolean(link.password)
  const [password, setPassword] = useState("")
  const [removePassword, setRemovePassword] = useState(false)

  const [expiry, setExpiry] = useState(toLocalInput(link.expiresAt))
  const hadExpiry = Boolean(link.expiresAt)

  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!URL_RE.test(url.trim())) {
      toast.error("Enter a valid http(s) URL")
      return
    }
    const payload: UpdateLinkInput = {}

    if (url.trim() !== link.originalUrl) payload.originalUrl = url.trim()
    if (active !== link.isActive) payload.isActive = active
    if (isPro && slug.trim() && slug.trim() !== link.slug) payload.slug = slug.trim()

    if (isPro) {
      if (removePassword && hadPassword) payload.password = null
      else if (password.trim()) payload.password = password.trim()

      const expiryIso = expiry ? new Date(expiry).toISOString() : ""
      if (expiryIso) {
        if (expiryIso !== link.expiresAt) payload.expiresAt = expiryIso
      } else if (hadExpiry) {
        payload.expiresAt = null
      }
    }

    if (Object.keys(payload).length === 0) {
      onClose()
      return
    }

    setSaving(true)
    try {
      const { data } = await linksApi.updateLink(link.id, payload)
      // Merge so fields the API doesn't echo back (favicon, clicks) are preserved.
      onSaved({ ...link, ...data })
      toast.success("Link updated")
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Could not update link")
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <Surface
        variant="chrome"
        glow
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative max-h-[88vh] w-full max-w-md overflow-y-auto p-7"
      >
        <h3 className="font-display text-xl font-semibold text-white">Edit link</h3>
        <p className="mt-1 text-sm text-[var(--text-mid)]">
          <span className="font-mono text-[var(--iris-cyan)]">/{link.slug}</span>
        </p>

        <div className="mt-6 space-y-5">
          <Field
            name="edit-url"
            type="url"
            label="Destination URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            icon={<Link2 className="size-5" />}
          />

          {/* Active toggle — free + pro */}
          <button
            type="button"
            onClick={() => setActive((a) => !a)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left"
          >
            <span>
              <span className="block text-sm text-white">Link active</span>
              <span className="block text-xs text-[var(--text-lo)]">
                {active ? "Redirects are enabled" : "Visitors will see a disabled message"}
              </span>
            </span>
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${active ? "bg-iris" : "bg-white/15"}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${active ? "left-[22px]" : "left-0.5"}`}
              />
            </span>
          </button>

          <div className="h-px bg-white/[0.06]" />
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-lo)]">Pro controls</p>

          <fieldset disabled={!isPro} className={!isPro ? "space-y-5 opacity-55" : "space-y-5"}>
            <Field
              name="edit-slug"
              label={<span className="flex items-center gap-2">Custom slug <ProLock /></span>}
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              icon={<Wand2 className="size-5" />}
            />

            <div>
              <Field
                name="edit-password"
                type="password"
                label={<span className="flex items-center gap-2">{hadPassword ? "Change password" : "Set password"} <ProLock /></span>}
                placeholder={hadPassword ? "••••••••" : "Add a passphrase"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (e.target.value) setRemovePassword(false)
                }}
                icon={<Lock className="size-5" />}
                disabled={removePassword}
              />
              {hadPassword && (
                <label className="mt-2 flex items-center gap-2 text-xs text-[var(--text-mid)]">
                  <input
                    type="checkbox"
                    checked={removePassword}
                    onChange={(e) => setRemovePassword(e.target.checked)}
                    className="size-3.5 accent-[var(--iris-azure)]"
                  />
                  Remove password protection
                </label>
              )}
            </div>

            <div>
              <Field
                name="edit-expiry"
                type="datetime-local"
                label={<span className="flex items-center gap-2">Expires <ProLock /></span>}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                icon={<Calendar className="size-5" />}
              />
              {expiry && (
                <button
                  type="button"
                  onClick={() => setExpiry("")}
                  className="mt-2 text-xs text-[var(--text-mid)] underline-offset-2 hover:underline"
                >
                  Clear expiry
                </button>
              )}
            </div>
          </fieldset>
        </div>

        <div className="mt-7 flex gap-3">
          <MagneticButton variant="outline" size="md" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </MagneticButton>
          <MagneticButton size="md" className="flex-1" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
          </MagneticButton>
        </div>
      </Surface>
    </motion.div>
  )
}
