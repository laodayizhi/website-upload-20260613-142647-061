(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startTimer() {
    if (!slides.length) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function() {
      showSlide(current + 1);
    }, 5000);
  }

  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
      startTimer();
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showSlide(Number(dot.getAttribute('data-slide') || 0));
      startTimer();
    });
  });

  startTimer();

  var pageFilter = document.querySelector('.page-filter-input');
  var typeFilter = document.querySelector('.type-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-tags') || ''
    ].join(' ').toLowerCase();
  }

  function applyPageFilter() {
    var keyword = pageFilter ? pageFilter.value.trim().toLowerCase() : '';
    var type = typeFilter ? typeFilter.value.trim() : '';

    cards.forEach(function(card) {
      var content = cardText(card);
      var cardType = card.getAttribute('data-type') || '';
      var keywordOk = !keyword || content.indexOf(keyword) !== -1;
      var typeOk = !type || cardType.indexOf(type) !== -1;
      card.classList.toggle('is-hidden', !(keywordOk && typeOk));
    });
  }

  if (pageFilter) {
    pageFilter.addEventListener('input', applyPageFilter);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyPageFilter);
  }

  var searchInput = document.getElementById('searchInput');
  var searchButton = document.getElementById('searchButton');
  var searchResults = document.getElementById('searchResults');

  function createResultCard(movie) {
    var link = document.createElement('a');
    link.className = 'movie-card';
    link.href = movie.url;

    var cover = document.createElement('div');
    cover.className = 'card-cover';

    var image = document.createElement('img');
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = 'lazy';
    image.decoding = 'async';

    var badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = movie.region;

    var play = document.createElement('span');
    play.className = 'play-float';
    play.textContent = '▶';

    cover.appendChild(image);
    cover.appendChild(badge);
    cover.appendChild(play);

    var content = document.createElement('div');
    content.className = 'card-content';

    var title = document.createElement('h3');
    title.textContent = movie.title;

    var desc = document.createElement('p');
    desc.textContent = movie.oneLine;

    var meta = document.createElement('div');
    meta.className = 'card-meta';

    var year = document.createElement('span');
    year.textContent = movie.year;

    var type = document.createElement('span');
    type.textContent = movie.type;

    meta.appendChild(year);
    meta.appendChild(type);
    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(meta);
    link.appendChild(cover);
    link.appendChild(content);
    return link;
  }

  function renderSearch() {
    if (!searchInput || !searchResults || !window.SiteMovies) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var paramKeyword = params.get('q');
    if (paramKeyword && !searchInput.value) {
      searchInput.value = paramKeyword;
    }

    var keyword = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';

    if (!keyword) {
      return;
    }

    var matches = window.SiteMovies.filter(function(movie) {
      return movie.searchText.indexOf(keyword) !== -1;
    }).slice(0, 120);

    matches.forEach(function(movie) {
      searchResults.appendChild(createResultCard(movie));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }

  if (searchButton) {
    searchButton.addEventListener('click', renderSearch);
  }
})();
