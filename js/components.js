import { html } from "./data.js";

export function factTag(id) {
  return `<a class="fact-tag" href="almanac.html#fact-${encodeURIComponent(id)}" aria-label="Open Almanac fact ${html(id)}">[${html(id)}]</a>`;
}

export function factPanel(fact) {
  const line = fact.kid_text || fact.text;
  const character = html(fact.character || "Mission log");
  const sources = (fact.source_ids || []).map(sourceId =>
    `<li><a href="almanac.html#source-${encodeURIComponent(sourceId)}">${html(sourceId)}</a></li>`
  ).join("");
  const freshness = fact.time_sensitive ? `<p class="as-of"><strong>As of ${html(fact.as_of || fact.accessed || "date not recorded")}:</strong> <a href="${html(fact.primary_url)}" target="_blank" rel="noreferrer">check NASA's current page</a></p>` : "";
  return `<article class="panel issue-card" id="${html(fact.id)}">
    <span class="comic-caption">${character} · mission log</span>
    <div class="speech"><span class="transmission-label">Incoming transmission · ${character}</span>${html(line)}</div>
    ${freshness}<div class="fact-line">${factTag(fact.id)} <details class="proof"><summary>Open proof card</summary><div class="source-links"><p>Checked against an official source. Accessed ${html(fact.accessed || "date not recorded")}.</p><ul>${sources}</ul></div></details></div>
  </article>`;
}

export function pageHeading(kicker, title, intro) {
  return `<header class="page-heading"><span class="eyebrow">${html(kicker)}</span><h1>${html(title)}</h1><p>${html(intro)}</p></header>`;
}

export function officialLinks(fact, sources) {
  return (fact.source_ids || []).map(id => {
    const source = sources.find(entry => entry.id === id);
    return source ? `<a href="${html(source.url)}" target="_blank" rel="noreferrer">${html(source.publisher)} ↗</a>` : "";
  }).filter(Boolean).join(" · ");
}
