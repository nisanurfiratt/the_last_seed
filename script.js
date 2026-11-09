/* THE LAST SEED
   Main interaction logic. Keep changeable values together in SETTINGS
   so that a live edit during the presentation is quick and safe.
*/

const SETTINGS = {
  startingWater: 5,
  startingSolar: 5,
  startingMoisture: 48,
  startingLight: 42,
  startingSoil: 38,
  startingStress: 8,
  startingGrowth: 0,
  sproutAt: 20,
  saplingAt: 50,
  bloomAt: 82,
  healthyMinimum: 35,
  stressLimit: 90,
  cycleMoistureLoss: 11,
  cycleLightLoss: 8,
  cycleGrowthGain: 12,
  maxLogEntries: 6
};

const ACTIONS = {
  water: { label: "Water the seed" },
  light: { label: "Redirect light" },
  soil: { label: "Nourish the soil" },
  shelter: { label: "Build a shelter" },
  cycle: { label: "Let a cycle pass" },
  bloom: { label: "Release the bloom" }
};

const initialState = () => ({
  water: SETTINGS.startingWater,
  solar: SETTINGS.startingSolar,
  moisture: SETTINGS.startingMoisture,
  light: SETTINGS.startingLight,
  soil: SETTINGS.startingSoil,
  stress: SETTINGS.startingStress,
  growth: SETTINGS.startingGrowth,
  cycle: 1,
  ended: false,
  outcome: null,
  events: ["The greenhouse is quiet. A seed waits beneath the soil."]
});

let state = initialState();
const $ = (id) => document.getElementById(id);
const clamp = (value) => Math.max(0, Math.min(100, value));

function getStage() {
  if (state.growth >= SETTINGS.bloomAt) return "bloom";
  if (state.growth >= SETTINGS.saplingAt) return "sapling";
  if (state.growth >= SETTINGS.sproutAt) return "sprout";
  return "seed";
}

function getStageName() {
  return ({ seed: "Dormant seed", sprout: "First sprout", sapling: "Young sapling", bloom: "Ready to bloom" })[getStage()];
}

/* The final flower colour reflects the resource that shaped the ecosystem most. */
function getBloomTone() {
  if (state.stress >= 40) return "resilient";
  if (state.moisture >= state.light + 8 && state.moisture >= state.soil + 8) return "hydrated";
  if (state.light >= state.moisture + 8 && state.light >= state.soil + 8) return "radiant";
  if (state.soil >= state.moisture + 8 && state.soil >= state.light + 8) return "grounded";
  return "balanced";
}

function getBloomToneLabel(tone) {
  return ({
    resilient: "Resilient / coral",
    hydrated: "Hydrated / turquoise",
    radiant: "Radiant / gold",
    grounded: "Grounded / lavender",
    balanced: "Balanced / ivory"
  })[tone];
}

/* Possibility: availability is derived from the system's current state. */
function getAvailability() {
  return {
    water: state.water > 0 && state.moisture < 85
      ? { allowed: true, hint: "Use 1 water unit · increase moisture" }
      : { allowed: false, hint: state.water === 0 ? "Locked · no water units remain" : "Locked · moisture is already high" },
    light: state.solar > 0 && state.light < 88
      ? { allowed: true, hint: "Use 1 solar cell · light +27; dry soil increases stress" }
      : { allowed: false, hint: state.solar === 0 ? "Locked · no solar cells remain" : "Locked · light is already strong" },
    soil: getStage() !== "seed" && state.water > 0 && state.solar > 0 && state.soil < 88
      ? { allowed: true, hint: "Use 1 water + 1 solar · improve soil" }
      : { allowed: false, hint: getStage() === "seed" ? "Unlocks when the seed sprouts" : state.water === 0 || state.solar === 0 ? "Locked · requires water and solar" : "Locked · soil is healthy enough" },
    shelter: state.stress >= 20 && state.solar > 0
      ? { allowed: true, hint: "Use 1 solar cell · reduce stress" }
      : { allowed: false, hint: state.stress < 20 ? "Unlocks when stress reaches 20%" : "Locked · no solar cells remain" },
    cycle: { allowed: true, hint: "Moisture −11 and light −8 · growth needs all conditions ≥35" },
    bloom: state.growth >= SETTINGS.bloomAt && state.moisture >= 25 && state.soil >= 45 && state.stress < 65
      ? { allowed: true, hint: "Your ecosystem is ready · complete the cycle" }
      : { allowed: false, hint: getStage() !== "bloom" ? `Unlocks at ${SETTINGS.bloomAt}% growth` : "Needs moisture ≥25, soil ≥45 and stress below 65%" }
  };
}

function addEvent(message) {
  state.events.unshift(message);
  state.events = state.events.slice(0, SETTINGS.maxLogEntries);
}

function change(values) {
  for (const [key, amount] of Object.entries(values)) state[key] = clamp(state[key] + amount);
}

