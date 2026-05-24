import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS, type ChartPoint } from '../../lib/chartData';
import { Card } from '../ui';

const axisStyle = { fill: '#c4b5fd', fontSize: 11 };
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1a1535',
    border: '1px solid rgba(168, 85, 247, 0.5)',
    borderRadius: '12px',
    color: '#f5f3ff',
  },
};

function EmptyChart({ message = 'No data to display yet.' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-56 text-sm text-violet-400/70 bg-[#12102a] rounded-xl border border-violet-500/25">
      {message}
    </div>
  );
}

export function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card title={title} className={className}>
      {children}
    </Card>
  );
}

export function PieChartView({
  data,
  height = 260,
}: {
  data: ChartPoint[];
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          stroke="#0b0a1a"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ color: '#e9d5ff' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BarChartView({
  data,
  height = 260,
  dataKey = 'value',
  color = CHART_COLORS[0],
  layout = 'vertical',
}: {
  data: ChartPoint[];
  height?: number;
  dataKey?: string;
  color?: string;
  layout?: 'vertical' | 'horizontal';
}) {
  if (!data.length || !data.some((d) => d.value > 0)) return <EmptyChart />;

  const isHorizontal = layout === 'horizontal';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={isHorizontal ? { left: 8, right: 16, top: 8, bottom: 8 } : { bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
        {isHorizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} tick={axisStyle} />
            <YAxis type="category" dataKey="name" width={100} tick={axisStyle} />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tick={axisStyle}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={axisStyle} />
          </>
        )}
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MultiBarChartView({
  data,
  keys,
  height = 280,
}: {
  data: ChartPoint[];
  keys: { key: string; label: string; color: string }[];
  height?: number;
}) {
  if (!data.length) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
        <XAxis
          dataKey="name"
          tick={axisStyle}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={70}
        />
        <YAxis allowDecimals={false} tick={axisStyle} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ color: '#e9d5ff' }} />
        {keys.map((k) => (
          <Bar key={k.key} dataKey={k.key} name={k.label} fill={k.color} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
