document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-mobile-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-search]"));
  if (query) {
    searchInputs.forEach(function (input) {
      input.value = query;
    });
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
  panels.forEach(function (panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
    var searchInput = panel.querySelector("[data-filter-search]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var regionInput = panel.querySelector("[data-filter-region]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var text = normalize(searchInput && searchInput.value);
      var category = normalize(categorySelect && categorySelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionInput && regionInput.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-keywords")
        ].join(" "));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchCategory = !category || cardCategory === category;
        var matchRegion = !region || cardRegion.indexOf(region) !== -1;
        var matchYear = true;

        if (year === "older") {
          var yearNumber = parseInt(cardYear, 10);
          matchYear = !yearNumber || yearNumber < 2020;
        } else if (year) {
          matchYear = cardYear.indexOf(year) === 0;
        }

        card.classList.toggle("is-hidden", !(matchText && matchCategory && matchYear && matchRegion));
      });
    }

    [searchInput, categorySelect, yearSelect, regionInput].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
});
