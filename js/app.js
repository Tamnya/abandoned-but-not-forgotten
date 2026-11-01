import { loadSiteData, html, shownFacts, factById, shuffled } from "./data.js";
import { factPanel, factTag, pageHeading } from "./components.js";

const PAGE_LINKS = [
  ["Home", "index.html", "home"], ["Moon Issue", "moon.html", "moon"],
  ["Mars Issue", "mars.html", "mars"], ["Deep Space", "deep-space.html", "deep_space"],
  ["Why It Matters", "why.html", "why"], ["Arcade", "arcade.html", "arcade"],
  ["My Collection", "collection.html", "collection"], ["The Almanac", "almanac.html", "almanac"]
];
const PLANETS = [
  ["Mercury", "F-100", "#a8a5a2"], ["Venus", "F-101", "#d8935f"], ["Earth", "F-102", "#3a8ec8"],
  ["Mars", "F-103", "#c65339"], ["Jupiter", "F-104", "#d9aa78"], ["Saturn", "F-105", "#e8cd72"],
  ["Uranus", "F-106", "#87d3d6"], ["Neptune", "F-107", "#425bb4"], ["Pluto", "F-108", "#a38c84"]
];
const PLANET_FACT_SHEET_URL = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/";
const CHAPTER_PAGE = { moon: "moon.html", mars: "mars.html", deep_space: "deep-space.html", why: "why.html", collection: "collection.html", arcade: "arcade.html" };
const main = document.querySelector("#main");
const page = document.body.dataset.page;
let siteData;
let audioContext;
let collectibleTimer;
let collectibleRemovalTimer;

function getFact(id) { return factById(siteData.facts, id); }
function card(id) { const fact = getFact(id); return fact?.verified && fact.primary_url && fact.text ? factPanel(fact) : ""; }
function nav() {
  const links = PAGE_LINKS.map(([label, href, key]) => `<a href="${href}" ${page === key ? 'aria-current="page"' : ""}>${label}</a>`).join("");
  document.querySelector("#site-header").innerHTML = `<div class="topbar"><a class="brand" href="index.html">SPACE HARDWARE FILES</a><nav class="nav-links" aria-label="Main navigation">${links}</nav><button class="sound-toggle" id="sound-toggle" type="button" aria-pressed="false" aria-label="Enable sound effects">Sound: off</button></div>`;
  const toggle = document.querySelector("#sound-toggle");
  const saved = localStorage.getItem("space-comic-sound") === "on";
  toggle.setAttribute("aria-pressed", String(saved)); toggle.textContent = saved ? "Sound: on" : "Sound: off";
  toggle.setAttribute("aria-label", saved ? "Disable sound effects" : "Enable sound effects");
  toggle.addEventListener("click", () => {
    const active = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(active)); toggle.textContent = active ? "Sound: on" : "Sound: off";
    toggle.setAttribute("aria-label", active ? "Disable sound effects" : "Enable sound effects");
    localStorage.setItem("space-comic-sound", active ? "on" : "off");
    if (active) void playPop(660, .12);
  });
  document.querySelectorAll(".nav-links a").forEach(link => link.addEventListener("click", () => sessionStorage.setItem("page-turn", "yes")));
}

async function playPop(frequency = 460, duration = .075) {
  if (localStorage.getItem("space-comic-sound") !== "on") return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext ||= new Audio();
    if (audioContext.state !== "running") await audioContext.resume();
    const context = audioContext;
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = "triangle"; oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(110, frequency * .42), context.currentTime + duration);
    gain.gain.setValueAtTime(.1, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch { /* Audio is an optional enhancement. */ }
}

function footer() {
  document.querySelector("#site-footer").innerHTML = `<div class="footer-inner"><div class="footer-links">${PAGE_LINKS.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</div><p>Independent participant project. NASA data and mission imagery are credited in The Almanac. This project is not endorsed by NASA.</p><span id="collectible-announcer" class="sr-only" role="status" aria-live="polite"></span></div>`;
  scheduleCollectible(2500 + Math.random() * 4500);
}

function readCollection() {
  try { const parsed = JSON.parse(localStorage.getItem("space-comic-planets") || "[]"); return Array.isArray(parsed) ? parsed.filter(id => PLANETS.some(planet => planet[1] === id)) : []; }
  catch { return []; }
}
function toast(message) {
  const old = document.querySelector(".toast"); old?.remove();
  const item = document.createElement("div"); item.className = "toast"; item.setAttribute("role", "status"); item.textContent = message;
  document.body.append(item); setTimeout(() => item.remove(), 2800);
}

function scheduleCollectible(delay = 9000 + Math.random() * 15000) {
  clearTimeout(collectibleTimer);
  collectibleTimer = setTimeout(showCollectible, delay);
}

