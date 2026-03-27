// ==UserScript==
// @name         SVG Injector (MathsOnline SVG Solutions)
// @namespace    https://www.mathsonline.com.au/
// @version      1.2
// @description  Intercepts SVG interactive responses and injects solution elements with debug logging.
// @author       You
// @match        https://www.mathsonline.com.au/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  function log(...args) {
    console.log("%cSVG Injector [Script1]:", "color: red; font-weight:bold;", ...args);
  }

  log("Script loaded");

  const targetKeywords = [
    "getNextSvgInteractive?rid=",
    "startQuestionSet?rid="
  ];

  function isTargetURL(url) {
    const result = targetKeywords.some(k => url.includes(k));
    log("Checking URL:", url, "→", result ? "MATCH" : "SKIP");
    return result;
  }

  function waitForContainer(timeout = 5000) {
    log("Waiting for .questionsContainer to appear");
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(".questionsContainer");
      if (existing) {
        log("Found container immediately");
        return resolve(existing);
      }

      const obs = new MutationObserver(() => {
        const el = document.querySelector(".questionsContainer");
        if (el) {
          obs.disconnect();
          log("Container appeared via MutationObserver");
          resolve(el);
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        obs.disconnect();
        log("Timeout waiting for container");
        reject("Timeout waiting for container");
      }, timeout);
    });
  }

  async function injectFromSVGString(svgString) {
    log("Injecting SVG string");
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    log("Parsed SVG, documentElement:", svgDoc.documentElement);

    let container;
    try {
      container = await waitForContainer();
    } catch (e) {
      log("Error finding container:", e);
      return;
    }

    const questionGroup = container.querySelector('g.question1[data-id="question1"]');
    if (!questionGroup) {
      return log("question group not found");
    }
    log("Found question group:", questionGroup);

    // inject all solution groups
    for (let i = 1; i <= 5; i++) {
      const sol = svgDoc.querySelector(`g.solution${i}`);
      log("Looking for solution", i, "→", sol ? "FOUND" : "NOT FOUND");
      if (sol) {
        questionGroup.appendChild(sol.cloneNode(true));
        log("Injected solution", i);
      }
    }

    // inject all polygons separately
    const polygons = svgDoc.querySelectorAll("polygon");
    log("Found polygons count:", polygons.length);
    polygons.forEach((p, idx) => {
      questionGroup.appendChild(p.cloneNode(true));
      log("Injected polygon", idx + 1, p);
    });

    log("Injection complete, question group now has children:", questionGroup.childNodes.length);
  }

  // --- FETCH HOOK ---
  const origFetch = window.fetch;
  window.fetch = async function (resource, ...args) {
    const url = typeof resource === "string" ? resource : resource.url;
    if (url && isTargetURL(url)) {
      log("Intercepted fetch:", url);
      const res = await origFetch.call(this, resource, ...args);

      try {
        const json = await res.clone().json();
        log("Fetched JSON keys:", Object.keys(json));
        if (json.svg) {
          log("SVG detected in fetch, injecting");
          injectFromSVGString(json.svg);
        } else {
          log("No SVG in JSON");
        }
      } catch (e) {
        log("JSON parse error:", e);
      }

      return res;
    }

    return origFetch.call(this, resource, ...args);
  };

  // --- XHR HOOK ---
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    this._url = url;
    log("XHR open:", method, url);
    return origOpen.apply(this, arguments);
  };

  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("load", () => {
      if (this._url && isTargetURL(this._url)) {
        log("XHR load intercepted for:", this._url);
        try {
          const json = JSON.parse(this.responseText);
          log("XHR JSON keys:", Object.keys(json));
          if (json.svg) {
            log("SVG detected in XHR, injecting");
            setTimeout(() => injectFromSVGString(json.svg), 300);
          } else {
            log("No SVG in XHR response");
          }
        } catch (e) {
          log("XHR parse error:", e);
        }
      }
    });

    return origSend.apply(this, arguments);
  };

  log("Script 1 ready with heavy logging");
})();
