# MTA DETENI — P13 QR Camera Audit & Hardening

Status: **implemented — synthetic preview only**

## Audit baseline

The previous Scan Center in `web/preview-v5.js` was text-input driven. It resolved synthetic `mta://` tokens but did not open a device camera; the UI explicitly stated that camera activation was not automatic.

## New camera module

`web/qr-camera-v2.js` adds an adaptive smartphone/tablet camera scanner using `html5-qrcode` v2.3.8 as the free/open-source browser scanning engine. The library provides camera scanning, image-file fallback, camera selection and configurable scanning APIs. Its public project documentation describes Android/iOS/browser support and camera/file scanning capabilities. The project is currently in maintenance mode, so the integration is isolated behind a small application adapter to allow future replacement without changing the MTA Scan Center contract.

Reference: https://github.com/mebjas/html5-qrcode

## UX contract

The scanner is deliberately designed as a mobile-first full-screen experience:

- camera preview fills the available viewport;
- safe-area aware bottom controls;
- responsive QR target box from 210px to 320px;
- rear/environment camera preferred;
- manual camera selection when multiple cameras exist;
- torch/flash control when the camera exposes `torch` capability;
- image/gallery fallback when live camera access is unavailable;
- animated scanning line;
- success state animation and optional device vibration;
- explicit close/stop control;
- no QR payload is uploaded by the scanner engine itself;
- scan result is handed back to the existing synthetic `p5resolve()` contract.

## Device/browser safety

A web application cannot guarantee camera access on literally every device. Camera availability depends on browser MediaDevices support, operating-system permission, secure context policy, device hardware and browser-specific behavior. Therefore the scanner has three layers of fallback:

1. rear/environment live camera;
2. selectable available camera;
3. local image/gallery scan.

Camera access must be provided through HTTPS or an approved secure local runtime context. The scanner never treats camera permission as authorization to protected MTA resources.

## Visual behavior

The scanner uses a Web WhatsApp-like interaction pattern without copying proprietary UI assets:

`OPEN → LIVE PREVIEW → ANIMATED TARGET → DETECTED → SUCCESS → RESOLVE`

A detected QR is not immediately treated as authorization. The existing MTA flow remains:

`scan → token resolution → authentication → RBAC → projection → audit`

## Offline behavior

The Service Worker now caches the scanner shell, CSS and scanner engine after online bootstrap. This enables the scanner to continue working after connectivity loss on a device that has completed the bootstrap. A fresh device with no prior bootstrap still requires the scanner engine to be obtained once; this remains distinct from a fully vendored, dependency-free first-load runtime.

## Governance

- Synthetic data only.
- AI OFF.
- Production database disconnected.
- Migration Freeze retained.
- QR tokens are opaque and are not authentication credentials.
- No real detainee data is included in the scanner implementation.

## Future replacement gate

The camera adapter is intentionally isolated. A future hardening increment may replace `html5-qrcode` with a fully vendored ZXing browser build or another actively maintained decoder while retaining the same MTA camera UI and resolution contract.
