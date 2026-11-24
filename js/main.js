/* ============================================================
   RAGERUSH - 90s website interactions
   ============================================================ */

(function () {
  "use strict";

  /* Safe storage wrapper: itch.io embeds the site in an iframe where
     localStorage can be blocked, so never let it break the whole page. */
  var store = {
    get: function (key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
    }
  };

  /* ---------- Visitor counter (persisted in localStorage) ---------- */
  function initCounter() {
    var el = document.getElementById("visitor-counter");
    if (!el) return;
    var count = parseInt(store.get("rr_visits"), 10);
    if (isNaN(count)) count = 128347;
    count += 1;
    store.set("rr_visits", count);
    var digits = String(count).padStart(6, "0").split("");
    el.innerHTML = "";
    digits.forEach(function (d) {
      var s = document.createElement("span");
      s.textContent = d;
      el.appendChild(s);
    });
  }

  /* ---------- Live clock ---------- */
  function initClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    function tick() {
      var now = new Date();
      el.textContent = "PAGE LOADED " + now.toLocaleDateString() + " - " + now.toLocaleTimeString();
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Trailer / fake video player ---------- */
  function initVideoPlayer() {
    var player = document.getElementById("video-player");
    if (!player) return;

    var overlay = player.querySelector(".play-overlay");
    var sceneText = player.querySelector(".scene-text");
    var timeEl = document.getElementById("video-time");
    var progressEl = player.querySelector(".progress-fill");
    var frames = [
      "RAGERUSH PRESENTS...",
      "THE YEAR IS 1997...",
      "THE ARCADE IS UNDER ATTACK!",
      "SUIT UP. POWER UP. RAGE ON!",
      "RAGERUSH - COMING SOON!"
    ];
    var frame = 0;
    var seconds = 0;
    var timer = null;

    function play() {
      player.classList.add("playing");
      seconds = 0;
      frame = 0;
      if (sceneText) sceneText.textContent = frames[0];
      timer = setInterval(function () {
        seconds += 1;
        frame = Math.floor(seconds / 4) % frames.length;
        if (sceneText) sceneText.textContent = frames[frame];
        var mm = String(Math.floor(seconds / 60)).padStart(2, "0");
        var ss = String(seconds % 60).padStart(2, "0");
        if (timeEl) timeEl.textContent = mm + ":" + ss + " / 00:45";
        if (progressEl) progressEl.style.width = Math.min((seconds / 45) * 100, 100) + "%";
        if (seconds >= 45) stop();
      }, 1000);
    }

    function stop() {
      clearInterval(timer);
      player.classList.remove("playing");
      if (timeEl) timeEl.textContent = "00:00 / 00:45";
      if (progressEl) progressEl.style.width = "0%";
    }

    function toggle() {
      if (player.classList.contains("playing")) stop();
      else play();
    }

    if (overlay) overlay.addEventListener("click", toggle);
    var stopBtn = document.getElementById("stop-btn");
    if (stopBtn) stopBtn.addEventListener("click", stop);

    /* Thumbnails change the scene text and scroll up to the player */
    document.querySelectorAll(".thumb[data-title]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        if (sceneText) sceneText.textContent = thumb.getAttribute("data-title");
        window.scrollTo({ top: player.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      });
    });
  }

  /* ---------- Download page: progress bar / simulated download ---------- */
  function initDownloads() {
    var buttons = document.querySelectorAll("[data-target]");
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var target = btn.getAttribute("data-target");
        var fill = target ? document.querySelector(target + " .progress-fill") : null;
        var status = target ? document.querySelector(target + " .dl-status") : null;
        if (!fill) return;
        var pct = 0;
        fill.style.width = "0%";
        if (status) status.textContent = "CONNECTING TO MIRROR...";
        var iv = setInterval(function () {
          pct += Math.floor(Math.random() * 12) + 4;
          if (pct >= 100) {
            pct = 100;
            clearInterval(iv);
            if (status) status.textContent = "DOWNLOAD COMPLETE! (just kidding - it's 1997, dial-up!)";
          } else {
            if (status) status.textContent = "DOWNLOADING... " + pct + "%";
          }
          fill.style.width = pct + "%";
        }, 220);
      });
    });
  }

  /* ---------- Guestbook (localStorage) ---------- */
  function initGuestbook() {
    var form = document.getElementById("guestbook-form");
    var list = document.getElementById("guestbook-list");
    if (!form || !list) return;

    function render() {
      var entries = [];
      try { entries = JSON.parse(store.get("rr_guestbook")) || []; } catch (e) {}
      list.innerHTML = "";
      entries.slice(-8).reverse().forEach(function (entry) {
        var div = document.createElement("div");
        div.className = "guest-entry";
        var name = document.createElement("span");
        name.className = "guest-name";
        name.textContent = entry.name + " wrote on " + entry.date + ":";
        var msg = document.createElement("span");
        msg.className = "guest-msg";
        msg.textContent = entry.message;
        div.appendChild(name);
        div.appendChild(msg);
        list.appendChild(div);
      });
      if (!entries.length) {
        list.innerHTML = '<div class="guest-entry"><span class="guest-msg">No entries yet! Be the first to sign!!!</span></div>';
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("[name=name]").value.trim() || "Anonymous";
      var message = form.querySelector("[name=message]").value.trim();
      if (!message) return;
      var entries = [];
      try { entries = JSON.parse(store.get("rr_guestbook")) || []; } catch (e) {}
      entries.push({ name: name, message: message, date: new Date().toLocaleDateString() });
      store.set("rr_guestbook", JSON.stringify(entries));
      form.reset();
      render();
    });

    render();
  }

  /* ---------- Single-page nav: mobile menu + scroll spy ---------- */
  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") links.classList.remove("open");
      });
    }

    var navLinks = document.querySelectorAll("[data-nav]");
    var sections = document.querySelectorAll("section[id]");
    if (!navLinks.length || !sections.length) return;

    function updateActive() {
      var pos = window.scrollY + 140;
      var current = "";
      sections.forEach(function (sec) {
        if (sec.offsetTop <= pos) current = sec.id;
      });
      navLinks.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("data-nav") === current);
      });
    }
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
  }

  /* ---------- Light / dark theme toggle ---------- */
  function initTheme() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var root = document.documentElement;
    var saved = store.get("rr_theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

    function sync() {
      var dark = root.getAttribute("data-theme") === "dark";
      btn.textContent = dark ? "☀" : "☾";
      var label = dark ? "Switch to light mode" : "Switch to dark mode";
      btn.title = label;
      btn.setAttribute("aria-label", label);
    }

    sync();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("rr_theme", next);
      sync();
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCounter();
    initClock();
    initVideoPlayer();
    initDownloads();
    initGuestbook();
    initNav();
    initTheme();
  });
})();
