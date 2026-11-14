import { useState } from 'react';

interface TrendPoint {
  date: string;
  thisMonth: number;
  lastMonth: number;
}

const trendData: TrendPoint[] = [
  { date: 'Apr 1', thisMonth: 26000, lastMonth: 21000 },
  { date: 'Apr 8', thisMonth: 42000, lastMonth: 34000 },
  { date: 'Apr 15', thisMonth: 58000, lastMonth: 46000 },
  { date: 'Apr 22', thisMonth: 69000, lastMonth: 61000 },
  { date: 'Apr 30', thisMonth: 82000, lastMonth: 74000 },
];

export const ApiUsageTrendChart = () => {
  const [hovered, setHovered] = useState<TrendPoint | null>(null);

  const width = 560;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;
  const maxVal = 100000;

  const pointsThisMonth = trendData.map((d, i) => {
    const x = paddingX + (i / (trendData.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (d.thisMonth / maxVal) * (height - 2 * paddingY);
    return { x, y, data: d };
  });

  const pointsLastMonth = trendData.map((d, i) => {
    const x = paddingX + (i / (trendData.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (d.lastMonth / maxVal) * (height - 2 * paddingY);
    return { x, y, data: d };
  });

  const getPath = (pts: { x: number; y: number }[]) =>
    pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
    }, '');

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>This Month</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Last Month</span>
          </div>
        </div>

        {hovered && (
          <div className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
            {hovered.date}: {hovered.thisMonth.toLocaleString()} reqs
          </div>
        )}
      </div>

      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="block w-full h-auto">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((r, idx) => {
          const y = height - paddingY - r * (height - 2 * paddingY);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#F1F5F9"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Last month dashed line */}
        <path
          d={getPath(pointsLastMonth)}
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* This month solid line */}
        <path
          d={getPath(pointsThisMonth)}
          fill="none"
          stroke="#4F46E5"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Data points */}
        {pointsThisMonth.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#FFFFFF"
            stroke="#4F46E5"
            strokeWidth="2.5"
            onMouseEnter={() => setHovered(p.data)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer hover:scale-125 transition-transform"
          />
        ))}

        {/* X Axis labels */}
        {pointsThisMonth.map((p, idx) => (
          <text
            key={idx}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            className="text-[11px] fill-slate-400 font-medium"
          >
            {p.data.date}
          </text>
        ))}
      </svg>
      </div>
    </div>
  );
};

