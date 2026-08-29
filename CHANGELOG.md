# Changelog - MMM-RainRadarDWD

All notable changes to this project will be documented in this file.


## [1.0.1] - 2026-08-29
### Changed
- Switch from Carto to OSM FOSSGIS e.V. as map provider (Carto requires API Key now)

### Chores
- Updated globals in devDependencies to 17.8.0
- Updated eslint in devDependencies to 10.8.0

## [1.0.0] - 2026-07-18
### Added
- Added exact expected precipitation timestamps to logs to simplify debugging.
- Implemented MagicMirror lifecycle methods `suspend()` and `resume()` to pause OpenLayers animations and background polling when the module is hidden (e.g. by a carousel), saving CPU resources.

### Changed
- Replaced frontend `console.log` calls with the native MagicMirror `Log` object for better system integration.

### Fixed
- Fixed an interval leak in `node_helper.js` where multiple `CONFIG` notifications would spawn overlapping weather-check intervals.
- Fixed a bug in `MMM-RainRadarDWD.css` where the entire CSS code was accidentally duplicated.

## [0.9.6] - 2026-06-28
### Chores
- Updated globals in devDependencies to 17.7.0
- Updated eslint in devDependencies to 10.6.0

## [0.9.5] - 2026-05-05
### Fixed
- Tried to fix the empy Map issue after module got hidden once

### Chores
- Updated globals in devDependencies to 17.6.0
- Updated eslint in devDependencies to 10.3.0

## [0.9.4] - 2026-04-13
### Changed
- Updated lint in scripts (removed unnessary . at end of line)
- Updated globals in devDependencies to 17.5.0

### Fixed
- Electron did not render the map anymore after update of Electron


## [0.9.3] - 2026-04-10
### Added
- Added a dynamic "ping" to the DWD server. The module now requests a microscopic 2x2 pixel image every 2 minutes to check if the latest radar frame is online, ensuring the "NOW" frame is always as current as possible without triggering 404 errors.
- Added an independent background refresh loop to the frontend. The radar timeline and timestamps now update continuously while the module is visible, completely decoupled from the Bright Sky API polling interval.
- Added defineconfig to eslint.config.mjs
- Added eslint script to package.json

### Changed
- added code comments to make it easier to understand why we did certain things in a year or two ;)
- Optimized map rendering by skipping unnecessary OpenLayers updates if the latest available DWD base time hasn't changed.
- updated Eslint to 10.2.0

## [0.9.2] - 2026-04-02
### Added
- Added `rainSearchRadius` to `config.js`. The module can now perform a cross-scan (Center, North, South, East, West) to detect precipitation passing slightly off-center.

### Changed
- Enhanced PM2 debug logging to explicitly state where in the radius the precipitation was detected (e.g., `[West]`).
- Completed README.md configuration options in table

### Fixed
- Fixed a timing bug where the currently running hour was ignored by the API evaluation (added a 60-minute backward buffer).
- Fixed duplicate `[MMM-RainRadarDWD]` prefix in the terminal logs by cleaning up the custom log function.

## [0.9.1] - 2026-04-02
### Added
- Added `.gitignore` to keep the repository clean
- Added modern ESLint flat configuration (`eslint.config.mjs`)
- Added `CODE_OF_CONDUCT.md`
- Added GitHub Dependabot configuration (`.github/dependabot.yml`)
- Added an "Update" instructions section to the `README.md`.

### Changed
- Updated `README.md` links to point to the new `MagicMirrorOrg` organization (formerly `MichMich`).
- Fixed a missing trailing comma in the `config.js` example within the `README.md`.

### Fixed
- Fixed an invalid JSON syntax error (trailing comma) in the `keywords` array of `package.json`.

## [0.9.0] - 2026-03-31
### Added
- Initial Beta Release.
