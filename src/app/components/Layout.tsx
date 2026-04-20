import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Activity, Lightbulb, FolderKanban } from "lucide-react";
import svgPaths from "../../imports/MidinerocreceV6DeudaDeExperiencia/svg-curwnqj0xs";

// ─────────────────────────────────────────────
// Galicia Logo
// ─────────────────────────────────────────────
function GaliciaLogo() {
  return (
    <div className="p-1 shrink-0">
      <div className="overflow-hidden" style={{ width: 32, height: 32 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d={svgPaths.p216f4700} fill="#FA6400" />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Nav Item
// ─────────────────────────────────────────────
interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavItem({ label, icon, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start w-full rounded overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div
        className="flex items-center gap-2 w-full"
        style={{
          padding: "10px 8px 10px 12px",
          background: active ? "#fff0e5" : "transparent",
          borderRadius: 4,
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
          <div style={{ width: 16, height: 16 }}>{icon}</div>
        </div>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: active ? 700 : 600,
            fontSize: 14,
            lineHeight: "20px",
            color: active ? "#fa6400" : "#666",
            letterSpacing: "0.14px",
            flex: 1,
            textAlign: "left",
            whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// Layout (NavBar + Sidebar + Outlet)
// ─────────────────────────────────────────────
export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const active = (path: string) => location.pathname === path;

  return (
    <div
      className="relative size-full"
      style={{ background: "#f4f4f4", minWidth: 1366 }}
    >
      {/* ── NavBar ── */}
      <div
        className="absolute flex items-center gap-4 left-0 right-0 top-0"
        style={{
          height: 64,
          background: "#fff",
          padding: 16,
          borderBottom: "1px solid #ccc",
          zIndex: 30,
        }}
      >
        <GaliciaLogo />
        <div className="flex-1" />
      </div>

      {/* ── Left Sidebar ── */}
      <div
        className="absolute flex flex-col left-0"
        style={{
          top: 64,
          bottom: 2,
          width: 156,
          background: "#f4f4f4",
          borderRight: "1px solid #ccc",
          zIndex: 20,
        }}
      >
        <div className="flex flex-col gap-1 p-2">
          <NavItem
            label="Inicio"
            icon={
              <Home
                size={16}
                color={active("/") ? "#fa6400" : "#666"}
              />
            }
            active={active("/")}
            onClick={() => navigate("/")}
          />
          <NavItem
            label="Diagnóstico"
            icon={
              <Activity
                size={16}
                color={active("/diagnostico") ? "#fa6400" : "#666"}
              />
            }
            active={active("/diagnostico")}
            onClick={() => navigate("/diagnostico")}
          />
          <NavItem
            label="Insights"
            icon={
              <Lightbulb
                size={16}
                color={active("/insights") ? "#fa6400" : "#666"}
              />
            }
            active={active("/insights")}
            onClick={() => navigate("/insights")}
          />
          <NavItem
            label="Proyectos"
            icon={
              <FolderKanban
                size={16}
                color={active("/proyectos") ? "#fa6400" : "#666"}
              />
            }
            active={active("/proyectos")}
            onClick={() => navigate("/proyectos")}
          />
        </div>
      </div>

      {/* ── Content area (child routes render here) ── */}
      <div
        className="absolute overflow-hidden"
        style={{ top: 64, left: 156, right: 0, bottom: 0 }}
      >
        <Outlet />
      </div>
    </div>
  );
}
