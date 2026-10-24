const $ = s => document.querySelector(s);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---- retro pixel cake ---- */
const PAL = {y:'#ffe45c',o:'#ff8a3d',w:'#fff',p:'#ff6f91',F:'#fff3f7',f:'#ff9fbd',b:'#7a3b2e',s:'#ffd35c',d:'#ff8fb0',g:'#d9c7ff'};
const CAKE = [
  '.....y...y...y.....', '.....o...o...o.....', '.....w...w...w.....', '.....p...p...p.....', '.....w...w...w.....',
  '..FFFFFFFFFFFFFFF..', '.FFFFFFFFFFFFFFFFF.', '.FFfFFFFfFFFFfFFFF.', '.bbbsbbbbbsbbbbsbb.',
  '.bbbbbbbbbbbbbbbbb.', '.FFFFFFFFFFFFFFFFF.', '.ddddddddddddddddd.', '.dddsdddddsdddddsd.',
  '.ddddddddddddddddd.', 'ggggggggggggggggggg', '..ggggggggggggggg..'];
let svg = '<svg viewBox="0 0 19 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pixel birthday cake">';
CAKE.forEach((row, y) => [...row].forEach((c, x) => {
  if (!PAL[c]) return;
  const flame = y < 2 ? ` class="fl${x === 9 ? ' b' : ''}"` : '';
  svg += `<rect${flame} x="${x}" y="${y}" width="1.02" height="1.02" fill="${PAL[c]}"/>`;
}));
$('#cake').innerHTML = svg + '</svg>';

/* ---- confetti (canvas) ---- */
const cv = $('#fx'), cx = cv.getContext('2d');
const COL = ['#ff6f91', '#ffd35c', '#b9a2ff', '#8ee3c8', '#ffffff', '#ff9a5c'];
let P = [];
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
addEventListener('resize', fit); fit();
const add = (x, y, vx, vy) => P.push({x, y, vx, vy, r: rnd(0, 6), vr: rnd(-.15, .15), w: rnd(6, 12), h: rnd(4, 9), c: COL[Math.random() * COL.length | 0]});
function burst(x, y, n = 90) {
  n = calm ? n / 4 : n;
  for (let i = 0; i < n; i++) { const a = rnd(0, 6.28), s = rnd(4, 12); add(x, y, Math.cos(a) * s, Math.sin(a) * s - 5); }
}
function cannons(n = 50) {
  n = calm ? n / 4 : n;
  for (let i = 0; i < n; i++) {
    add(0, innerHeight, rnd(4, 12), -rnd(10, 22));
    add(innerWidth, innerHeight, -rnd(4, 12), -rnd(10, 22));
  }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  if (!calm && P.length < 70 && Math.random() < .2) add(rnd(0, innerWidth), -10, rnd(-.8, .8), rnd(1, 2.5));
  P = P.filter(p => p.y < innerHeight + 20);
  for (const p of P) {
    p.vy = Math.min(p.vy + .2, 3.6); p.vx *= .985;
    p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
    cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
  }
  requestAnimationFrame(tick);
}
tick();

/* ---- balloons ---- */
function balloons(n) {
  if (calm) return;
  for (let i = 0; i < n; i++) {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.style.cssText = `left:${rnd(2, 92)}vw;background:${COL[i % 4]};--d:${rnd(5, 8)}s;--x:${rnd(-40, 40)}px;animation-delay:${rnd(0, 1.2)}s`;
    document.body.appendChild(b);
    b.addEventListener('animationend', () => b.remove());
  }
}

/* ---- photo gallery ---- */
const PHOTOS = ['1.jpg', '2.jpg', '3.jpg', '4.jpg'];
const DIRS = ['photos/', ''];   // tries the photos folder first, then the same folder as index.html
let dir = 0;
let cur = 0;
const ph = $('#ph'), dots = $('#dots');
PHOTOS.forEach(() => dots.appendChild(document.createElement('i')));
ph.addEventListener('error', () => {
  if (dir < DIRS.length - 1) { dir++; ph.src = DIRS[dir] + PHOTOS[cur]; }
});
function show(i) {
  cur = (i + PHOTOS.length) % PHOTOS.length;
  ph.src = DIRS[dir] + PHOTOS[cur];
  [...dots.children].forEach((d, k) => d.classList.toggle('on', k === cur));
}
$('#prev').addEventListener('click', () => show(cur - 1));
$('#fwd').addEventListener('click', () => show(cur + 1));
ph.addEventListener('click', () => show(cur + 1));

/* ---- swipe photos on touch screens ---- */
let swipeX = null;
const polaroid = $('.polaroid');
polaroid.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; }, { passive: true });
polaroid.addEventListener('touchend', e => {
  if (swipeX === null) return;
  const dx = e.changedTouches[0].clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
}, { passive: true });

/* ---- flow: intro -> popup -> letter -> photos ---- */
const stage = n => { document.body.dataset.stage = n; scrollTo(0, 0); };
$('#open').addEventListener('click', () => {
  stage('popup');
  $('#env').classList.add('is-open');
  const mx = innerWidth / 2;
  burst(mx, innerHeight * .4); cannons(); balloons(14);
  setTimeout(() => burst(mx, innerHeight * .35, 70), 900);
  setTimeout(() => { stage('letter'); burst(mx, innerHeight * .3, 60); }, 3200);
});
$('#next').addEventListener('click', () => { stage('photos'); show(0); cannons(40); balloons(8); });