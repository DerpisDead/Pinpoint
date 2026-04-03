const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CELL = 12;
const GAP  = 3;
const SLOT = CELL + GAP;   // 15px per grid slot
const LABEL_W = 18;        // left column for M/W/F labels
const TOP_PAD  = 18;       // space above grid for month labels

function activityColor(count: number): string {
  if (count === 0)   return "#F3F4F6"; // gray-100
  if (count <= 2)    return "#BBF7D0"; // green-200
  if (count <= 5)    return "#4ADE80"; // green-400
  if (count <= 10)   return "#16A34A"; // green-600
  return "#14532D";                    // green-900
}

type Cell = {
  date: string;
  count: number;
  dayOfWeek: number; // Mon=0 … Sun=6
  weekIndex: number;
  isFuture: boolean;
};

export default function ActivityHeatmap({
  activityByDate,
}: {
  activityByDate: Record<string, number>;
}) {
  // Find Monday of current week
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const currentDow = (today.getUTCDay() + 6) % 7; // Mon=0

  const mondayThisWeek = new Date(today);
  mondayThisWeek.setUTCDate(today.getUTCDate() - currentDow);

  // Start 12 full weeks before this Monday
  const startDate = new Date(mondayThisWeek);
  startDate.setUTCDate(mondayThisWeek.getUTCDate() - 12 * 7);

  // Build cells
  const cells: Cell[] = [];
  const cursor = new Date(startDate);
  let weekIndex = 0;
  let dayOfWeek = 0;

  // End after currentDow days into the 13th week (inclusive of today)
  const endDate = new Date(today);
  endDate.setUTCDate(today.getUTCDate() + (6 - currentDow)); // through Sunday of current week

  while (cursor <= endDate) {
    const dateStr = cursor.toISOString().slice(0, 10);
    cells.push({
      date: dateStr,
      count: activityByDate[dateStr] ?? 0,
      dayOfWeek,
      weekIndex,
      isFuture: dateStr > todayStr,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    dayOfWeek = (dayOfWeek + 1) % 7;
    if (dayOfWeek === 0) weekIndex++;
  }

  const totalWeeks = weekIndex + 1;
  const svgWidth  = LABEL_W + totalWeeks * SLOT;
  const svgHeight = TOP_PAD + 7 * SLOT;

  // Month labels: show when a Monday is the first occurrence of a new month
  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  for (const c of cells) {
    if (c.dayOfWeek === 0) {
      const m = new Date(c.date).getUTCMonth();
      if (m !== lastMonth) {
        monthLabels.push({ weekIndex: c.weekIndex, label: MONTHS[m] });
        lastMonth = m;
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        aria-label="Study activity heatmap"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Month labels */}
        {monthLabels.map(({ weekIndex: wi, label }) => (
          <text
            key={`m-${wi}`}
            x={LABEL_W + wi * SLOT}
            y={TOP_PAD - 4}
            fontSize={9}
            fill="#9CA3AF"
          >
            {label}
          </text>
        ))}

        {/* Day-of-week labels: M, W, F */}
        {[
          { label: "M", row: 0 },
          { label: "W", row: 2 },
          { label: "F", row: 4 },
        ].map(({ label, row }) => (
          <text
            key={label}
            x={0}
            y={TOP_PAD + row * SLOT + CELL - 1}
            fontSize={9}
            fill="#9CA3AF"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {cells.map((c) => (
          <rect
            key={c.date}
            x={LABEL_W + c.weekIndex * SLOT}
            y={TOP_PAD + c.dayOfWeek * SLOT}
            width={CELL}
            height={CELL}
            rx={2}
            ry={2}
            fill={c.isFuture ? "transparent" : activityColor(c.count)}
          >
            <title>
              {c.date}: {c.isFuture ? "—" : `${c.count} review${c.count !== 1 ? "s" : ""}`}
            </title>
          </rect>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-gray-400">Less</span>
        {[0, 1, 3, 6, 11].map((n) => (
          <span
            key={n}
            className="inline-block w-3 h-3 rounded-[2px]"
            style={{ backgroundColor: activityColor(n) }}
          />
        ))}
        <span className="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  );
}
