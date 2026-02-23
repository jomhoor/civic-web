"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { t, axisLabel, AXIS_KEYS } from "@/lib/i18n";
import {
  getAnalyticsOverview,
  getAnalyticsAggregate,
  getAnalyticsDistribution,
  getAnalyticsTrends,
} from "@/lib/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Users,
  Eye,
  Camera,
  MessageSquare,
  Globe,
  BarChart3,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { SettingsBar } from "@/components/settings-bar";

/* ── Axis colours (Republic palette) ── */
const AXIS_COLORS: Record<string, string> = {
  economy: "#0EBB90",
  governance: "#8CDAF5",
  civil_liberties: "#FEEB34",
  society: "#E87461",
  diplomacy: "#A78BFA",
  environment: "#34D399",
  justice: "#F59E0B",
  technology: "#60A5FA",
};

/* ── Types ── */
interface Overview {
  totalUsers: number;
  publicUsers: number;
  totalSnapshots: number;
  totalResponses: number;
  countries: { country: string; count: number }[];
}

interface Aggregate {
  dimensions: Record<string, number>;
  sampleSize: number;
}

interface AxisDist {
  axis: string;
  buckets: { range: string; min: number; max: number; count: number }[];
  mean: number;
  median: number;
  stdDev: number;
}

interface TrendPoint {
  period: string;
  dimensions: Record<string, number>;
  sampleSize: number;
}

type AnalyticsTab = "overview" | "aggregate" | "distribution" | "trends";

