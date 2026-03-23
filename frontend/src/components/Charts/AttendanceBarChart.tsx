import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceBarChartProps {
  data: { name: string; value: number }[];
  color?: string;
  horizontal?: boolean;
}

export default function AttendanceBarChart({ data, color = '#2563EB', horizontal }: AttendanceBarChartProps) {
  if (!data || data.length === 0) return <div className="text-sm text-text-secondary py-8 text-center">Нет данных для отображения</div>;

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(260, data.length * 32)}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} width={120} />
          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E3DF', borderRadius: 6, fontFamily: 'Inter', fontSize: 12 }} />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
        <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E3DF', borderRadius: 6, fontFamily: 'Inter', fontSize: 12 }} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
