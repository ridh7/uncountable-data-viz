export interface Experiment {
  key: string;
  id: string;
  date: Date;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
}

export interface ColumnDef {
  key: string;
  label: string;
  type: "meta" | "input" | "output";
}
