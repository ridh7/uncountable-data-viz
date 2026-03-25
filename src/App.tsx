import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ExperimentsPage from "./pages/ExperimentsPage";
import ScatterplotsPage from "./pages/ScatterplotsPage";
import ComparePage from "./pages/ComparePage";

function App() {
  return (
    <div className="min-h-screen bg-(--color-background)">
      <Navbar />
      <main className="p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/experiments" replace />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/scatter-plots" element={<ScatterplotsPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
