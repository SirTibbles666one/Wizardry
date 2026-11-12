// Boot watchdog: if the app never replaces the boot splash, say so.
//
// The splash is rendered by boot-shell.js into #root as #fluxer-boot-shell and is
// removed when the real app mounts. So "still there after this long" is the exact
// signal for "the client never started" — which otherwise shows as a blank page in
// the theme's background colour, with nothing to explain it or act on.
//
// The overlay is added on top and removed again if the app wakes up late, so a slow
// phone is never punished for being slow.
(() => {
	var DELAY_MS = 12000;
	var OVERLAY_ID = 'wizardry-boot-fallback';

	var splashAlive = () => document.getElementById('fluxer-boot-shell') !== null;

	var removeOverlay = () => {
		var existing = document.getElementById(OVERLAY_ID);
		if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
	};

	var showOverlay = () => {
		if (!splashAlive() || document.getElementById(OVERLAY_ID)) return;
		if (!document.body) return;
		var overlay = document.createElement('div');
		overlay.id = OVERLAY_ID;
		overlay.setAttribute('role', 'alert');
		overlay.style.cssText =
			'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;' +
			'justify-content:center;background:#18271c;color:#e4efe2;padding:24px;' +
			'text-align:center;font-family:Nunito,system-ui,-apple-system,sans-serif';
		overlay.innerHTML =
			'<div style="max-width:26rem">' +
			'<h1 style="margin:0 0 10px;font-size:22px;line-height:1.25;' +
			'font-family:\'Baloo 2\',Nunito,system-ui,sans-serif">Wizardry is taking longer to load</h1>' +
			'<p style="margin:0 0 20px;color:#a3bda0;font-size:15px;line-height:1.5">' +
			'The app did not finish starting. Your connection may have dropped, or an update was being installed.' +
			'</p>' +
			'<button type="button" id="wizardry-boot-retry" style="border:0;border-radius:12px;' +
			'padding:12px 22px;background:#e0b45c;color:#16241a;font-size:16px;font-weight:700;' +
			'font-family:inherit;cursor:pointer">Try again</button>' +
			'</div>';
		document.body.appendChild(overlay);
		var retry = document.getElementById('wizardry-boot-retry');
		if (retry) {
			retry.addEventListener('click', () => {
				location.reload();
			});
		}
	};

	setTimeout(showOverlay, DELAY_MS);

	var observer = new MutationObserver(() => {
		if (!splashAlive()) {
			removeOverlay();
			observer.disconnect();
		}
	});
	observer.observe(document.documentElement, {childList: true, subtree: true});
	window.addEventListener('online', removeOverlay);
})();
