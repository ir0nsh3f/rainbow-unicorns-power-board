# Rainbow Unicorns / 5U Girls Power Board

Public site: https://ir0nsh3f.github.io/rainbow-unicorns-power-board/

This site presents only Fall2026 5U Girls Akers and Boxx: rankings, full schedules, the next two Rainbow Unicorns fixtures, and a dedicated [Rainbow schedule](https://ir0nsh3f.github.io/rainbow-unicorns-power-board/#rainbow-schedule) tab for the entire season (exact 5ug / Boxx / Rainbow Unicorns). The season tab retains finals and all unplayed fixtures chronologically, independent of league filters, using shared CT times, official maps and current-season ranks/records. There are no individual-player profiles or family associations.

## One source of truth

The public `ir0nsh3f/sbmsa-power-board` collector continues checking all official divisions atomically. Its original user interface excludes5U; retained historical archives are not deleted. This repository does **not** collect scores or fit a second forecasting model.

`python scripts/export_site.py upstream` validates the upstream soccer archive, exports only5U division data, copies canonical ratings and next-two renderer, and extracts only the shared schedule helpers needed here. All soccer captures and receipts are exact-byte copies, with their original observed-public timestamps and workflow URLs. Exporting them here does not create a new first-public observation. `site/export.json` records the upstream commit and actual export time separately from accepted source timestamps.

## Automated publication

`.github/workflows/publish.yml` runs on pushes, manual `workflow_dispatch`, and every six hours at UTC minute47 (after the shared source's minute17 schedule). GitHub scheduling is approximate and may delay checks. It checks out current upstream main, tests the scoped export/provenance, exports, and publishes only generated `site/` with GitHub Pages. No local computer, custom domain, paid hosting or long-lived credential is required. The built-in token has only read contents and Pages/OIDC publish permissions.

Tests: `python -m unittest discover -s tests -v`; after export, `node --test tests/*.test.cjs`; browser `tests/ui.cjs` and `tests/rainbow-schedule-ui.cjs` with Playwright, optional `TEST_URL` and `PLAYWRIGHT_MODULE`. Local source at `upstream/` or `/workspace/sbmsa-power-board`. Generated `site/` and upstream checkout are ignored, not independently edited/committed results.

Current forecast `5ug-gamma-poisson-v2` uses three prior games; immutable v1 uses eight. Raw power remains opponent-ridge-margin-v3, ridge3; optional3-goal cap is user-selected, never automatic.

Review2026-11-30 and before season change. Preserve historical capture and receipt bytes. Source structural changes fail export closed rather than silently weakening scope or archive validation.
