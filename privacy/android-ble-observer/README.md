# Shards Signal Watch — Offline BLE Observer

This is the real native Android path for Shards Security's offline Bluetooth capability, separate from the website. The application asks permission before starting a foreground Bluetooth Low Energy advertisement scan, displays actual nearby broadcast RSSI and observation counts, and stops when the app is backgrounded.

**Security assertions**
- No INTERNET permission is declared, no socket or network API is used.
- Session identifiers are salted SHA-256 pseudonyms of observed rotating BLE addresses, generated fresh on each app start.
- No broadcast IDs, raw BLE addresses, payloads or location data are persisted to disk or transmitted.
- Android 12+ requests BLUETOOTH_SCAN/BLUETOOTH_CONNECT on demand, using neverForLocation. Earlier Android versions request fine location only for the BLE scan.
- No background service, pairing, jamming, advertising, radio disabling, deauthentication or attack-back behavior.
- Strong received signal power is a proximity hint, **not** an indicator that a hacking attempt happened.
- Operating system restrictions, rotation of BLE MAC addresses, permissions and vendor filters affect observations.

**Build** (JDK17 + Android SDK 35 + Gradle 8.9)

```bash
gradle -p privacy/android-ble-observer :app:assembleDebug
```

GitHub Actions builds a **debug test APK** and uploads it as a workflow artifact. A debug build is not a signed production release. Test on an Android device before trusting any RF observation.

**Not implemented:** reliable malicious BLE attack detection, packet sniffing, broad spectrum RF analysis, background service, allowlist persistence, tenant synchronization, endpoint detection, intrusion prevention, remote neutralization or commercial provisioning. A BLE advertisement cannot reliably establish malicious intent.
