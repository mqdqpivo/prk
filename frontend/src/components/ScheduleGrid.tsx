interface ScheduleSlot {
  id: number;
  day_of_week: number;
  lesson_number: number;
  room?: string;
  tsg?: {
    subject?: { name?: string; short_name?: string };
    group?: { name?: string };
    teacher?: { user?: { last_name?: string; first_name?: string } };
  };
}

interface ScheduleGridProps {
  slots: ScheduleSlot[];
  currentDay?: number;
  onSlotClick?: (day: number, lesson: number, slot?: ScheduleSlot) => void;
  editable?: boolean;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const TIMES = [
  '8:30–10:00', '10:10–11:40', '12:10–13:40', '13:50–15:20',
  '15:30–17:00', '17:10–18:40', '18:50–20:20', '20:30–22:00',
];

export default function ScheduleGrid({ slots, currentDay, onSlotClick, editable }: ScheduleGridProps) {
  const getSlot = (day: number, lesson: number) =>
    slots.find(s => s.day_of_week === day && s.lesson_number === lesson);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[700px]">
        <thead>
          <tr>
            <th className="text-xs text-text-secondary font-medium py-2 px-3 text-left border-b border-border w-[100px]">Пара</th>
            {DAYS.map((day, idx) => (
              <th
                key={idx}
                className={`text-xs text-text-secondary font-medium py-2 px-3 text-left border-b border-border ${
                  currentDay === idx + 1 ? 'bg-bg-subtle' : ''
                }`}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIMES.map((time, lessonIdx) => (
            <tr key={lessonIdx}>
              <td className="py-2 px-3 border-b border-border text-xs text-text-secondary">
                <div className="font-medium">{lessonIdx + 1}</div>
                <div>{time}</div>
              </td>
              {DAYS.map((_, dayIdx) => {
                const slot = getSlot(dayIdx + 1, lessonIdx + 1);
                return (
                  <td
                    key={dayIdx}
                    className={`py-2 px-3 border-b border-border ${
                      currentDay === dayIdx + 1 ? 'bg-bg-subtle' : ''
                    } ${editable ? 'cursor-pointer hover:bg-bg-subtle' : ''}`}
                    onClick={() => editable && onSlotClick?.(dayIdx + 1, lessonIdx + 1, slot || undefined)}
                  >
                    {slot && slot.tsg ? (
                      <div className="border-l-2 border-accent pl-2">
                        <div className="text-sm font-medium text-text-primary truncate">
                          {slot.tsg.subject?.short_name || slot.tsg.subject?.name || ''}
                        </div>
                        {slot.tsg.teacher?.user && (
                          <div className="text-[11px] text-text-secondary truncate">
                            {slot.tsg.teacher.user.last_name} {slot.tsg.teacher.user.first_name?.[0]}.
                          </div>
                        )}
                        {slot.room && (
                          <div className="text-[11px] text-text-secondary">ауд. {slot.room}</div>
                        )}
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
