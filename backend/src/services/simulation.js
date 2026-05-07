const cityGraph = {
  Depot: { Northside: 8, Midtown: 12, "East Market": 15, "South Park": 11, "West Harbor": 10 },
  Northside: { Depot: 8, Midtown: 6, "East Market": 9, "South Park": 10, "West Harbor": 14 },
  Midtown: { Depot: 12, Northside: 6, "East Market": 5, "South Park": 7, "West Harbor": 8 },
  "East Market": { Depot: 15, Northside: 9, Midtown: 5, "South Park": 8, "West Harbor": 12 },
  "South Park": { Depot: 11, Northside: 10, Midtown: 7, "East Market": 8, "West Harbor": 6 },
  "West Harbor": { Depot: 10, Northside: 14, Midtown: 8, "East Market": 12, "South Park": 6 },
};

const zoneBaseTraffic = {
  Depot: 1,
  Northside: 1.18,
  Midtown: 1.28,
  "East Market": 1.31,
  "South Park": 1.08,
  "West Harbor": 1.03,
};

const zoneCoordinates = {
  Depot: { x: 12, y: 53 },
  Northside: { x: 24, y: 24 },
  Midtown: { x: 48, y: 37 },
  "East Market": { x: 74, y: 34 },
  "South Park": { x: 55, y: 73 },
  "West Harbor": { x: 21, y: 72 },
};

const truckTemplates = [
  { id: "TRK-01", currentZone: "Depot", capacityKg: 300, fuelEfficiency: 0.91, driver: "A. Iyer" },
  { id: "TRK-02", currentZone: "South Park", capacityKg: 240, fuelEfficiency: 0.88, driver: "K. Sharma" },
  { id: "TRK-03", currentZone: "West Harbor", capacityKg: 280, fuelEfficiency: 0.84, driver: "N. Verma" },
];

const complaintTemplates = [
  {
    id: "CMP-41",
    zone: "East Market",
    issue: "Overflow reported near fish market service lane",
    severity: "High",
    waitingMinutes: 22,
  },
  {
    id: "CMP-42",
    zone: "Midtown",
    issue: "Missed pickup near office cluster",
    severity: "Medium",
    waitingMinutes: 16,
  },
  {
    id: "CMP-43",
    zone: "South Park",
    issue: "Public park bin lid jammed",
    severity: "Low",
    waitingMinutes: 41,
  },
];

const baseBins = [
  {
    id: "BIN-101",
    zone: "Northside",
    areaType: "Residential",
    fillLevel: 88,
    capacityKg: 120,
    dailyGrowth: 14,
    lastCollectedHoursAgo: 42,
    historicalDemand: [51, 58, 63, 67, 72, 80, 88],
  },
  {
    id: "BIN-102",
    zone: "Midtown",
    areaType: "Commercial",
    fillLevel: 71,
    capacityKg: 150,
    dailyGrowth: 18,
    lastCollectedHoursAgo: 27,
    historicalDemand: [48, 56, 64, 73, 79, 84, 90],
  },
  {
    id: "BIN-103",
    zone: "East Market",
    areaType: "Market",
    fillLevel: 86,
    capacityKg: 130,
    dailyGrowth: 22,
    lastCollectedHoursAgo: 35,
    historicalDemand: [44, 51, 60, 69, 77, 83, 89],
  },
  {
    id: "BIN-104",
    zone: "South Park",
    areaType: "Public Park",
    fillLevel: 59,
    capacityKg: 90,
    dailyGrowth: 12,
    lastCollectedHoursAgo: 19,
    historicalDemand: [27, 29, 34, 38, 41, 49, 55],
  },
  {
    id: "BIN-105",
    zone: "West Harbor",
    areaType: "Industrial",
    fillLevel: 54,
    capacityKg: 200,
    dailyGrowth: 16,
    lastCollectedHoursAgo: 18,
    historicalDemand: [40, 47, 49, 55, 61, 66, 70],
  },
  {
    id: "BIN-106",
    zone: "Midtown",
    areaType: "Food Street",
    fillLevel: 79,
    capacityKg: 110,
    dailyGrowth: 20,
    lastCollectedHoursAgo: 33,
    historicalDemand: [39, 45, 55, 62, 70, 79, 85],
  },
];

