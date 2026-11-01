# Abandoned but Not Forgotten!

A responsive, comic-style static website about space hardware left on the Moon, Mars, and in deep space. The project uses plain HTML, CSS, vanilla JavaScript, and JSON; it has no backend or package dependencies.

## Preview locally

From this folder, run a simple static file server:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000`. Opening the HTML files directly may prevent the browser from loading JSON data. The same folder can be deployed to GitHub Pages or another static host.

## Pages

- Home: `index.html`
- Moon Issue: `moon.html`
- Mars Issue: `mars.html`
- Deep Space Issue: `deep-space.html`
- Why Does It Matter?: `why.html`
- Optional games, including the Starfield Interceptor shooter: `arcade.html`
- Planet-card flight log: `collection.html`
- Sources and fact records: `almanac.html`

## Shared data

- `facts.json` is the source of every displayed factual claim. A record is rendered as verified only when it has `verified: true`, a `primary_url`, and non-empty text. Null or unverified records remain visible in the Almanac as needs-verification records and are not used in story copy.
- `sources.json` records source title, publisher, chapter, URL, access date, and usage note. Old secondary references are retained for audit history but are not used to verify story facts.
- `images.json` lists three locally bundled NASA archive images for the Moon, Mars, and deep-space issues. Each has a NASA archive ID, credit, date, descriptive alt text, usage note, and Almanac entry; the site does not hotlink photographs.
- `TODO_VERIFY.md` records unresolved claims, image work, and checks that still need a human browser pass.

Fact tags link to their Almanac entries. The Almanac links fact records back to their story pages and source entries back to every fact that cites them. Time-sensitive records show an “As of” date and link to the live NASA page.

## Fact-check process

Primary NASA/agency pages, NASA NSSDCA, NASA History, NASA Technical Reports Server, and agency mission records were preferred. A second authoritative source was compared for numerical claims where available. Some planet-card dimensions, day lengths, and average Sun distances currently have one NASA fact-sheet source only; see `TODO_VERIFY.md` for second-source follow-up. Dynamic spacecraft status, distance, and moon counts are date-stamped. No unverified event date or mission cause is guessed.

Character transmissions are playful paraphrases, not astronaut or engineer quotations. The fingernail comparison from the supplied source file is omitted. Web Audio effects are optional, off by default, and stored as a user preference; audio starts only after a user gesture. The collection stores progress in browser localStorage. Small planet stars appear at random safe positions while browsing; select one before it fades to add that planet to the flight log.

The Arcade's Starfield Interceptor is fictional. Focus the playfield and steer with the left/right arrows or A/D; press Space to fire. Touch controls are also available. Pause or reset at any time, or skip directly back to the story.

The current visual direction borrows from an instrument cluster: deep cockpit surfaces, luminous cyan status lights, amber controls, and readable mission records. Comic captions and speech bubbles remain part of the storytelling.

## GitHub Pages deployment

The repository includes `.github/workflows/pages.yml`. It publishes the project root after each push to `main` and supports manual runs from the Actions tab. In the GitHub repository, open **Settings → Pages** and choose **GitHub Actions** as the publishing source. For a private repository, the GitHub account or organization plan must support Pages on private repositories. The expected project URL is `https://<owner>.github.io/abandoned-but-not-forgotten/` once the first workflow run succeeds.

The source is currently in the private repository [`Tamnya/abandoned-but-not-forgotten`](https://github.com/Tamnya/abandoned-but-not-forgotten). GitHub rejected Pages setup under the current plan; the owner chose to keep the repository private and upgrade before publishing. No Pages URL is live yet.

## Images, artwork, and credits

The bundled images are PIA12922 (Apollo 12 landing area), PIA22210 (Curiosity panorama), and PIA01959 (Voyager 2 image of Saturn). Their files are under `assets/images/`; complete credits and metadata are in `images.json` and The Almanac. Follow the [NASA Image and Video Library usage guidelines](https://images.nasa.gov/). The Saturn entry's archive date is labeled as an archive metadata date because it may not represent the spacecraft encounter date.

Decorative halftone backgrounds, bursts, and panels are CSS-only artwork. They are not photographs and do not depict real hardware. Any future drawn or generated character artwork must be labeled “Illustration, not a photograph.”

NASA data and mission sources are linked in The Almanac. NASA logos and trademarks are not used. This is a NASA Space Apps Challenge participant project and is not endorsed by NASA. Add the correct team name on the Home page before submission.
