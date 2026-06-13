import { H as Hls } from "./hls-vendor.js";

export function initializeMoviePlayer(playerId, streamUrl) {
  var player = document.getElementById(playerId);
  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var button = player.querySelector("button");
  var started = false;
  var hlsInstance = null;

  function attachStream() {
    if (!video || started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();
    player.classList.add("is-playing");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
