import { useMemo } from "react";
import { parseExperiments } from "../utils/experiment.ts";
import ExperimentsTable from "../components/experiments/ExperimentsTable.tsx";

function ExperimentsPage() {
  // Parse once on mount — empty deps means this never recomputes across re-renders
  const experiments = useMemo(() => parseExperiments(), []);

  return (
    <div className="h-full flex flex-col">
      <ExperimentsTable experiments={experiments} />
    </div>
  );
}

export default ExperimentsPage;
