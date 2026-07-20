// stellar.js  —  Isha Chury Portfolio

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
  window.addEventListener('mousemove', e => {
    dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    dot.classList.add('cursor-active');   // stays hidden until we know where the mouse is
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => dot.classList.remove('is-hover'));
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