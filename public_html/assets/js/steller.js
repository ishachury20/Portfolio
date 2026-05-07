/*!
=========================================================
* Steller Landing page
=========================================================
* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com
=========================================================
*/

// --- 1. Loader & Page Entry Logic ---
window.addEventListener('load', () => {
  // Mark body as loading to prevent scrolling during intro
  document.body.classList.add('loading');

  setTimeout(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    
    // FADE OUT THE LOADER: This removes the "duplicate" text effect
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none'; // Completely removes it from the layout
      }, 500); 
    }
  }, 1800); 
});

// --- 2. Smooth Scroll ---
$(document).ready(function(){
  // Updated selector to catch all internal portfolio links
  $(".floating-nav a, .btn-primary, .project-link").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 700, function(){
        window.location.hash = hash;
      });
    } 
  });
});

/* --- 3. Mobile Menu Toggle Logic --- */
$(document).ready(function() {
  const $trigger = $('.mobile-menu-trigger');

  $trigger.on('click', function(e) {
    e.stopPropagation(); 
    $(this).toggleClass('is-active');
  });

  $(document).on('click', function() {
    $trigger.removeClass('is-active');
  });

  $('.mobile-dropdown').on('click', function(e) {
    e.stopPropagation();
  });
});

/* --- 4. Custom Cursor & Interactive Hover Logic --- */
$(document).ready(function() {
  const cursor = document.querySelector('.custom-cursor');
  const cursorLabels = document.querySelectorAll('.cursor-label');

  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    cursorLabels.forEach(label => {
      if (window.getComputedStyle(label).visibility === "visible") {
        const tightOffset = Math.max(20, window.innerWidth * 0.02); 
        label.style.left = (x + tightOffset) + 'px'; 
        const labelHeight = label.offsetHeight;
        label.style.top = (y - (labelHeight / 2)) + 'px';
      }
    });
  });

  // Comprehensive list of interactive elements based on your new design
  const interactiveElements = document.querySelectorAll(
    'a, button, .at-circle, .stack-icon-wrapper, .hero-layout-container, .genesis-card, .sandbox-card'
  );

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
});