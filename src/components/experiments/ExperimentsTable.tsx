import { useState, useMemo } from "react";
import type { Experiment, ColumnDef } from "../../types/experiment.ts";
import { getColumnDefs, getCellValue } from "../../utils/experiment.ts";
import FilterBar from "./FilterBar.tsx";
import ColumnSelector from "./ColumnSelector.tsx";

interface ExperimentTableProps {
  experiments: Experiment[];
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_VISIBLE: ColumnDef["type"][] = ["meta", "output"];

function isRightAligned(col: ColumnDef) {
  return col.key !== "id";
}

function ExperimentsTable({ experiments }: ExperimentTableProps) {
  // Avoid recomputing column definitions on every render — only when experiments change
  const columns = useMemo(() => getColumnDefs(experiments), [experiments]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columns.filter((c) => DEFAULT_VISIBLE.includes(c.type)).map((c) => c.key),
  );
  const [sortKey, setSortKey] = useState<string>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterColumn, setFilterColumn] = useState("");
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function handleFilterClear() {
    setFilterColumn("");
    setFilterMin("");
    setFilterMax("");
    setPage(1);
  }

  function handleSort(key: string) {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(1);
  }

  // Only re-filter when filter inputs change — not on sort, page, or column toggle
  const filtered = useMemo(() => {
    return experiments.filter((exp) => {
      if (!filterColumn) return true;
      const val = exp.outputs[filterColumn] ?? exp.inputs[filterColumn];
      if (val === undefined) return false;
      const min = parseFloat(filterMin);
      const max = parseFloat(filterMax);
      if (filterMin && !isNaN(min) && val < min) return false;
      if (filterMax && !isNaN(max) && val > max) return false;
      return true;
    });
  }, [experiments, filterColumn, filterMin, filterMax]);

  // Only re-sort when filtered data or sort params change — not on page or column toggle
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = sortKey === "date" ? a.date.getTime() : getCellValue(a, sortKey);
      const vb = sortKey === "date" ? b.date.getTime() : getCellValue(b, sortKey);
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return a.id.localeCompare(b.id);
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  // Convert array to Set for O(1) column lookups instead of O(n) includes()
  const visibleSet = useMemo(() => new Set(visibleColumns), [visibleColumns]);
  // Only recompute when columns or visibility changes — not on sort or page
  const displayedColumns = useMemo(
    () => columns.filter((c) => visibleSet.has(c.key)),
    [columns, visibleSet],
  );

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="bg-(--color-surface) border border-(--color-border) rounded-t-lg border-b-0">
        <div className="flex items-center justify-between px-4 py-3">
          <FilterBar
            columns={columns}
            filterColumn={filterColumn}
            filterMin={filterMin}
            filterMax={filterMax}
            onFilterColumnChange={(k) => {
              setFilterColumn(k);
              setPage(1);
            }}
            onFilterMinChange={(v) => {
              setFilterMin(v);
              setPage(1);
            }}
            onFilterMaxChange={(v) => {
              setFilterMax(v);
              setPage(1);
            }}
            onClear={handleFilterClear}
          />
          <ColumnSelector
            columns={columns}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
        </div>
      </div>
      <div className="bg-(--color-surface) border border-(--color-border) rounded-b-lg overflow-x-auto overflow-y-auto max-h-[calc(100vh-160px)] -mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border) bg-(--color-background) sticky top-0">
              <th className="px-4 py-3 text-right text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide whitespace-nowrap w-10">
                #
              </th>
              {displayedColumns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 ${isRightAligned(col) ? "text-right" : "text-left"} text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide cursor-pointer hover:text-(--color-primary) whitespace-nowrap select-none`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <span>{sortAsc ? "↑" : "↓"}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((exp, i) => (
              <tr
                key={exp.key}
                className="border-b border-(--color-border) last:border-0 hover:bg-(--color-background) transition-colors"
              >
                <td className="px-4 py-3 text-right text-xs text-(--color-text-secondary) w-10">
                  {(page - 1) * pageSize + i + 1}
                </td>
                {displayedColumns.map((col) => {
                  const value = getCellValue(exp, col.key);
                  const isZero = typeof value === "number" && value === 0;
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 whitespace-nowrap ${isRightAligned(col) ? "text-right" : "text-left"} ${
                        col.key === "id"
                          ? "font-semibold text-(--color-text)"
                          : ""
                      } ${
                        isZero ? "text-(--color-muted)" : "text-(--color-text)"
                      }`}
                    >
                      {typeof value === "number" ? value.toFixed(1) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*Pagination*/}
      <div className="flex items-center justify-between text-sm text-(--color-text-secondary)">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => {
                setPageSize(size);
                setPage(1);
              }}
              className={`px-2 py-0.5 rounded ${pageSize === size ? "bg-(--color-primary) text-(--color-on-primary) font-semibold" : "hover:text-(--color-primary)"}`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span>
            {filtered.length === 0
              ? "No experiments match"
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length} experiments`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-(--color-border) disabled:opacity-30 hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
            >
              ←
            </button>
            <span className="px-2 py-1">
              {totalPages === 0 ? "0 / 0" : `${page} / ${totalPages}`}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || totalPages === 0}
              className="px-3 py-1 rounded border border-(--color-border) disabled:opacity-30 hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperimentsTable;
