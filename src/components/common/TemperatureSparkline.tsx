import React from 'react';
import type { TemperatureRecord } from '../../types';

interface TemperatureSparklineProps {
  records: TemperatureRecord[];
  feverThreshold?: number;
  height?: number;
  width?: number;
  showLabels?: boolean;
}

export const TemperatureSparkline: React.FC<TemperatureSparklineProps> = ({
  records,
  feverThreshold = 38.0,
  height = 56,
  width = 180,
  showLabels = false,
}) => {
  if (!records || records.length === 0) {
    return <span className="text-xs text-slate-400 italic">No temp history</span>;
  }

  // Sort ascending by date
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const temps = sorted.map((r) => r.temperature);

  const minTemp = Math.min(...temps, 36.0);
  const maxTemp = Math.max(...temps, 39.5);
  const range = maxTemp - minTemp || 1;

  const paddingX = 12;
  const paddingY = 8;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // Map to SVG coordinates
  const points = sorted.map((rec, index) => {
    const x =
      sorted.length === 1
        ? width / 2
        : paddingX + (index / (sorted.length - 1)) * graphWidth;
    const y =
      height - paddingY - ((rec.temperature - minTemp) / range) * graphHeight;
    return { x, y, temp: rec.temperature, date: rec.date, isFever: rec.temperature >= feverThreshold };
  });

  const pathD = points.reduce((acc, curr, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }, '');

  // Fever threshold line Y
  const thresholdY =
    height - paddingY - ((feverThreshold - minTemp) / range) * graphHeight;

  return (
    <div className="inline-flex flex-col items-center">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        aria-label="Temperature trend"
      >
        {/* Fever threshold guideline */}
        {thresholdY >= paddingY && thresholdY <= height - paddingY && (
          <g>
            <line
              x1={paddingX}
              y1={thresholdY}
              x2={width - paddingX}
              y2={thresholdY}
              stroke="#fca5a5"
              strokeDasharray="3 3"
              strokeWidth="1.2"
            />
            <text
              x={width - paddingX + 2}
              y={thresholdY + 3}
              fontSize="10"
              fill="#ef4444"
              textAnchor="start"
              className="font-mono font-bold"
            >
              {feverThreshold}°
            </text>
          </g>
        )}

        {/* Trend line */}
        {sorted.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={pt.isFever ? 4.5 : 3.5}
              fill={pt.isFever ? '#ef4444' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="1.5"
            >
              <title>{`${pt.date}: ${pt.temp}°C ${pt.isFever ? '(Fever)' : '(Normal)'}`}</title>
            </circle>
          </g>
        ))}
      </svg>
      {showLabels && (
        <div className="flex justify-between w-full text-xs text-slate-500 font-medium mt-1.5 px-1">
          <span>{sorted[0]?.date.slice(5)}</span>
          <span className="font-semibold text-slate-700">
            {sorted[sorted.length - 1]?.temperature.toFixed(1)}°C
          </span>
          <span>{sorted[sorted.length - 1]?.date.slice(5)}</span>
        </div>
      )}
    </div>
  );
};

