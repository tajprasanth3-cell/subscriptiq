import { useState } from 'react';

interface DataPoint {
  date: string;
  amount: number;
}

const defaultData: DataPoint[] = [
  { date: 'Apr 1', amount: 32000 },
  { date: 'Apr 8', amount: 48000 },
  { date: 'Apr 15', amount: 42000 },
  { date: 'Apr 22', amount: 68000 },
  { date: 'Apr 30', amount: 92400 },
];

export const RevenueChart = () => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const minVal = 0;
  const maxVal = 100000;

  const points = defaultData.map((d, i) => {
    const x = paddingX + (i / (defaultData.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.amount - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-2xl font-extrabold text-slate-900">₹92,400</span>
          <span className="text-xs font-semibold text-emerald-600 ml-2.5">
            &uarr; 16.5% <span className="text-slate-400 font-normal">vs last month</span>
          </span>
        </div>
        {hoveredPoint && (
          <div className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold animate-in fade-in">
            {hoveredPoint.date}: ₹{hoveredPoint.amount.toLocaleString()}
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-hidden">
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = height - paddingY - ratio * (height - 2 * paddingY);
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

        {/* Gradient area */}
        <path d={areaD} fill="url(#revenueGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#4F46E5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Points */}
        {points.map((p, idx) => (
          <g key={idx} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#FFFFFF"
              stroke="#4F46E5"
              strokeWidth="2.5"
              onMouseEnter={() => setHoveredPoint(p.data)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="hover:scale-125 transition-transform"
            />
          </g>
        ))}

        {/* X Axis labels */}
        {points.map((p, idx) => (
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
