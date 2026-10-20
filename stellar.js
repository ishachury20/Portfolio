// stellar.js  —  Isha Chury Portfolio

// ---- 1440 design lock ----
// Above 1440px viewport width, the #scale-root canvas is scaled up uniformly so
// the layout keeps its 1440px proportions instead of re-flowing wider — but only
// up to MAX_SCALE. Past that (1440px with the setting below) the scale stops growing
// and the extra width becomes MARGIN: the content column stays the same size and
// the dark / white sections still run edge to edge, so images are never stretched
// wider on big monitors. Below 1440px this does nothing (normal responsive CSS).
(function () {
  const LOCK_WIDTH = 1440;   // ← change this to move the lock breakpoint
  const MAX_SCALE  = 1.0;    // ← biggest the page is allowed to grow (1.0 = never bigger than the 1440 design; 1.2 = 120%).
                             //   Lower = more side margin on large screens, higher = less.
  const root = document.getElementById('scale-root');
  if (!root) return;

  function applyScale() {
    const vw = window.innerWidth;
    if (vw > LOCK_WIDTH) {
      const scale = Math.min(vw / LOCK_WIDTH, MAX_SCALE);
      // canvas width in CSS px, chosen so that (width x scale) fills the screen exactly
      root.style.width = (vw / scale) + 'px';
      root.style.transform = `scale(${scale})`;
      // the element's own box doesn't grow when transformed, so the page
      // needs an explicit height equal to its scaled-up size or content
      // below/scrolling breaks
      document.body.style.height = (root.scrollHeight * scale) + 'px';
    } else {
      root.style.width = '';
      root.style.transform = 'none';
      document.body.style.height = 'auto';
    }
  }

  window.addEventListener('resize', applyScale);
  window.addEventListener('load', applyScale);
  window.addEventListener('stellar-relayout', applyScale);
  applyScale();
})();


// ---- Taller case-study cards on large screens ----
// Because the page no longer scales up past 1440px, big monitors just get more margin,
// which can make the card images feel wide and flat. Above 1440px the case-study card
// images are stretched taller by a few percent (full amount by ~1920px wide).
//   CARD_STRETCH = how much taller at full effect (1.08 = 8% taller; 1 = no stretch)
(function () {
  const CARD_STRETCH = 1.08;   // ← tune this
  const START = 1440, FULL = 1920;
  const imgs = Array.from(document.querySelectorAll('.cg-shot'));
  if (!imgs.length) return;

  function apply() {
    const vw = window.innerWidth;
    const t = Math.max(0, Math.min(1, (vw - START) / (FULL - START)));
    const k = 1 + (CARD_STRETCH - 1) * t;
    document.documentElement.style.setProperty('--card-stretch', k.toFixed(4));
    imgs.forEach(img => {
      if (t > 0 && img.naturalWidth) {
        img.style.aspectRatio = img.naturalWidth + ' / ' + (img.naturalHeight * k);
        img.style.objectFit = 'fill';
      } else {
        img.style.aspectRatio = '';
        img.style.objectFit = '';
      }
    });
    // page height was measured by the 1440 lock above; refresh it after the cards change size
    window.dispatchEvent(new Event('stellar-relayout'));
  }

  imgs.forEach(img => { if (!img.complete) img.addEventListener('load', apply); });
  window.addEventListener('resize', apply);
  window.addEventListener('load', apply);
  apply();
})();



