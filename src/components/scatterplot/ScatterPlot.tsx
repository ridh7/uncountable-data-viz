import { useState, useMemo, useRef, useCallback } from "react";
import Button from "../Button.tsx";
import { DownloadIcon } from "../icons.tsx";
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
import { getColumnDefs, getExperimentValue } from "../../utils/experiment.ts";
import { theme } from "../../theme.ts";

interface ScatterPlotProps {
  experiments: Experiment[];
}

interface DataPoint {
  x: number;
  y: number;
  experiments: Experiment[];
}

function CustomDot({ cx, cy }: { cx?: number; cy?: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      className="[r:7px] hover:[r:10px] 
      fill-(--color-primary) hover:fill-(--color-accent) 
      stroke-(--color-primary) hover:stroke-(--color-accent)
      [fill-opacity:0.65] stroke-[1.5]
      cursor-pointer transition-[r,fill,stroke] duration-150"
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
    <div className="bg-(--color-surface) border border-(--color-border) rounded-lg px-3 py-2.5 shadow-lg text-sm min-w-48">
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
  // Derive column definitions and groups — only recompute when experiments change, not on axis selection
  const columns = useMemo(() => getColumnDefs(experiments), [experiments]);
  const inputColumns = useMemo(
    () => columns.filter((c) => c.type === "input"),
    [columns],
  );
  const outputColumns = useMemo(
    () => columns.filter((c) => c.type === "output"),
    [columns],
  );

  const [xKey, setXKey] = useState(inputColumns[0]?.key ?? "");
  const [yKey, setYKey] = useState(outputColumns[0]?.key ?? "");

  // Recompute grouped data points only when experiments or selected axes change
  const data: DataPoint[] = useMemo(() => {
    const grouped = new Map<string, DataPoint>();
    experiments.forEach((exp) => {
      const x = getExperimentValue(exp, xKey);
      const y = getExperimentValue(exp, yKey);
      if (x === null || y === null) return;
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

  // SVG → Blob → Image → Canvas → PNG download
  // 1. Serialize the Recharts SVG to a string
  // 2. Create a Blob URL so it can be loaded as an image
  // 3. Draw the image onto a canvas (scaled for retina displays)
  // 4. Convert canvas to PNG data URL and trigger download
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
    img.onerror = () => {
      URL.revokeObjectURL(url);
      console.error("Failed to load SVG for PNG export");
    };
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
    "text-sm border border-(--color-border) rounded-md px-3 h-9 text-(--color-text) outline-none focus:border-(--color-primary) bg-(--color-surface)";

  return (
    <div className="flex flex-col h-full">
      <div className="bg-(--color-surface) border border-(--color-border) rounded-t-lg border-b border-b-(--color-border)">
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-(--color-text-secondary) mb-3">
            Select any two properties to visualize their relationship across all
            experiments.
          </p>
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-(--color-text)">
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
              <span className="text-sm font-semibold text-(--color-text)">
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
          <Button onClick={exportPng}>
            <DownloadIcon />
          </Button>
        </div>
      </div>

      <div
        ref={chartRef}
        className="flex-1 min-h-0 bg-(--color-surface) border border-(--color-border) rounded-b-lg p-4 border-t-0"
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
            <Scatter data={data} shape={CustomDot} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScatterPlot;
