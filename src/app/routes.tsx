import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { DiagnosticoPage } from "./pages/DiagnosticoPage";
import { InsightsPage } from "./pages/InsightsPage";
import { ProyectosPage } from "./pages/ProyectosPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/diagnostico" replace /> },
      { path: "diagnostico", Component: DiagnosticoPage },
      { path: "insights", Component: InsightsPage },
      { path: "proyectos",   Component: ProyectosPage   },
    ],
  },
]);
