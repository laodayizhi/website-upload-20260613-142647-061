(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function toggleMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-nav");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = panel.hasAttribute("hidden") === false;
            if (opened) {
                panel.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
            } else {
                panel.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            }
        });
    }

    function heroSlider() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function localFilter() {
        var panel = document.querySelector(".filter-panel");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("input[type='search']");
        var type = panel.querySelector("select[name='type']");
        var year = panel.querySelector("select[name='year']");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var t = type ? type.value : "";
            var y = year ? year.value : "";
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" ").toLowerCase();
                var okText = !q || text.indexOf(q) !== -1;
                var okType = !t || card.getAttribute("data-type") === t;
                var okYear = !y || card.getAttribute("data-year") === y;
                card.classList.toggle("hide-card", !(okText && okType && okYear));
            });
        }
        [input, type, year].forEach(function (item) {
            if (item) {
                item.addEventListener("input", apply);
                item.addEventListener("change", apply);
            }
        });
        var reset = panel.querySelector("button[type='button']");
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }
    }

    function searchPage() {
        var box = document.querySelector(".search-box");
        var result = document.querySelector("#search-results");
        if (!box || !result || !Array.isArray(window.SEARCH_MOVIES)) {
            return;
        }
        var input = box.querySelector("input");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var q = input.value.trim().toLowerCase();
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" ").toLowerCase();
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 120);
            if (!list.length) {
                result.innerHTML = '<div class="no-result">没有找到匹配内容，可以换一个片名、地区或类型再试。</div>';
                return;
            }
            result.innerHTML = list.map(function (movie) {
                return '<article class="movie-card">' +
                    '<a class="poster" href="' + movie.detail + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />' +
                    '<span class="poster-glow"></span>' +
                    '</a>' +
                    '<div class="card-content">' +
                    '<div class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
                    '<h2><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h2>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) {
                        return '<span>' + escapeHtml(tag) + '</span>';
                    }).join("") + '</div>' +
                    '<a class="card-link" href="' + movie.detail + '">立即观看</a>' +
                    '</div>' +
                    '</article>';
            }).join("");
        }
        box.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    window.setupMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var starter = document.getElementById("player-start");
        if (!video || !streamUrl) {
            return;
        }
        var prepared = false;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            prepare();
            if (starter) {
                starter.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }
        if (starter) {
            starter.addEventListener("click", start);
        }
        video.addEventListener("click", start, { once: true });
    };

    ready(function () {
        toggleMenu();
        heroSlider();
        localFilter();
        searchPage();
    });
})();
