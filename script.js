const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
let shooting = [];
let w = 0;
let h = 0;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  build();
}

function build() {
  const density = Math.min(1.4, (w * h) / 520000);
  const count = Math.floor(150 * density);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.3 + 0.25,
    a: Math.random(),
    s: Math.random() * 0.0018 + 0.0004
  }));
}

function spawnShooting() {
  shooting.push({
    x: Math.random() * w * 0.8,
    y: Math.random() * h * 0.4,
    len: Math.random() * 130 + 90,
    vx: 5 + Math.random() * 3,
    vy: 2.2 + Math.random() * 1.4,
    life: 1
  });
}

function draw() {
  ctx.clearRect(0, 0, w, h);

  for (const s of stars) {
    if (!reduced) {
      s.a += s.s;
      if (s.a > 1 || s.a < 0.15) s.s *= -1;
    }
    const alpha = reduced ? 0.7 : Math.abs(Math.sin(s.a * Math.PI));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  for (let i = shooting.length - 1; i >= 0; i--) {
    const m = shooting[i];
    const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len * 0.42);
    grad.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.len, m.y - m.len * 0.42);
    ctx.stroke();
    m.x += m.vx;
    m.y += m.vy;
    m.life -= 0.014;
    if (m.life <= 0 || m.x - m.len > w || m.y > h) shooting.splice(i, 1);
  }

  if (!reduced && shooting.length < 2 && Math.random() < 0.006) spawnShooting();

  requestAnimationFrame(draw);
}

resize();
window.addEventListener('resize', resize);
draw();

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = i === 0 ? '0ms' : `${Math.min(i, 3) * 90}ms`;
  io.observe(el);
});

const SONG = {
  title: 'Saturn — Sleeping At Last',
  youtube: 'dzNvk80XY9s',
  volume: 15
};

const songName = document.getElementById('songName');
if (SONG.title) songName.textContent = `♫ ${SONG.title}`;

const music = document.getElementById('music');
const musicBtn = document.getElementById('musicBtn');
const volBtn = document.getElementById('volBtn');
let player = null;
const VOLUMES = [0, 8, 15, 30];
let volIndex = 2;

function applyVolume() {
  const pct = VOLUMES[volIndex];
  if (player) {
    player.contentWindow.postMessage(
      `{"event":"command","func":"setVolume","args":["${pct / 100}"]}`,
      '*'
    );
  }
  music.volume = Math.min(1, Math.max(0.01, pct / 100));
  volBtn.textContent = pct === 0 ? '🔇' : `🔉 ${pct}`;
}

volBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  volIndex = (volIndex + 1) % VOLUMES.length;
  applyVolume();
});

function makePlayer() {
  if (player || !SONG.youtube) return;
  const id = SONG.youtube.split('/').pop().split('?')[0].split('=').pop();
  const frame = document.createElement('iframe');
  frame.src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&volume=${SONG.volume}`;
  frame.allow = 'autoplay';
  frame.style.cssText =
    'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px';
  document.body.appendChild(frame);
  player = frame;
  musicBtn.classList.add('playing');
  setTimeout(applyVolume, 400);
  setTimeout(applyVolume, 1500);
}

music.addEventListener('error', () => {
  if (musicBtn.classList.contains('local')) return;
  musicBtn.classList.add('local');
  if (SONG.youtube) makePlayer();
});

musicBtn.addEventListener('click', () => {
  if (player) {
    if (player.paused) {
      player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      musicBtn.classList.add('playing');
    } else {
      player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      musicBtn.classList.remove('playing');
    }
    return;
  }
  music.play().catch(() => {});
});

function startOnFirstTouch() {
  if (!SONG.youtube) {
    music.play().catch(() => {});
    return;
  }
  if (musicBtn.classList.contains('playing')) return;
  makePlayer();
}

window.addEventListener('pointerdown', startOnFirstTouch, { passive: true });

applyVolume();

function hearts(count) {
  const chars = ['♥', '✦', '✧', '❀'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.cssText = `position:fixed;z-index:30;pointer-events:none;font-size:${
      14 + Math.random() * 22
    }px;color:${Math.random() > 0.5 ? '#f4b8c4' : '#ffffff'};opacity:0;left:${
      15 + Math.random() * 70
    }vw;top:60vh;transition:transform 2.8s cubic-bezier(.2,.6,.3,1),opacity 2.8s ease`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = Math.random() * 0.7 + 0.3;
      el.style.transform = `translate(${(Math.random() - 0.5) * 260}px, -${
        60 + Math.random() * 130
      }vh) rotate(${Math.random() * 720 - 360}deg)`;
    });
    setTimeout(() => el.remove(), 3000);
  }
}

function respond(btnId, showId) {
  document.getElementById(btnId).closest('.ask').hidden = true;
  const after = document.getElementById(showId);
  after.hidden = false;
  after.classList.add('in');
  setTimeout(() => {
    after.scrollIntoView({ behavior: 'smooth', block: 'center' });
    hearts(34);
  }, 60);
}

document.getElementById('btnYes').addEventListener('click', () => respond('btnYes', 'afterYes'));
document.getElementById('btnLater').addEventListener('click', () => respond('btnLater', 'afterLater'));

document.getElementById('foot').textContent = '1 de octubre · Colombia — Chile';