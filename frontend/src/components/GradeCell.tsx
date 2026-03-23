interface GradeCellProps {
  value: number | null;
  small?: boolean;
}

const gradeColors: Record<number, string> = {
  5: 'bg-[#DCFCE7] text-[#166534]',
  4: 'bg-[#FEF9C3] text-[#854D0E]',
  3: 'bg-[#FFEDD5] text-[#9A3412]',
  2: 'bg-[#FEE2E2] text-[#991B1B]',
};

export default function GradeCell({ value, small }: GradeCellProps) {
  if (value === null || value === undefined) {
    return <span className="text-text-secondary">—</span>;
  }
  const rounded = Math.round(value);
  const colorClass = gradeColors[rounded] || 'bg-bg-subtle text-text-primary';
  return (
    <span className={`inline-flex items-center justify-center rounded-btn font-medium ${colorClass} ${small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}>
      {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
    </span>
  );
}