// ---- HealthChat card: screenshot rests slightly "tucked" below the card edge, rises on hover ----
// The screenshot is clipped by the card's inner edge. At rest its bottom LIFT is hidden below that edge;
// on hover it slides up by LIFT, revealing that hidden part, and ends with the window's bottom edge
// exactly on the inner edge (no gap). The window's bottom is found from the image's own pixels.
// (Needs the site served over http(s); if the browser blocks pixel reading, e.g. opening the file
// straight from disk, the CSS default position is used.)
document.querySelectorAll('.cg-screen').forEach(function (img) {
  const LIFT = 1.7;                     // ← how far it rises on hover, in % of the card width (cqw)
  if (!img) return;
  const clip = img.parentElement, media = clip.parentElement;
  let frac = null;
  img.style.setProperty('--lift', LIFT + 'cqw');

  function measure() {
    try {
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return;
      const c = document.createElement('canvas');
      c.width = 40; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, Math.round(w / 2) - 20, 0, 40, h, 0, 0, 40, h);
      const d = g.getImageData(0, 0, 40, h).data;
      for (let y = h - 1; y >= 0; y--) {
        let ok = 0;
        for (let x = 0; x < 40; x++) if (d[(y * 40 + x) * 4 + 3] >= 250) ok++;
        if (ok >= 30) { frac = (y + 1) / h; break; }
      }
    } catch (e) { frac = null; }
  }
  // PHONES (<=479px): size the screenshot so there's always the same small gap (FIT_GAP px) between the card's
  // description and the screenshot — whatever the phone's width or however many lines the description takes.
  // (It's the biggest the screenshot can be without touching the text; capped at the normal desktop size.)
  const FIT_GAP = 10;                    // ← gap under the description on phones, in px (lower = bigger screenshot)
  const phoneMQ = window.matchMedia('(max-width:479px)');
  function fit() {
    const sub = media.querySelector('.cg-overlay-sub');
    const shade = media.querySelector('.cg-shade');
    if (!phoneMQ.matches || !sub || frac == null || !img.naturalWidth) { img.style.width = ''; img.style.left = ''; if (shade) { shade.style.left = ''; shade.style.right = ''; } return; }
    const cr = clip.getBoundingClientRect(), sr = sub.getBoundingClientRect();
    const ch = clip.clientHeight, cw = clip.clientWidth;
    if (!ch || !cw) return;
    const liftPx = media.clientWidth * LIFT / 100;
    const ratio = img.naturalHeight / img.naturalWidth;
    let w = ((ch + liftPx - (sr.bottom - cr.top) - FIT_GAP) / frac) / ratio;
    w = Math.max(media.clientWidth * 0.62, Math.min(w, cw * 0.9041 / 0.9852));
    img.style.width = w + 'px';
    img.style.left = ((cw - w) / 2) + 'px';
    if (shade) {   // keep the soft shadow under the screenshot lined up with it
      const mw = media.clientWidth, L = clip.offsetLeft + (cw - w) / 2;
      shade.style.left = (L + 0.081 * w) + 'px';
      shade.style.right = (mw - (L + w) + 0.081 * w + 0.0065 * mw) + 'px';
    }
  }
  function place() {
    fit();
    if (frac == null) return;
    const ch = clip.clientHeight, ih = img.clientHeight;
    if (!ch || !ih) return;
    const liftPx = media.clientWidth * LIFT / 100;
    img.style.top = ((ch + liftPx - frac * ih) / ch * 100) + '%';
  }
  function init() { measure(); place(); }
  if (img.complete) init(); else img.addEventListener('load', init);
  window.addEventListener('resize', place);
  window.addEventListener('stellar-relayout', place);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(place);
    ro.observe(clip);
    const sub0 = media.querySelector('.cg-overlay-sub'); if (sub0) ro.observe(sub0);   // description re-wraps when web fonts arrive (Safari: after fonts.ready)
  }
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);   // text re-wraps once the fonts arrive
  window.addEventListener('load', place);
  window.addEventListener('pageshow', place);
  media.closest('.case-card')?.addEventListener('transitionend', place, true);   // re-fit once the reveal slide-in finishes (measuring mid-slide pulled the screenshot up)
  setTimeout(place, 300); setTimeout(place, 1200);   // safety re-fit after the loader / fonts settle
  if (phoneMQ.addEventListener) phoneMQ.addEventListener('change', place);
});

// ---- Phone nav: "@" button opens the LinkedIn / Resume dropdown ----
(function () {
  const btn  = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;
  function setOpen(open) {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  }
  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 680) setOpen(false); });
})();

// ---- Scroll reveal ----
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  // Case-study cards: every layer of a card (outline, screenshot, shadow, text, number) is revealed TOGETHER,
  // and only once the card's images have loaded — so nothing shows up before the rest (no bare background first).
  const cardIO = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (!e.isIntersecting) return;
      cardIO.unobserve(e.target);
      const card = e.target;
      const imgs = Array.from(card.querySelectorAll('img'));
      const ready = Promise.all(imgs.map(img => (img.decode ? img.decode() : Promise.resolve()).catch(() => {})));
      const timeout = new Promise(res => setTimeout(res, 1500));   // never wait longer than this for slow images
      Promise.race([ready, timeout]).then(() => {
        requestAnimationFrame(() => card.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible')));
      });
    }),
    { threshold: 0.12, rootMargin: '0px 0px 120px 0px' }   // starts a little early so the images are ready as the card scrolls in
  );
  document.querySelectorAll('.reveal').forEach(el => {
    const card = el.closest('.case-card');
    if (card) { if (!card.dataset.revealWatched) { card.dataset.revealWatched = '1'; cardIO.observe(card); } }
    else io.observe(el);
  });
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
}