const scenarioPresets = {
  standard: {
    key: "standard",
    label: "Standard",
    title: "Balanced city pulse",
    summary: "Normal weekday rhythm with moderate oscillation across commercial and residential corridors.",
    trafficBoost: {},
    fillBoost: {},
    complaintBoost: {},
    unavailableTrucks: [],
    growthBoost: {},
    sustainabilityFactor: 1,
  },
  surge: {
    key: "surge",
    label: "Festival Surge",
    title: "Festival night congestion burst",
    summary: "Market and Midtown density spike as evening crowds compress access and bin growth accelerates.",
    trafficBoost: { Midtown: 0.16, "East Market": 0.18, Northside: 0.05 },
    fillBoost: { Midtown: 12, "East Market": 14, Northside: 6 },
    complaintBoost: { Midtown: 12, "East Market": 18 },
    unavailableTrucks: [],
    growthBoost: { Midtown: 5, "East Market": 7 },
    sustainabilityFactor: 0.95,
  },
  monsoon: {
    key: "monsoon",
    label: "Monsoon",
    title: "Rain-soaked disruption pattern",
    summary: "South-side flooding and low-visibility routes slow the fleet while wet waste pushes heavier loads.",
    trafficBoost: { "South Park": 0.2, "West Harbor": 0.14, Midtown: 0.09 },
    fillBoost: { "South Park": 9, "West Harbor": 7 },
    complaintBoost: { "South Park": 15, "West Harbor": 9 },
    unavailableTrucks: ["TRK-02"],
    growthBoost: { "South Park": 4, "West Harbor": 3 },
    sustainabilityFactor: 0.91,
  },
  strike: {
    key: "strike",
    label: "Labor Shock",
    title: "Reduced fleet availability",
    summary: "Crew shortage compresses dispatch options and elevates queue pressure across the whole grid.",
    trafficBoost: { Midtown: 0.08, "East Market": 0.08, "South Park": 0.05 },
    fillBoost: { Northside: 6, Midtown: 8, "East Market": 8, "South Park": 6, "West Harbor": 5 },
    complaintBoost: { Midtown: 10, "East Market": 12, "South Park": 10 },
    unavailableTrucks: ["TRK-03"],
    growthBoost: { Midtown: 3, "East Market": 4, "South Park": 2 },
    sustainabilityFactor: 0.87,
  },
};

const timelinePresets = [
  { key: "now", label: "Now", tickOffset: 0, minutesAhead: 0 },
  { key: "plus15", label: "+15 min", tickOffset: 2, minutesAhead: 15 },
  { key: "plus60", label: "+60 min", tickOffset: 8, minutesAhead: 60 },
  { key: "plus240", label: "+4 hr", tickOffset: 24, minutesAhead: 240 },
];

let liveTick = 0;

function getScenarioProfile(key, forceOverflowScenario) {
  if (forceOverflowScenario && !key) return scenarioPresets.surge;
  return scenarioPresets[key] || scenarioPresets.standard;
}

function averageGrowth(history) {
  let totalGrowth = 0;
  for (let index = 1; index < history.length; index += 1) {
    totalGrowth += history[index] - history[index - 1];
  }
  return totalGrowth / (history.length - 1);
}

function predictFillHours(bin) {
  const trend = averageGrowth(bin.historicalDemand);
  const effectiveGrowthPerDay = (trend + bin.dailyGrowth) / 2;
  const remaining = Math.max(0, 100 - bin.fillLevel);
  const daysToFull = remaining / Math.max(effectiveGrowthPerDay, 0.5);
  return Number((daysToFull * 24).toFixed(1));
}

function classifyPriority(fillLevel) {
  if (fillLevel >= 90) return "Emergency";
  if (fillLevel >= 60) return "Medium";
  return "Low";
}

function calculatePriorityScore(bin, predictedOverflowHours, trafficMultiplier) {
  const fillScore = bin.fillLevel * 0.54;
  const urgencyScore = Math.max(0, 20 - predictedOverflowHours) * 1.6;
  const stagnationScore = Math.min(bin.lastCollectedHoursAgo, 48) * 0.38;
  const congestionScore = Math.max(0, (trafficMultiplier - 1) * 12);
  return Number((fillScore + urgencyScore + stagnationScore + congestionScore).toFixed(1));
}

