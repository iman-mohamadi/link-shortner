"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { format } from "date-fns"
import {
  BarChart2,
  Calendar,
  Download,
  ExternalLink,
  Link2,
  Lock,
  MousePointerClick,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { AppNav } from "@/components/layout/app-nav"
import { Surface } from "@/components/ui/surface"
import { Field } from "@/components/ui/field"
import { MagneticButton, MagneticLink } from "@/components/ui/magnetic-button"
import { Badge, CopyButton, Skeleton, StatTile } from "@/components/ui/bits"
import { Eyebrow } from "@/components/ui/kinetic-text"
import { toast } from "@/components/ui/toaster"
import { EditLinkModal } from "@/components/dashboard/edit-link-modal"
import { useRequireAuth } from "@/lib/hooks/use-auth"
import { linksApi } from "@/lib/api/links"
import type { Link as LinkModel } from "@/lib/api/types"
import { prettyUrl, qrSrc, shortDisplay, shortUrl } from "@/lib/format"
import { reveal, viewport } from "@/lib/motion"

export default function DashboardPage() {
  const { ready, user } = useRequireAuth()
  const isPro = Boolean(user?.isPro)
  const [links, setLinks] = useState<LinkModel[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [pendingDelete, setPendingDelete] = useState<LinkModel | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState<LinkModel | null>(null)
  const [qrTarget, setQrTarget] = useState<LinkModel | null>(null)

  useEffect(() => {
    if (!ready) return
    let active = true
    setLoading(true)
    linksApi
      .getMyLinks()
      .then((data) => active && setLinks(data))
      .catch((err) => active && toast.error(err.message || "Failed to load links"))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [ready])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return links
    return links.filter(
      (l) =>
        l.originalUrl.toLowerCase().includes(q) ||
        l.slug.toLowerCase().includes(q) ||
        (l.title?.toLowerCase().includes(q) ?? false)
    )
  }, [links, query])

  const totalClicks = useMemo(() => links.reduce((sum, l) => sum + (l.clicks || 0), 0), [links])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await linksApi.deleteLink(pendingDelete.id)
      setLinks((prev) => prev.filter((l) => l.id !== pendingDelete.id))
      toast.success("Link deleted")
      setPendingDelete(null)
    } catch (err: any) {
      toast.error(err.message || "Could not delete")
    } finally {
      setDeleting(false)
    }
  }

  const toggleActive = async (link: LinkModel) => {
    const next = !link.isActive
    // Optimistic update — revert if the request fails.
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: next } : l)))
    try {
      await linksApi.updateLink(link.id, { isActive: next })
      toast.success(next ? "Link enabled" : "Link paused")
    } catch (err: any) {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: link.isActive } : l)))
      toast.error(err.message || "Could not update link")
    }
  }

  const onSaved = (updated: LinkModel) => {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
  }

  if (!ready) return null

  return (
    <>
      <AppNav />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-12">
        {/* Header */}
        <motion.div variants={reveal} initial="hidden" animate="show" className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow className="mb-4">Welcome back</Eyebrow>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
              Your links
            </h1>
            <p className="mt-2 text-sm text-[var(--text-mid)]">
              {user?.phone}
              {user?.isPro && <Badge tone="pro" className="ml-3">PRO</Badge>}
            </p>
          </div>
          <MagneticLink href="/create" size="md">
            <Plus className="size-4" /> New link
          </MagneticLink>
        </motion.div>

        {/* Summary */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatTile value={links.length} label="Links" icon={<Link2 className="size-4" />} />
          <StatTile value={totalClicks.toLocaleString()} label="Total clicks" icon={<MousePointerClick className="size-4" />} />
          <StatTile
            value={user?.isPro ? "Pro" : "Free"}
            label="Plan"
            icon={<BarChart2 className="size-4" />}
          />
        </div>

        {/* Search */}
        <div className="mt-10 max-w-md">
          <Field
            name="search"
            placeholder="Search by title, slug or URL…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="size-5" />}
          />
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasLinks={links.length > 0} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((link, i) => (
                  <motion.div
                    key={link.id}
                    layout
                    variants={reveal}
                    initial="hidden"
                    whileInView="show"
                    viewport={viewport}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: (i % 3) * 0.04 }}
                  >
                    <LinkCard
                      link={link}
                      onDelete={() => setPendingDelete(link)}
                      onEdit={() => setEditing(link)}
                      onToggleActive={() => toggleActive(link)}
                      onShowQR={() => setQrTarget(link)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <EditLinkModal
            link={editing}
            isPro={isPro}
            onClose={() => setEditing(null)}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>

      {/* QR modal */}
      <AnimatePresence>
        {qrTarget && (
          <QRModal link={qrTarget} onClose={() => setQrTarget(null)} />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setPendingDelete(null)} />
            <Surface
              variant="chrome"
              glow
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-sm p-7 text-center"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--iris-magenta)]/15 text-[var(--iris-magenta)]">
                <Trash2 className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">Delete this link?</h3>
              <p className="mt-2 text-sm text-[var(--text-mid)]">
                <span className="font-mono text-[var(--iris-cyan)]">/{pendingDelete.slug}</span> and all of
                its analytics will be permanently removed.
              </p>
              <div className="mt-6 flex gap-3">
                <MagneticButton variant="outline" size="md" className="flex-1" onClick={() => setPendingDelete(null)} disabled={deleting}>
                  Cancel
                </MagneticButton>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 rounded-full bg-[var(--iris-magenta)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </Surface>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function LinkCard({
  link,
  onDelete,
  onEdit,
  onToggleActive,
  onShowQR,
}: {
  link: LinkModel
  onDelete: () => void
  onEdit: () => void
  onToggleActive: () => void
  onShowQR: () => void
}) {
  const url = shortUrl(link.slug)
  return (
    <Surface
      variant="glass"
      className={`group flex h-full flex-col p-5 transition-opacity ${link.isActive ? "" : "opacity-60"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={url}
          target="_blank"
          className="flex min-w-0 items-center gap-2 font-mono text-sm text-[var(--iris-cyan)] transition-colors hover:text-white"
        >
          <LinkFavicon favicon={link.favicon} />
          <span className="truncate">{shortDisplay(link.slug)}</span>
          <ExternalLink className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          {!link.isActive && <Badge tone="danger">paused</Badge>}
          {link.customSlug && <Badge tone="iris">custom</Badge>}
          {link.password && (
            <span className="text-[var(--text-lo)]" title="Password protected">
              <Lock className="size-3.5" />
            </span>
          )}
        </div>
      </div>

      {link.title && (
        <p className="mt-3 truncate text-sm font-medium text-white" title={link.title}>
          {link.title}
        </p>
      )}
      <p
        className={`line-clamp-2 text-sm text-[var(--text-mid)] ${link.title ? "mt-1" : "mt-3"}`}
        title={link.originalUrl}
      >
        {prettyUrl(link.originalUrl, 80)}
      </p>

      <div className="mt-auto flex items-center justify-between pt-5">
        <div className="flex items-center gap-4 text-xs text-[var(--text-lo)]">
          <span className="flex items-center gap-1.5 text-[var(--text-mid)]">
            <MousePointerClick className="size-3.5" />
            <span className="font-semibold text-white">{link.clicks ?? 0}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {format(new Date(link.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <ActiveToggle active={link.isActive} onToggle={onToggleActive} />
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
        <CopyButton value={url} className="flex-1 justify-center" />
        <button
          type="button"
          onClick={onShowQR}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--text-mid)] transition-colors hover:border-white/25 hover:text-white"
          aria-label="Show QR code"
          title="QR code"
        >
          <QrCode className="size-4" />
        </button>
        <Link
          href={`/analytics/${link.id}`}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--text-mid)] transition-colors hover:border-white/25 hover:text-white"
          aria-label="View analytics"
        >
          <BarChart2 className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--text-mid)] transition-colors hover:border-white/25 hover:text-white"
          aria-label="Edit link"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--text-mid)] transition-colors hover:border-[var(--iris-magenta)]/40 hover:text-[var(--iris-magenta)]"
          aria-label="Delete link"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </Surface>
  )
}

/* ─── QR Modal — lazy-fetches the QR on open ─────────────────────────────── */
function QRModal({ link, onClose }: { link: LinkModel; onClose: () => void }) {
  const [qr, setQr] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(true)
  const [errorQr, setErrorQr] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoadingQr(true)
    setErrorQr(null)
    linksApi
      .getLinkQR(link.id)
      .then((data) => { if (active) setQr(data) })
      .catch((err) => { if (active) setErrorQr(err.message || "Could not load QR") })
      .finally(() => { if (active) setLoadingQr(false) })
    return () => { active = false }
  }, [link.id])

  const src = qrSrc(qr)
  const filename = `lumen-${link.slug}.png`

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Surface
        variant="chrome"
        glow
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative w-full max-w-xs p-7 text-center"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full text-[var(--text-lo)] transition-colors hover:text-white"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <p className="mb-1 font-mono text-sm text-[var(--iris-cyan)]">/{link.slug}</p>
        <p className="mb-5 text-xs text-[var(--text-lo)]">Scan to open · share anywhere</p>

        {/* QR area */}
        <div className="mx-auto flex size-48 items-center justify-center rounded-2xl bg-white">
          {loadingQr ? (
            <div className="size-6 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
          ) : errorQr ? (
            <p className="px-4 text-center text-xs text-red-500">{errorQr}</p>
          ) : src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={`QR code for ${link.slug}`} className="size-44 rounded-xl" />
          ) : null}
        </div>

        {/* Download */}
        {src && (
          <a
            href={src}
            download={filename}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm text-[var(--text-mid)] transition-colors hover:border-white/25 hover:text-white"
          >
            <Download className="size-3.5" /> Download PNG
          </a>
        )}
      </Surface>
    </motion.div>
  )
}

function LinkFavicon({ favicon }: { favicon: string | null }) {
  const [failed, setFailed] = useState(false)
  if (!favicon || failed) {
    return <Link2 className="size-4 shrink-0 text-[var(--text-lo)]" />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={favicon}
      alt=""
      className="size-4 shrink-0 rounded-sm"
      onError={() => setFailed(true)}
    />
  )
}

function ActiveToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={active}
      aria-label={active ? "Pause link" : "Enable link"}
      title={active ? "Pause link" : "Enable link"}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${active ? "bg-iris" : "bg-white/15"}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${active ? "left-[18px]" : "left-0.5"}`}
      />
    </button>
  )
}

function EmptyState({ hasLinks }: { hasLinks: boolean }) {
  return (
    <Surface variant="glass" className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="animate-float flex size-16 items-center justify-center rounded-2xl glass refract">
        <Link2 className="size-7 text-[var(--iris-azure)]" />
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold text-white">
        {hasLinks ? "No matches" : "No links yet"}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-[var(--text-mid)]">
        {hasLinks ? "Try a different search term." : "Forge your first short link to start tracking clicks."}
      </p>
      {!hasLinks && (
        <MagneticLink href="/create" size="md" className="mt-7">
          <Plus className="size-4" /> Create link
        </MagneticLink>
      )}
    </Surface>
  )
}
