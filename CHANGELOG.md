# Changelog

## 2026-06-11

### Added

- Added device-specific MQTT topic selection using the selected device ID.
- Added MQTT unsubscribe support to the JavaScript client and the Android and iOS native bridges.
- Added MQTT connection status, latest received message, and test publishing controls to the dashboard.
- Added tests for connection reuse, disconnect sequencing, topic switching, unsubscribe behavior, and device topic selection.

### Changed

- Reused active MQTT connections and serialized subscription changes to prevent duplicate connections and topic races.
- Automatically connected and subscribed when a device is selected, and disconnected when the authorized navigator unmounts.
- Locked Android phones and iPhone/iPad devices to portrait orientation.
