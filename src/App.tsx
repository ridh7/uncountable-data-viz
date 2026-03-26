import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import ExperimentsPage from "./pages/ExperimentsPage.tsx";
import ScatterPlotPage from "./pages/ScatterPlotPage.tsx";
import ComparePage from "./pages/ComparePage.tsx";

function App() {
  return (
    <div className="h-screen flex flex-col bg-(--color-background)">
      <Navbar />
      <main className="flex-1 min-h-0 p-8 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/experiments" replace />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/scatter-plot" element={<ScatterPlotPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
