const root = document.documentElement;
const themeButton = document.getElementById('theme-toggle');
function updateThemeButton() {
  const isDark = root.dataset.theme === 'dark';
  document.getElementById('theme-label').textContent = isDark ? 'light mode' : 'dark mode';
  document.getElementById('theme-icon').textContent = isDark ? '☼' : '☾';
  themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
}
updateThemeButton();
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('gurveer-theme', root.dataset.theme); } catch {}
  updateThemeButton();
});
document.getElementById('year').textContent = new Date().getFullYear();
const copyButton = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('maduraigurveer@gmail.com');
    copyStatus.textContent = 'Email copied. Say hello!';
  } catch {
    copyStatus.textContent = 'Select the email address to copy it, or click it to open your mail app.';
  }
});
const sections = [...document.querySelectorAll('main > section')];
const navLinks = [...document.querySelectorAll('nav a')];
function updateNavigation() {
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 180) current = section;
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) current = sections[sections.length - 1];
  navLinks.forEach(link => {
    const active = link.hash === `#${current.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateNavigation, { passive: true });
updateNavigation();

const enterButton = document.getElementById('enter-site');
const game = document.getElementById('goose-game');
const stage = document.getElementById('game-stage');
const runner = document.getElementById('runner-goose');
const bushes = [...document.querySelectorAll('.game-bush')];
const door = document.getElementById('game-door');
const overlay = document.getElementById('game-overlay');
const status = document.getElementById('game-status');
const progress = document.getElementById('game-progress');
const WORLD_WIDTH = 720;
const WORLD_HEIGHT = 260;
const GROUND = 40;
const GOOSE_X = 90;
const START_SPEED = 210;
const MAX_SPEED = 350;
const BUSH_WIDTH = 36;
const BUSH_HEIGHT = 32;
const DOOR_X = Number(bushes[bushes.length - 1].dataset.worldX) + 350;
function currentSpeed() {
  return START_SPEED + (MAX_SPEED - START_SPEED) * Math.min(distance / (DOOR_X - 400), 1);
}
let mode = 'idle';
let distance = 0;
let height = 0;
let velocity = 0;
let previousTime = null;
let animationFrame = null;

function enterWebsite() {
  mode = 'complete';
  cancelAnimationFrame(animationFrame);
  root.classList.remove('entrance-pending');
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.getElementById('main').focus({ preventScroll: true });
  updateNavigation();
}
function renderGame() {
  runner.style.left = `${GOOSE_X / WORLD_WIDTH * 100}%`;
  runner.style.bottom = `${(GROUND + height) / WORLD_HEIGHT * 100}%`;
  bushes.forEach(bush => {
    const x = Number(bush.dataset.worldX) - distance;
    bush.style.left = `${x / WORLD_WIDTH * 100}%`;
    bush.style.visibility = x < -BUSH_WIDTH || x > WORLD_WIDTH ? 'hidden' : 'visible';
  });
  door.style.left = `${(DOOR_X - distance) / WORLD_WIDTH * 100}%`;
  const cleared = bushes.filter(bush => Number(bush.dataset.worldX) + BUSH_WIDTH < distance + GOOSE_X + 12).length;
  progress.textContent = `${cleared} / ${bushes.length} jumps`;
}
function startGame() {
  cancelAnimationFrame(animationFrame);
  enterButton.hidden = true;
  game.hidden = false;
  overlay.hidden = true;
  distance = 0;
  height = 0;
  velocity = 0;
  previousTime = null;
  mode = 'running';
  status.textContent = 'Jump over seven bushes to reach the door. The pace picks up as you go!';
  stage.setAttribute('aria-label', 'Jump. Tap or press Space.');
  stage.focus({ preventScroll: true });
  renderGame();
  animationFrame = requestAnimationFrame(tick);
}
function jump() {
  if (mode === 'crashed') {
    startGame();
  } else if (mode === 'running' && height === 0) {
    velocity = 430;
  }
}
function tick(time) {
  if (mode !== 'running') return;
  const dt = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.035);
  previousTime = time;
  distance += currentSpeed() * dt;
  height = Math.max(0, height + velocity * dt - 550 * dt * dt);
  velocity = height > 0 ? velocity - 1100 * dt : 0;
  renderGame();
  const collided = bushes.some(bush => {
    const x = Number(bush.dataset.worldX) - distance;
    return x < GOOSE_X + 55 && x + BUSH_WIDTH > GOOSE_X + 12 && height < BUSH_HEIGHT;
  });
  if (collided) {
    mode = 'crashed';
    overlay.hidden = false;
    status.textContent = 'Oops, a bush! Tap or press Space to try again.';
    stage.setAttribute('aria-label', 'Try again. Tap or press Space.');
    return;
  }
  if (DOOR_X - distance < GOOSE_X + 25) {
    enterWebsite();
    return;
  }
  animationFrame = requestAnimationFrame(tick);
}
enterButton.addEventListener('click', startGame);
// Pointer input works on the whole entrance while a run is active.
document.getElementById('entrance').addEventListener('pointerdown', event => {
  if (mode !== 'running' && mode !== 'crashed') return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  jump();
});
document.addEventListener('keydown', event => {
  if (!root.classList.contains('entrance-pending')) return;
  if (event.code === 'Space' || (event.key === 'Enter' && event.target === stage)) {
    event.preventDefault();
    if (event.repeat) return;
    if (mode === 'idle') startGame();
    else jump();
  }
});
document.addEventListener('visibilitychange', () => { previousTime = null; });