function showCollectible() {
  const available = PLANETS.filter(([, id]) => !readCollection().includes(id));
  if (!main || !available.length) return;
  if (document.visibilityState === "hidden") { scheduleCollectible(); return; }
  const slots = Array.from(main.querySelectorAll(".timeline .issue-card, .panel-grid > .panel, .game, .planet-card, .fact-entry, .source-entry, .page-heading"));
  const headerBottom = document.querySelector("#site-header")?.getBoundingClientRect().bottom || 0;
  const visibleSlots = slots.filter(slot => {
    if (slot.closest(".hidden") || !slot.getClientRects().length) return false;
    const rect = slot.getBoundingClientRect();
    return rect.bottom > headerBottom && rect.bottom < innerHeight - 50 && rect.right > 0 && rect.left < innerWidth;
  });
  if (!visibleSlots.length) { scheduleCollectible(5000); return; }
  const anchor = visibleSlots[Math.floor(Math.random() * visibleSlots.length)];
  const [name, id, color] = available[Math.floor(Math.random() * available.length)];
  const lane = document.createElement("div"); lane.className = `collectible-lane ${Math.random() < .5 ? "lane-left" : "lane-right"}`;
  const token = document.createElement("button");
  token.type = "button"; token.className = "collectible-orb"; token.style.setProperty("--orb", color);
  token.setAttribute("aria-label", `Collect the ${name} planet star`); token.title = `A ${name} star is drifting by`;
  token.innerHTML = `<span aria-hidden="true">✦</span>`;
  token.addEventListener("click", () => collectPlanet(id, token, lane, anchor), { once: true });
  lane.append(token); anchor.insertAdjacentElement("afterend", lane);
  const announcement = document.querySelector("#collectible-announcer");
  if (announcement) announcement.textContent = `A ${name} planet star appeared near ${anchor.querySelector("h2,h3")?.textContent || "this mission record"}.`;
  clearTimeout(collectibleRemovalTimer);
  collectibleRemovalTimer = setTimeout(() => { removeCollectible(lane, anchor); scheduleCollectible(); }, 6500);
}

function removeCollectible(lane, anchor) {
  const hadFocus = lane?.contains(document.activeElement);
  lane?.remove();
  if (hadFocus) {
    if (anchor?.isConnected) {
      if (!anchor.matches("a,button,input,select,textarea,[tabindex]")) anchor.tabIndex = -1;
      anchor.focus({ preventScroll: true });
    } else main.focus({ preventScroll: true });
  }
}

function collectPlanet(id, button, lane = button, anchor) {
  const found = readCollection(); if (!found.includes(id)) { found.push(id); localStorage.setItem("space-comic-planets", JSON.stringify(found)); }
  button.classList.add("collected"); void playPop(760, .1);
  const name = PLANETS.find(item => item[1] === id)?.[0] || "Planet";
  toast(`${name} card collected!`);
  clearTimeout(collectibleRemovalTimer); scheduleCollectible();
  setTimeout(() => { removeCollectible(lane, anchor); if (page === "collection") { renderCollection(); main.focus({ preventScroll: true }); } }, 240);
}

function renderHome() {
  main.innerHTML = `<section class="hero"><span class="comic-caption">Signal received · Issue No. 01</span><h1>Abandoned but not forgotten!</h1><p>Turn the key. Follow the signal. Meet the machines that stayed after the launch crews headed home. ${factTag("F-053")} ${factTag("F-054")}</p><span class="sfx" aria-hidden="true">ZOOM!</span><p class="illustration-note">Your mission: explore the logs, check the proof, and keep an eye out for a drifting planet star.</p></section>
  <section aria-labelledby="issues-title"><h2 id="issues-title">Choose your issue</h2><div class="panel-grid">
    <a class="panel panel-link" href="moon.html" data-pop><span class="comic-caption">Issue 1</span><h2>Meanwhile, on the Moon…</h2><p>Landing stages, science stations, and rovers. ${factTag("F-053")} ${factTag("F-054")}</p></a>
    <a class="panel panel-link" href="mars.html" data-pop><span class="comic-caption">Issue 2</span><h2>Meanwhile, on Mars…</h2><p>Rover logs and a helicopter's mission record. ${factTag("F-013")} ${factTag("F-021")}</p></a>
    <a class="panel panel-link" href="deep-space.html" data-pop><span class="comic-caption">Issue 3</span><h2>Out beyond the planets…</h2><p>Four long-distance mission histories. ${factTag("F-080")} ${factTag("F-082")}</p></a>
  </div></section>
  <section><h2>First facts from the field</h2><div class="panel-grid">${card("F-053")}${card("F-013")}${card("F-041")}</div></section>
  <section class="callout"><h2>Captain Almanac says…</h2><p>Every story fact links to its source record. Unchecked details stay out of the story and are listed in the TODO file.</p><a class="button" href="almanac.html">Open The Almanac</a></section>
  <section class="credits"><h2>Credits</h2><p>Fact sources include NASA, NASA/JPL, NASA NSSDCA, NASA History, NASA Technical Reports Server, and ILRS/GSFC. NASA images are locally bundled and credited in The Almanac. CSS comic decorations are original illustrations, not photographs.</p><p>Team: <strong>[Add team name]</strong>. NASA Space Apps Challenge disclaimer: This is a participant project and is not endorsed by NASA. NASA names and marks remain the property of NASA.</p></section>`;
}

