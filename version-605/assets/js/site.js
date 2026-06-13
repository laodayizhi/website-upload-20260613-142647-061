(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    show(0);
    start();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const categorySelect = document.querySelector('[data-filter-category]');
  const sortSelect = document.querySelector('[data-sort-select]');
  const grid = document.querySelector('[data-card-grid]');
  const emptyState = document.querySelector('[data-empty-state]');

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery) {
      searchInput.value = initialQuery;
    }
  }

  const filterCards = function () {
    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('[data-card]'));
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = categorySelect ? categorySelect.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.category
      ].join(' ').toLowerCase();
      const categoryMatch = !category || card.dataset.category === category;
      const queryMatch = !query || haystack.includes(query);
      const shouldShow = categoryMatch && queryMatch;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  };

  const sortCards = function () {
    if (!grid || !sortSelect) {
      return;
    }

    const mode = sortSelect.value;
    const cards = Array.from(grid.querySelectorAll('[data-card]'));

    if (mode === 'year-desc') {
      cards.sort(function (a, b) {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
    }

    if (mode === 'title-asc') {
      cards.sort(function (a, b) {
        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
      });
    }

    if (mode === 'default') {
      cards.sort(function (a, b) {
        return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
      });
    }

    cards.forEach(function (card, index) {
      if (!card.dataset.index) {
        card.dataset.index = String(index);
      }
      grid.appendChild(card);
    });

    filterCards();
  };

  if (grid) {
    Array.from(grid.querySelectorAll('[data-card]')).forEach(function (card, index) {
      card.dataset.index = String(index);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
  }

  filterCards();
})();
