(function () {
  const configElement = document.getElementById('movie-player-config');
  const video = document.getElementById('movieVideo');
  const overlay = document.querySelector('[data-play-overlay]');

  if (!configElement || !video) {
    return;
  }

  let source = '';
  let hls = null;
  let prepared = false;

  try {
    source = JSON.parse(configElement.textContent || '{}').source || '';
  } catch (error) {
    source = '';
  }

  const showError = function () {
    if (overlay) {
      overlay.hidden = false;
      overlay.innerHTML = '<span>!</span>';
      overlay.setAttribute('aria-label', '播放暂时不可用');
    }
  };

  const prepare = function () {
    if (prepared || !source) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          showError();
        }
      });
      return;
    }

    showError();
  };

  const startPlayback = function () {
    prepare();

    if (overlay) {
      overlay.hidden = true;
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.hidden = false;
        }
      });
    }
  };

  prepare();

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.hidden = true;
    }
  });
})();