const ISSUE_CONFIG = {
  moon: { kicker:"Moon Issue · Chapter 1", title:"The Moon's leftover legends", intro:"The landing was act one. The instruments had a longer story to tell.", dispatch:"Apollo 12's ALSEP was built to keep sending measurements home long after the astronauts departed.", dispatchFact:"F-054", subtitle:"Lunar mission timeline", ids:["F-053","F-054","F-052","F-055","F-050","F-057","F-056","F-060"] },
  mars: { kicker:"Mars Issue · Chapter 2", title:"The red planet roll call", intro:"Static cuts to a red horizon. The mission log keeps rolling.", dispatch:"Opportunity's last communication came more than 14 years after landing. Every extra day turned into another page in the log.", dispatchFact:"F-013", subtitle:"Rover, lander, and rotorcraft transmissions", ids:["F-070","F-010","F-011","F-012","F-013","F-014","F-073","F-074","F-075","F-076","F-077","F-020","F-021","F-022","F-078"] },
  deep_space: { kicker:"Deep Space Issue · Chapter 3", title:"Signals from the long way out", intro:"Turn down the cabin lights. Listen for the little voices crossing the dark.", dispatch:"Pioneer 10's final signal arrived in 2003. As of 2026-11-01, NASA lists Voyager 1 as an active extended mission.", dispatchFact:"F-082", dispatchFactExtra:"F-080", subtitle:"The faraway flight logs", ids:["F-040","F-041","F-086","F-081","F-087","F-082","F-083","F-084","F-085","F-080"] },
  why: { kicker:"Field Notes · Chapter 4", title:"Why does it matter?", intro:"Every mission leaves questions behind. These records show what the machines helped us ask.", dispatch:"A lunar experiment was designed to stay and send measurements home. The hardware's story did not end with the launch crew.", dispatchFact:"F-054", subtitle:"What the hardware taught us", ids:["F-054","F-055","F-071","F-074","F-073","F-090","F-091","F-092"] }
};

