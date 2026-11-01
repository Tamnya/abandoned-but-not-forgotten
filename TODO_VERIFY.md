# TODO: verify before submission

## Fact follow-up

- **F-001:** confirm the exact reflector counts and cube dimensions against a NASA primary technical source.
- **F-002:** the lunar recession rate is verified against ILRS/GSFC but is not currently used in story copy; the fingernail comparison is omitted as a site-created analogy.
- **F-003:** confirm the specific claim about the Apollo arrays' long-term operation. F-060 covers the general passive design only.
- **F-032:** replace broad present-tense wording with a specific recent NASA report, or keep hidden.
- **F-051:** confirm the location/status of individual Lunar Roving Vehicles with a direct NASA primary source; record remains null.
- **F-085:** NASA's linked page has no live Pioneer 10/11 distance. Add one only if NASA publishes an authoritative current value; the site currently explains the gap and does not guess.
- **Numeric corroboration:** planet-card diameters, average solar distances, and most day lengths currently cite the NASA NSSDCA fact sheet alone. Compare against a second NASA/agency source before submission. Some mission numeric values also have a single source; check the corresponding `source_ids` in `facts.json`.

## Image follow-up

- Three official NASA image files are bundled locally and listed in `images.json`: Apollo 12 LRO view (PIA12922), Curiosity Gale Crater panorama (PIA22210), and Voyager 2 Saturn image (PIA01959).
- The Voyager archive metadata gives 1999-04-25; this is labeled as the archive metadata date, not claimed to be the spacecraft encounter date.
- Before external publication, recheck the NASA archive usage guidance and image metadata. The image files are used only on the matching issue page and have descriptive alt text.

## Scope follow-up

- Expand the Moon chronology with precise dates/sites for all Apollo and Surveyor landings, plus documented accidental/intentional impacts, only when each event has a primary source and tag.
- Add launch/landing, planned/actual duration, end cause, and final location for every requested Mars mission where NASA records support those details. The initial version includes the documented subset; unsupported details stay out of public copy.
- Add the missing Viking 1 profile and verify individual launch dates, planned lifetimes, and end causes for all requested landers; the current Mars issue includes only facts checked during this build.
- Add reviewed Hindi and Bengali translations only after a scientifically knowledgeable reviewer checks them.
- Replace the team-name placeholder on the Home page with the actual team name.

## Implementation constraints encountered

- The project is pushed to the private repository `https://github.com/Tamnya/abandoned-but-not-forgotten` on `main`.
- The Pages workflow is present, but the initial `Configure Pages` run failed because the account plan does not support Pages for private repositories. The owner chose to keep the source private and upgrade the plan. After the upgrade, enable Pages for this repository and rerun the workflow; do not change repository visibility without the user's approval.
- No browser-based keyboard/reduced-motion walkthrough was available in this workspace; those checks need a manual browser pass before event submission.
- The team-name placeholder on the Home page must be replaced before submission.

## Build audit completed

- Parsed all three JSON datasets; checked fact source IDs, verified-fact requirements, image source IDs, image files, image page targets, and local HTML links. Result: 55 facts, 51 verified records, 52 sources, 3 image records, and no broken references found.
- Checked JavaScript syntax for the three shared site modules. The modules report no syntax errors.
- Reviewed the special Opportunity duration wording, the now-NASA-confirmed Voyager 1 expected milestone date, the F-002 analogy handling, and the hidden F-051 null placeholder.
- Browser rendering, game interaction, keyboard-only navigation, localStorage behavior, and live reduced-motion/SFX preferences still need a manual browser pass.

## Cockpit refresh handoff

- The Arcade now has a fictional keyboard/touch shooter in place of Moon Lander. It has pause, restart, score, lives, and a skip-to-story route; check these controls in a browser before release.
- The fixed footer sticker bar is removed. Planet stars appear after randomly selected visible panels, mission records, or Almanac entries in normal page flow, then time out if not collected; verify keyboard focus, localStorage persistence, and timing in a browser.
- Sound now reuses one Web Audio context and resumes it after the visible sound-toggle gesture. Audio remains off by default and is controlled separately from visual reduced-motion effects; verify audibility on target browsers.
- Cockpit styling and new mission dispatch copy were added. Fact record text and source references were not edited.
- Ideas for a later update: black-box mission recaps, unlockable character callouts, shooter challenge medals, and a daily rotating fact.
- A read-only code review found off-screen collectible timing and missing direct count links; candidates are now limited to visible blocks with room below, and the planet moon-count label links to the NASA page for that count where one is listed. The saved sound state now initializes its accessible label correctly, and a collected orb pops before removal.
- Final static JavaScript syntax check passed. The running Home, Arcade, and Collection routes responded with HTTP 200. No browser runtime was available here to confirm actual sound playback or game/keyboard/touch behavior.
- The Collection page now offers a confirmation-protected reset for Easter egg progress; verify cancel, confirm, and recapture behavior in a browser.
