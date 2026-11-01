export async function loadSiteData() {
  const [factData, sourceData, imageData] = await Promise.all([
    fetch("facts.json").then(requireOk),
    fetch("sources.json").then(requireOk),
    fetch("images.json").then(requireOk)
  ]);
  const [facts, sources, images] = await Promise.all([
    factData.json(), sourceData.json(), imageData.json()
  ]);
  return { facts: facts.facts ?? [], sources: sources.sources ?? [], images: images.images ?? [] };
}

function requireOk(response) {
  if (!response.ok) throw new Error(`Unable to load site data (${response.status}).`);
  return response;
}

export function html(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function factById(facts, id) {
  return facts.find(fact => fact.id === id);
}

export function shownFacts(facts, chapter) {
  return facts.filter(fact => fact.chapter === chapter && fact.verified === true && fact.primary_url && fact.text);
}

export function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