function renderIssue() {
  const config = ISSUE_CONFIG[page];
  const issueImage = siteData.images.find(image => image.chapter === page);
  const imageMarkup = issueImage ? `<figure class="archive-photo"><img src="${html(issueImage.file)}" alt="${html(issueImage.alt)}" loading="lazy"><figcaption>${html(issueImage.title)} · ${html(issueImage.credit)} · ${html(issueImage.image_date)} · <a href="almanac.html#source-${html(issueImage.id)}">Image credit</a></figcaption></figure>` : "";
  main.innerHTML = `${pageHeading(config.kicker, config.title, config.intro)}<section class="dispatch"><span class="dispatch-mark" aria-hidden="true">◉</span><p><span class="transmission-label">Captain's flight log · verified transmission</span>${html(config.dispatch)} ${factTag(config.dispatchFact)} ${config.dispatchFactExtra ? factTag(config.dispatchFactExtra) : ""}</p></section>${imageMarkup}<div class="comic-caption">MISSION ARCHIVE · TRANSMISSION QUEUE</div><h2>${config.subtitle}</h2><div class="timeline">${config.ids.map(card).filter(Boolean).join("")}</div>
    ${page === "moon" ? `<div class="callout"><strong>Site note:</strong> Exact coordinates for some intentional and accidental impacts are unknown or not added here. See the fact tags and Almanac instead of guessing a location.</div>` : ""}
    ${page === "mars" ? `<p class="archive-note">Some requested details—such as every launch date, planned lifetime, and final site for every lander—are not yet in this checked subset. The Almanac and TODO list mark the gaps.</p>` : ""}
    ${page === "deep_space" ? `<p class="as-of callout">As of 2026-11-01, the Voyager readings link to NASA's changing table ${factTag("F-086")} ${factTag("F-087")}. The Pioneer distance is omitted because a current NASA odometer was not found ${factTag("F-085")}.</p>` : ""}
    <p><a class="button" href="arcade.html">Play a quick game (optional)</a></p>`;
}

function renderWhy() { renderIssue(); }

function renderAlmanac() {
  const pageMap = CHAPTER_PAGE;
  const sources = siteData.sources;
  const sourceFacts = sources.filter(source => source.type === "fact");
  const images = siteData.images;
  main.innerHTML = `<section class="almanac"><span class="eyebrow">Reference edition · verified links</span><h1>The Almanac</h1><p>Browse the sources behind the stories, then follow a fact ID back to the page that uses it.</p>
    <nav aria-label="Chapters"><strong>Table of contents by chapter:</strong> <a href="#chapter-moon">Moon</a> · <a href="#chapter-mars">Mars</a> · <a href="#chapter-deep_space">Deep Space</a></nav>
    <div class="almanac-tools"><label>Search <input id="source-search" type="search" placeholder="Title, fact ID, mission…"></label><label>Chapter <select id="chapter-filter"><option value="all">All chapters</option><option value="moon">Moon</option><option value="mars">Mars</option><option value="deep_space">Deep Space</option><option value="why">Why it matters</option><option value="collection">Collection</option><option value="arcade">Arcade</option></select></label><label>Type <select id="type-filter"><option value="all">Facts and images</option><option value="fact">Fact sources</option><option value="image">Image sources</option></select></label></div>
    <section id="fact-index"><h2>Fact entries</h2><div id="fact-list"></div></section>
    <div class="almanac-columns"><section><h2>Sources of Facts</h2><div id="fact-sources"></div></section><section><h2>Sources of Images</h2><div id="image-sources"></div></section></div>
    <section><h2>How we fact-checked</h2><p>Primary NASA or other agency records were preferred. Numerical claims were checked against a second authoritative record where available; some planet-card values currently have only the NASA fact-sheet citation and are listed for corroboration in TODO_VERIFY.md. Changing status, distance, and moon counts are labeled with an access date. Unverified or unresolved records remain marked and are not used as ordinary story facts.</p></section>
    <details><summary>Retained secondary research leads</summary><p>These leads were present in the supplied source file, but are not accepted as verification for visible facts.</p><div id="secondary-list"></div></details>
    </section>`;

  const factList = document.querySelector("#fact-list");
  function pageFor(fact) { return pageMap[fact.chapter] || "index.html"; }
  function renderFactEntries(query = "", chapter = "all") {
    const needle = query.toLowerCase();
    const records = siteData.facts.filter(fact => (chapter === "all" || fact.chapter === chapter) && `${fact.id} ${fact.character} ${fact.text || ""} ${fact.verification_notes || ""}`.toLowerCase().includes(needle));
    factList.innerHTML = records.map(fact => `<article class="fact-entry" id="fact-${html(fact.id)}"><h3>${html(fact.id)} · ${html(fact.character || "Fact")}</h3><p>${html(fact.text || "[VERIFY: description]")}</p><p><strong>Status:</strong> ${fact.verified && fact.primary_url ? "Verified against primary source" : "Needs verification — excluded from story copy"}${fact.time_sensitive ? ` · As of ${html(fact.as_of || "not recorded")}` : ""}</p><p>${factTag(fact.id)} · <a href="${pageFor(fact)}#${html(fact.id)}">Back to ${html(fact.chapter.replace("_", " "))} page</a></p>${fact.verification_notes ? `<p class="archive-note">${html(fact.verification_notes)}</p>` : ""}</article>`).join("") || `<p>No fact entries match those filters.</p>`;
  }
  function renderSourceEntries() {
    const query = document.querySelector("#source-search").value.toLowerCase();
    const chapter = document.querySelector("#chapter-filter").value;
    const type = document.querySelector("#type-filter").value;
    const relevantFacts = siteData.facts.filter(fact => chapter === "all" || fact.chapter === chapter);
    const sourceList = sourceFacts.filter(source => (chapter === "all" || source.chapter === chapter) && (type === "all" || type === "fact") && `${source.title} ${source.publisher} ${source.id} ${source.url}`.toLowerCase().includes(query));
  const imageList = images.filter(image => (chapter === "all" || image.chapter === chapter) && (type === "all" || type === "image") && `${image.title} ${image.credit} ${image.id}`.toLowerCase().includes(query));
    const usedFacts = id => relevantFacts.filter(fact => (fact.source_ids || []).includes(id));
    document.querySelector("#fact-sources").innerHTML = (type === "image" ? [] : sourceList).map(source => {
      const uses = usedFacts(source.id);
      const links = uses.map(fact => `<a href="${pageFor(fact)}#${html(fact.id)}">${html(fact.id)} on ${html(fact.chapter.replace("_", " "))}</a>`).join(" · ") || "No verified story use";
      return `<article class="source-entry" id="source-${html(source.id)}"><h3>${html(source.id)} · ${html(source.title)}</h3><p>${html(source.publisher)} · accessed ${html(source.accessed)}</p><p><a href="${html(source.url)}" target="_blank" rel="noreferrer">Open source ↗</a></p><p>${html(source.license_note)}</p><p><strong>Used on:</strong> ${links}</p><p><a href="almanac.html#fact-index">Back to fact list ↑</a></p></article>`;
    }).join("") || (type === "image" ? `<p>No image records are bundled. See TODO_VERIFY.md.</p>` : `<p>No fact sources match those filters.</p>`);
    document.querySelector("#image-sources").innerHTML = (type === "fact" ? [] : imageList).map(image => `<article class="source-entry" id="source-${html(image.id)}"><h3>${html(image.id)} · ${html(image.title)}</h3><p>${html(image.publisher)} · ${html(image.credit)} · ${html(image.image_date)}</p><p>${html(image.usage_note)}</p><p><a href="${html(image.url)}" target="_blank" rel="noreferrer">Original archive entry ↗</a></p><p><strong>Used on:</strong> <a href="${html(image.page)}">${html(image.chapter.replace("_", " "))} issue</a></p><p><a href="almanac.html#fact-index">Back to Almanac ↑</a></p></article>`).join("") || (type === "fact" ? `<p>Image sources are hidden by the selected filter.</p>` : `<p>No image records match those filters.</p>`);
  }
  document.querySelector("#secondary-list").innerHTML = sources.filter(source => source.type === "secondary" || source.type === "tertiary").map(source => `<p>${html(source.id)} · ${html(source.title)} (${html(source.publisher)}) — retained as a research lead, not a verification source.</p>`).join("");
  function refresh() {
    const imageOnly = document.querySelector("#type-filter").value === "image";
    document.querySelector("#fact-index").classList.toggle("hidden", imageOnly);
    renderFactEntries(document.querySelector("#source-search").value, document.querySelector("#chapter-filter").value);
    renderSourceEntries();
  }
  ["source-search","chapter-filter","type-filter"].forEach(id => document.querySelector(`#${id}`).addEventListener("input", refresh));
  refresh();
}

