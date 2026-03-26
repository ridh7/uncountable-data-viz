import type { ColumnDef } from "../../types/experiment.ts";

interface FilterBarProps {
  columns: ColumnDef[];
  filterColumn: string;
  filterMin: string;
  filterMax: string;
  onFilterColumnChange: (key: string) => void;
  onFilterMinChange: (value: string) => void;
  onFilterMaxChange: (value: string) => void;
  onClear: () => void;
}

function FilterBar({
  columns,
  filterColumn,
  filterMin,
  filterMax,
  onFilterColumnChange,
  onFilterMinChange,
  onFilterMaxChange,
  onClear,
}: FilterBarProps) {
  const filterableColumns = columns.filter((c) => c.type !== "meta");
  const hasFilter = filterColumn || filterMin || filterMax;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold text-(--color-text)">Filter</span>
      <select
        value={filterColumn}
        onChange={(e) => onFilterColumnChange(e.target.value)}
        className="text-sm border border-(--color-border) rounded-md px-3 py-1.5 h-9 text-(--color-text) outline-none focus:border-(--color-primary)"
      >
        <option value="">Select field..</option>
        {filterableColumns.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Min"
        value={filterMin}
        onChange={(e) => onFilterMinChange(e.target.value)}
        className="text-sm border border-(--color-border) rounded-md px-3 py-1.5 h-9 w-24 text-(--color-text) outline-none focus:border-(--color-primary)"
      />
      <span className="text-sm text-(--color-text-secondary)">to</span>
      <input
        type="number"
        placeholder="Max"
        value={filterMax}
        onChange={(e) => onFilterMaxChange(e.target.value)}
        className="text-sm border border-(--color-border) rounded-md px-3 py-1.5 h-9 w-24 text-(--color-text) outline-none focus:border-(--color-primary)"
      />
      {hasFilter && (
        <button
          onClick={onClear}
          className="text-sm text-(--color-text-secondary) hover:text-(--color-primary) transition-colors"
        >
          x Clear
        </button>
      )}
    </div>
  );
}

export default FilterBar;
