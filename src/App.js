import { useState, useEffect, useRef } from "react";

const ROLES = { EMPLOYEE: "employee", MANAGER: "manager", ADMIN: "admin" };

const THRUST_AREAS = [
  "Revenue Growth",
  "Customer Experience",
  "Operational Excellence",
  "People Development",
  "Innovation & Technology",
  "Compliance & Risk",
  "Cost Optimisation",
  "Strategic Partnerships",
];

const UOM_TYPES = [
  "Numeric (Min)",
  "Numeric (Max)",
  "%  (Min)",
  "% (Max)",
  "Timeline",
  "Zero-Based",
];

const QUARTERS = [
  "Q1 (July)",
  "Q2 (October)",
  "Q3 (January)",
  "Q4 (March/April)",
];

const INITIAL_GOALS = [
  {
    id: 1,
    employeeId: "emp1",
    title: "Increase Sales Revenue",
    thrust: "Revenue Growth",
    uom: "Numeric (Min)",
    target: 5000000,
    weight: 30,
    status: "approved",
    q1: 1200000,
    q2: 2600000,
    q3: null,
    q4: null,
    q1status: "On Track",
    q2status: "On Track",
  },
  {
    id: 2,
    employeeId: "emp1",
    title: "Reduce Customer Churn",
    thrust: "Customer Experience",
    uom: "% (Max)",
    target: 5,
    weight: 25,
    status: "approved",
    q1: 6.2,
    q2: 5.1,
    q3: null,
    q4: null,
    q1status: "On Track",
    q2status: "On Track",
  },
  {
    id: 3,
    employeeId: "emp1",
    title: "Launch New Product Feature",
    thrust: "Innovation & Technology",
    uom: "Timeline",
    target: "2024-09-30",
    weight: 20,
    status: "approved",
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q1status: "On Track",
  },
  {
    id: 4,
    employeeId: "emp1",
    title: "Zero Safety Incidents",
    thrust: "Compliance & Risk",
    uom: "Zero-Based",
    target: 0,
    weight: 10,
    status: "approved",
    q1: 0,
    q2: 0,
    q3: null,
    q4: null,
    q1status: "Completed",
    q2status: "Completed",
  },
  {
    id: 5,
    employeeId: "emp1",
    title: "Complete Leadership Training",
    thrust: "People Development",
    uom: "% (Min)",
    target: 100,
    weight: 15,
    status: "approved",
    q1: 40,
    q2: 75,
    q3: null,
    q4: null,
    q1status: "On Track",
    q2status: "On Track",
  },
  {
    id: 6,
    employeeId: "emp2",
    title: "Improve NPS Score",
    thrust: "Customer Experience",
    uom: "Numeric (Min)",
    target: 75,
    weight: 40,
    status: "pending",
    q1: null,
    q2: null,
    q3: null,
    q4: null,
  },
  {
    id: 7,
    employeeId: "emp2",
    title: "Reduce Operational Costs",
    thrust: "Cost Optimisation",
    uom: "% (Max)",
    target: 10,
    weight: 35,
    status: "pending",
    q1: null,
    q2: null,
    q3: null,
    q4: null,
  },
  {
    id: 8,
    employeeId: "emp2",
    title: "Team Upskilling Program",
    thrust: "People Development",
    uom: "% (Min)",
    target: 80,
    weight: 25,
    status: "pending",
    q1: null,
    q2: null,
    q3: null,
    q4: null,
  },
];

const USERS = {
  emp1: {
    name: "Arjun Mehta",
    role: ROLES.EMPLOYEE,
    managerId: "mgr1",
    dept: "Sales",
    avatar: "AM",
  },
  emp2: {
    name: "Priya Sharma",
    role: ROLES.EMPLOYEE,
    managerId: "mgr1",
    dept: "Operations",
    avatar: "PS",
  },
  mgr1: {
    name: "Rahul Verma",
    role: ROLES.MANAGER,
    dept: "Sales & Ops",
    avatar: "RV",
  },
  admin1: { name: "Neha Joshi", role: ROLES.ADMIN, dept: "HR", avatar: "NJ" },
};

const computeProgress = (goal) => {
  const latest = goal.q2 ?? goal.q1;
  if (latest === null || latest === undefined) return null;
  if (goal.uom === "Zero-Based") return goal.q1 === 0 ? 100 : 0;
  if (goal.uom === "Timeline") return null;
  if (goal.uom.includes("Max"))
    return Math.min(100, Math.round((goal.target / latest) * 100));
  return Math.min(100, Math.round((latest / goal.target) * 100));
};

