// ==UserScript==
// @name         SVG Injector (MathsOnline TranslateX Mode)
// @namespace    https://www.mathsonline.com.au/
// @version      1.1
// @description  Captures SVG files and injects solution elements based on translateX slide position.
// @author       You
// @match        https://www.mathsonline.com.au/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  function log(...args) {
    console.log("%cSVG Injector [Script2]:", "color: blue; font-weight:bold;", ...args);
  }

  log("Script loaded");

  const interceptedSVGs = [];

  function store(url) {
    if (!interceptedSVGs.includes(url)) {
      interceptedSVGs.push(url);
      log("Stored SVG:", url);
      log("Current SVG list:", interceptedSVGs);
    } else {
      log("Duplicate SVG ignored:", url);
    }
  }

  // --- FETCH HOOK ---
  const origFetch = window.fetch;
  window.fetch = function (resource, ...args) {
    const url = typeof resource === "string" ? resource : resource.url;

    if (url) log("Fetch request:", url);

    if (url && url.endsWith(".svg")) {
      log("SVG detected via fetch");
      store(url);
    }

    return origFetch.call(this, resource, ...args);
  };

  // --- XHR HOOK ---
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    log("XHR open:", method, url);

    if (url && url.endsWith(".svg")) {
      log("SVG detected via XHR");
      store(url);
    }

    return origOpen.apply(this, arguments);
  };

  function getTranslateX(style) {
    if (!style) {
      log("No style attribute found");
      return null;
    }

    const m = style.match(/translateX\((-?\d+)%\)/);
    const val = m ? Number(m[1]) : null;

    log("translateX parsed:", style, "→", val);

    return val;
  }

  async function inject(svgUrl, questionNum) {
    log("Inject called:", { svgUrl, questionNum });

    try {
      const res = await fetch(svgUrl);
      log("Fetched SVG response:", svgUrl);

      const text = await res.text();
      log("SVG text length:", text.length);

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, "image/svg+xml");

      log("Parsed SVG document:", svgDoc.documentElement);

      const container = document.querySelector(`#question-${questionNum} .questionsContainer`);

      if (!container) {
        log("Container NOT found for question", questionNum);
        return;
      }

      log("Container found:", container);

      const solutions = svgDoc.querySelectorAll("g.solution1, g.solution2, g.solution3, g.solution4, g.solution5");
      log("Solutions found:", solutions.length);

      solutions.forEach((g, i) => {
        container.appendChild(g.cloneNode(true));
        log("Injected solution group:", i + 1);
      });

      const polygons = svgDoc.querySelectorAll("polygon");
      log("Polygons found:", polygons.length);

      polygons.forEach((p, i) => {
        container.appendChild(p.cloneNode(true));
        log("Injected polygon:", i + 1);
      });

      log("Injection complete for question", questionNum);

    } catch (e) {
      log("Injection failed:", e);
    }
  }

  function watch() {
    log("Starting translateX watcher");

    const target = document.getElementById("svgui-content-host");

    if (!target) {
      log("Target not found, retrying...");
      return setTimeout(watch, 500);
    }

    log("Target found:", target);

    let last = null;

    const obs = new MutationObserver(() => {
      const style = target.getAttribute("style");
      const tx = getTranslateX(style);

      if (tx !== null) {
        const index = 1 - (tx / 100);

        log("Slide index calculated:", index);

        if (index !== last) {
          log("Slide changed:", last, "→", index);
          last = index;

          const url = interceptedSVGs[index - 1];

          log("Resolved SVG URL:", url);

          if (url) {
            inject(url, index);
          } else {
            log("No SVG URL found for index", index);
          }
        }
      }
    });

    obs.observe(target, { attributes: true });
    log("MutationObserver attached");
  }

  if (document.readyState === "loading") {
    log("Waiting for DOMContentLoaded");
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }

  log("Script 2 ready with heavy logging");
})();
