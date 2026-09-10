# MohandesYar AI 2.0 — Physical-device release evidence

## Evidence register

| Platform | Device model | OS | Browser | Test date | Tester | Result | Evidence |
|---|---|---|---|---|---|---|---|
| Android | Not provided | Not provided | Chrome, version not provided | 2026-08-24 | Yousef Bahram Beigi | PASS (user-confirmed) | PR #23 release-gate statement |
| iPhone | iPhone 13 Pro Max | Version not recorded at test time | Safari, version not recorded | 2026-08-24 | Yousef Bahram Beigi | PASS (user-confirmed) | PR #21 and PR #23 release-gate statements |
| Windows | Not provided | Not provided | Not provided | Not provided | Yousef Bahram Beigi | PASS (user-confirmed) | Physical Windows PWA test confirmed complete on 2026-09-10; environment details were not supplied |

The Android, iPhone, and Windows results reflect the user's explicit confirmation that the
physical-device tests passed. Missing device, operating-system, browser-version, or test-date
fields are retained as `Not provided`; they must not be inferred after the fact. For journal
evidence, any later-supplied Windows environment details should be appended without changing
the recorded PASS unless a rerun produces a different result.

Automated browser QA covers IndexedDB image/video persistence, GPS metadata, backup/restore, a multi-page Persian A4 PDF with six nonblank thumbnails, service-worker update, retained local data, and offline relaunch.

The following two installation checks still require physical devices because desktop browser emulation cannot certify operating-system installation UI.

## Android Chrome

1. Open the production GitHub Pages URL in current Chrome while online.
2. Choose **Install app** or **Add to Home screen** and launch the installed icon.
3. Wait for «نسخه آفلاین آماده استفاده است».
4. Enable airplane mode, fully close the installed app, and relaunch it.
5. Pass only when the dashboard opens without a network error and the saved test project/evidence remain visible.

## iPhone Safari

1. Open the production URL in Safari, then choose **Share → Add to Home Screen**.
2. Launch the Home Screen icon once while online.
3. Enable GPS capture, take one photo, and allow location access when iOS asks.
4. Confirm the photo preview and GPS accuracy are shown.
5. Enable airplane mode, fully close the installed app, and relaunch it.
6. Pass only when the dashboard, captured photo, GPS metadata, and report preview remain available.

For every future run, record the device model, OS/browser version, date, tester,
Pass/Fail result, and a non-sensitive evidence reference. Do not store project data,
precise GPS coordinates, credentials, or personal media in the repository.
