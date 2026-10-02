import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  List,
  ClipboardCheck,
  FileCode2,
  Activity,
  ExternalLink,
  Search,
  Bell,
} from "lucide-react";
import Iridescence from "./Iridescence";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
  { to: "/register", label: "Register", icon: PlusCircle },
  { to: "/deployments", label: "Deployments", icon: List },
  { to: "/audit", label: "Audit Approve", icon: ClipboardCheck },
  { to: "/artifact", label: "Artifact Hash", icon: FileCode2 },
];

export default function Layout() {
  return (
    <>
      {/* ── Iridescence background: fixed, full-screen, behind everything ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Iridescence
          color={[0.024, 0.714, 0.831]}
          speed={0.6}
          amplitude={0.12}
          mouseReact={false}
        />
        {/* Very light vignette only — keep iridescence vivid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(4,2,12,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── App shell sits above the canvas ── */}
      <div className="app-shell" style={{ position: "relative", zIndex: 1 }}>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-dots">
              <span style={{ width: 10, height: 10, background: "#a78bfa", display: "block", borderRadius: 3 }} />
              <span style={{ width: 10, height: 10, background: "#f472b6", display: "block", borderRadius: "50%" }} />
              <span
                style={{
                  display: "block",
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderBottom: "11px solid #6eb5ff",
                }}
              />
            </div>
            <span className="text-sm font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
              VDeploy
            </span>
          </div>

          {/* Nav */}
          <p className="sidebar-nav-label">Menu</p>
          <nav className="space-y-0.5">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Footer info */}
          <div className="sidebar-footer">
            <div
              className="rounded-xl p-3 text-xs space-y-1"
              style={{
                background: "rgba(167,139,250,0.07)",
                border: "1px solid rgba(167,139,250,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--accent-purple)" }}>
                <Activity size={11} />
                Fail-closed
              </p>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                Every check must pass. The browser never decides trust.
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main column ── */}
        <div className="main-content">

          {/* Top bar */}
          <header className="topbar">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Sepolia Security Console
              </span>
            </div>

            <div className="topbar-search">
              <Search size={13} strokeWidth={2} />
              <input placeholder="Search deployments…" />
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(76,228,162,0.08)",
                  border: "1px solid rgba(76,228,162,0.18)",
                  color: "var(--accent-green)",
                }}
              >
                <span className="status-dot pulse-dot" style={{ background: "var(--accent-green)", width: 6, height: 6 }} />
                Sepolia
              </div>

              <button
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{ width: 34, height: 34, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                title="Notifications"
              >
                <Bell size={14} />
              </button>

              <a
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{ width: 34, height: 34, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                title="Sepolia Etherscan"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </header>

          {/* Page content */}
          <div className="page-content">
            <Outlet />
          </div>

          {/* Footer */}
          <footer
            className="text-center text-xs py-4 px-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
          >
            The browser never decides trust · Fail closed by design
          </footer>
        </div>
      </div>
    </>
  );
}
