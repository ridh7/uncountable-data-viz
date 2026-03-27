import { useMemo } from "react";
import { parseExperiments } from "../utils/experiment.ts";
import ScatterPlot from "../components/scatterplot/ScatterPlot.tsx";

function ScatterPlotPage() {
  const experiments = useMemo(() => parseExperiments(), []);

  return (
    <div className="h-full flex flex-col">
      <ScatterPlot experiments={experiments} />
    </div>
  );
}

export default ScatterPlotPage;
