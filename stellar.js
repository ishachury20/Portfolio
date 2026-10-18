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
  function place() {
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
  if (window.ResizeObserver) new ResizeObserver(place).observe(clip);
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
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
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