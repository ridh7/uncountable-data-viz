# Uncountable Data Viz

A front-end data visualization app that provides three views for exploring a dataset of materials science experiments, each with a set of input parameters and measured outputs.

## Views

### Experiments

A sortable, filterable table of all experiments. Columns can be toggled on/off via a column selector. Input and output columns are visually distinguished.

### Scatter Plot

An interactive scatter plot for exploring relationships between any two columns (inputs or outputs). Axes are grouped by type (Inputs / Outputs) in the selector dropdowns.

### Histograms

Filter experiments by an output measurement and value range, then see the distribution of input parameters across matching experiments. Inputs are grouped by category (Polymers, Fillers, Plasticizers, etc.) and rendered as grouped bar histograms.

## Stack

- **React 19** + **TypeScript**
- **Vite** for bundling and dev server
- **Tailwind CSS v4** for styling
- **Recharts** for charts
- **React Router v7** for navigation

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

```bash
# Type-check and build for production
npm run build

# Preview the production build
npm run preview
```
