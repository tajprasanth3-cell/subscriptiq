import { useState, useMemo } from 'react';

interface TierData {
  tier: string;
  percentage: number;
  count: number;
  color: string;
}

const distributionData: TierData[] = [
  { tier: 'Basic', percentage: 38.7, count: 96, color: '#4F46E5' },
  { tier: 'Professional', percentage: 42.3, count: 105, color: '#10B981' },
  { tier: 'Enterprise', percentage: 18.9, count: 47, color: '#F59E0B' },
];

export const PlanDistributionChart = () => {
  const [activeTier, setActiveTier] = useState<TierData | null>(null);

  const total = 248;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  // Pure computation of slice offsets with useMemo without mutating variables
  const slices = useMemo(() => {
    return distributionData.map((d, index) => {
      const previousSum = distributionData
        .slice(0, index)
        .reduce((acc, curr) => acc + curr.percentage, 0);
      const strokeDasharray = `${(d.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((previousSum / 100) * circumference);
      return { ...d, strokeDasharray, strokeDashoffset };
    });
  }, [circumference]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Donut Chart */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth="20"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 hover:opacity-85 cursor-pointer"
              onMouseEnter={() => setActiveTier(slice)}
              onMouseLeave={() => setActiveTier(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 leading-tight">
            {activeTier ? `${activeTier.percentage}%` : total}
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            {activeTier ? activeTier.tier : 'Organizations'}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="w-full space-y-3">
        {distributionData.map((d) => (
          <div
            key={d.tier}
            onMouseEnter={() => setActiveTier(d)}
            onMouseLeave={() => setActiveTier(null)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="font-semibold text-slate-800">{d.tier}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-slate-900">{d.percentage}%</span>
              <span className="text-slate-400 text-[11px]">({d.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