function renderCollection() {
  const found = readCollection(); const uncollected = PLANETS.filter(([,id]) => !found.includes(id));
  const percent = Math.round(found.length / PLANETS.length * 100);
  main.innerHTML = `${pageHeading("My Collection · Flight Log", "Planet cards", "Catch the tiny orbiting stars as they appear around the site. Your discoveries stay in this browser." )}
    <div class="console-heading collection-readout"><div><span class="transmission-label">Recovered planetary signals</span><strong id="progress-text">${found.length}/9 cards recovered</strong></div><div class="flight-readout"><span>COMPLETION</span><strong>${percent}%</strong></div></div><div class="progress-track" role="progressbar" aria-label="Planet card collection progress" aria-valuemin="0" aria-valuemax="9" aria-valuenow="${found.length}"><span class="progress-fill" style="width:${percent}%"></span></div>
    <p><button id="hint-button" type="button">Request a Captain's hint</button> <span id="hint-output" class="hint" aria-live="polite">Keep watch—an orbiting star appears now and then.</span></p>
    <div class="album-grid">${PLANETS.map(([name,id,color]) => renderPlanetCard(name,id,color,found.includes(id))).join("")}</div>
    <section class="certificate" id="certificate"><span class="eyebrow">Mission complete</span><h2>You're a Space Explorer!</h2><p>Certificate awarded for collecting all nine planet cards.</p><p>Explorer name: _______________________</p><p>Date: _______________________</p></section><div class="collection-actions"><button id="print-certificate" type="button">Print certificate / album</button><button id="reset-collection" class="reset-collection" type="button">Reset Easter eggs</button></div>`;
  document.querySelector("#hint-button").addEventListener("click", () => {
    const output = document.querySelector("#hint-output");
    if (!uncollected.length) { output.textContent = "Mission complete—every planet is in your flight log!"; return; }
    output.textContent = "Captain's hint: the next star can appear anywhere on this page. Keep watch between transmissions.";
    const existing = document.querySelector(".collectible-orb");
    if (existing) { existing.focus(); existing.classList.add("orb-hint"); }
  });
  document.querySelector("#print-certificate").addEventListener("click", () => { document.querySelector("#certificate").classList.add("visible"); window.print(); });
  document.querySelector("#reset-collection").addEventListener("click", () => {
    if (!window.confirm("Reset all collected planet Easter eggs in this browser? This cannot be undone.")) return;
    localStorage.removeItem("space-comic-planets");
    renderCollection(); main.focus({ preventScroll: true });
    toast("Easter egg collection reset. The planet stars are back in play!");
  });
  if (found.length === PLANETS.length) document.querySelector("#certificate").classList.add("visible");
}

