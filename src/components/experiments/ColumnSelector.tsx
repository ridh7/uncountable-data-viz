import { useState, useRef, useEffect } from "react";
import type { ColumnDef } from "../../types/experiment.ts";
import Button from "../Button.tsx";

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
      <Button onClick={() => setOpen((o) => !o)} variant="secondary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Columns
      </Button>

      {open && (
        <div className="absolute right-0 top-10 w-64 bg-white border border-(--color-border) rounded-lg shadow-lg z-10 p-3 max-h-80 overflow-y-auto">
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