/* Agency: each selected action directly changes resources, stress or growth. */
function performAction(action) {
  if (state.ended) return;
  const availability = getAvailability()[action];
  if (!availability || !availability.allowed) return;

  switch (action) {
    case "water":
      state.water -= 1;
      change({ moisture: 27, stress: -4 });
      addEvent("Water +27 moisture · stress −4 · 1 water unit used.");
      break;
    case "light":
      state.solar -= 1;
      change({ light: 27 });
      if (state.moisture >= SETTINGS.healthyMinimum) {
        change({ growth: 5, stress: -2 });
        addEvent("Light +27 · growth +5 · stress −2. Moisture was high enough to absorb the light.");
      } else {
        change({ stress: 12 });
        addEvent("Light +27, but moisture was below 35 · stress +12 · no growth. The seed could not use the light well.");
      }
      break;
    case "soil":
      state.water -= 1;
      state.solar -= 1;
      change({ soil: 25, moisture: 7, growth: 7 });
      addEvent("Soil +25 · moisture +7 · growth +7 · 1 water and 1 solar unit used.");
      break;
    case "shelter":
      state.solar -= 1;
      change({ stress: -25, moisture: 5 });
      addEvent("Shelter built · stress −25 · moisture +5 · 1 solar cell used.");
      break;
    case "cycle": {
      const healthy = state.moisture >= SETTINGS.healthyMinimum && state.light >= SETTINGS.healthyMinimum && state.soil >= SETTINGS.healthyMinimum;
      change({ moisture: -SETTINGS.cycleMoistureLoss, light: -SETTINGS.cycleLightLoss });
      if (healthy) {
        change({ growth: SETTINGS.cycleGrowthGain, stress: -5 });
        addEvent("Healthy cycle · growth +12 · stress −5 · moisture −11 and light −8.");
      } else {
        change({ stress: 13 });
        addEvent("Unbalanced cycle · stress +13 · moisture −11 and light −8 · at least one condition was below 35, so there was no growth.");
      }
      state.cycle += 1;
      break;
    }
    case "bloom":
      state.growth = 100;
      state.ended = true;
      state.outcome = "success";
      addEvent("The last seed bloomed. New life can spread across the quiet world.");
      break;
    default:
      return;
  }

  if (!state.ended && state.stress >= SETTINGS.stressLimit) {
    state.ended = true;
    state.outcome = "withered";
    addEvent("The seed could not survive the stress. The greenhouse fell quiet.");
  }

  render();
  if (state.ended) showEnding();
}

function setMeter(id, value) {
  $(id + "-value").textContent = `${value}%`;
  $(id + "-bar").style.width = `${value}%`;
}

function renderActions() {
  const availability = getAvailability();
  document.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action;
    const status = availability[action];
    button.disabled = !status.allowed || state.ended;
    button.querySelector("small").textContent = status.hint;
    button.setAttribute("aria-label", `${ACTIONS[action].label}. ${status.hint}`);
  });
}

function render() {
  const stage = getStage();
  $("stage-name").textContent = getStageName();
  $("cycle-number").textContent = String(state.cycle).padStart(2, "0");
  $("growth-value").textContent = `${state.growth}%`;
  $("growth-fill").style.width = `${state.growth}%`;
  $("growth-progress").setAttribute("aria-valuenow", String(state.growth));
  $("moisture-value").textContent = `${state.moisture}%`;
  $("light-value").textContent = `${state.light}%`;
  $("soil-value").textContent = `${state.soil}%`;
  $("stress-value").textContent = `${state.stress}%`;
  $("moisture-bar").style.width = `${state.moisture}%`;
  $("light-bar").style.width = `${state.light}%`;
  $("soil-bar").style.width = `${state.soil}%`;
  $("stress-bar").style.width = `${state.stress}%`;
  $("water-value").textContent = state.water;
  $("solar-value").textContent = state.solar;
  $("landscape").dataset.stage = stage;
  $("landscape").dataset.mood = state.stress >= 40 ? "stressed" : "calm";
  const bloomTone = getBloomTone();
  $("landscape").dataset.bloomTone = bloomTone;
  $("world-status").textContent = state.ended ? `ECOSYSTEM: ${state.outcome.toUpperCase()}` : `ECOSYSTEM: ${stage.toUpperCase()}`;
  $("atmosphere-label").textContent = stage === "bloom"
    ? `BLOOM: ${getBloomToneLabel(bloomTone).toUpperCase()}`
    : state.stress >= 40 ? "DISTURBED / FRAGILE" : "STILL / CHANGING";
  $("growth-description").textContent = ({seed:"A dormant seed rests beneath the soil.",sprout:"A fragile sprout has broken through the surface.",sapling:"The young plant is growing roots and reaching outward.",bloom:"The plant is strong enough to prepare its bloom."})[stage];
  $("action-feedback").textContent = state.ended ? "The experiment has ended. Restart to explore another path." : state.events[0];
  $("event-count").textContent = `${String(state.events.length).padStart(2,"0")} / ${String(SETTINGS.maxLogEntries).padStart(2,"0")}`;
  $("event-log").innerHTML = state.events.map((event, index) => `<li><span class="event-index">${String(index + 1).padStart(2,"0")}</span><span>${escapeHTML(event)}</span></li>`).join("");
  renderActions();
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}

function showEnding() {
  $("ending-kicker").textContent = state.outcome === "success" ? "FIELD REPORT // RESTORED" : "FIELD REPORT // LOST";
  $("ending-title").textContent = state.outcome === "success" ? "A new beginning." : "The greenhouse fell quiet.";
  $("ending-message").textContent = state.outcome === "success"
    ? `After ${state.cycle} cycles, the last seed bloomed. Your choices created the conditions for new life.`
    : `After ${state.cycle} cycles, stress reached ${state.stress}%. The seed could not survive this path. Try a different balance of water, light and soil.`;
  $("ending-dialog").showModal();
}

function restart() {
  state = initialState();
  $("ending-dialog").close();
  render();
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => performAction(button.dataset.action));
});
$("reset-button").addEventListener("click", restart);
$("ending-reset").addEventListener("click", restart);

render();
