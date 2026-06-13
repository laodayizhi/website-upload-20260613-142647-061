(function () {
  window.initMoviePlayer = function (source) {
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.player-overlay');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      loadSource();
      overlay.classList.add('is-hidden');
      video.controls = true;

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', function () {
      playVideo();
    });

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