// ---- Sandbox carousel ----
(function () {
  const slides = [
    { title:"Let's Get Talking", desc:"A conversational card game engaging men in infertility dialogue to improve communication of physical, social, and mental needs.", credit:"ACM DIS Pictorial" },
    { title:"Mood Ring",         desc:"A tiny wearable concept that shifts color with heart-rate variability — a weekend prototype exploring ambient emotional feedback.", credit:"Personal project" },
    { title:"Type Walk",         desc:"A generative typography sketch where letterforms morph as you scroll, built to learn more about SVG path interpolation.", credit:"Weekend build" }
  ];
  const visual   = document.getElementById('sandboxVisual');
  const info     = document.getElementById('sandboxInfo');
  const titleEl  = document.getElementById('sandboxTitle');
  const descEl   = document.getElementById('sandboxDesc');
  const creditEl = document.getElementById('sandboxCredit');
  const dotsWrap = document.getElementById('sandboxDots');
  const arrow    = document.getElementById('sandboxArrow');
  if (!titleEl || !dotsWrap) return;
  let index = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', 'Sandbox project ' + (i + 1));
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function render() {
    const s = slides[index];
    titleEl.textContent  = s.title;
    descEl.textContent   = s.desc;
    creditEl.textContent = s.credit;
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === index));
  }
  function goTo(i) {
    if (i === index) return;
    index = i;
    if (prefersReduced) { render(); return; }
    if (visual) visual.style.opacity = 0;
    if (info)   info.style.opacity   = 0;
    setTimeout(() => {
      render();
      if (visual) visual.style.opacity = 1;
      if (info)   info.style.opacity   = 1;
    }, 180);
  }
  if (arrow) arrow.addEventListener('click', () => goTo((index + 1) % slides.length));
  render();
})();

// ---- phone hero spotlight: fade it out as the white section scrolls over the pinned hero ----
(function () {
  const mq = window.matchMedia('(max-width:479px)');
  const hero = document.querySelector('.hero-block');
  if (!hero) return;
  let ticking = false;
  function update() {
    ticking = false;
    if (!mq.matches) { document.documentElement.style.removeProperty('--spot-o'); return; }
    const h = hero.offsetHeight || 1;
    const o = Math.max(0, Math.min(1, 1 - window.scrollY / (h * 0.7)));   // ← 0.7 = fade out after scrolling 70% of the hero's height
    document.documentElement.style.setProperty('--spot-o', o.toFixed(3));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();


// ---- LOADING SCREEN (index.html) ----
// A dark panel wipes across the white screen as the page loads (progress eases toward ~90% while waiting, then runs to 100%
// once the page, images and fonts are ready — never faster than MIN_MS, so it doesn't just flash). At 100% the name fades
// and the (dark) screen dissolves into the hero.
(function () {
  const el = document.getElementById('loader');
  if (!el) return;
  const root = document.documentElement;
  const MIN_MS = 1800;     // ← shortest the loading screen stays up (ms)
  const MAX_MS = 6000;     // ← give up waiting after this long and open the site anyway (ms)
  const HOLD_MS = 450;     // ← pause at 100% before the name fades (ms)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minMs = reduced ? 600 : MIN_MS;
  const num = document.getElementById('ldNum'), fill = document.getElementById('ldFill');
  const start = performance.now();
  let pct = 0, ready = false, finished = false;

  const loaded = new Promise(res => {
    if (document.readyState === 'complete') res(); else window.addEventListener('load', res, { once: true });
  });
  const fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  Promise.all([loaded, fonts]).then(() => { ready = true; });
  setTimeout(() => { ready = true; }, MAX_MS);

  function paint() {
    num.textContent = Math.round(pct);
    fill.style.width = pct + '%';
  }
  function finish() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem('ic-loader-seen', '1'); } catch (e) {}
    setTimeout(() => {
      el.classList.add('is-done');
      root.classList.remove('is-loading');
      setTimeout(() => el.remove(), 1500);
    }, HOLD_MS);
  }
  function tick(now) {
    const t = Math.max(0, now - start);   // (the first animation frame can be stamped slightly before `start`)
    let target = Math.min(90, 90 * (1 - Math.exp(-t / 1200)));
    if (ready) target = Math.min(100, Math.max(target, 100 * t / minMs));
    pct += (target - pct) * 0.12 + 0.05;
    if (pct > target) pct = target;
    if (pct < 0) pct = 0;
    if (ready && t >= minMs && pct > 99.4) pct = 100;
    paint();
    if (pct < 100) requestAnimationFrame(tick); else finish();
  }
  paint();
  requestAnimationFrame(tick);
})();


// ---- Phone logo carousel: (re)start the scroll once everything has loaded ----
// Safari can start the CSS animation while the strip is still 0px wide (images / fonts not in yet) and then leave it frozen
// until a refresh. Restarting it after load, after the loading screen, and when the tab comes back makes it always run.
(function () {
  const track = document.querySelector('.logo-track');
  if (!track) return;
  function restart() {
    track.style.animation = 'none';
    void track.offsetWidth;            // force a reflow so the animation really restarts
    track.style.animation = '';
  }
  track.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', restart); });
  window.addEventListener('load', restart);
  window.addEventListener('pageshow', restart);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) restart(); });
  const ld = document.getElementById('loader');
  if (ld) ld.addEventListener('transitionend', restart);
  setTimeout(restart, 600); setTimeout(restart, 2500);
})();