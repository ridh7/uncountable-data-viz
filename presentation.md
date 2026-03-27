---
marp: true
theme: default
paginate: true
style: |
  :root {
    --color-primary: #2328AF;
    --color-accent: #F59E0B;
    --color-bg: #F8F9FC;
    --color-text: #1A1A2E;
  }
  section {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  }
  section::before {
    content: '';
    background-image: url('src/assets/logo.png');
    background-size: 36px 36px;
    background-repeat: no-repeat;
    width: 36px;
    height: 36px;
    position: absolute;
    bottom: 24px;
    left: 40px;
  }
  h1, h2, h3 {
    color: var(--color-primary);
  }
  a {
    color: var(--color-primary);
  }
  strong {
    color: var(--color-primary);
  }
  .accent {
    color: var(--color-accent);
  }
  section.title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: var(--color-bg);
    color: var(--color-primary);
  }
  section.title h1, section.title h2, section.title h3 {
    color: var(--color-primary);
  }
  section.title::after {
    display: none;
  }
  table {
    font-size: 0.85em;
  }
  th {
    background: var(--color-primary);
    color: white;
  }
  code {
    background: #E8E8F0;
    color: var(--color-primary);
    padding: 2px 6px;
    border-radius: 4px;
  }
---

<!-- _class: title -->

# Uncountable Take-Home

### Interactive Explorer for R&D Experiment Data

---

## Why Visualization Matters for R&D

- Materials science experiments generate **hundreds of input/output variables**
- Spreadsheets and raw data make it hard to spot trends or correlations
- Interactive visualizations let researchers:
  - **Filter** experiments by parameter ranges instantly
  - **Compare** input distributions across experiment groups
  - **Discover** relationships between inputs and outputs visually
- Faster insight = fewer wasted experiments = **lower R&D costs**

---

## Overview

The app provides three complementary views for exploring experiment data:

| View                  | Purpose                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| **Experiments Table** | Browse, sort, filter, and paginate all experiments with configurable columns |
| **Scatter Plot**      | Plot any two variables against each other to discover correlations           |
| **Histograms**        | Compare input distributions across categorized groups side-by-side           |

Each view shares the same parsed data layer and theme system.

---

## Tech Stack

| Layer          | Choice          | Why                                                  |
| -------------- | --------------- | ---------------------------------------------------- |
| **Framework**  | React 19        | Component model, hooks, large ecosystem              |
| **Language**   | TypeScript      | Type safety, better DX, catch errors at compile time |
| **Build Tool** | Vite            | Fast HMR, ES module native, minimal config           |
| **Styling**    | Tailwind CSS v4 | Utility-first, no context switching, small bundle    |
| **Charts**     | Recharts        | Declarative, composable, built on D3 primitives      |
| **Routing**    | React Router v7 | Standard SPA routing with nested layouts             |

---

## Assumptions

- **All input/output values are numbers** — `as Record<string, number>` without runtime validation
- **Key format is `YYYYMMDD_<id>`** — date parsing relies on the first 8 characters being a valid date
- **Small dataset, client-side processing** — all filtering, sorting, and binning is synchronous in-memory
- **Data is static** — no live reload or API polling
- **Chart div contains exactly one SVG** — PNG export grabs the first `<svg>` in the wrapper

---

## Architecture Decisions

- **Centralized theming** via CSS custom properties injected from `theme.ts` — enables easy rebranding and dark mode
- **Data parsing separated from UI** — `utils/experiment.ts` handles all transforms; components stay pure
- **Reusable components** — shared `Button`, icon components, `FilterBar`, `ColumnSelector`
- **Memoization** at the right level — expensive computations (`useMemo`), stable references (`useCallback`)
- **No unnecessary dependencies** — 2 SVG icons instead of an icon library; custom binning instead of a stats library

---

## If I Had More Time

- **Dark mode** — theme system is already set up for it
- **Additional filters** — the ability to filter on multiple properties at the same time
- **More chart types** — box plots, heatmaps, parallel coordinates
- **Backend API** — server-side pagination, filtering, and sorting
- **Testing** — unit tests for utils, integration tests for key flows
- **Accessibility** — keyboard navigation, ARIA labels, screen reader support
- **Export** — CSV/PDF export for filtered data and charts

---

<!-- _class: title -->

# Demo
