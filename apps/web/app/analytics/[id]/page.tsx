"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Compass,
  ExternalLink,
  Globe2,
  Loader2,
  Monitor,
  MousePointerClick,
  Smartphone,
  Tablet,
} from "lucide-react"
import {
  Bar, BarChart, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import { AppNav } from "@/components/layout/app-nav"
import { Surface } from "@/components/ui/surface"
import { Badge, CountUp, Skeleton } from "@/components/ui/bits"
import { Eyebrow } from "@/components/ui/kinetic-text"
import { toast } from "@/components/ui/toaster"
import { useRequireAuth } from "@/lib/hooks/use-auth"
import { linksApi } from "@/lib/api/links"
import type { LinkStats } from "@/lib/api/types"
import { shortDisplay, shortUrl } from "@/lib/format"
import { reveal, viewport } from "@/lib/motion"

/* ─────────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────────── */
const PALETTE = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa"]

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const deviceIcon = (device?: string) => {
  const d = (device ?? "").toLowerCase()
  if (d.includes("mobile"))  return <Smartphone className="size-4" />
  if (d.includes("tablet"))  return <Tablet     className="size-4" />
  return <Monitor className="size-4" />
}

const flagEmoji = (countryCode?: string | null): string => {
  if (!countryCode || countryCode.length !== 2) return "🌐"
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("")
}

/* ─────────────────────────────────────────────────────────────────────────────
   Chart tooltip
───────────────────────────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs text-white shadow-xl">
      <span className="text-[var(--text-mid)]">{label ?? payload[0].name}</span>{" "}
      <span className="font-semibold">{payload[0].value}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Empty state
───────────────────────────────────────────────────────────────────────────── */
function Empty({ label = "No data yet." }: { label?: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-center text-sm text-[var(--text-lo)]">
      {label}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Animated horizontal bar
───────────────────────────────────────────────────────────────────────────── */
function HBar({ rows, color = "var(--accent)" }: { rows: Array<{ label: string; count: number }>; color?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="truncate text-[var(--text-mid)]">{r.label || "Unknown"}</span>
            <span className="ml-4 shrink-0 font-semibold text-white">{r.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(r.count / max) * 100}%` }}
              viewport={viewport}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: color }}
              className="h-full rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */
export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }    = use(params)
  const { ready } = useRequireAuth()
  const [stats,   setStats]   = useState<LinkStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let active = true
    setLoading(true)
    linksApi
      .getLinkStats(id)
      .then((data) => { if (active) setStats(data) })
      .catch((err) => { if (active) toast.error(err.message || "Failed to load analytics") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [ready, id])

  if (!ready) return null

  const countryData  = (stats?.countries  ?? []).map((c) => ({ name: `${flagEmoji(c.country)} ${c.country}`, value: c.count }))
  const cityRows     = (stats?.cities     ?? []).map((c) => ({ label: c.city,    count: c.count }))
  const deviceData   = (stats?.devices    ?? []).map((d) => ({ name: d.device || "Unknown",  value: d.count }))
  const browserRows  = (stats?.browsers   ?? []).map((b) => ({ label: b.browser  || "Unknown", count: b.count }))
  const referrerRows = (stats?.referrers  ?? []).map((r) => ({ label: r.referrer || "Direct",  count: r.count }))
  const activity     = stats?.recentActivity ?? []
  const slug         = stats ? shortDisplay(stats.slug).split("/").pop()! : ""

  return (
    <>
      <AppNav />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-10">

        {/* Header */}
        <motion.div variants={reveal} initial="hidden" animate="show" className="mb-10">
          <Link
            href="/dashboard"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-[var(--text-mid)] transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to links
          </Link>
          <Eyebrow className="mb-3">Analytics</Eyebrow>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            {stats ? <>/{slug}</> : "Analytics"}
          </h1>
          {stats && (
            <a
              href={shortUrl(stats.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--iris-cyan)] transition-opacity hover:opacity-75"
            >
              {shortUrl(stats.slug)} <ExternalLink className="size-3.5" />
            </a>
          )}
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-44 lg:col-span-1" />
            <Skeleton className="h-44 lg:col-span-2" />
            <Skeleton className="h-72 lg:col-span-2" />
            <Skeleton className="h-72" />
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-96 lg:col-span-3" />
          </div>
        ) : !stats ? (
          <Surface variant="glass" className="p-16 text-center text-[var(--text-mid)]">
            <Loader2 className="mx-auto mb-3 size-6 animate-spin opacity-40" />
            Couldn&apos;t load analytics for this link.
          </Surface>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Total clicks */}
            <Surface variant="iris" className="relative flex flex-col justify-between overflow-hidden p-7">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-iris opacity-20 blur-3xl" />
              <div className="flex items-center gap-2 text-[var(--text-mid)]">
                <MousePointerClick className="size-4" />
                <span className="text-[11px] uppercase tracking-[0.20em]">Total clicks</span>
              </div>
              <div className="mt-6 font-display text-6xl font-semibold text-white sm:text-7xl">
                <CountUp to={stats.totalClicks} />
              </div>
            </Surface>

            {/* Quick tiles */}
            <div className="grid grid-cols-3 gap-4 lg:col-span-2">
              {[
                { label: "Countries", value: stats.countries.length, icon: <Globe2     className="size-4" /> },
                { label: "Devices",   value: stats.devices.length,   icon: <Smartphone className="size-4" /> },
                { label: "Sources",   value: stats.referrers.length, icon: <Compass    className="size-4" /> },
              ].map((t) => (
                <Surface key={t.label} variant="glass" className="flex flex-col justify-between p-5">
                  <div className="flex items-center gap-2 text-[var(--text-lo)]">
                    {t.icon}
                    <span className="text-[10.5px] uppercase tracking-[0.18em]">{t.label}</span>
                  </div>
                  <div className="mt-4 font-display text-3xl font-semibold text-white">
                    <CountUp to={t.value} />
                  </div>
                </Surface>
              ))}
            </div>

            {/* Countries bar chart */}
            <Surface variant="glass" className="p-6 lg:col-span-2">
              <h3 className="mb-5 font-display text-lg font-semibold text-white">Clicks by country</h3>
              {countryData.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countryData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="rgba(196,205,224,0.4)" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis stroke="rgba(196,205,224,0.4)" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<ChartTooltip />} />
                      <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={44} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <Empty />}
            </Surface>

            {/* Devices donut */}
            <Surface variant="glass" className="p-6">
              <h3 className="mb-5 font-display text-lg font-semibold text-white">Devices</h3>
              {deviceData.length ? (
                <>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none">
                          {deviceData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-2">
                    {deviceData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-[var(--text-mid)]">
                          <span className="size-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                          <span className="capitalize">{d.name}</span>
                        </span>
                        <span className="font-semibold text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <Empty />}
            </Surface>

            {/* Browsers */}
            <Surface variant="glass" className="p-6">
              <h3 className="mb-5 font-display text-lg font-semibold text-white">Browsers</h3>
              {browserRows.length ? <HBar rows={browserRows} color="var(--accent)" /> : <Empty />}
            </Surface>

            {/* Top cities */}
            <Surface variant="glass" className="p-6">
              <h3 className="mb-5 font-display text-lg font-semibold text-white">Top cities</h3>
              {cityRows.length
                ? <HBar rows={cityRows} color="#34d399" />
                : <Empty label="City data not available yet." />}
            </Surface>

            {/* Traffic sources */}
            <Surface variant="glass" className="p-6">
              <h3 className="mb-5 font-display text-lg font-semibold text-white">Traffic sources</h3>
              {referrerRows.length
                ? <HBar rows={referrerRows} color="#f472b6" />
                : <Empty label="No referrer data yet." />}
            </Surface>

            {/* Recent activity table — full width */}
            <Surface variant="glass" className="p-6 lg:col-span-3">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-white">Recent activity</h3>
                <span className="text-xs text-[var(--text-lo)]">Last {activity.length} clicks · IPs anonymized</span>
              </div>
              {activity.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Device / Browser", "Location", "IP (masked)", "Source", "Time"].map((h) => (
                          <th key={h} className="pb-3 pr-6 text-left text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--text-lo)] last:pr-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((a, i) => (
                        <motion.tr
                          key={a.id}
                          variants={reveal}
                          initial="hidden"
                          whileInView="show"
                          viewport={viewport}
                          transition={{ delay: i * 0.025 }}
                          className="border-b border-white/[0.04] last:border-0"
                        >
                          {/* Device / Browser */}
                          <td className="py-3.5 pr-6">
                            <div className="flex items-center gap-3">
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent-hi)]">
                                {deviceIcon(a.device)}
                              </span>
                              <div>
                                <div className="font-medium capitalize text-white">{a.device || "Unknown"}</div>
                                <div className="text-xs text-[var(--text-lo)]">{a.browser || "—"}</div>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 pr-6">
                            <div className="flex items-center gap-2">
                              <span className="text-base leading-none">{flagEmoji(a.country)}</span>
                              <div>
                                <div className="font-medium text-white">
                                  {a.city
                                    ? `${a.city}${a.region ? `, ${a.region}` : ""}`
                                    : (a.country || "Unknown")}
                                </div>
                                {a.city && (
                                  <div className="text-xs text-[var(--text-lo)]">{a.country}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* IP (masked) */}
                          <td className="py-3.5 pr-6">
                            {a.ip
                              ? <span className="font-mono text-xs text-[var(--text-mid)]">{a.ip}</span>
                              : <span className="text-xs text-[var(--text-lo)]">—</span>}
                          </td>

                          {/* Referrer / Source */}
                          <td className="py-3.5 pr-6">
                            {a.referrer && a.referrer !== "Direct"
                              ? <Badge tone="iris">{a.referrer}</Badge>
                              : <span className="text-xs text-[var(--text-lo)]">Direct</span>}
                          </td>

                          {/* Time */}
                          <td className="py-3.5 text-xs text-[var(--text-lo)]">
                            {(a.timestamp ?? a.createdAt)
                              ? new Date((a.timestamp ?? a.createdAt)!).toLocaleString(undefined, {
                                  month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty label="No clicks recorded yet — share your link to see live activity here." />
              )}
            </Surface>

          </div>
        )}
      </main>
    </>
  )
}
