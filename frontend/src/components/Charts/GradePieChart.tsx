import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GradePieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

export default function GradePieChart({ data }: GradePieChartProps) {
  if (!data || data.length === 0) return <div className="text-sm text-text-secondary py-8 text-center">Нет данных для отображения</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={2}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E3DF', borderRadius: 6, fontFamily: 'Inter', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
