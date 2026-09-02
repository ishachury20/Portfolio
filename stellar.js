// stellar.js  —  Isha Chury Portfolio

// ---- 1440 design lock ----
// Above 1440px viewport width, scale the whole #scale-root canvas up
// uniformly so the layout keeps its exact 1440px proportions instead of
// re-flowing wider. Below 1440px this does nothing (normal responsive CSS).
(function () {
  const LOCK_WIDTH = 1440;   // ← change this to move the lock breakpoint
  const root = document.getElementById('scale-root');
  if (!root) return;

  function applyScale() {
    const vw = window.innerWidth;
    if (vw > LOCK_WIDTH) {
      const scale = vw / LOCK_WIDTH;
      root.style.transform = `scale(${scale})`;
      // the element's own box doesn't grow when transformed, so the page
      // needs an explicit height equal to its scaled-up size or content
      // below/scrolling breaks
      document.body.style.height = (root.scrollHeight * scale) + 'px';
    } else {
      root.style.transform = 'none';
      document.body.style.height = 'auto';
    }
  }

  window.addEventListener('resize', applyScale);
  window.addEventListener('load', applyScale);
  applyScale();
})();



// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }));
}

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

// ---- Custom cursor — pointer devices only ----
if (window.matchMedia('(pointer: fine)').matches && !prefersReduced) {
  document.body.classList.add('has-custom-cursor');
  const dot = document.getElementById('cursorDot');
  let mouseX = 0, mouseY = 0;
  let locked = false;   // true while the dot is snapped to a hovered element's bubble

  function moveDotTo(x, y) {
    dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.classList.add('cursor-active');   // stays hidden until we know where the mouse is
    if (!locked) moveDotTo(mouseX, mouseY);
  });

  // above these sizes a target counts as a large click area (e.g. a
  // full-card link), not "text" to hug — it gets the plain grow instead
  const MAX_BUBBLE_W = 260;
  const MAX_BUBBLE_H = 90;

  function hasOwnBubble(el) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
    const hasBlur = cs.backdropFilter && cs.backdropFilter !== 'none';
    return hasBg || hasBlur;
  }

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const rect = el.getBoundingClientRect();
      const fitsAsBubble = rect.width <= MAX_BUBBLE_W && rect.height <= MAX_BUBBLE_H;

      if (hasOwnBubble(el)) {
        // element already reads as a button/pill (active tab, sandbox
        // arrow, etc.) — merge into it rather than draw a second one
        dot.classList.add('is-merged');
      } else if (fitsAsBubble) {
        // no bubble of its own — the cursor becomes one, sized to hug it
        const padX = 10, padY = 6;
        dot.style.width  = (rect.width  + padX * 2) + 'px';
        dot.style.height = (rect.height + padY * 2) + 'px';
        moveDotTo(rect.left + rect.width / 2, rect.top + rect.height / 2);
        locked = true;
        dot.classList.add('is-bubble');
      } else {
        // large click target — grow in place, keep following the pointer
        dot.classList.add('is-hover');
      }
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('is-hover', 'is-bubble', 'is-merged');
      dot.style.width = '';
      dot.style.height = '';
      locked = false;
      moveDotTo(mouseX, mouseY);
    });
  });
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