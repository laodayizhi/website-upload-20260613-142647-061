(function() {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const headerForms = document.querySelectorAll("[data-site-search]");
  headerForms.forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      const input = form.querySelector("input");
      const query = input ? input.value.trim() : "";
      const target = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.location.href = target;
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    const dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    let index = 0;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        activate(dotIndex);
      });
    });

    activate(0);

    if (slides.length > 1) {
      window.setInterval(function() {
        activate(index + 1);
      }, 5200);
    }
  }

  const filterInput = document.querySelector("[data-card-filter]");
  const filterSelect = document.querySelector("[data-card-select]");
  const cardList = document.querySelector("[data-card-list]");
  const emptyState = document.querySelector("[data-empty-state]");

  function applyCardFilter() {
    if (!cardList) {
      return;
    }

    const cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
    const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    const year = filterSelect ? filterSelect.value : "";
    let visible = 0;

    cards.forEach(function(card) {
      const text = (card.getAttribute("data-filter-text") || "").toLowerCase();
      const cardYear = card.getAttribute("data-year") || "";
      const matchedQuery = !query || text.indexOf(query) !== -1;
      const matchedYear = !year || cardYear === year;
      const shown = matchedQuery && matchedYear;
      card.style.display = shown ? "" : "none";
      if (shown) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyCardFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", applyCardFilter);
  }

  if (cardList) {
    applyCardFilter();
  }

  const searchPage = document.querySelector("[data-search-page]");
  if (searchPage && window.MOVIE_SEARCH_INDEX) {
    const input = searchPage.querySelector("[data-search-input]");
    const results = searchPage.querySelector("[data-search-results]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function cardTemplate(movie) {
      return [
        '<a class="movie-card" href="' + movie.href + '" data-filter-text="">',
        '<div class="poster-shell">',
        '<img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="badge">' + escapeHtml(movie.year) + '</span>',
        '<span class="badge badge-right">' + escapeHtml(movie.category) + '</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.desc) + '</p>',
        '<div class="movie-meta">',
        '<span class="meta-chip">' + escapeHtml(movie.type) + '</span>',
        '<span class="meta-chip">' + escapeHtml(movie.region) + '</span>',
        '</div>',
        '</div>',
        '</a>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function render() {
      if (!results) {
        return;
      }

      const query = input ? input.value.trim().toLowerCase() : "";
      let list = window.MOVIE_SEARCH_INDEX;

      if (query) {
        list = list.filter(function(movie) {
          return movie.searchText.toLowerCase().indexOf(query) !== -1;
        });
      }

      list = list.slice(0, 120);
      results.innerHTML = list.map(cardTemplate).join("");

      const empty = searchPage.querySelector("[data-empty-state]");
      if (empty) {
        empty.classList.toggle("is-visible", list.length === 0);
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }

    render();
  }
})();
