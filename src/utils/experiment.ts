import rawData from "../data/UncountableFrontEndDataset.json";
import type { Experiment, ColumnDef } from "../types/experiment.ts";

export function parseExperiments(): Experiment[] {
  return Object.entries(rawData).map(([key, value]) => {
    const [datePart, ...rest] = key.split("_");
    const date = new Date(
      parseInt(datePart.slice(0, 4)),
      parseInt(datePart.slice(4, 6)) - 1,
      parseInt(datePart.slice(6, 8)),
    );
    return {
      key,
      id: rest.join("_"),
      date,
      inputs: value.inputs as Record<string, number>,
      outputs: value.outputs as Record<string, number>,
    };
  });
}

export function getColumnDefs(experiments: Experiment[]): ColumnDef[] {
  if (experiments.length === 0) return [];
  const first = experiments[0];
  const meta: ColumnDef[] = [
    {
      key: "id",
      label: "Experiment",
      type: "meta",
    },
    { key: "date", label: "Date", type: "meta" },
  ];
  const inputs: ColumnDef[] = Object.keys(first.inputs).map((k) => ({
    key: k,
    label: k,
    type: "input",
  }));
  const outputs: ColumnDef[] = Object.keys(first.outputs).map((k) => ({
    key: k,
    label: k,
    type: "output",
  }));
  return [...meta, ...inputs, ...outputs];
}

export function getCellValue(
  experiment: Experiment,
  key: string,
): string | number {
  if (key === "id") return experiment.id;
  if (key === "date") return experiment.date.toLocaleDateString();
  if (key in experiment.inputs) return experiment.inputs[key];
  if (key in experiment.outputs) return experiment.outputs[key];
  return "—";
}
