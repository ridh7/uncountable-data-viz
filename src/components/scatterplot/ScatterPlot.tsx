import { useState, useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Experiment } from "../../types/experiment.ts";
import { getColumnDefs } from "../../utils/experiment.ts";
import { theme } from "../../theme.ts";

interface ScatterPlotProps {
  experiments: Experiment[];
}

interface DataPoint {
  x: number;
  y: number;
  experiments: Experiment[];
}

function CustomDot(props: any) {
  const { cx, cy } = props;
  const [hovered, setHovered] = useState(false);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={hovered ? 10 : 7}
      fill={hovered ? theme.colors.accent : theme.colors.primary}
      fillOpacity={0.65}
      stroke={hovered ? theme.colors.accent : theme.colors.primary}
      strokeWidth={1.5}
      style={{ cursor: "pointer", transition: "r 0.15s, fill 0.15s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
}

function ScatterPlot({ experiments }: ScatterPlotProps) {
  const columns = useMemo(() => getColumnDefs(experiments), [experiments]);
  const selectableColumns = columns.filter((c) => c.type !== "meta");

  const [xKey, setXKey] = useState(selectableColumns[0]?.key ?? "");
  const [yKey, setYKey] = useState(selectableColumns[1]?.key ?? "");

  function getValue(exp: Experiment, key: string): number {
    return exp.inputs[key] ?? exp.outputs[key] ?? 0;
  }

  const data: DataPoint[] = useMemo(() => {
    const grouped = new Map<string, DataPoint>();
    experiments.forEach((exp) => {
      const x = getValue(exp, xKey);
      const y = getValue(exp, yKey);
      const key = `${x},${y}`;
      if (grouped.has(key)) {
        grouped.get(key)!.experiments.push(exp);
      } else {
        grouped.set(key, { x, y, experiments: [exp] });
      }
    });
    return Array.from(grouped.values());
  }, [experiments, xKey, yKey]);

  function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload as DataPoint;
    const multiple = point.experiments.length > 1;
    return (
      <div className="bg-white border border-(--color-border) rounded-lg px-3 py-2.5 shadow-lg text-sm min-w-48">
        {multiple && (
          <p className="font-bold text-(--color-text) mb-1">
            {point.experiments.length} experiments at this position
          </p>
        )}
        {multiple && <div className="border-t border-(--color-border) mb-2" />}
        {point.experiments.map((exp) => (
          <div key={exp.key} className={multiple ? "mb-1" : ""}>
            <p className="font-bold text-(--color-text)">{exp.id}</p>
            <p className="text-(--color-text-secondary) text-xs">
              {exp.date.toLocaleDateString()}
            </p>
          </div>
        ))}
        <div
          className={`text-(--color-text-secondary) text-xs ${multiple ? "border-t border-(--color-border) mt-2 pt-2" : "mt-2"}`}
        >
          {xKey}:{" "}
          <span className="font-semibold text-(--color-text)">
            {point.x.toFixed(2)}
          </span>
          <span className="mx-2">·</span>
          {yKey}:{" "}
          <span className="font-semibold text-(--color-text)">
            {point.y.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  const selectClass =
    "text-sm border border-(--color-border) rounded-md px-3 h-9 text-(--color-text) outline-none focus:border-(--color-primary) bg-white";

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border border-(--color-border) rounded-t-lg border-b border-b-(--color-border)">
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-(--color-text-secondary) mb-3">
            Select any two properties to visualize their relationship across all experiments
          </p>
        </div>
        <div className="flex items-center gap-6 px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-(--color-text-secondary)">
              X Axis
            </span>
            <select
              value={xKey}
              onChange={(e) => setXKey(e.target.value)}
              className={selectClass}
            >
              {selectableColumns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-(--color-text-secondary)">
              Y Axis
            </span>
            <select
              value={yKey}
              onChange={(e) => setYKey(e.target.value)}
              className={selectClass}
            >
              {selectableColumns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-(--color-border) rounded-b-lg p-4 border-t-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
            <XAxis
              dataKey="x"
              type="number"
              name={xKey}
              label={{
                value: xKey,
                position: "bottom",
                offset: 20,
                fontSize: 12,
                fill: theme.colors.textSecondary,
              }}
              tick={{ fontSize: 11, fill: theme.colors.textSecondary }}
              tickLine={false}
              axisLine={{ stroke: theme.colors.border }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name={yKey}
              label={{
                value: yKey,
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fontSize: 12,
                fill: theme.colors.textSecondary,
              }}
              tick={{ fontSize: 11, fill: theme.colors.textSecondary }}
              tickLine={false}
              axisLine={{ stroke: theme.colors.border }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3" }}
              isAnimationActive={false}
            />
            <Scatter data={data} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScatterPlot;
