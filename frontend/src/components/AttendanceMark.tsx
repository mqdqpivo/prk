interface AttendanceMarkProps {
  status: string | null;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  present: { label: 'Присутствует', color: 'text-[#166534]', dot: 'bg-[#10B981]' },
  absent: { label: 'Отсутствует', color: 'text-[#991B1B]', dot: 'bg-[#EF4444]' },
  late: { label: 'Опоздание', color: 'text-[#854D0E]', dot: 'bg-[#F59E0B]' },
  excused: { label: 'Уважительная', color: 'text-[#1E40AF]', dot: 'bg-[#2563EB]' },
};

export default function AttendanceMark({ status }: AttendanceMarkProps) {
  if (!status) return <span className="text-text-secondary">—</span>;
  const config = statusConfig[status];
  if (!config) return <span className="text-text-secondary">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
