/*!
=========================================================
* Steller Landing page
=========================================================

* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// smooth scroll
$(document).ready(function(){
	$(".nav-link").on('click', function(event) {

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

/* --- Mobile Menu Toggle Logic --- */
$(document).ready(function() {
  const $trigger = $('.mobile-menu-trigger');

  // 1. Listen for the click on the @ circle
  $trigger.on('click', function(e) {
    // Prevent the click from 'bubbling' up (which would trigger the close-menu logic immediately)
    e.stopPropagation(); 
    $(this).toggleClass('is-active');
  });

  // 2. 'Click-Away' Logic: Close the menu if the user clicks anywhere else on the screen
  $(document).on('click', function() {
    $trigger.removeClass('is-active');
  });

  // 3. Prevent the dropdown itself from closing the menu when the user clicks inside it
  $('.mobile-dropdown').on('click', function(e) {
    e.stopPropagation();
  });
});