function shortestDistance(start, end) {
  if (start === end) return 0;
  const distances = {};
  const visited = new Set();
  const nodes = Object.keys(cityGraph);

  nodes.forEach((node) => {
    distances[node] = Number.POSITIVE_INFINITY;
  });
  distances[start] = 0;

  while (visited.size < nodes.length) {
    let currentNode = null;
    let shortest = Number.POSITIVE_INFINITY;

    nodes.forEach((node) => {
      if (!visited.has(node) && distances[node] < shortest) {
        shortest = distances[node];
        currentNode = node;
      }
    });

    if (!currentNode) break;
    if (currentNode === end) return distances[currentNode];

    visited.add(currentNode);
    Object.entries(cityGraph[currentNode]).forEach(([neighbor, weight]) => {
      const candidate = distances[currentNode] + weight;
      if (candidate < distances[neighbor]) distances[neighbor] = candidate;
    });
  }

  return distances[end];
}

function estimateCollectionLoad(bin) {
  return Math.ceil((bin.fillLevel / 100) * bin.capacityKg);
}

function buildTrafficMap(tick, scenarioProfile) {
  return Object.fromEntries(
    Object.entries(zoneBaseTraffic).map(([zone, base], index) => {
      if (zone === "Depot") return [zone, 1];
      const oscillation = Math.sin((tick + index) / 1.8) * 0.11;
      const scenarioBoost = scenarioProfile.trafficBoost[zone] || 0;
      return [zone, Number((base + oscillation + scenarioBoost).toFixed(2))];
    })
  );
}

function buildLiveBins(tick, scenarioProfile) {
  return baseBins.map((bin, index) => {
    const wave = Math.sin((tick + 1.6 * index) / 2.3) * 5;
    const trend = (tick % 6) * 1.2;
    const scenarioBoost = scenarioProfile.fillBoost[bin.zone] || 0;
    const fillLevel = Math.max(22, Math.min(99, Math.round(bin.fillLevel + wave + trend + scenarioBoost)));

    return {
      ...bin,
      fillLevel,
      dailyGrowth: bin.dailyGrowth + (scenarioProfile.growthBoost[bin.zone] || 0),
      lastCollectedHoursAgo: Number((bin.lastCollectedHoursAgo + tick * 0.4).toFixed(1)),
    };
  });
}

function buildFleetStatus(tick, scenarioProfile) {
  return truckTemplates.map((truck, index) => {
    const activePulse = (tick + index) % 4 !== 0 || truck.id !== "TRK-03";
    const unavailableByScenario = scenarioProfile.unavailableTrucks.includes(truck.id);
    const available = !unavailableByScenario && (truck.id === "TRK-03" ? activePulse : true);
    const speedPenalty = unavailableByScenario ? -8 : 0;

    return {
      ...truck,
      available,
      liveSpeedKmph: Math.max(14, Math.round(28 + Math.sin((tick + index) / 1.7) * 6 + index * 3 + speedPenalty)),
    };
  });
}

function buildRouteSegments(route) {
  const segments = [];
  for (let index = 0; index < route.length - 1; index += 1) {
    const start = zoneCoordinates[route[index]];
    const end = zoneCoordinates[route[index + 1]];
    if (!start || !end) continue;
    segments.push({ from: route[index], to: route[index + 1], start, end });
  }
  return segments;
}

