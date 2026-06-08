/*!
 * stellar.js — Production
 * Isha Chury · Interaction Designer · 2026
 */

/* =====================================================================
 * 1. SMOOTH SCROLL
 * ===================================================================== */
$(document).ready(function () {
  $(".floating-nav a, .btn-primary, .project-link").on('click', function (event) {
    if (this.hash !== "") {
      event.preventDefault();
      const hash = this.hash;
      $('html, body').animate({ scrollTop: $(hash).offset().top }, 700, function () {
        window.location.hash = hash;
      });
    }
  });
});

/* =====================================================================
 * 2. MOBILE MENU TRIGGER
 * ===================================================================== */
$(document).ready(function () {
  const $trigger = $('.mobile-menu-trigger');

  $trigger.on('click', function (e) {
    e.stopPropagation();
    $(this).toggleClass('is-active');
  });

  $(document).on('click', function () { $trigger.removeClass('is-active'); });
  $('.mobile-dropdown').on('click', function (e) { e.stopPropagation(); });
});

/* =====================================================================
 * 3. CUSTOM CURSOR
 * FIX #5: Hero section elements (.hero-visual, .hero-cards-container,
 *          .hero-card, .hero-layout) are intentionally excluded from
 *          the interactive selectors so the cursor never scales on the
 *          card stack area.
 * ===================================================================== */
$(document).ready(function () {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  // Lerp values for smooth cursor lag
  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Animate cursor with slight lag for polish
  function animateCursor() {
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // FIX #5: hero-visual, hero-card, hero-cards-container EXCLUDED.
  // Only explicit UI interactive elements trigger the hover state.
  const interactiveSelectors = [
    '.floating-nav a',
    '.nav-text-link',
    '.nav-resume-btn',
    '.at-circle',
    '.social-icon',
    '.case-study-card',
    '.project-cta',
    '.sandbox-content-card',
    '.sandbox-arrow',
    '.dot',
    '.footer-icon-link',
    '.mobile-dropdown a',
  ].join(', ');

  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
});

/* =====================================================================
 * 4. ACTIVE NAV STATE
 * FIX #3: Work is always active — the glow never leaves.
 * The IntersectionObserver that previously swapped .active is removed.
 * ===================================================================== */
// Work link is hardcoded .active in HTML — nothing to wire here.

/* =====================================================================
 * 5. SCROLL REVEAL — case study cards fade up on enter
 * ===================================================================== */
$(document).ready(function () {
  const revealEls = document.querySelectorAll('.reveal-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => { el.classList.add('is-visible'); }, delay);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));
});

/* =====================================================================
 * 6. SANDBOX CAROUSEL — 2 projects only, no auto-advance
 * ===================================================================== */
$(document).ready(function () {
  const slides = [
    {
      index:       '01 / 02',
      title:       "Let's Get Talking",
      description: "A conversational card game engaging men in infertility dialogue to improve communication of physical, social, and mental needs",
      tag:         "ACM DIS Pictorial",
      img:         "images/Sandbox-1.png",
    },
    {
      index:       '02 / 02',
      title:       "Sandbox Project Two",
      description: "Update this entry with your second sandbox project details.",
      tag:         "In Progress",
      img:         "images/Sandbox-1.png",
    },
  ];

  let current = 0;

  const $img   = $('.sandbox-image');
  const $index = $('.sandbox-index');
  const $title = $('.sandbox-text h3');
  const $desc  = $('.sandbox-text p');
  const $tag   = $('.publication-tag');
  const $dots  = $('.sandbox-dots .dot');
  const $arrow = $('.sandbox-arrow');

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    const s = slides[current];

    $('.sandbox-visual, .sandbox-content-card').css({ opacity: 0, transition: 'opacity 0.2s ease' });
    setTimeout(() => {
      $img.attr('src', s.img).attr('alt', s.title);
      $index.text(s.index);
      $title.text(s.title);
      $desc.text(s.description);
      $tag.text(s.tag);
      $dots.removeClass('active').attr('aria-selected', 'false');
      $dots.eq(current).addClass('active').attr('aria-selected', 'true');
      $('.sandbox-visual, .sandbox-content-card').css({ opacity: 1 });
    }, 200);
  }

  $arrow.on('click', () => goTo(current + 1));
  $dots.on('click', function () { goTo($(this).index()); });
});

/* Section 7: hero parallax removed — image is static */