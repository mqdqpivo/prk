import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface GradeLineChartProps {
  data: { week: string; avg_grade: number }[];
}

export default function GradeLineChart({ data }: GradeLineChartProps) {
  if (!data || data.length === 0) return <div className="text-sm text-text-secondary py-8 text-center">Нет данных для отображения</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v: string) => v ? new Date(v).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : ''} />
        <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E3DF', borderRadius: 6, fontFamily: 'Inter', fontSize: 12 }} />
        <Area type="monotone" dataKey="avg_grade" stroke="#2563EB" fill="#DBEAFE" strokeWidth={2} name="Средний балл" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
