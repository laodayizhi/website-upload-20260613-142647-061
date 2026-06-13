(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('.page-filter');
  var filterTarget = document.querySelector('.filter-target');
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(value) {
    if (!filterTarget) {
      return;
    }

    var keyword = normalize(value);
    var cards = Array.prototype.slice.call(filterTarget.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
    }

    filterCards(filterInput.value);

    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }
})();