function renderPlanetCard(name, id, color, unlocked) {
  const fact = getFact(id); const values = fact?.value || {};
  const moonSource = (fact?.source_ids || []).map(id => siteData.sources.find(source => source.id === id)).find(source => source && source.type === "fact" && source.chapter === "collection" && source.url !== PLANET_FACT_SHEET_URL);
  const moonUrl = moonSource?.url || fact?.primary_url;
  const content = unlocked && fact?.verified ? `<p>Diameter: ${values.diameter_km?.toLocaleString()} km</p><p>Avg. Sun distance: ${values.distance_from_sun_million_km?.toLocaleString()} million km</p><p>Known moons: ${values.known_moons} <small>(NASA, as of ${html(fact.as_of)}: <a href="${html(moonUrl)}" target="_blank" rel="noreferrer">current count</a>)</small></p><p>Day: ${values.day_hours} hours</p><p>${html(values.amazing_fact || "")}</p>${factTag(id)}` : `<p>Sticker not found yet.</p>`;
  return `<article class="planet-card ${unlocked ? "" : "locked"}" ${unlocked ? `style="--orb:${color}"` : ""}><div class="planet-orb" style="--orb:${color}" aria-hidden="true"></div><h3>${unlocked ? html(name) : "???"}</h3>${content}</article>`;
}

function renderArcade() {
  main.innerHTML = `${pageHeading("Arcade · command deck", "Arcade Flight Control", "Optional side missions. The mission archives and evidence are always one click away.")}
    <p><a class="button" href="mars.html">Skip / Back to the story</a></p>
    <section class="game shooter-console" id="shooter-game"><div class="console-heading"><div><span class="eyebrow">Arcade simulation · not a mission recording</span><h2>Starfield Interceptor</h2></div><div class="flight-readout"><span>SCORE</span><strong id="shooter-score" aria-live="polite">0000</strong></div></div><p>Protect the signal buoy from comic meteor sprites. Focus the playfield; use ←/→ or A/D to steer and Space to fire. Touch pilots can use the controls below.</p><canvas id="shooter-canvas" width="720" height="360" tabindex="0" aria-label="Space shooter playfield. Focus here and use arrow keys or A and D to steer, Space to fire."></canvas><div class="shooter-status" aria-live="polite"><span id="shooter-lives">HULL · ♥ ♥ ♥</span><span id="shooter-message">Ready when you are, Captain.</span></div><div class="shooter-controls"><button type="button" id="shooter-start">Start mission</button><button type="button" id="shooter-pause" disabled>Pause</button><button type="button" id="shooter-reset">Reset</button><div class="touch-controls" aria-label="Touch flight controls"><button type="button" data-control="left" aria-label="Steer left">◀</button><button type="button" data-control="fire">FIRE</button><button type="button" data-control="right" aria-label="Steer right">▶</button></div></div><p class="arcade-note">This is a fictional arcade challenge; the meteor sprites do not represent real hardware or mission hazards. NASA identifies orbital debris as a collision risk to spacecraft. ${factTag("F-091")}</p></section>
    <section class="game" id="match-game"><h2>Match the Mission</h2><p>Choose where each explorer went.</p><div id="match-items"></div><button type="button" id="check-match">Check matches</button><p class="answer" id="match-result" aria-live="polite"></p><a href="deep-space.html">Back to the story</a></section>
    <section class="game" id="quiz-game"><h2>Hardware Quiz · 10 questions</h2><div id="quiz-question"></div><button type="button" id="next-question">Next question</button><p class="answer" id="quiz-result" aria-live="polite"></p><a href="index.html">Back to the story</a></section>`;
  renderShooter(); renderMissionMatch(); renderQuiz();
}

