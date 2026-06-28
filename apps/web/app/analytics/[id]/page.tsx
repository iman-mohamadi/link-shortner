"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Globe2,
  Loader2,
  Monitor,
  MousePointerClick,
  Smartphone,
  Tablet,
  Compass,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { AppNav } from "@/components/layout/app-nav"
import { Surface } from "@/components/ui/surface"
import { Badge, CountUp, Skeleton } from "@/components/ui/bits"
import { Eyebrow } from "@/components/ui/kinetic-text"
import { toast } from "@/components/ui/toaster"
import { useRequireAuth } from "@/lib/hooks/use-auth"
import { linksApi } from "@/lib/api/links"
import type { LinkStats } from "@/lib/api/types"
import { shortDisplay } from "@/lib/format"
import { reveal, viewport } from "@/lib/motion"

const IRIS = ["#6ef2e0", "#5b8cff", "#9b6bff", "#ff6bd6", "#ffb86b"]

const deviceIcon = (device?: string) => {
  const d = (device || "").toLowerCase()
  if (d.includes("mobile")) return <Smartphone className="size-4" />
  if (d.includes("tablet")) return <Tablet className="size-4" />
  if (d.includes("desktop")) return <Monitor className="size-4" />
  return <Globe2 className="size-4" />
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs text-white">
      <span className="text-[var(--text-mid)]">{label ?? payload[0].name}</span>{" "}
      <span className="font-semibold">{payload[0].value}</span>
    </div>
  )
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { ready } = useRequireAuth()
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let active = true
    setLoading(true)
    linksApi
      .getLinkStats(id)
      .then((data) => active && setStats(data))
      .catch((err) => active && toast.error(err.message || "Failed to load analytics"))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [ready, id])

  if (!ready) return null

  const countryData = (stats?.countries ?? []).map((c) => ({ name: c.country || "??", value: c.count }))
  const deviceData = (stats?.devices ?? []).map((d) => ({ name: d.device || "Unknown", value: d.count }))
  const browsers = stats?.browsers ?? []
  const maxBrowser = Math.max(1, ...browsers.map((b) => b.count))

  return (
    <>
      <AppNav />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-12">
        <motion.div variants={reveal} initial="hidden" animate="show" className="mb-10">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-mid)] transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to links
          </Link>
          <Eyebrow className="mb-4">Performance</Eyebrow>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-chrome sm:text-5xl">
            {stats ? <>/{shortDisplay(stats.slug).split("/").pop()}</> : "Analytics"}
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-44 lg:col-span-1" />
            <Skeleton className="h-44 lg:col-span-2" />
            <Skeleton className="h-72 lg:col-span-2" />
            <Skeleton className="h-72" />
          </div>
        ) : !stats ? (
          <Surface variant="glass" className="p-16 text-center text-[var(--text-mid)]">
            <Loader2 className="mx-auto mb-3 size-6 animate-spin opacity-40" />
            Couldn&apos;t load analytics for this link.
          </Surface>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Hero stat */}
            <Surface variant="iris" className="relative flex flex-col justify-between overflow-hidden p-7 lg:col-span-1">
              <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-iris opacity-25 blur-3xl" />
              <div className="flex items-center gap-2 text-[var(--text-mid)]">
                <MousePointerClick className="size-4" />
                <span className="text-xs uppercase tracking-[0.18em]">Total clicks</span>
              </div>
              <div className="font-display text-6xl font-semibold text-white sm:text-7xl">
                <CountUp to={stats.totalClicks} />
              </div>
            </Surface>

            {/* Quick tiles */}
            <div className="grid grid-cols-3 gap-4 lg:col-span-2">
              {[
                { label: "Countries", value: stats.countries.length, icon: <Globe2 className="size-4" /> },
                { label: "Devices", value: stats.devices.length, icon: <Smartphone className="size-4" /> },
                { label: "Browsers", value: stats.browsers.length, icon: <Compass className="size-4" /> },
              ].map((t) => (
                <Surface key={t.label} variant="glass" className="flex flex-col justify-between p-5">
                  <div className="flex items-center gap-2 text-[var(--text-lo)]">
                    {t.icon}
                    <span className="text-[11px] uppercase tracking-[0.16em]">{t.label}</span>
                  </div>
                  <div className="font-display text-3xl font-semibold text-white">
                    <CountUp to={t.value} />
                  </div>
                </Surface>
              ))}
            </div>

            {/* Countries bar chart */}
            <Surface variant="glass" className="p-6 lg:col-span-2">
              <h3 className="mb-6 font-display text-lg font-semibold text-white">Clicks by country</h3>
              {countryData.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countryData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barIris" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5b8cff" />
                          <stop offset="100%" stopColor="#9b6bff" />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="rgba(196,205,224,0.5)" tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<ChartTooltip />} />
                      <Bar dataKey="value" fill="url(#barIris)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
            </Surface>

            {/* Devices donut */}
            <Surface variant="glass" className="p-6">
              <h3 className="mb-6 font-display text-lg font-semibold text-white">Devices</h3>
              {deviceData.length ? (
                <>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                          {deviceData.map((_, i) => (
                            <Cell key={i} fill={IRIS[i % IRIS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {deviceData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-[var(--text-mid)]">
                          <span className="size-2.5 rounded-full" style={{ background: IRIS[i % IRIS.length] }} />
                          {d.name}
                        </span>
                        <span className="text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyChart />
              )}
            </Surface>

            {/* Browsers */}
            <Surface variant="glass" className="p-6">
              <h3 className="mb-6 font-display text-lg font-semibold text-white">Browsers</h3>
              {browsers.length ? (
                <div className="space-y-4">
                  {browsers.map((b) => (
                    <div key={b.browser}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-[var(--text-mid)]">{b.browser || "Unknown"}</span>
                        <span className="text-white">{b.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(b.count / maxBrowser) * 100}%` }}
                          viewport={viewport}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-iris"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChart />
              )}
            </Surface>

            {/* Recent activity */}
            <Surface variant="glass" className="p-6 lg:col-span-2">
              <h3 className="mb-6 font-display text-lg font-semibold text-white">Recent activity</h3>
              {stats.recentActivity.length ? (
                <div className="space-y-1">
                  {stats.recentActivity.map((a, i) => (
                    <motion.div
                      key={a.id}
                      variants={reveal}
                      initial="hidden"
                      whileInView="show"
                      viewport={viewport}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.05] text-[var(--iris-azure)]">
                          {deviceIcon(a.device)}
                        </span>
                        <div>
                          <div className="text-sm capitalize text-white">{a.device || "Unknown"}</div>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-lo)]">
                            <span>{a.browser || "—"}</span>
                            {a.country && <Badge>{a.country}</Badge>}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-lo)]">
                        {a.timestamp || a.createdAt
                          ? new Date((a.timestamp || a.createdAt) as string).toLocaleString()
                          : ""}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyChart label="No clicks recorded yet — share your link to see activity." />
              )}
            </Surface>
          </div>
        )}
      </main>
    </>
  )
}

function EmptyChart({ label = "No data yet." }: { label?: string }) {
  return (
    <div className="flex h-44 items-center justify-center text-center text-sm text-[var(--text-lo)]">
      {label}
    </div>
  )
}
