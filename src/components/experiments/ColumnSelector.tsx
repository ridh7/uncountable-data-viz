import { useState, useRef, useEffect } from "react";
import type { ColumnDef } from "../../types/experiment.ts";

interface ColumnSelectorProps {
  columns: ColumnDef[];
  visibleColumns: string[];
  onChange: (keys: string[]) => void;
}

function ColumnSelector({
  columns,
  visibleColumns,
  onChange,
}: ColumnSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectableColumns = columns.filter((c) => c.type !== "meta");
  const inputColumns = selectableColumns.filter((c) => c.type === "input");
  const outputColumns = selectableColumns.filter((c) => c.type === "output");

  const allSelected = selectableColumns.every((c) =>
    visibleColumns.includes(c.key),
  );
  const allInputsSelected = inputColumns.every((c) =>
    visibleColumns.includes(c.key),
  );
  const allOutputsSelected = outputColumns.every((c) =>
    visibleColumns.includes(c.key),
  );

  function toggleColumn(key: string) {
    if (visibleColumns.includes(key)) {
      onChange(visibleColumns.filter((k) => k !== key));
    } else {
      onChange([...visibleColumns, key]);
    }
  }

  function toggleGroup(groupColumns: ColumnDef[], allChecked: boolean) {
    if (allChecked) {
      onChange(
        visibleColumns.filter((k) => !groupColumns.some((c) => c.key === k)),
      );
    } else {
      const newKeys = groupColumns
        .map((c) => c.key)
        .filter((k) => !visibleColumns.includes(k));
      onChange([...visibleColumns, ...newKeys]);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-semibold px-4 py-2 border border-(--color-border) rounded-lg bg-white text-(--color-primary) hover:bg-(--color-background) transition-colors"
      >
        + Columns
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-64 bg-white border border-(--color-border) rounded-lg shadow-lg z-10 p-3">
          {/*All*/}
          <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-(--color-background) cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleGroup(selectableColumns, allSelected)}
              className="accent-(--color-primary)"
            />
            <span className="text-sm font-semibold text-(--color-text)">
              All
            </span>
          </label>

          <div className="border-t border-(--color-border) my-2" />

          {/*Output*/}
          <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-(--color-background) cursor-pointer">
            <input
              type="checkbox"
              checked={allOutputsSelected}
              onChange={() => toggleGroup(outputColumns, allOutputsSelected)}
              className="accent-(--color-primary)"
            />
            <span className="text-sm font-semibold text-(--color-text)">
              Outputs
            </span>
          </label>

          {outputColumns.map((c) => (
            <label
              key={c.key}
              className="flex items-center gap-2 px-2 py-1.5 pl-6 rounded hover:bg-(--color-background) cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(c.key)}
                onChange={() => toggleColumn(c.key)}
                className="accent-(--color-primary)"
              />
              <span className="text-sm text-(--color-text-secondary)">
                {c.label}
              </span>
            </label>
          ))}

          <div className="border-t border-(--color-border) my-2" />

          {/*Input*/}
          <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-(--color-background) cursor-pointer">
            <input
              type="checkbox"
              checked={allInputsSelected}
              onChange={() => toggleGroup(inputColumns, allInputsSelected)}
              className="accent-(--color-primary)"
            />
            <span className="text-sm font-semibold text-(--color-text)">
              Inputs
            </span>
          </label>

          {inputColumns.map((c) => (
            <label
              key={c.key}
              className="flex items-center gap-2 px-2 py-1.5 pl-6 rounded hover:bg-(--color-background) cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(c.key)}
                onChange={() => toggleColumn(c.key)}
                className="accent-(--color-primary)"
              />
              <span className="text-sm text-(--color-text-secondary)">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default ColumnSelector;
