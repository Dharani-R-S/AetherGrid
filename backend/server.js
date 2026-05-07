const path = require("path");
const fs = require("fs");
const express = require("express");
const { createSimulationSnapshot } = require("./src/services/simulation");

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, "..", "frontend", "dist");

const app = express();

app.get("/api/dashboard", (request, response) => {
  response.json(createSimulationSnapshot({ scenario: request.query.scenario }));
});

app.get("/api/scenario", (request, response) => {
  response.json(
    createSimulationSnapshot({
      scenario: request.query.scenario,
      forceOverflowScenario: true,
    })
  );
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Dynamic waste backend running at http://localhost:${PORT}`);
});