const avatarColors = {
  AM: "#7C3AED",
  PS: "#059669",
  RV: "#DC2626",
  NJ: "#D97706",
};

function Avatar({ code, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColors[code] || "#6B7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        letterSpacing: "0.5px",
      }}
    >
      {code}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    approved: { bg: "#D1FAE5", color: "#065F46", label: "Approved" },
    pending: { bg: "#FEF3C7", color: "#92400E", label: "Pending Review" },
    rejected: { bg: "#FEE2E2", color: "#991B1B", label: "Needs Revision" },
    "On Track": { bg: "#DBEAFE", color: "#1E40AF", label: "On Track" },
    Completed: { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
    "Not Started": { bg: "#F3F4F6", color: "#374151", label: "Not Started" },
  };
  const c = cfg[status] || cfg["Not Started"];
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}

function ProgressBar({ value, size = "sm" }) {
  if (value === null)
    return <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>;
  const color = value >= 80 ? "#10B981" : value >= 50 ? "#F59E0B" : "#EF4444";
  const h = size === "lg" ? 8 : 5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: h,
          background: "#F3F4F6",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 10,
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color,
          minWidth: 32,
          textAlign: "right",
        }}
      >
        {value}%
      </span>
    </div>
  );
}

function Sidebar({ currentUser, setCurrentUser, activeTab, setActiveTab }) {
  const navItems = {
    [ROLES.EMPLOYEE]: [
      { id: "dashboard", icon: "🏠", label: "Dashboard" },
      { id: "my-goals", icon: "🎯", label: "My Goals" },
      { id: "checkins", icon: "📊", label: "Check-ins" },
    ],
    [ROLES.MANAGER]: [
      { id: "dashboard", icon: "🏠", label: "Dashboard" },
      { id: "team", icon: "👥", label: "Team Goals" },
      { id: "approvals", icon: "✅", label: "Approvals" },
      { id: "checkins", icon: "📊", label: "Check-ins" },
    ],
    [ROLES.ADMIN]: [
      { id: "dashboard", icon: "🏠", label: "Dashboard" },
      { id: "overview", icon: "🗂️", label: "All Goals" },
      { id: "analytics", icon: "📈", label: "Analytics" },
      { id: "audit", icon: "🔍", label: "Audit Trail" },
      { id: "settings", icon: "⚙️", label: "Cycle Settings" },
    ],
  };

  const items = navItems[currentUser.role] || [];

  return (
    <div
      style={{
        width: 220,
        background: "#0F172A",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1E293B" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            ⚛
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              AtomQuest
            </div>
            <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>
              Goal Portal
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E293B" }}>
        <div
          style={{
            fontSize: 10,
            color: "#64748B",
            marginBottom: 8,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Switch Role
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(USERS)
            .filter(([, u]) => u.role !== ROLES.EMPLOYEE || ["emp1"].includes)
            .map(([id, u]) => (
              <button
                key={id}
                onClick={() => {
                  setCurrentUser({ id, ...u });
                  setActiveTab("dashboard");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: currentUser.id === id ? "#1E293B" : "transparent",
                  color: currentUser.id === id ? "#E2E8F0" : "#64748B",
                  fontSize: 12,
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <Avatar code={u.avatar} size={22} />
                <div>
                  <div
                    style={{ fontWeight: currentUser.id === id ? 600 : 400 }}
                  >
                    {u.name.split(" ")[0]}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{u.role}</div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 12px", flex: 1 }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: activeTab === item.id ? "#6366F1" : "transparent",
              color: activeTab === item.id ? "#fff" : "#94A3B8",
              fontSize: 13,
              fontWeight: activeTab === item.id ? 600 : 400,
              marginBottom: 2,
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User card */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1E293B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar code={currentUser.avatar} size={30} />
          <div>
            <div style={{ color: "#E2E8F0", fontSize: 12, fontWeight: 600 }}>
              {currentUser.name}
            </div>
            <div style={{ color: "#64748B", fontSize: 11 }}>
              {currentUser.dept}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard({ currentUser, goals }) {
  const myGoals = goals.filter((g) => g.employeeId === currentUser.id);
  const approved = myGoals.filter((g) => g.status === "approved");
  const avgProgress = approved.length
    ? Math.round(
        approved
          .map((g) => computeProgress(g) ?? 0)
          .reduce((a, b) => a + b, 0) / approved.length
      )
    : 0;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A" }}
        >
          Good afternoon, {currentUser.name.split(" ")[0]} 👋
        </h1>
        <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>
          Q2 Check-in window is open — update your achievements
        </p>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Total Goals",
            value: myGoals.length,
            icon: "🎯",
            color: "#6366F1",
            bg: "#EEF2FF",
          },
          {
            label: "Approved",
            value: approved.length,
            icon: "✅",
            color: "#059669",
            bg: "#ECFDF5",
          },
          {
            label: "Pending Review",
            value: myGoals.filter((g) => g.status === "pending").length,
            icon: "⏳",
            color: "#D97706",
            bg: "#FFFBEB",
          },
          {
            label: "Overall Progress",
            value: `${avgProgress}%`,
            icon: "📊",
            color: "#2563EB",
            bg: "#EFF6FF",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: kpi.bg,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Goal progress */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>
          Goal Progress Summary
        </h3>
        {approved.map((g) => (
          <div
            key={g.id}
            style={{
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  {g.thrust} · {g.weight}% weight
                </div>
              </div>
              <StatusBadge status={g.q2status || g.q1status || "Not Started"} />
            </div>
            <ProgressBar value={computeProgress(g)} size="lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalSheet({ currentUser, goals, setGoals }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    thrust: THRUST_AREAS[0],
    uom: UOM_TYPES[0],
    target: "",
    weight: "",
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const myGoals = goals.filter((g) => g.employeeId === currentUser.id);
  const totalWeight = myGoals.reduce((s, g) => s + Number(g.weight), 0);

  const fetchAISuggestion = async () => {
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `I am ${currentUser.name} in the ${
                currentUser.dept
              } department. 
I already have these goals: ${
                myGoals.map((g) => g.title).join(", ") || "none yet"
              }.
Thrust area I want: ${form.thrust}.
Suggest a SMART goal for this thrust area. 
Respond ONLY in JSON: {"title": "...", "description": "...", "suggestedTarget": "...", "uom": "one of: Numeric (Min), Numeric (Max), % (Min), % (Max), Timeline, Zero-Based", "rationale": "..."}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data.content[0].text;
      const json = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAiSuggestion(json);
    } catch {
      setAiSuggestion({
        title: "Suggestion unavailable",
        rationale: "Please fill in manually.",
      });
    }
    setAiLoading(false);
  };

  const addGoal = () => {
    if (!form.title || !form.target || !form.weight) return;
    const newWeight = totalWeight + Number(form.weight);
    if (Number(form.weight) < 10) return alert("Minimum weight is 10%");
    if (newWeight > 100) return alert("Total weight cannot exceed 100%");
    if (myGoals.length >= 8) return alert("Maximum 8 goals allowed");
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        employeeId: currentUser.id,
        title: form.title,
        thrust: form.thrust,
        uom: form.uom,
        target: form.target,
        weight: Number(form.weight),
        status: "pending",
        q1: null,
        q2: null,
        q3: null,
        q4: null,
      },
    ]);
    setForm({
      title: "",
      thrust: THRUST_AREAS[0],
      uom: UOM_TYPES[0],
      target: "",
      weight: "",
    });
    setShowForm(false);
    setAiSuggestion(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            My Goal Sheet
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>
            FY 2024–25 · Phase 1: Goal Setting
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div
            style={{
              padding: "8px 16px",
              background: totalWeight === 100 ? "#ECFDF5" : "#FFF7ED",
              border: `1px solid ${
                totalWeight === 100 ? "#6EE7B7" : "#FED7AA"
              }`,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: totalWeight === 100 ? "#065F46" : "#9A3412",
            }}
          >
            Weightage: {totalWeight}/100%
          </div>
          {myGoals.length < 8 && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "8px 16px",
                background: "#6366F1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              + Add Goal
            </button>
          )}
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              New Goal
            </h3>
            <button
              onClick={fetchAISuggestion}
              disabled={aiLoading}
              style={{
                padding: "6px 14px",
                background: "#EEF2FF",
                color: "#6366F1",
                border: "1px solid #C7D2FE",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {aiLoading ? "⏳ Thinking..." : "✨ AI Suggest Goal"}
            </button>
          </div>

          {aiSuggestion && (
            <div
              style={{
                background: "#F0F9FF",
                border: "1px solid #BAE6FD",
                borderRadius: 8,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0369A1",
                  marginBottom: 6,
                }}
              >
                ✨ AI Suggestion
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                {aiSuggestion.title}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>
                {aiSuggestion.rationale}
              </div>
              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    title: aiSuggestion.title,
                    uom: aiSuggestion.uom || f.uom,
                    target: aiSuggestion.suggestedTarget || f.target,
                  }))
                }
                style={{
                  fontSize: 12,
                  background: "#0369A1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                Use this suggestion
              </button>
            </div>
          )}

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Goal Title *
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Increase quarterly revenue by 15%"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Thrust Area
              </label>
              <select
                value={form.thrust}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thrust: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  fontSize: 13,
                  background: "#fff",
                }}
              >
                {THRUST_AREAS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Unit of Measurement
              </label>
              <select
                value={form.uom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uom: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  fontSize: 13,
                  background: "#fff",
                }}
              >
                {UOM_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Target Value *
              </label>
              <input
                value={form.target}
                onChange={(e) =>
                  setForm((f) => ({ ...f, target: e.target.value }))
                }
                placeholder="e.g. 5000000 or 2024-09-30"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Weightage % * (min 10%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={form.weight}
                onChange={(e) =>
                  setForm((f) => ({ ...f, weight: e.target.value }))
                }
                placeholder="e.g. 20"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => {
                setShowForm(false);
                setAiSuggestion(null);
              }}
              style={{
                padding: "8px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                cursor: "pointer",
                background: "#fff",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={addGoal}
              style={{
                padding: "8px 16px",
                background: "#6366F1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Submit Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {[
                "#",
                "Goal Title",
                "Thrust Area",
                "UoM",
                "Target",
                "Weight",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#374151",
                    borderBottom: "1px solid #E2E8F0",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myGoals.map((g, i) => (
              <tr key={g.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px 16px", color: "#9CA3AF" }}>
                  {i + 1}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                  {g.title}
                </td>
                <td style={{ padding: "12px 16px", color: "#6B7280" }}>
                  {g.thrust}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      background: "#F3F4F6",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                  >
                    {g.uom}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                  {g.target}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    color: "#6366F1",
                  }}
                >
                  {g.weight}%
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusBadge status={g.status} />
                </td>
              </tr>
            ))}
            {myGoals.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}
                >
                  No goals added yet. Click "+ Add Goal" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CheckIns({ currentUser, goals, setGoals }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [achievement, setAchievement] = useState("");
  const [status, setStatus] = useState("On Track");
  const [aiCoach, setAiCoach] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const myGoals = goals.filter(
    (g) => g.employeeId === currentUser.id && g.status === "approved"
  );

  const getAiCoaching = async (goal) => {
    setAiLoading(true);
    setAiCoach(null);
    try {
      const progress = computeProgress(goal);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: `Employee ${currentUser.name}, goal: "${
                goal.title
              }", target: ${goal.target}, current progress: ${
                progress ?? "not started"
              }%, status: ${goal.q2status || goal.q1status || "Not Started"}.
Give a brief, practical coaching insight for Q3. Respond ONLY in JSON: {"insight": "...", "tip": "...", "risk": "..."}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const json = JSON.parse(
        data.content[0].text.replace(/```json|```/g, "").trim()
      );
      setAiCoach(json);
    } catch {
      setAiCoach({
        insight: "Keep tracking your progress",
        tip: "Log achievements regularly",
        risk: "Late submissions may affect review",
      });
    }
    setAiLoading(false);
  };

  const submitUpdate = (goalId, quarter) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              [quarter]: Number(achievement) || achievement,
              [`${quarter}status`]: status,
            }
          : g
      )
    );
    setSelectedGoal(null);
    setAchievement("");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>
        Quarterly Check-ins
      </h1>
      <p style={{ margin: "0 0 24px", color: "#64748B", fontSize: 14 }}>
        Q2 window is active (October) · Update your achievements
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {myGoals.map((goal) => {
          const progress = computeProgress(goal);
          return (
            <div
              key={goal.id}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {goal.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    {goal.thrust} · Target: {goal.target} · {goal.uom}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      getAiCoaching(goal);
                    }}
                    style={{
                      padding: "5px 12px",
                      background: "#EEF2FF",
                      color: "#6366F1",
                      border: "1px solid #C7D2FE",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ✨ AI Coach
                  </button>
                  <button
                    onClick={() => setSelectedGoal(goal)}
                    style={{
                      padding: "5px 12px",
                      background: "#F8FAFC",
                      color: "#374151",
                      border: "1px solid #E2E8F0",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Update Q2 →
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 10,
                }}
              >
                {QUARTERS.map((q, i) => {
                  const qKey = `q${i + 1}`;
                  const val = goal[qKey];
                  return (
                    <div
                      key={q}
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#6B7280",
                          marginBottom: 4,
                        }}
                      >
                        {q}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: val !== null ? "#0F172A" : "#9CA3AF",
                        }}
                      >
                        {val !== null ? val : "—"}
                      </div>
                      {goal[`${qKey}status`] && (
                        <StatusBadge status={goal[`${qKey}status`]} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 12 }}>
                <ProgressBar value={progress} size="lg" />
              </div>

              {/* AI Coach panel */}
              {selectedGoal?.id === goal.id && aiCoach && !aiLoading && (
                <div
                  style={{
                    marginTop: 14,
                    background: "#F0F9FF",
                    border: "1px solid #BAE6FD",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0369A1",
                      marginBottom: 8,
                    }}
                  >
                    ✨ AI Coaching Insight
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#0369A1",
                        }}
                      >
                        Insight
                      </div>
                      <div style={{ fontSize: 12, color: "#1E40AF" }}>
                        {aiCoach.insight}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#059669",
                        }}
                      >
                        Tip
                      </div>
                      <div style={{ fontSize: 12, color: "#065F46" }}>
                        {aiCoach.tip}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#DC2626",
                        }}
                      >
                        Risk
                      </div>
                      <div style={{ fontSize: 12, color: "#991B1B" }}>
                        {aiCoach.risk}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedGoal?.id === goal.id && aiLoading && (
                <div
                  style={{
                    marginTop: 14,
                    textAlign: "center",
                    color: "#6366F1",
                    fontSize: 13,
                  }}
                >
                  ⏳ Getting AI coaching...
                </div>
              )}

              {/* Update form */}
              {selectedGoal?.id === goal.id && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "flex-end" }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        Q2 Achievement
                      </label>
                      <input
                        value={achievement}
                        onChange={(e) => setAchievement(e.target.value)}
                        placeholder="Enter actual value..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #D1D5DB",
                          borderRadius: 8,
                          fontSize: 13,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #D1D5DB",
                          borderRadius: 8,
                          fontSize: 13,
                          background: "#fff",
                        }}
                      >
                        {["Not Started", "On Track", "Completed"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => submitUpdate(goal.id, "q2")}
                      style={{
                        padding: "8px 16px",
                        background: "#6366F1",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setSelectedGoal(null)}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #D1D5DB",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "#fff",
                        fontSize: 13,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ManagerApprovals({ goals, setGoals, users }) {
  const [comment, setComment] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const pendingGoals = goals.filter((g) => g.status === "pending");
  const byEmployee = pendingGoals.reduce((acc, g) => {
    if (!acc[g.employeeId]) acc[g.employeeId] = [];
    acc[g.employeeId].push(g);
    return acc;
  }, {});

  const analyzeEmployee = async (empId, empGoals) => {
    setLoadingId(empId);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: `Review these goals for employee ${users[empId]?.name}:
${empGoals
  .map((g) => `- ${g.title} (${g.thrust}, ${g.weight}%, target: ${g.target})`)
  .join("\n")}
Total weight: ${empGoals.reduce((s, g) => s + g.weight, 0)}%

Give a brief review. Respond ONLY in JSON: {"overall": "...", "concerns": "...", "recommendation": "approve or return", "reason": "..."}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const json = JSON.parse(
        data.content[0].text.replace(/```json|```/g, "").trim()
      );
      setAiAnalysis((prev) => ({ ...prev, [empId]: json }));
    } catch {
      setAiAnalysis((prev) => ({
        ...prev,
        [empId]: {
          overall: "Review manually",
          recommendation: "approve",
          reason: "AI unavailable",
        },
      }));
    }
    setLoadingId(null);
  };

  const approve = (empId) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.employeeId === empId && g.status === "pending"
          ? { ...g, status: "approved" }
          : g
      )
    );
  };
  const reject = (empId) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.employeeId === empId && g.status === "pending"
          ? { ...g, status: "rejected" }
          : g
      )
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>
        Goal Approvals
      </h1>
      <p style={{ margin: "0 0 24px", color: "#64748B", fontSize: 14 }}>
        {Object.keys(byEmployee).length} employee(s) pending review
      </p>

      {Object.entries(byEmployee).map(([empId, empGoals]) => {
        const user = users[empId];
        const totalW = empGoals.reduce((s, g) => s + g.weight, 0);
        const analysis = aiAnalysis[empId];
        return (
          <div
            key={empId}
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {user && <Avatar code={user.avatar} size={40} />}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>
                    {user?.dept} · {empGoals.length} goals · Total weight:{" "}
                    <span
                      style={{
                        fontWeight: 600,
                        color: totalW === 100 ? "#059669" : "#DC2626",
                      }}
                    >
                      {totalW}%
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => analyzeEmployee(empId, empGoals)}
                  disabled={loadingId === empId}
                  style={{
                    padding: "6px 14px",
                    background: "#EEF2FF",
                    color: "#6366F1",
                    border: "1px solid #C7D2FE",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {loadingId === empId ? "⏳ Analyzing..." : "✨ AI Review"}
                </button>
                <button
                  onClick={() => approve(empId)}
                  style={{
                    padding: "6px 14px",
                    background: "#059669",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  ✓ Approve All
                </button>
                <button
                  onClick={() => reject(empId)}
                  style={{
                    padding: "6px 14px",
                    background: "#fff",
                    color: "#DC2626",
                    border: "1px solid #FCA5A5",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ↩ Return
                </button>
              </div>
            </div>

            {analysis && (
              <div
                style={{
                  background:
                    analysis.recommendation === "approve"
                      ? "#F0FDF4"
                      : "#FFF7ED",
                  border: `1px solid ${
                    analysis.recommendation === "approve"
                      ? "#BBF7D0"
                      : "#FED7AA"
                  }`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color:
                      analysis.recommendation === "approve"
                        ? "#166534"
                        : "#9A3412",
                    marginBottom: 6,
                  }}
                >
                  ✨ AI Recommendation: {analysis.recommendation?.toUpperCase()}
                </div>
                <div
                  style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}
                >
                  <strong>Overall:</strong> {analysis.overall}
                </div>
                {analysis.concerns && (
                  <div style={{ fontSize: 12, color: "#374151" }}>
                    <strong>Note:</strong> {analysis.concerns}
                  </div>
                )}
              </div>
            )}

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Goal", "Thrust Area", "Target", "Weight", "UoM"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#6B7280",
                          fontSize: 11,
                          borderBottom: "1px solid #E2E8F0",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {empGoals.map((g) => (
                  <tr key={g.id}>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                      {g.title}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#6B7280" }}>
                      {g.thrust}
                    </td>
                    <td style={{ padding: "10px 12px" }}>{g.target}</td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#6366F1",
                      }}
                    >
                      {g.weight}%
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 11,
                        color: "#6B7280",
                        fontFamily: "monospace",
                      }}
                    >
                      {g.uom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12 }}>
              <textarea
                placeholder="Add review comment (optional)..."
                value={comment[empId] || ""}
                onChange={(e) =>
                  setComment((prev) => ({ ...prev, [empId]: e.target.value }))
                }
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  fontSize: 13,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        );
      })}

      {Object.keys(byEmployee).length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            color: "#9CA3AF",
          }}
        >
          No pending approvals. All caught up! ✅
        </div>
      )}
    </div>
  );
}

function TeamDashboard({ currentUser, goals, users }) {
  const teamGoals = goals.filter(
    (g) =>
      users[g.employeeId]?.managerId === currentUser.id ||
      g.employeeId === "emp1" ||
      g.employeeId === "emp2"
  );
  const employees = [...new Set(teamGoals.map((g) => g.employeeId))];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>
        Team Dashboard
      </h1>
      <p style={{ margin: "0 0 24px", color: "#64748B", fontSize: 14 }}>
        Q2 Check-in Status · {employees.length} team members
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {employees.map((empId) => {
          const user = users[empId];
          const empGoals = teamGoals.filter(
            (g) => g.employeeId === empId && g.status === "approved"
          );
          const avgProg = empGoals.length
            ? Math.round(
                empGoals
                  .map((g) => computeProgress(g) ?? 0)
                  .reduce((a, b) => a + b, 0) / empGoals.length
              )
            : 0;
          return (
            <div
              key={empId}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {user && <Avatar code={user.avatar} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>
                      {user?.dept} · {empGoals.length} active goals
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color:
                        avgProg >= 70
                          ? "#059669"
                          : avgProg >= 40
                          ? "#D97706"
                          : "#DC2626",
                    }}
                  >
                    {avgProg}%
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>
                    avg progress
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {empGoals.map((g) => (
                  <div
                    key={g.id}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ fontSize: 13, flex: 1 }}>{g.title}</div>
                    <div style={{ width: 200 }}>
                      <ProgressBar value={computeProgress(g)} />
                    </div>
                    <StatusBadge
                      status={g.q2status || g.q1status || "Not Started"}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminAnalytics({ goals, users }) {
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const allApproved = goals.filter((g) => g.status === "approved");
  const byThrust = THRUST_AREAS.reduce((acc, t) => {
    acc[t] = goals.filter((g) => g.thrust === t).length;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(byThrust));

  const getOrgInsight = async () => {
    setLoading(true);
    try {
      const summary = {
        total: goals.length,
        approved: goals.filter((g) => g.status === "approved").length,
        pending: goals.filter((g) => g.status === "pending").length,
        avgProgress: Math.round(
          allApproved
            .map((g) => computeProgress(g) ?? 0)
            .reduce((a, b) => a + b, 0) / (allApproved.length || 1)
        ),
        topThrust: Object.entries(byThrust).sort((a, b) => b[1] - a[1])[0]?.[0],
      };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: `HR Analytics for our organization: ${JSON.stringify(
                summary
              )}.
Give a brief strategic insight. Respond ONLY in JSON: {"headline": "...", "insight": "...", "action": "...", "risk": "..."}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const json = JSON.parse(
        data.content[0].text.replace(/```json|```/g, "").trim()
      );
      setAiInsight(json);
    } catch {
      setAiInsight({
        headline: "Analysis ready",
        insight: "Review goal distribution across thrust areas",
        action: "Follow up on pending approvals",
        risk: "Low completion rate may affect appraisals",
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Analytics & Insights
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>
            FY 2024–25 organisation-wide overview
          </p>
        </div>
        <button
          onClick={getOrgInsight}
          disabled={loading}
          style={{
            padding: "8px 18px",
            background: "#6366F1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {loading ? "⏳ Analysing..." : "✨ AI Org Insight"}
        </button>
      </div>

      {aiInsight && (
        <div
          style={{
            background: "linear-gradient(135deg, #EEF2FF, #F0FDF4)",
            border: "1px solid #C7D2FE",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#3730A3",
              marginBottom: 12,
            }}
          >
            ✨ {aiInsight.headline}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4338CA",
                  marginBottom: 4,
                }}
              >
                INSIGHT
              </div>
              <div style={{ fontSize: 13, color: "#1E1B4B" }}>
                {aiInsight.insight}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#059669",
                  marginBottom: 4,
                }}
              >
                RECOMMENDED ACTION
              </div>
              <div style={{ fontSize: 13, color: "#064E3B" }}>
                {aiInsight.action}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#DC2626",
                  marginBottom: 4,
                }}
              >
                RISK FLAG
              </div>
              <div style={{ fontSize: 13, color: "#7F1D1D" }}>
                {aiInsight.risk}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total Goals", value: goals.length, color: "#6366F1" },
          {
            label: "Approved",
            value: goals.filter((g) => g.status === "approved").length,
            color: "#059669",
          },
          {
            label: "Pending",
            value: goals.filter((g) => g.status === "pending").length,
            color: "#D97706",
          },
          {
            label: "Avg Progress",
            value: `${Math.round(
              allApproved
                .map((g) => computeProgress(g) ?? 0)
                .reduce((a, b) => a + b, 0) / (allApproved.length || 1)
            )}%`,
            color: "#2563EB",
          },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>
              {k.value}
            </div>
            <div style={{ fontSize: 13, color: "#64748B" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>
          Goals by Thrust Area
        </h3>
        {Object.entries(byThrust)
          .filter(([, c]) => c > 0)
          .map(([t, c]) => (
            <div key={t} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                  fontSize: 13,
                }}
              >
                <span>{t}</span>
                <span style={{ fontWeight: 600, color: "#6366F1" }}>{c}</span>
              </div>
              <div
                style={{ height: 6, background: "#F1F5F9", borderRadius: 4 }}
              >
                <div
                  style={{
                    width: `${(c / maxCount) * 100}%`,
                    height: "100%",
                    background: "#6366F1",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AuditTrail() {
  const logs = [
    {
      id: 1,
      time: "2024-07-15 09:32",
      user: "Rahul Verma",
      role: "Manager",
      action: "Approved goal set",
      target: "Arjun Mehta",
      detail: "5 goals approved, locked for editing",
    },
    {
      id: 2,
      time: "2024-07-14 14:21",
      user: "Arjun Mehta",
      role: "Employee",
      action: "Submitted goal sheet",
      target: "Self",
      detail: "5 goals, total weight 100%",
    },
    {
      id: 3,
      time: "2024-07-10 11:05",
      user: "Neha Joshi",
      role: "Admin",
      action: "Opened goal-setting cycle",
      target: "All employees",
      detail: "Phase 1 window: 1st May–31st July",
    },
    {
      id: 4,
      time: "2024-10-01 10:00",
      user: "Arjun Mehta",
      role: "Employee",
      action: "Q2 achievement update",
      target: "Increase Sales Revenue",
      detail: "Updated: 2600000 / 5000000 (52%)",
    },
    {
      id: 5,
      time: "2024-10-02 15:30",
      user: "Rahul Verma",
      role: "Manager",
      action: "Q2 check-in comment",
      target: "Arjun Mehta",
      detail: "Good progress on revenue goal. Keep momentum.",
    },
  ];
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>
        Audit Trail
      </h1>
      <p style={{ margin: "0 0 24px", color: "#64748B", fontSize: 14 }}>
        System log of all goal-related actions
      </p>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {logs.map((log, i) => (
          <div
            key={log.id}
            style={{
              display: "flex",
              gap: 16,
              padding: "14px 20px",
              borderBottom: i < logs.length - 1 ? "1px solid #F1F5F9" : "none",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#94A3B8",
                whiteSpace: "nowrap",
                minWidth: 120,
                marginTop: 2,
              }}
            >
              {log.time}
            </div>
            <div
              style={{
                width: 4,
                height: 4,
                background: "#6366F1",
                borderRadius: "50%",
                marginTop: 7,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                <span style={{ color: "#6366F1" }}>{log.user}</span>
                <span style={{ color: "#94A3B8" }}> ({log.role})</span>
                <span style={{ color: "#374151" }}> · {log.action}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                {log.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CycleSettings() {
  const cycles = [
    {
      period: "Phase 1 — Goal Setting",
      opens: "1st May",
      status: "closed",
      action: "Goal Creation, Submission & Approval",
    },
    {
      period: "Q1 Check-in",
      opens: "July",
      status: "closed",
      action: "Progress Update — Planned vs. Actual",
    },
    {
      period: "Q2 Check-in",
      opens: "October",
      status: "active",
      action: "Progress Update — Planned vs. Actual",
    },
    {
      period: "Q3 Check-in",
      opens: "January",
      status: "upcoming",
      action: "Progress Update — Planned vs. Actual",
    },
    {
      period: "Q4 / Annual",
      opens: "March/April",
      status: "upcoming",
      action: "Final Achievement Capture",
    },
  ];
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>
        Cycle Settings
      </h1>
      <p style={{ margin: "0 0 24px", color: "#64748B", fontSize: 14 }}>
        Manage goal-setting and check-in windows for FY 2024–25
      </p>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Period", "Window Opens", "Action", "Status", "Control"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {cycles.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                  {c.period}
                </td>
                <td style={{ padding: "12px 16px", color: "#6B7280" }}>
                  {c.opens}
                </td>
                <td style={{ padding: "12px 16px", color: "#6B7280" }}>
                  {c.action}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        c.status === "active"
                          ? "#D1FAE5"
                          : c.status === "closed"
                          ? "#F3F4F6"
                          : "#FEF3C7",
                      color:
                        c.status === "active"
                          ? "#065F46"
                          : c.status === "closed"
                          ? "#374151"
                          : "#92400E",
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    {c.status === "active"
                      ? "Close Window"
                      : c.status === "upcoming"
                      ? "Open Early"
                      : "Reopen"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState({ id: "emp1", ...USERS.emp1 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [goals, setGoals] = useState(INITIAL_GOALS);

  const renderContent = () => {
    if (currentUser.role === ROLES.EMPLOYEE) {
      if (activeTab === "dashboard")
        return <EmployeeDashboard currentUser={currentUser} goals={goals} />;
      if (activeTab === "my-goals")
        return (
          <GoalSheet
            currentUser={currentUser}
            goals={goals}
            setGoals={setGoals}
          />
        );
      if (activeTab === "checkins")
        return (
          <CheckIns
            currentUser={currentUser}
            goals={goals}
            setGoals={setGoals}
          />
        );
    }
    if (currentUser.role === ROLES.MANAGER) {
      if (activeTab === "dashboard" || activeTab === "team")
        return (
          <TeamDashboard
            currentUser={currentUser}
            goals={goals}
            users={USERS}
          />
        );
      if (activeTab === "approvals")
        return (
          <ManagerApprovals goals={goals} setGoals={setGoals} users={USERS} />
        );
      if (activeTab === "checkins")
        return (
          <TeamDashboard
            currentUser={currentUser}
            goals={goals}
            users={USERS}
          />
        );
    }
    if (currentUser.role === ROLES.ADMIN) {
      if (activeTab === "dashboard" || activeTab === "analytics")
        return <AdminAnalytics goals={goals} users={USERS} />;
      if (activeTab === "audit") return <AuditTrail />;
      if (activeTab === "settings") return <CycleSettings />;
      if (activeTab === "overview")
        return (
          <ManagerApprovals goals={goals} setGoals={setGoals} users={USERS} />
        );
    }
    return <EmployeeDashboard currentUser={currentUser} goals={goals} />;
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      <Sidebar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main style={{ flex: 1, overflow: "auto" }}>{renderContent()}</main>
    </div>
  );
}