function renderShooter() {
  const canvas = document.querySelector("#shooter-canvas");
  const ctx = canvas.getContext("2d");
  const scoreOutput = document.querySelector("#shooter-score");
  const livesOutput = document.querySelector("#shooter-lives");
  const message = document.querySelector("#shooter-message");
  const start = document.querySelector("#shooter-start");
  const pause = document.querySelector("#shooter-pause");
  const held = new Set();
  const stars = Array.from({ length: 55 }, () => ({ x: Math.random() * 720, y: Math.random() * 360, r: Math.random() * 1.8 + .4, alpha: .35 + Math.random() * .55 }));
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playerX = 360, score = 0, lives = 3, shots = [], rocks = [], running = false, raf = 0, lastTime = 0, spawnClock = 0;
  const width = canvas.width, height = canvas.height;

  function draw() {
    ctx.fillStyle = "#07111f"; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#40eaff1d"; ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y <= height; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    ctx.fillStyle = "#c8fbff";
    stars.forEach(star => { ctx.globalAlpha = star.alpha; ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(playerX, 327);
    ctx.fillStyle = "#45e7ff"; ctx.shadowColor = "#45e7ff"; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(14, 14); ctx.lineTo(0, 8); ctx.lineTo(-14, 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffbb4d"; ctx.beginPath(); ctx.moveTo(-5, 13); ctx.lineTo(0, 13 + (reducedMotion ? 8 : 12 + Math.random() * 6)); ctx.lineTo(5, 13); ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
    shots.forEach(shot => { ctx.fillStyle = "#fff27a"; ctx.shadowColor = "#ffe553"; ctx.shadowBlur = 10; ctx.fillRect(shot.x - 2, shot.y - 8, 4, 12); }); ctx.shadowBlur = 0;
    rocks.forEach(rock => {
      ctx.fillStyle = "#f27854"; ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i < 8; i += 1) { const angle = i * Math.PI / 4; const radius = rock.size * (.78 + (i % 2) * .22); const x = rock.x + Math.cos(angle) * radius; const y = rock.y + Math.sin(angle) * radius; if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }

  function update(time) {
    if (!running) return;
    const dt = Math.min(.04, Math.max(0, (time - lastTime) / 1000)); lastTime = time; spawnClock += dt;
    if (held.has("left")) playerX = Math.max(18, playerX - (reducedMotion ? 170 : 280) * dt);
    if (held.has("right")) playerX = Math.min(width - 18, playerX + (reducedMotion ? 170 : 280) * dt);
    if (spawnClock > (reducedMotion ? 1.35 : .8)) { rocks.push({ x: 20 + Math.random() * (width - 40), y: -18, speed: reducedMotion ? 45 + Math.random() * 40 : 80 + Math.random() * 90, size: 10 + Math.random() * 10 }); spawnClock = 0; }
    shots = shots.filter(shot => shot.y > -10); shots.forEach(shot => { shot.y -= (reducedMotion ? 300 : 420) * dt; });
    rocks.forEach(rock => { rock.y += rock.speed * dt; });
    for (let ri = rocks.length - 1; ri >= 0; ri -= 1) {
      const rock = rocks[ri];
      const hit = shots.findIndex(shot => Math.hypot(shot.x - rock.x, shot.y - rock.y) < rock.size + 5);
      if (hit >= 0) { shots.splice(hit, 1); rocks.splice(ri, 1); score += 10; scoreOutput.textContent = String(score).padStart(4, "0"); void playPop(500 + score % 200, .045); continue; }
      if (rock.y > height - 18) { rocks.splice(ri, 1); lives -= 1; livesOutput.textContent = `HULL · ${"♥ ".repeat(lives).trim() || "0"}`; if (lives <= 0) { endGame(); break; } }
    }
    draw();
    if (running) raf = requestAnimationFrame(update);
  }

  function endGame() { running = false; held.clear(); cancelAnimationFrame(raf); pause.disabled = true; start.disabled = false; start.textContent = "Restart mission"; message.textContent = `Signal buoy secured: ${score} points. Ready for another sortie?`; }
  function fire() { if (!running) return; shots.push({ x: playerX, y: 310 }); void playPop(840, .035); }
  function begin(reset = false) {
    if (reset) { held.clear(); playerX = 360; score = 0; lives = 3; shots = []; rocks = []; spawnClock = 0; scoreOutput.textContent = "0000"; livesOutput.textContent = "HULL · ♥ ♥ ♥"; }
    if (running) return;
    running = true; lastTime = performance.now(); start.disabled = true; pause.disabled = false; pause.textContent = "Pause"; message.textContent = "Incoming comic meteors—keep the signal buoy clear!"; canvas.focus(); raf = requestAnimationFrame(update);
  }
  function togglePause() {
    if (!running) { begin(); return; }
    running = false; held.clear(); cancelAnimationFrame(raf); start.disabled = false; start.textContent = "Resume mission"; pause.textContent = "Resume"; message.textContent = "Paused. The signal buoy is holding.";
  }

  start.addEventListener("click", () => begin());
  pause.addEventListener("click", togglePause);
  document.querySelector("#shooter-reset").addEventListener("click", () => { running = false; cancelAnimationFrame(raf); begin(true); });
  document.querySelectorAll("[data-control]").forEach(button => {
    const control = button.dataset.control;
    if (control === "fire") button.addEventListener("click", fire);
    else {
      button.addEventListener("pointerdown", event => { event.preventDefault(); held.add(control); button.setPointerCapture?.(event.pointerId); });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => button.addEventListener(type, () => held.delete(control)));
    }
  });
  canvas.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") { event.preventDefault(); held.add("left"); }
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") { event.preventDefault(); held.add("right"); }
    if (event.code === "Space") { event.preventDefault(); fire(); }
  });
  canvas.addEventListener("keyup", event => { if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") held.delete("left"); if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") held.delete("right"); });
  canvas.addEventListener("blur", () => held.clear());
  window.addEventListener("pagehide", () => { running = false; cancelAnimationFrame(raf); }, { once: true });
  draw();
}

function renderMissionMatch() {
  const missions = [["Sojourner","Mars","F-070"],["Surveyor 3","Moon","F-050"],["Voyager 1","Deep space","F-080"],["Ingenuity","Mars","F-021"]];
  document.querySelector("#match-items").innerHTML = missions.map(([name,,factId],i) => `<label class="match-row">${name} ${factTag(factId)} <select data-match="${i}" aria-label="Destination for ${name}"><option value="">Choose a destination</option><option>Moon</option><option>Mars</option><option>Deep space</option></select></label>`).join("<br>");
  document.querySelector("#check-match").addEventListener("click", () => {
    const correct = missions.filter(([,body],i) => document.querySelector(`[data-match="${i}"]`).value === body).length;
    document.querySelector("#match-result").innerHTML = `${correct}/4 matches. Review each record: ${missions.map(([, ,factId]) => factTag(factId)).join(" ")}`;
  });
}

function renderQuiz() {
  let questionNo = 0; let current = [];
  const questions = [
    ["How long was Sojourner's mission planned to last?", "7 days", ["7 days","90 days","30 days"], "F-070"],
    ["What happened to Spirit on May 1, 2009?", "It got stuck in soft soil", ["It got stuck in soft soil","It took off","It landed on Earth"], "F-011"],
    ["What caused Opportunity to stop communicating?", "A planet-wide dust storm", ["A planet-wide dust storm","A broken wheel","A landing failure"], "F-014"],
    ["How many flights did Ingenuity complete?", "72", ["5","72","100"], "F-021"],
    ["How many marsquakes did InSight detect?", "1,319", ["319","1,319","13,190"], "F-031"],
    ["Which crew visited Surveyor 3?", "Apollo 12", ["Apollo 11","Apollo 12","Apollo 17"], "F-050"],
    ["Which missions drove a Lunar Roving Vehicle?", "Apollo 15, 16, and 17", ["Apollo 11, 12, and 13","Apollo 15, 16, and 17","Apollo 8, 10, and 12"], "F-052"],
    ["Where is Curiosity exploring?", "Gale Crater", ["Gale Crater","Utopia Planitia","Gusev Crater"], "F-073"],
    ["What did Viking's biology experiments find?", "No clear evidence of living microorganisms", ["Clear proof of life","No clear evidence of living microorganisms","Nothing was measured"], "F-074"],
    ["What happened to Mars Polar Lander?", "It was lost on arrival", ["It returned to Earth","It was lost on arrival","It is still active"], "F-078"]
  ];
  const questionBox = document.querySelector("#quiz-question"); const result = document.querySelector("#quiz-result"); const button = document.querySelector("#next-question");
  function ask() {
    if (questionNo >= questions.length) { questionNo=0; }
    current = questions[questionNo];
    questionBox.innerHTML = `<p><strong>${questionNo+1}/10 · ${html(current[0])}</strong> ${factTag(current[3])}</p>${shuffled(current[2]).map((option,i) => `<label><input type="radio" name="quiz" value="${html(option)}"> ${html(option)}</label><br>`).join("")}`;
    result.textContent = ""; button.textContent = "Check answer";
  }
  button.addEventListener("click", () => {
    if (!result.textContent) {
      const selected = document.querySelector('input[name="quiz"]:checked');
      if (!selected) { result.textContent = "Choose an answer first."; return; }
      const f = getFact(current[3]);
      result.innerHTML = `${selected.value === current[1] ? "Correct!" : `Not quite. The answer is ${html(current[1])}.`} ${factTag(current[3])} ${html(f?.text || "")}`;
      button.textContent = "Next question"; questionNo += 1;
    } else ask();
  });
  ask();
}

function attachSfx() {
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("panel-visible"); observer.unobserve(entry.target); }
    }), { threshold: .15 });
    document.querySelectorAll(".issue-card").forEach(panel => observer.observe(panel));
  } else document.querySelectorAll(".issue-card").forEach(panel => panel.classList.add("panel-visible"));
  document.querySelectorAll("[data-pop]").forEach(target => target.addEventListener("click", () => playPop(520, .08)));
  document.querySelectorAll(".issue-card .speech").forEach(speech => speech.addEventListener("click", () => {
    const burst = document.createElement("span"); burst.className = "sfx speech-burst"; burst.textContent = "POP!"; speech.append(burst); playPop(700,.09); setTimeout(() => burst.remove(),700);
  }));
}

async function start() {
  try { siteData = await loadSiteData(); }
  catch (error) { main.innerHTML = `<section class="panel"><h1>Comms hiccup</h1><p>The story data could not load. ${html(error.message)}</p><p>Open this site through the local preview steps in README.md.</p></section>`; return; }
  nav();
  if (page === "home") renderHome();
  else if (ISSUE_CONFIG[page]) renderIssue();
  else if (page === "almanac") renderAlmanac();
  else if (page === "collection") renderCollection();
  else if (page === "arcade") renderArcade();
  footer(); attachSfx();
  if (sessionStorage.getItem("page-turn")) { document.body.classList.add("page-turn"); sessionStorage.removeItem("page-turn"); }
}

start();
