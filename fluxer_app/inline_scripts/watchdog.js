// Boot watchdog: if the client never fills #root, say so.
//
// The failure this exists for is silent: the document, its inline theme and the
// service worker all arrive, the app bundle does not run, and the page is a blank
// rectangle in the theme's own background colour. Nothing tells the person what
// happened or what to do.
//
// The signal is #root staying empty — checked every second from load, acted on after
// twelve, and withdrawn the moment the app mounts, so a slow phone is never punished
// for being slow.
(() => {
	var GRACE_MS = 12000;
	var OVERLAY_ID = 'wizardry-boot-fallback';
	var startedAt = Date.now();
	var shown = false;

	var root = () => document.getElementById('root');

	var mounted = function () {
		var el = root();
		return !!(el && el.childElementCount > 0);
	};

	var removeOverlay = function () {
		var existing = document.getElementById(OVERLAY_ID);
		if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
		shown = false;
	};

	var showOverlay = function () {
		if (document.getElementById(OVERLAY_ID) || !document.body) return;
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
			"font-family:'Baloo 2',Nunito,system-ui,sans-serif\">Wizardry is taking longer to load</h1>" +
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
			retry.addEventListener('click', function () {
				location.reload();
			});
		}
	};

	var tick = function () {
		if (mounted()) {
			if (shown) removeOverlay();
			return;
		}
		if (!shown && Date.now() - startedAt >= GRACE_MS) {
			showOverlay();
			shown = true;
		}
	};

	setInterval(tick, 1000);
	tick();
})();