function assignRoutes(enrichedBins, trucks, trafficByZone) {
  const availableTrucks = trucks
    .filter((truck) => truck.available)
    .map((truck) => ({
      ...truck,
      nextReadyMinutes: 0,
      assignedLoadKg: 0,
      routeHistory: [],
    }));

  const orderedBins = [...enrichedBins].sort((left, right) => right.priorityScore - left.priorityScore);
  const assignments = [];

  orderedBins.forEach((bin) => {
    const candidateTrucks = availableTrucks
      .map((truck) => {
        const distance = shortestDistance(truck.currentZone, bin.zone);
        const returnDistance = shortestDistance(bin.zone, "Depot");
        const trafficMultiplier = trafficByZone[bin.zone] || 1;
        const eta = Number((distance * trafficMultiplier).toFixed(1));
        const returnEta = Number((returnDistance * trafficMultiplier).toFixed(1));
        const load = estimateCollectionLoad(bin);
        const projectedLoad = truck.assignedLoadKg + load;
        const canHandle = projectedLoad <= truck.capacityKg;

        return {
          truck,
          eta,
          returnEta,
          load,
          canHandle,
          score: canHandle
            ? (truck.nextReadyMinutes + eta + returnEta + projectedLoad / 25) / truck.fuelEfficiency
            : Number.POSITIVE_INFINITY,
        };
      })
      .sort((left, right) => left.score - right.score);

    const bestChoice = candidateTrucks[0];
    if (!bestChoice || !bestChoice.canHandle) {
      assignments.push({
        binId: bin.id,
        truckId: "UNASSIGNED",
        zone: bin.zone,
        route: [bin.zone],
        routeSegments: [],
        etaMinutes: null,
        loadKg: estimateCollectionLoad(bin),
        utilizationAfterTrip: null,
        reason: "No truck with enough remaining capacity is currently available.",
      });
      return;
    }

    bestChoice.truck.assignedLoadKg += bestChoice.load;
    const route = [bestChoice.truck.currentZone, bin.zone, "Depot"];

    assignments.push({
      binId: bin.id,
      truckId: bestChoice.truck.id,
      zone: bin.zone,
      route,
      routeSegments: buildRouteSegments(route),
      etaMinutes: Number((bestChoice.truck.nextReadyMinutes + bestChoice.eta).toFixed(1)),
      loadKg: bestChoice.load,
      utilizationAfterTrip: Math.round((bestChoice.truck.assignedLoadKg / bestChoice.truck.capacityKg) * 100),
      reason: `${bestChoice.truck.id} is the best live dispatch after balancing queue time, traffic, distance, and remaining payload.`,
    });

    bestChoice.truck.currentZone = "Depot";
    bestChoice.truck.nextReadyMinutes = Number(
      (bestChoice.truck.nextReadyMinutes + bestChoice.eta + bestChoice.returnEta + 7).toFixed(1)
    );
    bestChoice.truck.routeHistory.push(bin.id);
  });

  return {
    assignments,
    truckPlans: availableTrucks.map((truck) => ({
      id: truck.id,
      nextReadyMinutes: truck.nextReadyMinutes,
      assignedLoadKg: truck.assignedLoadKg,
      utilizationPct: Math.round((truck.assignedLoadKg / truck.capacityKg) * 100),
      routeHistory: truck.routeHistory,
    })),
  };
}

function buildMetrics(enrichedBins, assignments, trucks, scenarioProfile) {
  const emergencyBins = enrichedBins.filter((bin) => bin.priority === "Emergency").length;
  const mediumBins = enrichedBins.filter((bin) => bin.priority === "Medium").length;
  const lowBins = enrichedBins.filter((bin) => bin.priority === "Low").length;
  const assignedTrips = assignments.filter((assignment) => assignment.truckId !== "UNASSIGNED");
  const averageEta =
    assignedTrips.length === 0
      ? 0
      : Number((assignedTrips.reduce((total, assignment) => total + assignment.etaMinutes, 0) / assignedTrips.length).toFixed(1));
  const serviceRiskBins = enrichedBins.filter((bin) => bin.predictedOverflowHours < 12).length;
  const fleetUtilization = Math.round(
    trucks.reduce((total, truck) => total + (truck.utilizationPct || 0), 0) / Math.max(trucks.length, 1)
  );
  const estimatedCo2SavedKg = Number(
    (assignedTrips.length * 7.4 + mediumBins * 1.8 * scenarioProfile.sustainabilityFactor).toFixed(1)
  );

  return {
    totalBins: enrichedBins.length,
    emergencyBins,
    mediumBins,
    lowBins,
    serviceRiskBins,
    availableTrucks: trucks.filter((truck) => truck.available).length,
    averageEta,
    fleetUtilization,
    estimatedCo2SavedKg,
  };
}

