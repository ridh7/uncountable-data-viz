import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { label: "Experiments", to: "/experiments" },
  { label: "Scatter Plot", to: "/scatter-plot" },
  { label: "Histograms", to: "/histograms" },
];

function Navbar() {
  return (
    <nav className="w-full bg-(--color-surface) border-b border-(--color-primary) px-8 h-14 flex items-center">
      <div className="flex-1">
        <NavLink to="/experiments">
          <img src={logo} alt="Uncountable" className="h-8 w-8" />
        </NavLink>
      </div>
      <div className="flex gap-8">
        {NAV_ITEMS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors ${isActive ? "text-(--color-primary) border-b-2 border-(--color-primary) pb-0.5" : "text-(--color-text-secondary) hover:text-(--color-primary)"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
      <div className="flex-1" />
    </nav>
  );
}

export default Navbar;
