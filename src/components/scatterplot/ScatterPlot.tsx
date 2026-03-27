import { useState, useMemo, useRef, useCallback } from "react";
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

function CustomDot(props: { cx?: number; cy?: number }) {
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

interface ScatterTooltipProps {
  active?: boolean;
  payload?: { payload: DataPoint }[];
  xKey: string;
  yKey: string;
}

function ScatterTooltip({ active, payload, xKey, yKey }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
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

function ScatterPlot({ experiments }: ScatterPlotProps) {
  const columns = useMemo(() => getColumnDefs(experiments), [experiments]);
  const inputColumns = columns.filter((c) => c.type === "input");
  const outputColumns = columns.filter((c) => c.type === "output");

  const [xKey, setXKey] = useState(inputColumns[0]?.key ?? "");
  const [yKey, setYKey] = useState(outputColumns[0]?.key ?? "");

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

  const chartRef = useRef<HTMLDivElement>(null);

  const exportPng = useCallback(() => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const { width, height } = svg.getBoundingClientRect();
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `scatter_${xKey}_vs_${yKey}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }, [xKey, yKey]);

  const selectClass =
    "text-sm border border-(--color-border) rounded-md px-3 h-9 text-(--color-text) outline-none focus:border-(--color-primary) bg-white";

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border border-(--color-border) rounded-t-lg border-b border-b-(--color-border)">
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-(--color-text-secondary) mb-3">
            Select any two properties to visualize their relationship across all
            experiments.
          </p>
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-(--color-text-secondary)">
                X-Axis
              </span>
              <select
                value={xKey}
                onChange={(e) => setXKey(e.target.value)}
                className={selectClass}
              >
                <optgroup label="Inputs">
                  {inputColumns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outputs">
                  {outputColumns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-(--color-text-secondary)">
                Y-Axis
              </span>
              <select
                value={yKey}
                onChange={(e) => setYKey(e.target.value)}
                className={selectClass}
              >
                <optgroup label="Inputs">
                  {inputColumns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outputs">
                  {outputColumns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
          <button
            onClick={exportPng}
            className="flex items-center gap-1.5 text-sm font-medium rounded-md px-3 h-9 text-white bg-(--color-primary) hover:opacity-90 active:opacity-80 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={chartRef}
        className="flex-1 min-h-0 bg-white border border-(--color-border) rounded-b-lg p-4 border-t-0"
      >
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
              content={<ScatterTooltip xKey={xKey} yKey={yKey} />}
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
