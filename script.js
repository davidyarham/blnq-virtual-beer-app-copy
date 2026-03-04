const glassEl = document.getElementById('glassTilt');
const liquidEl = document.getElementById('liquid');
const foamEl = document.getElementById('foam');
const bubblesEl = document.getElementById('bubbles');
const levelFill = document.getElementById('levelFill');
const levelLabel = document.getElementById('levelLabel');
const drinkBtn = document.getElementById('drinkBtn');
const topupBtn = document.getElementById('topupBtn');
const emptyMsg = document.getElementById('emptyMsg');
const pourStream = document.getElementById('pourStream');

let level = 100;
let drinkInterval = null;
let isPouring = false;

// ── Bubbles ──────────────────────────────────────────────
function createBubbles() {
	bubblesEl.innerHTML = '';
	for (let i = 0; i < 18; i++) {
		const b = document.createElement('div');
		b.className = 'bubble';
		const size = 4 + Math.random() * 8;
		b.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${10 + Math.random() * 80}%;
      animation-duration: ${1.4 + Math.random() * 2.2}s;
      animation-delay: ${Math.random() * 2}s;
    `;
		bubblesEl.appendChild(b);
	}
}
createBubbles();

// ── Update visuals ───────────────────────────────────────
function updateLevel() {
	level = Math.max(0, Math.min(100, level));
	document.documentElement.style.setProperty('--level', level);
	levelFill.style.transform = `scaleX(${level / 100})`;
	levelLabel.textContent = Math.round(level) + '%';

	// Foam shrinks as beer empties
	const foamH = Math.max(0, 28 * (level / 100));
	foamEl.style.height = foamH + 'px';

	// Bubbles fade when low
	bubblesEl.style.opacity = level < 10 ? '0' : '1';

	const isEmpty = level <= 0;
	drinkBtn.disabled = isEmpty;
	emptyMsg.classList.toggle('visible', isEmpty);
}

// ── Drink logic ──────────────────────────────────────────
function startDrinking() {
	if (level <= 0) return;
	glassEl.classList.add('drinking');

	drinkInterval = setInterval(() => {
		level -= 2;
		updateLevel();
		if (level <= 0) stopDrinking();
	}, 80);
}

function stopDrinking() {
	clearInterval(drinkInterval);
	drinkInterval = null;
	glassEl.classList.remove('drinking');
}

// Drink on hold
drinkBtn.addEventListener('mousedown', startDrinking);
drinkBtn.addEventListener('touchstart', (e) => {
	e.preventDefault();
	startDrinking();
}, {
	passive: false
});
['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt =>
	drinkBtn.addEventListener(evt, stopDrinking)
);

// ── Top Up logic ─────────────────────────────────────────
topupBtn.addEventListener('click', () => {
	if (isPouring) return;
	isPouring = true;

	// Animate pour stream
	pourStream.style.height = '90px';
	pourStream.classList.add('active');

	// Gradually fill
	const fillInterval = setInterval(() => {
		level += 1.5;
		updateLevel();
		if (level >= 100) {
			level = 100;
			updateLevel();
			clearInterval(fillInterval);
			pourStream.classList.remove('active');
			setTimeout(() => {
				pourStream.style.height = '0';
			}, 200);
			setTimeout(() => {
				isPouring = false;
			}, 600);
		}
	}, 30);
});

updateLevel();