export default function AnalyticsPage() {
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);

  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const [country, setCountry] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [distribution, setDistribution] = useState<AxisDist[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, ag, di, tr] = await Promise.all([
        getAnalyticsOverview(),
        getAnalyticsAggregate(country || undefined),
        getAnalyticsDistribution(country || undefined),
        getAnalyticsTrends(12, country || undefined),
      ]);
      setOverview(ov);
      setAggregate(ag);
      setDistribution(di);
      setTrends(tr);
    } catch (e) {
      console.error("Analytics fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const gridColor =
    theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const textMuted =
    theme === "light" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.44)";

  /* ── Tab definitions ── */
  const tabs: { key: AnalyticsTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "overview",
      label: t("analytics_overview", language),
      icon: <Globe size={16} strokeWidth={1.5} />,
    },
    {
      key: "aggregate",
      label: t("analytics_aggregate", language),
      icon: <Eye size={16} strokeWidth={1.5} />,
    },
    {
      key: "distribution",
      label: t("analytics_distribution", language),
      icon: <BarChart3 size={16} strokeWidth={1.5} />,
    },
    {
      key: "trends",
      label: t("analytics_trends", language),
      icon: <TrendingUp size={16} strokeWidth={1.5} />,
    },
  ];

  /* ── Stat card ── */
  const StatCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <div
      className="card p-4 sm:p-5 flex items-center gap-4"
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl"
        style={{
          background: "var(--accent-gradient-soft)",
          border: "1px solid var(--border-accent)",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <SettingsBar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: "var(--component-primary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <ArrowLeft
              size={18}
              strokeWidth={1.5}
              style={{ color: "var(--text-secondary)" }}
              className="rtl:rotate-180"
            />
          </button>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold glow-text"
            >
              {t("analytics_title", language)}
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {t("analytics_subtitle", language)}
            </p>
          </div>
        </div>

        {/* Country filter */}
        {overview && overview.countries.length > 0 && (
          <div className="mt-4 mb-6">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                background: "var(--component-primary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">
                {t("analytics_all_countries", language)}
              </option>
              {overview.countries.map((c) => (
                <option key={c.country} value={c.country}>
                  {c.country} ({c.count})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "var(--component-primary)" }}>
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all"
              style={{
                background: tab === tb.key ? "var(--bg-card)" : "transparent",
                color:
                  tab === tb.key
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                boxShadow: tab === tb.key ? "var(--shadow-sm)" : "none",
              }}
            >
              {tb.icon}
              <span className="hidden sm:inline">{tb.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={28}
              strokeWidth={1.5}
              className="animate-spin"
              style={{ color: "var(--accent-primary)" }}
            />
          </div>
        ) : (
          <>
            {/* ─────── Overview Tab ─────── */}
            {tab === "overview" && overview && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    icon={
                      <Users
                        size={18}
                        strokeWidth={1.5}
                        style={{ color: "var(--accent-primary)" }}
                      />
                    }
                    label={t("analytics_total_users", language)}
                    value={overview.totalUsers}
                  />
                  <StatCard
                    icon={
                      <Eye
                        size={18}
                        strokeWidth={1.5}
                        style={{ color: "var(--accent-primary)" }}
                      />
                    }
                    label={t("analytics_public_users", language)}
                    value={overview.publicUsers}
                  />
                  <StatCard
                    icon={
                      <Camera
                        size={18}
                        strokeWidth={1.5}
                        style={{ color: "var(--accent-primary)" }}
                      />
                    }
                    label={t("analytics_total_snapshots", language)}
                    value={overview.totalSnapshots}
                  />
                  <StatCard
                    icon={
                      <MessageSquare
                        size={18}
                        strokeWidth={1.5}
                        style={{ color: "var(--accent-primary)" }}
                      />
                    }
                    label={t("analytics_total_responses", language)}
                    value={overview.totalResponses}
                  />
                </div>

                {/* Top countries */}
                {overview.countries.length > 0 && (
                  <div className="card p-4 sm:p-6">
                    <h3
                      className="text-sm font-semibold mb-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("analytics_top_countries", language)}
                    </h3>
                    <div className="space-y-2">
                      {overview.countries.slice(0, 10).map((c, i) => {
                        const max = overview.countries[0]?.count || 1;
                        return (
                          <div key={c.country} className="flex items-center gap-3">
                            <span
                              className="text-xs w-6 text-end"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {i + 1}
                            </span>
                            <span
                              className="text-sm flex-shrink-0 w-24"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {c.country}
                            </span>
                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--component-primary)" }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(c.count / max) * 100}%`,
                                  background: "var(--accent-gradient)",
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-mono w-8 text-end"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {c.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─────── Aggregate Tab ─────── */}
            {tab === "aggregate" && aggregate && (
              <div className="space-y-6">
                {aggregate.sampleSize === 0 ? (
                  <div className="card p-8 text-center">
                    <p style={{ color: "var(--text-muted)" }}>
                      {t("analytics_no_data", language)}
                    </p>
                  </div>
                ) : (
                  <>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {t("analytics_sample_size", language)}:{" "}
                      <span style={{ color: "var(--accent-primary)" }}>
                        {aggregate.sampleSize}
                      </span>
                    </p>

                    {/* Radar chart */}
                    <div className="card p-4 sm:p-6">
                      <div className="w-full aspect-square max-h-[420px] mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            data={AXIS_KEYS.map((axis) => ({
                              axis: axisLabel(axis, language),
                              value:
                                ((aggregate.dimensions[axis] ?? 0) + 1) / 2,
                              raw: (
                                aggregate.dimensions[axis] ?? 0
                              ).toFixed(2),
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius="75%"
                          >
                            <PolarGrid stroke={gridColor} />
                            <PolarAngleAxis
                              dataKey="axis"
                              tick={{
                                fill: textMuted,
                                fontSize: 11,
                              }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 1]}
                              tick={false}
                              axisLine={false}
                            />
                            <Radar
                              name="Aggregate"
                              dataKey="value"
                              stroke="var(--accent-primary)"
                              fill="var(--accent-primary)"
                              fillOpacity={0.2}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-md)",
                                color: "var(--text-primary)",
                                fontSize: 12,
                              }}
                              formatter={(
                                _val: unknown,
                                _name: unknown,
                                props: { payload: { raw: string } }
                              ) => [props.payload.raw, "Score"]}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Axis values table */}
                    <div className="card p-4 sm:p-6">
                      <div className="space-y-2">
                        {AXIS_KEYS.map((axis) => {
                          const val = aggregate.dimensions[axis] ?? 0;
                          const pct = ((val + 1) / 2) * 100;
                          return (
                            <div
                              key={axis}
                              className="flex items-center gap-3"
                            >
                              <span
                                className="text-sm w-28 sm:w-36 flex-shrink-0"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {axisLabel(axis, language)}
                              </span>
                              <div
                                className="flex-1 h-3 rounded-full overflow-hidden"
                                style={{
                                  background: "var(--component-primary)",
                                }}
                              >
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    background:
                                      AXIS_COLORS[axis] ?? "var(--accent-primary)",
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-mono w-12 text-end"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {val.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─────── Distribution Tab ─────── */}
            {tab === "distribution" && distribution.length > 0 && (
              <div className="space-y-6">
                {distribution.map((d) => (
                  <div key={d.axis} className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="text-sm font-semibold"
                        style={{
                          color:
                            AXIS_COLORS[d.axis] ?? "var(--text-primary)",
                        }}
                      >
                        {axisLabel(d.axis, language)}
                      </h3>
                      <div
                        className="flex gap-3 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span>
                          {t("analytics_mean", language)}: {d.mean.toFixed(2)}
                        </span>
                        <span>
                          {t("analytics_median", language)}:{" "}
                          {d.median.toFixed(2)}
                        </span>
                        <span>
                          {t("analytics_std_dev", language)}:{" "}
                          {d.stdDev.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={d.buckets}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={gridColor}
                          />
                          <XAxis
                            dataKey="range"
                            tick={{ fill: textMuted, fontSize: 10 }}
                          />
                          <YAxis
                            tick={{ fill: textMuted, fontSize: 10 }}
                            width={30}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              color: "var(--text-primary)",
                              fontSize: 12,
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill={AXIS_COLORS[d.axis] ?? "var(--accent-primary)"}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─────── Trends Tab ─────── */}
            {tab === "trends" && (
              <div className="space-y-6">
                {trends.length === 0 ? (
                  <div className="card p-8 text-center">
                    <p style={{ color: "var(--text-muted)" }}>
                      {t("analytics_no_data", language)}
                    </p>
                  </div>
                ) : (
                  <div className="card p-4 sm:p-6">
                    <h3
                      className="text-sm font-semibold mb-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t("analytics_monthly_trends", language)}
                    </h3>
                    <div className="w-full h-72 sm:h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trends.map((tp) => ({
                            period: tp.period,
                            ...Object.fromEntries(
                              AXIS_KEYS.map((a) => [
                                a,
                                tp.dimensions[a] ?? 0,
                              ])
                            ),
                            sampleSize: tp.sampleSize,
                          }))}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={gridColor}
                          />
                          <XAxis
                            dataKey="period"
                            tick={{ fill: textMuted, fontSize: 10 }}
                          />
                          <YAxis
                            domain={[-1, 1]}
                            tick={{ fill: textMuted, fontSize: 10 }}
                            width={35}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              color: "var(--text-primary)",
                              fontSize: 12,
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 11, color: textMuted }}
                          />
                          {AXIS_KEYS.map((axis) => (
                            <Line
                              key={axis}
                              type="monotone"
                              dataKey={axis}
                              name={axisLabel(axis, language)}
                              stroke={AXIS_COLORS[axis]}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
