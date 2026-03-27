# SVG Injector (MathsOnline SVG Solutions)

## Overview
This userscript intercepts SVG interactive responses from **MathsOnline** and injects solution graphics (e.g. answer arrows) directly into the question display.

It works by hooking into network requests, extracting the SVG data returned by the platform, and inserting specific solution elements into the rendered SVG.

---

## Features
- Intercepts both **fetch** and **XMLHttpRequest (XHR)** calls
- Extracts embedded SVG from JSON responses
- Parses SVG into DOM عناصر
- Injects solution groups (`g.solutionX`) into the question
- Heavy logging for debugging and tracing execution
- Scoped to MathsOnline only (no unnecessary global execution)

---

## How It Works

### 1. Request Interception
The script listens for requests to:
- `/ajax/svg_interactives/startQuestionSet`
- `/ajax/svg_interactives/getNextSvgInteractive`

These endpoints return JSON containing:
```json
{
  "svg": "<svg>...</svg>"
}
---

### 2. SVG Extraction

The script pulls the `svg` string from the response and parses it:

```js
const parser = new DOMParser();
const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
```

---

### 3. Solution Detection

Within the SVG, solution elements are stored as:

```xml
<g class="solution1">
<g class="solution2">
...
```

Each solution group contains:

* Arrow graphics (path + polygon)
* Positioning relative to the correct answer

---

### 4. Injection

The script finds the active question container:

```js
g.question1[data-id="question1"]
```

Then injects solution elements:

```js
questionGroup.appendChild(sol.cloneNode(true));
```

---

### 5. Rendering Timing

MathsOnline dynamically re-renders SVG content.
To avoid injected elements being removed:

* Injection must occur **after rendering completes**
* A delay or visibility check is required

---

## Installation

1. Install a userscript manager:

   * Tampermonkey (recommended)

2. Create a new script

3. Paste the script code

4. Ensure metadata block is:

```js
// ==UserScript==
// @name         SVG Injector (MathsOnline SVG Solutions)
// @namespace    https://www.mathsonline.com.au/
// @version      1.2
// @description  Intercepts SVG interactive responses and injects solution elements.
// @match        https://www.mathsonline.com.au/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==
```

---

## Logging

The script includes detailed console logging:

* Request interception
* URL matching
* JSON parsing
* SVG parsing
* Solution detection
* Injection status

Example:

```
SVG Injector [Script1]: Intercepted fetch: /ajax/svg_interactives/getNextSvgInteractive
SVG Injector [Script1]: SVG detected, injecting
SVG Injector [Script1]: Injected solution 1
```

---

## Disclaimer

This script modifies client-side behaviour of MathsOnline and is intended for educational and debugging purposes only.

Use responsibly.

```
```
