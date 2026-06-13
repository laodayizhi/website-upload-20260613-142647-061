(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dots button"));
  let currentSlide = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(currentSlide + 1), 5200);
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const filterSelect = document.querySelector("[data-filter-select]");
  const cards = Array.from(document.querySelectorAll(".movie-card, .rank-item"));

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const applyFilter = () => {
    const keyword = normalize(filterInput ? filterInput.value : "");
    const group = normalize(filterSelect ? filterSelect.value : "");

    cards.forEach((card) => {
      const text = normalize(card.getAttribute("data-filter") || card.textContent);
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesGroup = !group || text.includes(group);
      card.classList.toggle("hide-card", !(matchesKeyword && matchesGroup));
    });
  };

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("q");
    if (keyword) {
      filterInput.value = keyword;
    }
    filterInput.addEventListener("input", applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", applyFilter);
  }

  if (filterInput || filterSelect) {
    applyFilter();
  }

  const quickSearch = document.querySelector("[data-quick-search]");
  if (quickSearch) {
    quickSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = quickSearch.querySelector("input");
      const query = input ? input.value.trim() : "";
      const url = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
      window.location.href = url;
    });
  }
})();
