import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { theme } from "../../theme.ts";

interface InputHistogramProps {
  keys: string[];
  bins: Record<string, number | string>[];
}

function InputHistogram({ keys, bins }: InputHistogramProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length || !hoveredKey) return null;
    const entry = hoveredKey
      ? payload.find((p: any) => p.dataKey === hoveredKey)
      : payload[0];
    if (!entry) return null;
    return (
      <div className="bg-white border border-(--color-border) rounded px-2 py-1.5 shadow text-xs">
        <p>
          {entry.dataKey}:{" "}
          <span className="font-semibold" style={{ color: entry.fill }}>
            {entry.value}
          </span>
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={bins}
        margin={{ top: 4, right: 8, bottom: 0, left: -8 }}
        barCategoryGap="20%"
        barGap={1}
      >
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: theme.colors.textSecondary }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 9, fill: theme.colors.textSecondary }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: theme.colors.background }}
          isAnimationActive={false}
        />
        {keys.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
            iconSize={8}
            iconType="square"
          />
        )}
        {keys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={theme.chartPalette[i % theme.chartPalette.length]}
            radius={[2, 2, 0, 0]}
            fillOpacity={hoveredKey && hoveredKey !== key ? 0.3 : 0.85}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default InputHistogram;
