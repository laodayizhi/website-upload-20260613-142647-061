(function () {
    var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    var hlsPromise = null;

    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function $all(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = $("[data-menu-button]");
        var menu = $("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = $all("[data-hero-slide]");
        if (slides.length === 0) {
            return;
        }
        var dots = $all("[data-hero-dot]");
        var previous = $("[data-hero-prev]");
        var next = $("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        var panels = $all("[data-filter-panel]");
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var input = $("[data-search-input]", panel);
            var category = $("[data-category-filter]", panel);
            var type = $("[data-type-filter]", panel);
            var count = $("[data-filter-count]", panel);
            var cards = $all("[data-card]", root);

            function apply() {
                var keyword = normalize(input && input.value);
                var categoryValue = normalize(category && category.value);
                var typeValue = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
                    var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                    var match = matchKeyword && matchCategory && matchType;
                    card.classList.toggle("card-hidden", !match);
                    if (match) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部";
                }
            }

            [input, category, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function ensureHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = hlsScriptUrl;
            script.async = true;
            script.onload = function () {
                resolve(window.Hls || null);
            };
            script.onerror = function () {
                reject(new Error("load failed"));
            };
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function startVideo(shell) {
        var video = $("video[data-stream]", shell);
        var button = $("[data-play-button]", shell);
        var message = $("[data-play-message]", shell);
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        if (!stream) {
            if (message) {
                message.textContent = "播放源暂不可用";
            }
            return;
        }
        if (video.getAttribute("data-ready") === "true") {
            video.play().catch(function () {});
            return;
        }
        if (message) {
            message.textContent = "正在启动播放";
        }

        function reveal() {
            video.setAttribute("data-ready", "true");
            if (button) {
                button.classList.add("is-hidden");
            }
            video.play().catch(function () {});
        }

        function useDirect() {
            video.src = stream;
            video.addEventListener("loadedmetadata", reveal, { once: true });
            video.load();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var localHls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            localHls.loadSource(stream);
            localHls.attachMedia(video);
            localHls.on(window.Hls.Events.MANIFEST_PARSED, reveal);
            localHls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && message) {
                    message.textContent = "视频暂时无法播放，请稍后重试";
                }
            });
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            useDirect();
            return;
        }

        ensureHlsLibrary()
            .then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, reveal);
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && message) {
                            message.textContent = "视频暂时无法播放，请稍后重试";
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    useDirect();
                } else if (message) {
                    message.textContent = "播放环境暂不支持该视频格式";
                }
            })
            .catch(function () {
                if (message) {
                    message.textContent = "视频暂时无法播放，请稍后重试";
                }
            });
    }

    function initPlayers() {
        $all("[data-player]").forEach(function (shell) {
            var button = $("[data-play-button]", shell);
            if (button) {
                button.addEventListener("click", function () {
                    startVideo(shell);
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
