export interface InputGroup {
  label: string;
  keys: string[];
}

export const INPUT_GROUPS: InputGroup[] = [
  {
    label: "Polymers",
    keys: ["Polymer 1", "Polymer 2", "Polymer 3", "Polymer 4"],
  },
  {
    label: "Fillers",
    keys: [
      "Carbon Black High Grade",
      "Carbon Black Low Grade",
      "Silica Filler 1",
      "Silica Filler 2",
    ],
  },
  {
    label: "Plasticizers",
    keys: ["Plasticizer 1", "Plasticizer 2", "Plasticizer 3"],
  },
  {
    label: "Co-Agents",
    keys: ["Co-Agent 1", "Co-Agent 2", "Co-Agent 3"],
  },
  {
    label: "Curing Agents",
    keys: ["Curing Agent 1", "Curing Agent 2"],
  },
  { label: "Antioxidant", keys: ["Antioxidant"] },
  { label: "Coloring Pigment", keys: ["Coloring Pigment"] },
  { label: "Oven Temperature", keys: ["Oven Temperature"] },
];

// keyValues: { "Polymer 1": [v1, v2, ...], "Polymer 2": [...], ... }
function niceStep(roughStep: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function niceLabel(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

// Returns bins with shared nice x-axis range across all keys
export function computeGroupBins(
  keyValues: Record<string, number[]>,
): Record<string, number | string>[] {
  const allValues = Object.values(keyValues).flat();
  if (!allValues.length) return [];

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);

  if (rawMin === rawMax) {
    const bin: Record<string, number | string> = { label: niceLabel(rawMin) };
    Object.entries(keyValues).forEach(([k, vals]) => { bin[k] = vals.length; });
    return [bin];
  }

  const step = niceStep((rawMax - rawMin) / 5);
  const min = Math.floor(rawMin / step) * step;
  const max = Math.ceil(rawMax / step) * step;
  const binCount = Math.round((max - min) / step);

  return Array.from({ length: binCount }, (_, i) => {
    const lo = min + i * step;
    const hi = lo + step;
    const bin: Record<string, number | string> = { label: niceLabel(lo) };
    Object.entries(keyValues).forEach(([k, vals]) => {
      bin[k] = vals.filter((v) => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
    });
    return bin;
  });
}
