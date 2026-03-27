import { useState, useMemo } from "react";
import { parseExperiments, getColumnDefs } from "../utils/experiment.ts";
import {
  INPUT_GROUPS,
  HISTOGRAM_ROWS,
  computeGroupBins,
} from "../utils/categories.ts";
import InputHistogram from "../components/histograms/InputHistogram.tsx";
import Button from "../components/Button.tsx";

function HistogramsPage() {
  // Parse once on mount — empty deps means this never recomputes across re-renders
  const experiments = useMemo(() => parseExperiments(), []);
  // Derive column definitions only when experiments change
  const columns = useMemo(() => getColumnDefs(experiments), [experiments]);
  // Filter to output columns only — avoids re-filtering on every render
  const outputColumns = useMemo(
    () => columns.filter((c) => c.type === "output"),
    [columns],
  );

  const [outputKey, setOutputKey] = useState(outputColumns[0]?.key ?? "");
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");

  // Only re-filter when output key or range changes — not on unrelated re-renders
  const matched = useMemo(() => {
    return experiments.filter((exp) => {
      const val = exp.outputs[outputKey];
      if (val === undefined) return false;
      const min = parseFloat(rangeMin);
      const max = parseFloat(rangeMax);
      if (rangeMin && !isNaN(min) && val < min) return false;
      if (rangeMax && !isNaN(max) && val > max) return false;
      return true;
    });
  }, [experiments, outputKey, rangeMin, rangeMax]);

  // Recompute bins only when matched experiments change — expensive nested loop
  const groupedBins = useMemo(() => {
    const result = new Map<string, ReturnType<typeof computeGroupBins>>();
    INPUT_GROUPS.forEach((group) =>
      result.set(
        group.label,
        computeGroupBins(
          Object.fromEntries(
            group.keys.map((k) => [
              k,
              matched.flatMap((e) => (k in e.inputs ? [e.inputs[k]] : [])),
            ]),
          ),
        ),
      ),
    );
    return result;
  }, [matched]);

  const inputClass =
    "text-sm border border-(--color-border) rounded-md px-3 h-9 text-(--color-text) outline-none focus:border-(--color-primary) bg-(--color-surface)";

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Toolbar */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-lg px-4 pt-3 pb-3 shrink-0 sticky top-0 z-10">
        <p className="text-xs text-(--color-text-secondary) mb-3">
          Select an output measurement and a value range to see which input
          combinations produced experiments in that range. The x-axis shows
          input values, the y-axis shows experiment count.
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-(--color-text)">
                Measurement
              </span>
              <select
                value={outputKey}
                onChange={(e) => setOutputKey(e.target.value)}
                className={inputClass}
              >
                {outputColumns.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-(--color-text)">
                Range
              </span>
              <input
                type="number"
                placeholder="Min"
                value={rangeMin}
                onChange={(e) => setRangeMin(e.target.value)}
                className={`${inputClass} w-24`}
              />
              <span className="text-(--color-text-secondary)">–</span>
              <input
                type="number"
                placeholder="Max"
                value={rangeMax}
                onChange={(e) => setRangeMax(e.target.value)}
                className={`${inputClass} w-24`}
              />
            </div>
            {(rangeMin || rangeMax) && (
              <Button
                onClick={() => {
                  setRangeMin("");
                  setRangeMax("");
                }}
                variant="secondary"
              >
                Clear
              </Button>
            )}
          </div>
          <span className="text-sm text-(--color-text-secondary)">
            <span className="font-semibold text-(--color-text)">
              {matched.length}
            </span>{" "}
            / {experiments.length} experiments match
          </span>
        </div>
      </div>

      {/* Histogram rows */}
      {HISTOGRAM_ROWS.map((row) => (
        <div key={row.map((g) => g.label).join(",")} className="flex gap-4">
          {row.map((group) => (
            <div
              key={group.label}
              className="flex-1 bg-(--color-surface) border border-(--color-border) rounded-lg p-4"
            >
              <h3 className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide mb-3">
                {group.label}
              </h3>
              <InputHistogram
                keys={group.keys}
                bins={groupedBins.get(group.label)!}
              />
            </div>
          ))}
        </div>
      ))}
      <div className="pb-4" />
    </div>
  );
}

export default HistogramsPage;
