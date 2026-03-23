import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BADGE_COLORS = [
  "rgba(255,87,8,0.95)", // Orange (primary)
  "rgba(245,0,47,0.95)", // Red (danger)
  "rgba(255,204,0,0.95)", // Yellow (highlight)
  "rgba(255,87,8,0.55)",
];

const CHART_GRID = "rgba(2, 6, 23, 0.08)";
const CHART_TEXT = "rgba(2, 6, 23, 0.55)";

export default function AdminOverviewPage({
  selectedSessionCode,
  filter,
  isLoadingResults,
  totalCount,
  memberCount,
  leaderCount,
  characterChartData,
  badgeChartData,
  logs,
}) {
  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-extrabold text-slate-950">
          차수별 참여 현황
        </h2>
        <p className="text-sm text-slate-500">
          선택한 차수 기준으로 결과가 실시간으로 반영됩니다.
        </p>
        {selectedSessionCode && (
          <div className="inline-flex items-center gap-2 text-sm text-slate-700">
            <span className="text-slate-500">선택된 차수</span>
            <span className="font-mono font-semibold">{selectedSessionCode}</span>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="전체 참여자 수"
          value={isLoadingResults ? "-" : totalCount}
          accent="from-[color:var(--key-primary)] to-[color:var(--key-highlight)]"
        />
        <SummaryCard
          label="구성원 참여 수"
          value={isLoadingResults ? "-" : memberCount}
          accent="from-[color:var(--key-highlight)] to-[color:var(--key-primary)]"
        />
        <SummaryCard
          label="리더 참여 수"
          value={isLoadingResults ? "-" : leaderCount}
          accent="from-[color:var(--key-danger)] to-[color:var(--key-primary)]"
        />
      </section>

      <section className="grid gap-4">
        <div className="rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                캐릭터 분포
              </h3>
            </div>
          </div>
          <div className="h-[22rem] sm:h-[28rem] lg:h-[36rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={characterChartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="type"
                  tick={{ fill: CHART_TEXT, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_GRID }}
                  interval={0}
                  height={56}
                  tickFormatter={(value) => {
                    const str = String(value ?? "");
                    return str.length > 15 ? `${str.slice(0, 15)}…` : str;
                  }}
                />
                <YAxis
                  tick={{ fill: CHART_TEXT, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_GRID }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "rgba(2, 6, 23, 0.12)",
                    borderRadius: 16,
                    padding: "8px 10px",
                  }}
                  itemStyle={{ fontSize: 12, color: "rgba(2,6,23,0.75)" }}
                  labelStyle={{ color: "#0b1220", marginBottom: 4 }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                  fill="url(#character-gradient)"
                />
                <defs>
                  <linearGradient
                    id="character-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="rgba(255,87,8,0.95)" />
                    <stop offset="70%" stopColor="rgba(255,204,0,0.45)" />
                    <stop offset="100%" stopColor="rgba(255,204,0,0.10)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            막대가 높을수록 해당 캐릭터 유형으로 분석된 인원이 많다는 의미입니다.
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                리더십 뱃지 비율
              </h3>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={badgeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={52}
                    paddingAngle={4}
                  >
                    {badgeChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={BADGE_COLORS[index % BADGE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "rgba(2, 6, 23, 0.12)",
                      borderRadius: 16,
                      padding: "8px 10px",
                    }}
                    itemStyle={{ fontSize: 12, color: "rgba(2,6,23,0.75)" }}
                    labelStyle={{ color: "#0b1220", marginBottom: 4 }}
                    formatter={(value) => [`${value}명`, "리더 수"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={32}
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {badgeChartData.map((badge, index) => {
                const totalLeaders = badgeChartData.reduce(
                  (sum, b) => sum + b.value,
                  0,
                );
                const ratio =
                  totalLeaders === 0
                    ? 0
                    : Math.round((badge.value / totalLeaders) * 100);

                return (
                  <div
                    key={badge.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            BADGE_COLORS[index % BADGE_COLORS.length],
                        }}
                      />
                      <span className="text-slate-800">{badge.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>{badge.value}명</span>
                      <span className="text-slate-500">·</span>
                      <span>{ratio}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)]">
        <div className="rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                실시간 결과 로그
              </h3>
              <p className="text-sm text-slate-500">
                최신 응답 순으로 캐릭터/뱃지 결과를 보여줍니다. (최대 30개)
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden rounded-3xl border border-black/5 bg-[#f6f7f9]">
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  아직 수집된 로그가 없습니다. 참여자가 결과를 완료하면 이 영역에
                  실시간으로 표시됩니다.
                </div>
              ) : (
                <ul className="divide-y divide-black/5 text-sm">
                  {logs.map((log) => (
                    <li
                      key={log.id}
                      className="px-5 py-3 flex items-start justify-between gap-3 hover:bg-black/5 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[color:var(--key-primary)]/80" />
                        <p className="text-slate-900">{log.message}</p>
                      </div>
                      <span className="mt-0.5 shrink-0 text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-sm flex flex-col gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-950">
              현재 세션 요약
            </h3>
            <p className="text-sm text-slate-500">
              선택한 세션과 필터 기준으로 간단한 숫자 지표를 정리했습니다.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <SummaryRow label="대상 범위" value={getFilterLabel(filter)} />
            <SummaryRow
              label="전체 인원"
              value={isLoadingResults ? "-" : `${totalCount}명`}
            />
            <SummaryRow
              label="구성원"
              value={isLoadingResults ? "-" : `${memberCount}명`}
            />
            <SummaryRow
              label="리더"
              value={isLoadingResults ? "-" : `${leaderCount}명`}
            />
          </dl>

          <div className="mt-2 rounded-3xl border border-black/5 bg-[#f6f7f9] p-4 text-sm text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-900 mb-1.5">활용 팁</p>
            <p>
              상단에서 차수를 변경하며 세션 간 캐릭터 분포와 리더십 뱃지 비율을
              비교해 보세요. 교육 직후 디브리핑 시간에 트렌드를 설명할 때
              유용합니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white px-5 py-4 shadow-sm flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-extrabold text-slate-950 tabular-nums">
          {typeof value === "number" ? value.toLocaleString("ko-KR") : value}
        </p>
      </div>
      <div
        className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${accent} opacity-90`}
      >
        <span className="sr-only">indicator</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-semibold">{value}</dd>
    </div>
  );
}

function getFilterLabel(filter) {
  switch (filter) {
    case "member":
      return "구성원만 포함";
    case "leader":
      return "리더만 포함";
    default:
      return "구성원 + 리더 전체";
  }
}