function buildZonePressure(enrichedBins, trafficByZone) {
  const grouped = {};
  enrichedBins.forEach((bin) => {
    if (!grouped[bin.zone]) {
      grouped[bin.zone] = {
        zone: bin.zone,
        averageFill: 0,
        totalPriorityScore: 0,
        bins: 0,
        emergencyBins: 0,
      };
    }

    grouped[bin.zone].averageFill += bin.fillLevel;
    grouped[bin.zone].totalPriorityScore += bin.priorityScore;
    grouped[bin.zone].bins += 1;
    if (bin.priority === "Emergency") grouped[bin.zone].emergencyBins += 1;
  });

  return Object.values(grouped)
    .map((zone) => ({
      ...zone,
      averageFill: Math.round(zone.averageFill / zone.bins),
      trafficMultiplier: trafficByZone[zone.zone],
      pressureIndex: Math.round(zone.totalPriorityScore / zone.bins + trafficByZone[zone.zone] * 10),
      x: zoneCoordinates[zone.zone].x,
      y: zoneCoordinates[zone.zone].y,
    }))
    .sort((left, right) => right.pressureIndex - left.pressureIndex);
}

function buildComplaints(tick, enrichedBins, scenarioProfile) {
  return complaintTemplates
    .map((complaint, index) => {
      const relatedBin = enrichedBins.find((bin) => bin.zone === complaint.zone);
      const escalated = relatedBin && relatedBin.fillLevel > 88;
      return {
        ...complaint,
        waitingMinutes: complaint.waitingMinutes + tick * (index + 1) + (scenarioProfile.complaintBoost[complaint.zone] || 0),
        status: escalated ? "Escalated" : index === 0 ? "Dispatching" : "Queued",
        relatedFillLevel: relatedBin ? relatedBin.fillLevel : null,
      };
    })
    .sort((left, right) => right.waitingMinutes - left.waitingMinutes);
}

function buildInsights(metrics, zonePressure, complaints, trucks, scenarioProfile) {
  const highestPressureZone = zonePressure[0];
  const delayedTruck = [...trucks].sort((left, right) => right.nextReadyMinutes - left.nextReadyMinutes)[0];
  const escalatedComplaint = complaints.find((complaint) => complaint.status === "Escalated");

  const insights = [
    {
      title: "Pre-overflow intervention",
      value: `${metrics.serviceRiskBins} bins`,
      detail: "Require service within the next 12 hours to avoid public overflow incidents.",
      tone: metrics.serviceRiskBins > 2 ? "danger" : "warning",
    },
    {
      title: "Hottest operational zone",
      value: highestPressureZone.zone,
      detail: `Pressure index ${highestPressureZone.pressureIndex} with ${highestPressureZone.averageFill}% average fill and ${highestPressureZone.trafficMultiplier}x traffic.`,
      tone: "neutral",
    },
    {
      title: "Fleet bottleneck",
      value: delayedTruck ? `${delayedTruck.id} ${delayedTruck.nextReadyMinutes.toFixed(0)} min` : "Stable",
      detail: delayedTruck
        ? `Projected utilization is ${delayedTruck.utilizationPct}% after queued pickups.`
        : "No fleet congestion detected.",
      tone: delayedTruck && delayedTruck.nextReadyMinutes > 60 ? "warning" : "success",
    },
    {
      title: "Reality profile",
      value: scenarioProfile.label,
      detail: scenarioProfile.summary,
      tone: "neutral",
    },
  ];

  if (escalatedComplaint) {
    insights.push({
      title: "Citizen escalation",
      value: escalatedComplaint.zone,
      detail: `${escalatedComplaint.id} is waiting ${escalatedComplaint.waitingMinutes} minutes and should be tied to dispatch priority.`,
      tone: "danger",
    });
  }

  return insights;
}

function buildLiveFeed(assignments, complaints, metrics, tick, scenarioProfile) {
  const feed = [];
  assignments.slice(0, 3).forEach((assignment, index) => {
    feed.push({
      id: `dispatch-${assignment.binId}`,
      type: "Dispatch",
      timeLabel: `${2 + index + tick} min ago`,
      headline: `${assignment.truckId} assigned to ${assignment.binId}`,
      detail: assignment.reason,
    });
  });

  complaints.slice(0, 2).forEach((complaint) => {
    feed.push({
      id: complaint.id,
      type: "Complaint",
      timeLabel: `${Math.max(1, Math.round(complaint.waitingMinutes / 3))} min ago`,
      headline: `${complaint.zone} resident report updated`,
      detail: `${complaint.issue}. Current status: ${complaint.status}.`,
    });
  });

  feed.push({
    id: "scenario-feed",
    type: "Scenario",
    timeLabel: "Just now",
    headline: `${scenarioProfile.label} conditions are active`,
    detail: scenarioProfile.summary,
  });

  feed.push({
    id: "sustainability",
    type: "Analytics",
    timeLabel: "Just now",
    headline: `${metrics.estimatedCo2SavedKg} kg CO2 savings projected today`,
    detail: "Dynamic scheduling prevents low-value trips and improves truck utilization.",
  });

  return feed;
}

