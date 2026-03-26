import { useState, useMemo } from "react";
import { parseExperiments } from "../utils/experiment.ts";
import { getColumnDefs } from "../utils/experiment.ts";
import { INPUT_GROUPS, computeGroupBins } from "../utils/categories.ts";
import InputHistogram from "../components/histograms/InputHistogram.tsx";

function HistogramsPage() {
  const experiments = useMemo(() => parseExperiments(), []);
  const columns = useMemo(() => getColumnDefs(experiments), [experiments]);
  const outputColumns = columns.filter((c) => c.type === "output");

  const [outputKey, setOutputKey] = useState(outputColumns[0]?.key ?? "");
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");

  const matched = useMemo(() => {
    return experiments.filter((exp) => {
      const val = exp.outputs[outputKey];
      if (val === undefined) return false;
      if (rangeMin && val < parseFloat(rangeMin)) return false;
      if (rangeMax && val > parseFloat(rangeMax)) return false;
      return true;
    });
  }, [experiments, outputKey, rangeMin, rangeMax]);

  const inputClass =
    "text-sm border border-(--color-border) rounded-md px-3 h-9 text-(--color-text) outline-none focus:border-(--color-primary) bg-white";

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Toolbar */}
      <div className="bg-white border border-(--color-border) rounded-lg px-4 pt-3 pb-3 shrink-0 sticky top-0 z-10">
        <p className="text-xs text-(--color-text-secondary) mb-3">
          Select an output measurement and a value range to see which input combinations produced experiments in that range. The x-axis shows input values, the y-axis shows experiment count.
        </p>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-(--color-text-secondary)">
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
          <span className="text-sm font-semibold text-(--color-text-secondary)">
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
        <span className="text-sm text-(--color-text-secondary)">
          <span className="font-semibold text-(--color-text)">
            {matched.length}
          </span>{" "}
          / {experiments.length} experiments match
        </span>
        </div>
      </div>

      {/* Histogram rows */}
      {[
        [INPUT_GROUPS[0], INPUT_GROUPS[1]],
        [INPUT_GROUPS[2], INPUT_GROUPS[3], INPUT_GROUPS[4]],
        [INPUT_GROUPS[5], INPUT_GROUPS[6], INPUT_GROUPS[7]],
      ].map((row, ri) => (
        <div key={ri} className="flex gap-4">
          {row.map((group) => (
            <div
              key={group.label}
              className="flex-1 bg-white border border-(--color-border) rounded-lg p-4"
            >
              <h3 className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide mb-3">
                {group.label}
              </h3>
              <InputHistogram
                keys={group.keys}
                bins={computeGroupBins(
                  Object.fromEntries(
                    group.keys.map((k) => [k, matched.map((e) => e.inputs[k] ?? 0)])
                  )
                )}
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
