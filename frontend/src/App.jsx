import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnomalyPanel, AssignmentsPanel, CloudOpsPanel, CommandDeckPanel,
  FeedPanel, FleetAndComplaintsPanel, FutureCastPanel, InsightsRow,
  MetricsRow, MissionControlDrawer, PageHeader, ProjectStoryPanel,
  PriorityTablePanel, ScenarioSwitcher, SystemBanner, TimelineSwitcher,
  ZoneFocusRail, ZonePressurePanel,
} from "./components/DashboardSections";

const pages = [
  { key: "overview", label: "Command Center", eyebrow: "City Pulse" },
  { key: "dispatch", label: "Dispatch Ops", eyebrow: "Fleet Control" },
  { key: "intelligence", label: "Predictive AI", eyebrow: "Risk Engine" },
  { key: "citizens", label: "Citizen Care", eyebrow: "Service Desk" },
  { key: "cloud", label: "Cloud Platform", eyebrow: "Project-Ready" },
];

function buildEndpoint(base, scenarioKey) {
  const url = new URL(base, window.location.origin);
  if (scenarioKey && scenarioKey !== "standard") url.searchParams.set("scenario", scenarioKey);
  return `${url.pathname}${url.search}`;
}

function normalizeSnapshot(s) {
  if (!s) return null;
  return { ...s, bins: Array.isArray(s.bins) ? s.bins : [], assignments: Array.isArray(s.assignments) ? s.assignments : [], complaints: Array.isArray(s.complaints) ? s.complaints : [], zonePressure: Array.isArray(s.zonePressure) ? s.zonePressure : [], liveFeed: Array.isArray(s.liveFeed) ? s.liveFeed : [], trucks: Array.isArray(s.trucks) ? s.trucks : [], insights: Array.isArray(s.insights) ? s.insights : [], metrics: s.metrics || {}, forecast: s.forecast || { summary: "N/A", next15Minutes: "N/A", nextHour: "N/A", nextWave: "N/A" } };
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activePage, setActivePage] = useState("overview");
  const [activeZone, setActiveZone] = useState("All Zones");
  const [activeMode, setActiveMode] = useState("Pulse");
  const [activeScenario, setActiveScenario] = useState("standard");
  const [activeTimeline, setActiveTimeline] = useState("now");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  async function loadDashboard(base = `${import.meta.env.VITE_API_BASE_URL}/dashboard`, silent = false, sc = activeScenario) {
    requestIdRef.current += 1;
    const rid = requestIdRef.current;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    const tid = window.setTimeout(() => ctrl.abort(), 8000);
    abortRef.current = ctrl;
    if (!silent) setLoading(true);
    setError("");
    try {
      const r = await fetch(buildEndpoint(base, sc), { signal: ctrl.signal });
      if (!r.ok) throw new Error("Status " + r.status);
      const p = await r.json();
      if (rid === requestIdRef.current) setData(p);
    } catch (e) {
      setError(e.name === "AbortError" ? "Request timed out." : e.message);
    } finally {
      clearTimeout(tid);
      if (abortRef.current === ctrl) abortRef.current = null;
      if (!silent && rid === requestIdRef.current) setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(`${import.meta.env.VITE_API_BASE_URL}/dashboard`, false, activeScenario); return () => abortRef.current?.abort(); }, [activeScenario]);
  useEffect(() => { if (!autoRefresh || activeTimeline !== "now") return; const t = setInterval(() => loadDashboard(`${import.meta.env.VITE_API_BASE_URL}/dashboard`, true, activeScenario), 5000); return () => clearInterval(t); }, [autoRefresh, activeScenario, activeTimeline]);

  const timelineState = useMemo(() => { const items = Array.isArray(data?.timeline) ? data.timeline : []; return items.find(i => i.key === activeTimeline) || items[0] || null; }, [activeTimeline, data]);
  const safeSnapshot = useMemo(() => normalizeSnapshot(timelineState?.snapshot || data), [data, timelineState]);

  const scopedData = useMemo(() => {
    if (!safeSnapshot) return null;
    if (activeZone === "All Zones") return safeSnapshot;
    return { ...safeSnapshot, bins: safeSnapshot.bins.filter(b => b.zone === activeZone), assignments: safeSnapshot.assignments.filter(a => a.route.includes(activeZone)), complaints: safeSnapshot.complaints.filter(c => c.zone === activeZone), zonePressure: safeSnapshot.zonePressure.filter(z => z.zone === activeZone), liveFeed: safeSnapshot.liveFeed.filter(e => e.headline.includes(activeZone) || e.detail.includes(activeZone)) };
  }, [activeZone, safeSnapshot]);

  useEffect(() => { if (!scopedData) return; const ok = scopedData.assignments.some(a => a.binId === selectedAssignmentId); if (!ok) setSelectedAssignmentId(scopedData.assignments[0]?.binId || null); }, [scopedData, selectedAssignmentId]);

  const selectedAssignment = useMemo(() => scopedData?.assignments?.find(a => a.binId === selectedAssignmentId) || null, [scopedData, selectedAssignmentId]);
  const pageMeta = pages.find(p => p.key === activePage) || pages[0];

  const topAction = useMemo(() => {
    if (selectedAssignment) return selectedAssignment.binId + " assigned to " + selectedAssignment.truckId;
    const lb = scopedData?.bins?.[0];
    return lb ? lb.id + " in " + lb.zone + " is highest priority." : "No urgent dispatch.";
  }, [scopedData, selectedAssignment]);

  const scenarioCards = useMemo(() => {
    if (!data || !timelineState || !safeSnapshot) return [];
    return [
      { label: timelineState.label, title: data.scenario.title, detail: safeSnapshot.forecast.summary, tone: "neutral" },
      { label: "Dispatch Window", title: "Route posture", detail: safeSnapshot.forecast.next15Minutes, tone: "success" },
      { label: "Risk Horizon", title: "Overflow outlook", detail: safeSnapshot.forecast.nextHour, tone: "warning" },
    ];
  }, [data, safeSnapshot, timelineState]);

  const timelineMoments = useMemo(() => {
    if (!scopedData || !timelineState) return [];
    return [
      { label: timelineState.label, value: (scopedData.metrics.emergencyBins || 0) + " emergency" },
      { label: "ETA", value: (scopedData.metrics.averageEta || 0) + " min" },
      { label: "Risk", value: (scopedData.metrics.serviceRiskBins || 0) + " bins" },
      { label: "Hotspot", value: scopedData.zonePressure[0]?.zone || "Stable" },
    ];
  }, [scopedData, timelineState]);

  const commandActions = useMemo(() => {
    if (!scopedData || !data || !safeSnapshot) return [];
    const pb = scopedData.bins[0];
    const ec = scopedData.complaints.find(c => c.status === "Escalated");
    const dt = [...scopedData.trucks].sort((a, b) => b.nextReadyMinutes - a.nextReadyMinutes)[0];
    return [
      { label: activeMode, title: pb ? "Prioritize " + pb.id : "No priority bin", detail: pb ? "Lead with " + pb.zone : "No active pressure.", tone: "warning" },
      { label: "Timeline", title: timelineState?.label || "Now", detail: safeSnapshot.forecast.nextWave, tone: "neutral" },
      { label: ec ? "Citizen Escalation" : "Complaint Watch", title: ec ? ec.id : "No critical complaint", detail: ec ? "Coordinate " + ec.zone + " response." : "Sentiment stable.", tone: ec ? "danger" : "success" },
      { label: "Fleet Posture", title: dt ? dt.id + " bottleneck" : "Fleet stable", detail: dt ? dt.nextReadyMinutes.toFixed(0) + " min until reset." : "Fleet can absorb demand.", tone: dt && dt.nextReadyMinutes > 45 ? "danger" : "success" },
    ];
  }, [activeMode, data, safeSnapshot, scopedData, timelineState]);

  const anomalies = useMemo(() => {
    if (!scopedData) return [];
    const rb = scopedData.bins.filter(b => b.fillLevel >= 85 || b.predictedOverflowHours < 10).slice(0, 3).map(b => ({ title: b.id + " pressure spike", tag: b.zone, detail: b.fillLevel + "% fill, " + b.predictedOverflowHours + "h to overflow.", tone: "danger" }));
    const ca = scopedData.complaints.filter(c => c.status === "Escalated").map(c => ({ title: c.id + " escalation", tag: "Complaint", detail: c.waitingMinutes + " min waiting in " + c.zone + ".", tone: "warning" }));
    return [...rb, ...ca];
  }, [scopedData]);

  if (loading && !data) return <div className="status-shell"><div className="loader" /><p>Calibrating city telemetry...</p></div>;
  if (error && !data) return <div className="status-shell"><p>Live telemetry failed: {error}</p></div>;
  if (!data || !safeSnapshot || !scopedData) return <div className="status-shell"><div className="loader" /><p>Preparing workspace...</p></div>;

  return (
    <div className="app-root">
      <nav className="topnav">
        <div className="brand"><span className="brand-icon" /><div><strong>AetherGrid</strong><span>Smart Waste Cloud</span></div></div>
        <div className="nav-links">
          {pages.map(p => (
            <button key={p.key} className={"nav-btn" + (activePage === p.key ? " active" : "")} onClick={() => setActivePage(p.key)}>
              <span className="nav-label">{p.label}</span>
            </button>
          ))}
        </div>
        <div className="nav-right">
          <span className={"live-dot" + (autoRefresh ? " on" : "")} />
          <button className="ctrl-btn" onClick={() => loadDashboard()} disabled={loading}>{loading ? "..." : "Refresh"}</button>
          <button className="ctrl-btn ghost" onClick={() => setAutoRefresh(v => !v)}>{autoRefresh ? "Pause" : "Resume"}</button>
          <span className="ts">{new Date(data.generatedAt).toLocaleTimeString()}</span>
        </div>
      </nav>

      <main className="main-content">
        <PageHeader eyebrow={pageMeta.eyebrow} title={pageMeta.label} subtitle={topAction} scenario={data.scenario} cloudOps={data.cloudOps} metrics={scopedData.metrics} error={error} />
        <section className="toolbar-stack">
          <ScenarioSwitcher scenarios={data.scenarios} activeScenario={activeScenario} onSelectScenario={v => { setActiveScenario(v); setActiveTimeline("now"); }} />
          <TimelineSwitcher timelines={data.timelineOptions} activeTimeline={activeTimeline} onSelectTimeline={setActiveTimeline} />
          <ZoneFocusRail zones={safeSnapshot.zonePressure} activeZone={activeZone} onSelectZone={setActiveZone} />
        </section>

        {activePage === "overview" && (
          <div className="page-grid overview-grid">
            <MetricsRow metrics={scopedData.metrics} />
            <ProjectStoryPanel exampleScenario={data.exampleScenario} cloudOps={data.cloudOps} compact />
            <InsightsRow insights={safeSnapshot.insights} />
            <SystemBanner error={error} liveFeedCount={scopedData.liveFeed.length} activeZone={activeZone} />
            <ZonePressurePanel zones={scopedData.zonePressure} assignments={scopedData.assignments} depot={data.mapLegend.depot} selectedAssignmentId={selectedAssignmentId} onSelectAssignment={setSelectedAssignmentId} activeZone={activeZone} onSelectZone={setActiveZone} />
            <FutureCastPanel scenarios={scenarioCards} timelineMoments={timelineMoments} />
          </div>
        )}
        {activePage === "dispatch" && (
          <div className="page-grid split-grid">
            <CommandDeckPanel actions={commandActions} activeMode={activeMode} onModeChange={setActiveMode} />
            <AssignmentsPanel assignments={scopedData.assignments} selectedAssignmentId={selectedAssignmentId} onSelectAssignment={setSelectedAssignmentId} />
            <MissionControlDrawer selectedAssignment={selectedAssignment} selectedZone={activeZone} selectedMode={activeMode} />
            <PriorityTablePanel bins={scopedData.bins} />
          </div>
        )}
        {activePage === "intelligence" && (
          <div className="page-grid split-grid">
            <FutureCastPanel scenarios={scenarioCards} timelineMoments={timelineMoments} />
            <AnomalyPanel anomalies={anomalies} />
            <PriorityTablePanel bins={scopedData.bins} />
            <ZonePressurePanel zones={scopedData.zonePressure} assignments={scopedData.assignments} depot={data.mapLegend.depot} selectedAssignmentId={selectedAssignmentId} onSelectAssignment={setSelectedAssignmentId} activeZone={activeZone} onSelectZone={setActiveZone} />
          </div>
        )}
        {activePage === "citizens" && (
          <div className="page-grid split-grid">
            <FleetAndComplaintsPanel trucks={safeSnapshot.trucks} complaints={scopedData.complaints} />
            <FeedPanel liveFeed={scopedData.liveFeed} />
            <SystemBanner error={error} liveFeedCount={scopedData.liveFeed.length} activeZone={activeZone} />
            <AnomalyPanel anomalies={anomalies} />
          </div>
        )}
        {activePage === "cloud" && (
          <div className="page-grid">
            <ProjectStoryPanel exampleScenario={data.exampleScenario} cloudOps={data.cloudOps} />
            <CloudOpsPanel cloudOps={data.cloudOps} metrics={scopedData.metrics} scenario={data.scenario} />
            <FeedPanel liveFeed={scopedData.liveFeed} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