function buildForecast(metrics, bins, assignments, scenarioProfile) {
  const leadBin = bins[0];
  const assigned = assignments.filter((assignment) => assignment.truckId !== "UNASSIGNED").length;
  return {
    summary: scenarioProfile.summary,
    next15Minutes: `Dispatch can stabilize ${assigned} active routes if ${metrics.availableTrucks} trucks remain available.`,
    nextHour: `${metrics.serviceRiskBins} bins may drift into service-risk territory if hotspot pressure grows unchecked.`,
    nextWave: leadBin
      ? `${leadBin.zone} remains the dominant pressure corridor, led by ${leadBin.id} at ${leadBin.fillLevel}% fill.`
      : "Grid conditions remain balanced.",
  };
}

function buildCloudOps(snapshot, scenarioProfile) {
  const unassignedRoutes = snapshot.assignments.filter((assignment) => assignment.truckId === "UNASSIGNED").length;
  const escalatedComplaints = snapshot.complaints.filter((complaint) => complaint.status === "Escalated").length;
  const activeDevices = snapshot.bins.length + snapshot.trucks.length;
  const highRiskZones = snapshot.zonePressure.filter((zone) => zone.pressureIndex >= 80).length;

  return {
    provider: "AetherGrid Cloud",
    region: "ap-south-1",
    syncHealth: unassignedRoutes || escalatedComplaints ? "Degraded" : "Healthy",
    uptimePct: Number((99.91 - unassignedRoutes * 0.08).toFixed(2)),
    edgeDevices: activeDevices,
    packetsPerMinute: 420 + snapshot.metrics.totalBins * 18 + highRiskZones * 34,
    latencyMs: Math.max(42, 74 + highRiskZones * 8 + unassignedRoutes * 15),
    storageGb: Number((18.4 + snapshot.liveFeed.length * 0.14 + snapshot.metrics.totalBins * 0.22).toFixed(1)),
    apiCallsToday: 12480 + snapshot.assignments.length * 320,
    autoscaleReplicas: Math.max(2, 2 + highRiskZones + escalatedComplaints),
    backupStatus: "Last checkpoint 4 minutes ago",
    dataResidency: "India region with encrypted telemetry streams",
    services: [
      {
        name: "IoT telemetry ingest",
        status: "Online",
        detail: `${activeDevices} edge devices publishing fill, route, and fleet signals.`,
      },
      {
        name: "Prediction worker",
        status: scenarioProfile.key === "strike" ? "Scaling" : "Online",
        detail: `${scenarioProfile.label} model profile is recalculating priority scores and overflow windows.`,
      },
      {
        name: "Dispatch API",
        status: unassignedRoutes ? "Watch" : "Online",
        detail: unassignedRoutes
          ? `${unassignedRoutes} route needs manual fleet capacity review.`
          : "All active route decisions are available to mobile crew apps.",
      },
      {
        name: "Citizen notification queue",
        status: escalatedComplaints ? "Priority" : "Online",
        detail: escalatedComplaints
          ? `${escalatedComplaints} complaint thread is being elevated for SLA protection.`
          : "Resident updates are being batched without SLA pressure.",
      },
    ],
    deploymentFlow: [
      "Smart bin sensor publishes fill telemetry",
      "Cloud API validates and stores the event",
      "Prediction worker updates risk and ETA",
      "Dispatch dashboard pushes crew-ready decisions",
    ],
    demoPitch:
      "The cloud layer turns this from a static dashboard into a deployable smart-city platform: edge devices stream telemetry, cloud workers forecast risk, APIs coordinate crews, and backups protect audit history.",
  };
}

