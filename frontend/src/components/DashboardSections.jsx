const metricCards = [
  { key: "emergencyBins", label: "Emergency", suffix: "", tone: "danger" },
  { key: "serviceRiskBins", label: "At Risk", suffix: "", tone: "warning" },
  { key: "availableTrucks", label: "Fleet Ready", suffix: "", tone: "success" },
  { key: "averageEta", label: "Avg ETA", suffix: " min", tone: "neutral" },
  { key: "fleetUtilization", label: "Utilization", suffix: "%", tone: "neutral" },
  { key: "estimatedCo2SavedKg", label: "CO2 Saved", suffix: " kg", tone: "success" },
];

function PanelHeader({ label, title, aside, compact = false }) {
  return (
    <div className={`panel-heading ${compact ? "compact" : ""}`}>
      <div>
        <span className="small-label">{label}</span>
        <h2>{title}</h2>
      </div>
      {aside ? <span className="muted">{aside}</span> : null}
    </div>
  );
}

function EmptyState({ title, detail }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

export function ShellNav({
  pages,
  activePage,
  onPageChange,
  generatedAt,
  autoRefresh,
  loading,
  onRefresh,
  onToggleLive,
}) {
  return (
    <aside className="shell-nav">
      <div className="nav-brand">
        <span className="brand-dot" />
        <div>
          <strong>AetherGrid</strong>
          <span>Smart Waste Cloud</span>
        </div>
      </div>

      <nav className="page-tabs" aria-label="Dashboard pages">
        {pages.map((page) => (
          <button
            key={page.key}
            type="button"
            className={activePage === page.key ? "page-tab active" : "page-tab"}
            onClick={() => onPageChange(page.key)}
          >
            <span>{page.eyebrow}</span>
            <strong>{page.label}</strong>
          </button>
        ))}
      </nav>

      <div className="nav-status">
        <span className="small-label">Live Sync</span>
        <strong>{autoRefresh ? "Every 5 sec" : "Manual"}</strong>
        <p>{new Date(generatedAt).toLocaleTimeString()}</p>
      </div>

      <div className="nav-actions">
        <button type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing" : "Refresh"}
        </button>
        <button type="button" className="secondary" onClick={onToggleLive}>
          {autoRefresh ? "Pause Live" : "Resume Live"}
        </button>
      </div>
    </aside>
  );
}

export function PageHeader({ eyebrow, title, subtitle, scenario, cloudOps, metrics, error }) {
  return (
    <section className="page-header">
      <div className="page-title-card">
        <span className="small-label">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="page-proof-row">
          <span>{metrics?.totalBins || 0} smart bins</span>
          <span>{metrics?.availableTrucks || 0} fleet units ready</span>
          <span>{cloudOps?.autoscaleReplicas || 0} cloud replicas</span>
        </div>
      </div>

      <div className="header-cards">
        <article>
          <span>Scenario</span>
          <strong>{scenario.label}</strong>
          <p>{scenario.title}</p>
        </article>
        <article>
          <span>Cloud</span>
          <strong>{cloudOps?.syncHealth || "Checking"}</strong>
          <p>{cloudOps?.region || "Region unavailable"}</p>
        </article>
        <article>
          <span>Impact</span>
          <strong>{metrics?.estimatedCo2SavedKg || 0} kg</strong>
          <p>Projected CO2 saved from dynamic routing today.</p>
        </article>
        <article className={error ? "danger" : "success"}>
          <span>System</span>
          <strong>{error ? "Attention" : "Operational"}</strong>
          <p>{error || "Telemetry and routing APIs are online."}</p>
        </article>
      </div>
    </section>
  );
}

export function ProjectStoryPanel({ exampleScenario, cloudOps, compact = false }) {
  const focusedBins = exampleScenario?.focusedBins || [];
  const storyCards = [
    {
      label: "Problem",
      title: "Overflow is predicted before it becomes visible",
      detail: "Smart bins, complaints, and traffic signals are combined into one dispatch priority score.",
    },
    {
      label: "Solution",
      title: "AI routes crews by urgency, capacity, and ETA",
      detail: "The system assigns trucks dynamically and keeps the operator focused on the next best action.",
    },
    {
      label: "Cloud",
      title: "IoT data becomes a deployable city platform",
      detail: cloudOps?.demoPitch || "Cloud telemetry, APIs, backups, and autoscaling make the project presentation-ready.",
    },
  ];

  return (
    <article className={`panel project-story ${compact ? "compact-story" : ""}`}>
      <PanelHeader label="Project Narrative" title="What makes this a top-tier OOAD project" aside={cloudOps?.provider} />

      <div className="story-grid">
        {storyCards.map((card) => (
          <article key={card.label} className="story-card">
            <span className="small-label">{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>

      {!compact && (
        <div className="demo-strip">
          <div>
            <span className="small-label">Demo Scenario</span>
            <strong>{exampleScenario?.title || "Live smart-city dispatch"}</strong>
            <p>{exampleScenario?.explanation}</p>
          </div>
          <div className="focused-bin-row">
            {focusedBins.map((bin) => (
              <span key={bin.id}>
                {bin.id} · {bin.zone} · {bin.assignedTruck}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function RouteOverlay({ assignments, depot, selectedAssignmentId, onSelectAssignment }) {
  const visibleAssignments = assignments.filter((assignment) => assignment.routeSegments?.length).slice(0, 6);
  if (!visibleAssignments.length) return null;

  return (
    <svg className="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <circle className="depot-node" cx={depot.x} cy={depot.y} r="2.4" />
      {visibleAssignments.map((assignment) =>
        assignment.routeSegments.map((segment, index) => (
          <line
            key={`${assignment.binId}-${segment.from}-${segment.to}-${index}`}
            x1={segment.start.x}
            y1={segment.start.y}
            x2={segment.end.x}
            y2={segment.end.y}
            className={`route-line ${assignment.truckId === "UNASSIGNED" ? "ghost" : ""} ${
              selectedAssignmentId === assignment.binId ? "active" : ""
            }`}
            onClick={() => onSelectAssignment?.(assignment.binId)}
          />
        ))
      )}
    </svg>
  );
}

export function Topbar({
  topAction,
  generatedAt,
  error,
  autoRefresh,
  loading,
  activeZone,
  onRefresh,
  onScenario,
  onToggleLive,
}) {
  return (
    <section className="topbar panel topbar-hero">
      <div className="title-block">
        <div className="brand-mark">
          <span className="brand-kicker">AetherGrid</span>
          <span className="brand-subtitle">Urban Sanitation Command</span>
        </div>
        <h1>The city is alive. Dispatch like you can feel its pulse.</h1>
        <p>
          A cinematic command surface for overflow prevention, anomaly response, fleet orchestration, and future-state
          sanitation planning.
        </p>

        <div className="hero-pills" aria-label="Dashboard highlights">
          <span>Pulse Engine</span>
          <span>Forecast Lanes</span>
          <span>Anomaly Chamber</span>
          <span>{activeZone === "All Zones" ? "Whole City Focus" : `${activeZone} Focus`}</span>
        </div>

        <div className="hero-signal">
          <div className="signal-line" />
          <div className="signal-copy">
            <span className="small-label">Operator Cue</span>
            <strong>{topAction?.title || "No urgent dispatch selected"}</strong>
            <p>{topAction?.body || "Pick a zone, route, or scenario to focus the grid."}</p>
          </div>
        </div>
      </div>

      <div className="topbar-side">
        <div className="status-card spectral-card">
          <span className="small-label">Mission Directive</span>
          <strong>{error ? "Recover live visibility" : "Maintain zero-overflow discipline"}</strong>
          <p>
            {error
              ? "Signal has degraded. Hold the strongest known snapshot while re-establishing telemetry."
              : "Route crews before pressure spikes harden into citizen-visible incidents."}
          </p>
        </div>

        <div className="control-row">
          <button onClick={onRefresh} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Pulse"}
          </button>
          <button className="secondary" onClick={onScenario} disabled={loading}>
            Trigger Surge
          </button>
          <button className="ghost" onClick={onToggleLive}>
            {autoRefresh ? "Live Orbit" : "Manual Orbit"}
          </button>
        </div>

        <div className="micro-stats">
          <div>
            <span className="small-label">Last Sync</span>
            <strong>{new Date(generatedAt).toLocaleTimeString()}</strong>
          </div>
          <div>
            <span className="small-label">System</span>
            <strong>{error ? "Fractured" : "Aligned"}</strong>
          </div>
          <div>
            <span className="small-label">Mode</span>
            <strong>{autoRefresh ? "Live 5s" : "Manual"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ScenarioSwitcher({ scenarios, activeScenario, onSelectScenario }) {
  return (
    <section className="focus-rail">
      <div className="focus-rail-head">
        <div>
          <span className="small-label">Reality Engine</span>
          <h2>Choose the city timeline</h2>
        </div>
        <span className="muted">{scenarios.find((scenario) => scenario.key === activeScenario)?.title}</span>
      </div>

      <div className="zone-chip-row">
        {scenarios.map((scenario) => (
          <button
            key={scenario.key}
            className={activeScenario === scenario.key ? "chip active" : "chip"}
            onClick={() => onSelectScenario(scenario.key)}
          >
            {scenario.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function TimelineSwitcher({ timelines, activeTimeline, onSelectTimeline }) {
  return (
    <section className="focus-rail">
      <div className="focus-rail-head">
        <div>
          <span className="small-label">Timeline Engine</span>
          <h2>Move across probable futures</h2>
        </div>
        <span className="muted">{timelines.find((timeline) => timeline.key === activeTimeline)?.label}</span>
      </div>

      <div className="zone-chip-row">
        {timelines.map((timeline) => (
          <button
            key={timeline.key}
            className={activeTimeline === timeline.key ? "chip active" : "chip"}
            onClick={() => onSelectTimeline(timeline.key)}
          >
            {timeline.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function MetricsRow({ metrics }) {
  return (
    <section className="metrics-row">
      {metricCards.map((card) => (
        <article key={card.key} className={`metric-card panel ${card.tone}`}>
          <span>{card.label}</span>
          <strong>
            {metrics[card.key]}
            {card.suffix}
          </strong>
        </article>
      ))}
    </section>
  );
}

export function InsightsRow({ insights }) {
  return (
    <section className="insights-row">
      {insights.map((insight) => (
        <article key={insight.title} className={`insight-card ${insight.tone || "neutral"}`}>
          <span className="small-label">{insight.title}</span>
          <strong>{insight.value}</strong>
          <p>{insight.detail}</p>
        </article>
      ))}
    </section>
  );
}

export function SystemBanner({ error, liveFeedCount, activeZone }) {
  return (
    <section className={`system-banner ${error ? "degraded" : "healthy"}`}>
      <div>
        <span className="small-label">System Status</span>
        <strong>{error ? "Live sync requires attention" : "Dispatch intelligence is updating normally"}</strong>
      </div>
      <span className="banner-copy">
        {error || `${liveFeedCount} feed events active. Focus scope: ${activeZone}.`}
      </span>
    </section>
  );
}

export function ZoneFocusRail({ zones, activeZone, onSelectZone }) {
  return (
    <section className="focus-rail">
      <div className="focus-rail-head">
        <div>
          <span className="small-label">Zone Lens</span>
          <h2>Choose a city reality</h2>
        </div>
        <span className="muted">{activeZone}</span>
      </div>

      <div className="zone-chip-row">
        <button className={activeZone === "All Zones" ? "chip active" : "chip"} onClick={() => onSelectZone("All Zones")}>
          All Zones
        </button>
        {zones.map((zone) => (
          <button
            key={zone.zone}
            className={activeZone === zone.zone ? "chip active" : "chip"}
            onClick={() => onSelectZone(zone.zone)}
          >
            {zone.zone}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ZonePressurePanel({
  zones,
  assignments,
  depot,
  selectedAssignmentId,
  onSelectAssignment,
  activeZone,
  onSelectZone,
}) {
  return (
    <article className="panel map-panel">
      <PanelHeader label="City Pressure" title="Zone hotspot map" aside="Live priority overlay" />

      <div className="map-stage">
        <RouteOverlay
          assignments={assignments}
          depot={depot}
          selectedAssignmentId={selectedAssignmentId}
          onSelectAssignment={onSelectAssignment}
        />
        <div className="map-aura map-aura-one" />
        <div className="map-aura map-aura-two" />
        {zones.map((zone) => (
          <button
            key={zone.zone}
            type="button"
            className={`map-node ${
              zone.pressureIndex > 90 ? "critical" : zone.pressureIndex > 75 ? "elevated" : "stable"
            } ${activeZone === zone.zone ? "selected" : ""}`}
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            onClick={() => onSelectZone(zone.zone)}
          >
            <strong>{zone.zone}</strong>
            <span>{zone.averageFill}% fill</span>
          </button>
        ))}
      </div>

      <div className="zone-list compact-list panel-scroll">
        {zones.map((zone) => (
          <button key={zone.zone} type="button" className="zone-item zone-item-button" onClick={() => onSelectZone(zone.zone)}>
            <div className="zone-copy">
              <strong>{zone.zone}</strong>
              <span>
                Pressure {zone.pressureIndex} | Traffic {zone.trafficMultiplier}x | Emergency {zone.emergencyBins}
              </span>
            </div>
            <div className="zone-bar">
              <span style={{ width: `${Math.min(zone.pressureIndex, 100)}%` }} />
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

export function PriorityTablePanel({ bins }) {
  return (
    <article className="panel table-panel">
      <PanelHeader label="Smart Bin Intelligence" title="Priority table" aside="Sorted by urgency" />

      <div className="table-wrap panel-scroll">
        {bins.length ? (
          <table>
            <thead>
              <tr>
                <th>Bin</th>
                <th>Zone</th>
                <th>Fill</th>
                <th>Priority</th>
                <th>Overflow</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((bin) => (
                <tr key={bin.id}>
                  <td>{bin.id}</td>
                  <td>{bin.zone}</td>
                  <td>{bin.fillLevel}%</td>
                  <td>
                    <span className={`priority-badge ${bin.priority.toLowerCase()}`}>{bin.priority}</span>
                  </td>
                  <td>{bin.predictedOverflowHours} hrs</td>
                  <td>{bin.serviceWindowLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No bins in this lens" detail="Choose another zone or switch back to the whole-city view." />
        )}
      </div>
    </article>
  );
}

export function FutureCastPanel({ scenarios, timelineMoments }) {
  return (
    <article className="panel future-panel">
      <PanelHeader label="Prediction Theater" title="Futurecast lanes" aside="Near-future possibilities" />

      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <article key={scenario.title} className={`scenario-card ${scenario.tone}`}>
            <span className="small-label">{scenario.label}</span>
            <strong>{scenario.title}</strong>
            <p>{scenario.detail}</p>
          </article>
        ))}
      </div>

      <div className="timeline-lane">
        {timelineMoments.map((moment) => (
          <div key={moment.label} className="timeline-node">
            <span>{moment.label}</span>
            <strong>{moment.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export function AssignmentsPanel({ assignments, selectedAssignmentId, onSelectAssignment }) {
  return (
    <article className="panel">
      <PanelHeader label="Dispatch Queue" title="Assignments" aside={`${assignments.length} decisions`} />

      <div className="assignment-list compact-list panel-scroll">
        {assignments.length ? (
          assignments.slice(0, 6).map((assignment) => (
            <button
              key={`${assignment.binId}-${assignment.truckId}`}
              type="button"
              className={`assignment-item assignment-button ${selectedAssignmentId === assignment.binId ? "selected" : ""}`}
              onClick={() => onSelectAssignment(assignment.binId)}
            >
              <div className="assignment-head">
                <strong>
                  {assignment.binId} to {assignment.truckId}
                </strong>
                <span className="eta-pill">{assignment.etaMinutes === null ? "Pending" : `${assignment.etaMinutes} min`}</span>
              </div>
              <p>{assignment.reason}</p>
              <div className="meta-line">
                <span>{assignment.route.join(" / ")}</span>
                <span>{assignment.loadKg} kg</span>
              </div>
            </button>
          ))
        ) : (
          <EmptyState title="No active assignments here" detail="This zone lens currently has no matching route decisions." />
        )}
      </div>
    </article>
  );
}

export function CommandDeckPanel({ actions, activeMode, onModeChange }) {
  return (
    <article className="panel command-panel">
      <PanelHeader label="Command Deck" title="Operator modes" aside={activeMode} />

      <div className="command-mode-row">
        {["Pulse", "Forecast", "Anomaly"].map((mode) => (
          <button key={mode} className={activeMode === mode ? "chip active" : "chip"} onClick={() => onModeChange(mode)}>
            {mode}
          </button>
        ))}
      </div>

      <div className="command-grid">
        {actions.map((action) => (
          <article key={action.title} className={`command-card ${action.tone}`}>
            <span className="small-label">{action.label}</span>
            <strong>{action.title}</strong>
            <p>{action.detail}</p>
          </article>
        ))}
      </div>
    </article>
  );
}

export function FleetAndComplaintsPanel({ trucks, complaints }) {
  return (
    <article className="panel split-panel">
      <div className="subpanel">
        <PanelHeader label="Fleet" title="Truck status" compact />
        <div className="truck-list compact-list panel-scroll">
          {trucks.map((truck) => (
            <article key={truck.id} className="truck-card">
              <div className="truck-head">
                <strong>{truck.id}</strong>
                <span className={truck.available ? "status-ok" : "status-risk"}>{truck.available ? "Ready" : "Busy"}</span>
              </div>
              <p>{truck.driver}</p>
              <div className="meta-line">
                <span>{truck.currentZone}</span>
                <span>{truck.utilizationPct}% load</span>
                <span>{truck.nextReadyMinutes.toFixed(0)} min</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="subpanel">
        <PanelHeader label="Complaints" title="Citizen alerts" compact />
        <div className="complaint-list compact-list panel-scroll">
          {complaints.length ? (
            complaints.map((complaint) => (
              <article key={complaint.id} className="complaint-card">
                <div className="complaint-head">
                  <strong>{complaint.id}</strong>
                  <span className={`complaint-status ${complaint.status.toLowerCase()}`}>{complaint.status}</span>
                </div>
                <p>{complaint.issue}</p>
                <div className="meta-line">
                  <span>{complaint.zone}</span>
                  <span>{complaint.waitingMinutes} min</span>
                  <span>{complaint.relatedFillLevel}% nearby</span>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No complaints in view" detail="The current zone lens has no active resident complaints." />
          )}
        </div>
      </div>
    </article>
  );
}

export function MissionControlDrawer({ selectedAssignment, selectedZone, selectedMode }) {
  return (
    <article className="panel mission-panel">
      <PanelHeader label="Mission Control" title="Focused command drawer" aside={selectedMode} />
      {selectedAssignment ? (
        <div className="mission-grid">
          <div className="mission-card">
            <span className="small-label">Selected Route</span>
            <strong>{selectedAssignment.binId}</strong>
            <p>{selectedAssignment.reason}</p>
          </div>
          <div className="mission-card">
            <span className="small-label">Truck</span>
            <strong>{selectedAssignment.truckId}</strong>
            <p>{selectedAssignment.route.join(" / ")}</p>
          </div>
          <div className="mission-card">
            <span className="small-label">Payload</span>
            <strong>{selectedAssignment.loadKg} kg</strong>
            <p>
              {selectedAssignment.etaMinutes === null
                ? "Pending fleet capacity"
                : `ETA ${selectedAssignment.etaMinutes} min with ${selectedAssignment.utilizationAfterTrip}% projected load.`}
            </p>
          </div>
          <div className="mission-actions">
            <button type="button">Lock Route Focus</button>
            <button type="button" className="secondary">
              Prioritize {selectedZone}
            </button>
            <button type="button" className="ghost">
              Simulate Reroute
            </button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No route selected"
          detail="Pick an assignment or route line to inspect its exact mission posture."
        />
      )}
    </article>
  );
}

export function AnomalyPanel({ anomalies }) {
  return (
    <article className="panel anomaly-panel">
      <PanelHeader label="Anomaly Chamber" title="Signals that deserve attention" aside={`${anomalies.length} traces`} />

      <div className="compact-list panel-scroll">
        {anomalies.length ? (
          anomalies.map((anomaly) => (
            <article key={anomaly.title} className={`anomaly-card ${anomaly.tone}`}>
              <div className="anomaly-head">
                <strong>{anomaly.title}</strong>
                <span>{anomaly.tag}</span>
              </div>
              <p>{anomaly.detail}</p>
            </article>
          ))
        ) : (
          <EmptyState title="No anomalies surfaced" detail="The current lens is stable enough that no trace is standing out." />
        )}
      </div>
    </article>
  );
}

export function FeedPanel({ liveFeed }) {
  return (
    <article className="panel feed-panel">
      <PanelHeader label="Activity Feed" title="Recent changes" />

      <div className="feed-list compact-list panel-scroll">
        {liveFeed.length ? (
          liveFeed.map((event) => (
            <article key={event.id} className="feed-item">
              <span className="feed-type">{event.type}</span>
              <div>
                <div className="feed-head">
                  <strong>{event.headline}</strong>
                  <span className="muted">{event.timeLabel}</span>
                </div>
                <p>{event.detail}</p>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No feed events in this lens" detail="Try another zone or switch to the whole-city view." />
        )}
      </div>
    </article>
  );
}

export function CloudOpsPanel({ cloudOps, metrics, scenario }) {
  if (!cloudOps) {
    return (
      <article className="panel glass-card fade-in">
        <PanelHeader label="Cloud Operations" title="Deployment layer" />
        <EmptyState title="Cloud telemetry unavailable" detail="Refresh the dashboard to rebuild cloud status." />
      </article>
    );
  }

  const statCards = [
    { label: "Uptime", value: `${cloudOps.uptimePct}%`, tone: "success" },
    { label: "Latency", value: `${cloudOps.latencyMs} ms`, tone: cloudOps.latencyMs > 95 ? "warning" : "success" },
    { label: "Edge Devices", value: cloudOps.edgeDevices, tone: "neutral" },
    { label: "API Calls", value: cloudOps.apiCallsToday.toLocaleString(), tone: "neutral" },
    { label: "Autoscale", value: `${cloudOps.autoscaleReplicas} pods`, tone: "success" },
    { label: "Storage", value: `${cloudOps.storageGb} GB`, tone: "neutral" },
  ];

  return (
    <article className="panel cloud-panel">
      <PanelHeader label="Cloud Operations" title="Deployable smart-city architecture" aside={cloudOps.provider} />

      <div className="cloud-hero">
        <div>
          <span className="small-label">Demo Pitch</span>
          <strong>{cloudOps.syncHealth} cloud sync in {cloudOps.region}</strong>
          <p>{cloudOps.demoPitch}</p>
        </div>
        <div className="cloud-pill-stack">
          <span>{cloudOps.dataResidency}</span>
          <span>{cloudOps.backupStatus}</span>
          <span>{scenario.label} model profile</span>
          <span>{metrics.serviceRiskBins || 0} risk bins tracked</span>
        </div>
      </div>

      <div className="cloud-stat-grid">
        {statCards.map((stat) => (
          <article key={stat.label} className={`metric-card ${stat.tone}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      <div className="cloud-grid">
        <section className="cloud-services">
          <PanelHeader label="Microservices" title="Runtime services" compact />
          <div className="compact-list">
            {cloudOps.services.map((service) => (
              <article key={service.name} className="service-card">
                <div>
                  <strong>{service.name}</strong>
                  <p>{service.detail}</p>
                </div>
                <span className={`service-status ${service.status.toLowerCase()}`}>{service.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="cloud-flow">
          <PanelHeader label="Cloud Flow" title="How to explain the project" compact />
          <ol>
            {cloudOps.deploymentFlow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
