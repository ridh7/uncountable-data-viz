import { useMemo } from "react";
import { parseExperiments } from "../utils/experiment.ts";
import ExperimentsTable from "../components/experiments/ExperimentsTable.tsx";

function ExperimentsPage() {
  const experiments = useMemo(() => parseExperiments(), []);

  return (
    <div className="h-full flex flex-col">
      <ExperimentsTable experiments={experiments} />
    </div>
  );
}

export default ExperimentsPage;