function buildTimelineSummary(snapshot) {
  return {
    metrics: snapshot.metrics,
    hottestZone: snapshot.zonePressure[0]?.zone || "Stable",
    forecast: snapshot.forecast,
    assignments: snapshot.assignments.length,
  };
}

function buildSnapshotAtTick(baseTick, scenarioProfile) {
  const bins = buildLiveBins(baseTick, scenarioProfile);
  const trafficByZone = buildTrafficMap(baseTick, scenarioProfile);
  const fleet = buildFleetStatus(baseTick, scenarioProfile);

  const enrichedBins = bins.map((bin) => {
    const predictedOverflowHours = predictFillHours(bin);
    return {
      ...bin,
      predictedOverflowHours,
      priority: classifyPriority(bin.fillLevel),
      trafficMultiplier: trafficByZone[bin.zone],
      priorityScore: calculatePriorityScore(bin, predictedOverflowHours, trafficByZone[bin.zone]),
      serviceWindowLabel:
        predictedOverflowHours < 8 ? "Immediate dispatch" : predictedOverflowHours < 24 ? "Next collection wave" : "Monitor",
    };
  });

  const { assignments, truckPlans } = assignRoutes(enrichedBins, fleet, trafficByZone);
  const trucks = fleet.map((truck) => {
    const plan = truckPlans.find((item) => item.id === truck.id);
    return {
      ...truck,
      nextReadyMinutes: plan ? plan.nextReadyMinutes : 0,
      utilizationPct: plan ? plan.utilizationPct : 0,
      routeHistory: plan ? plan.routeHistory : [],
    };
  });

  const metrics = buildMetrics(enrichedBins, assignments, trucks, scenarioProfile);
  const zonePressure = buildZonePressure(enrichedBins, trafficByZone);
  const complaints = buildComplaints(baseTick, enrichedBins, scenarioProfile);
  const insights = buildInsights(metrics, zonePressure, complaints, trucks, scenarioProfile);
  const liveFeed = buildLiveFeed(assignments, complaints, metrics, baseTick, scenarioProfile);
  const forecast = buildForecast(metrics, enrichedBins, assignments, scenarioProfile);

  return {
    metrics,
    bins: enrichedBins.sort((left, right) => right.priorityScore - left.priorityScore),
    trucks,
    trafficByZone,
    assignments,
    zonePressure,
    complaints,
    insights,
    liveFeed,
    forecast,
  };
}

function createSimulationSnapshot(options = {}) {
  liveTick += 1;
  const scenarioProfile = getScenarioProfile(options.scenario, options.forceOverflowScenario);
  const currentTick = liveTick;
  const currentSnapshot = buildSnapshotAtTick(currentTick, scenarioProfile);
  const cloudOps = buildCloudOps(currentSnapshot, scenarioProfile);

  const timeline = timelinePresets.map((timelinePreset) => {
    const snapshot = buildSnapshotAtTick(currentTick + timelinePreset.tickOffset, scenarioProfile);
    return {
      ...timelinePreset,
      summary: buildTimelineSummary(snapshot),
      snapshot,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    isLive: true,
    scenario: scenarioProfile,
    scenarios: Object.values(scenarioPresets).map(({ key, label, title }) => ({ key, label, title })),
    timelineOptions: timelinePresets.map(({ key, label, minutesAhead }) => ({ key, label, minutesAhead })),
    timeline,
    ...currentSnapshot,
    cloudOps,
    mapLegend: {
      depot: zoneCoordinates.Depot,
      zones: Object.fromEntries(Object.entries(zoneCoordinates).filter(([zone]) => zone !== "Depot")),
    },
    exampleScenario: {
      title: scenarioProfile.title,
      explanation:
        "The platform continuously reprioritizes bins, escalates citizen complaints, and rebalances the fleet as congestion and fill levels shift.",
      focusedBins: currentSnapshot.bins.slice(0, 3).map((bin) => ({
        id: bin.id,
        zone: bin.zone,
        assignedTruck: currentSnapshot.assignments.find((assignment) => assignment.binId === bin.id)?.truckId || "UNASSIGNED",
      })),
    },
  };
}

module.exports = { createSimulationSnapshot };
