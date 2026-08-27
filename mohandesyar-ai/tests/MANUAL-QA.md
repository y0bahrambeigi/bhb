# MohandesYar AI 2.0 — Physical-device release gate

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

Record the device model, OS/browser version, date, tester, and Pass/Fail result in the PR before marking it Ready for review.
