import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const axisStyle = { fill: '#A9B2A8', fontSize: 12 }

function tooltipStyle() {
  return {
    background: '#17211C',
    border: '1px solid rgba(236, 231, 216, 0.18)',
    borderRadius: 8,
    color: '#ECE7D8',
  }
}

export function AreaPanelChart({
  data,
  xKey,
  yKey,
  color = '#2C7DA0',
  height = 220,
}: {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  color?: string
  height?: number
}) {
  if (data.length === 0) return <NoChartData />

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(236,231,216,0.10)" vertical={false} />
          <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle()} />
          <Area type="monotone" dataKey={yKey} stroke={color} fill={color} fillOpacity={0.22} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TwoLineChart({
  data,
  xKey,
  firstKey,
  secondKey,
  height = 240,
}: {
  data: Record<string, unknown>[]
  xKey: string
  firstKey: string
  secondKey: string
  height?: number
}) {
  if (data.length === 0) return <NoChartData />

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(236,231,216,0.10)" vertical={false} />
          <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle()} />
          <Line type="monotone" dataKey={firstKey} stroke="#2FBF71" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey={secondKey} stroke="#D64545" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarPanelChart({
  data,
  xKey,
  yKey,
  color = '#F0B429',
  layout = 'horizontal',
  height = 220,
}: {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  color?: string
  layout?: 'horizontal' | 'vertical'
  height?: number
}) {
  if (data.length === 0) return <NoChartData />

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout} margin={{ left: layout === 'vertical' ? 18 : -18, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(236,231,216,0.10)" horizontal={layout === 'horizontal'} vertical={layout === 'vertical'} />
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} width={54} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
            </>
          )}
          <Tooltip contentStyle={tooltipStyle()} />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DonutPanelChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number; color: string }[]
  height?: number
}) {
  if (data.length === 0) return <NoChartData />

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_150px]" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3}>
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle()} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col justify-center gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-lot-muted">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
              {item.name}
            </span>
            <span className="digital-text font-semibold text-lot-lane">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Heatmap({ matrix }: { matrix: number[][] }) {
  const max = Math.max(1, ...matrix.flat())
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[760px] gap-1" style={{ gridTemplateColumns: '42px repeat(24, minmax(20px, 1fr))' }}>
        <div />
        {Array.from({ length: 24 }).map((_, hour) => (
          <span key={hour} className="text-center text-[10px] text-lot-muted">{hour}</span>
        ))}
        {matrix.map((row, day) => [
          <span key={`${day}-label`} className="py-1 text-xs text-lot-muted">{days[day]}</span>,
          ...row.map((value, hour) => (
            <span
              key={`${day}-${hour}`}
              className="h-6 rounded-sm border border-lot-divider"
              title={`${days[day]} ${hour}:00 - ${value}`}
              style={{ background: `rgba(240, 180, 41, ${0.08 + (value / max) * 0.78})` }}
            />
          )),
        ])}
      </div>
    </div>
  )
}

function NoChartData() {
  return <div className="grid h-44 place-items-center rounded-control border border-dashed border-lot-divider text-sm text-lot-muted">Chưa có dữ liệu biểu đồ</div>
}
