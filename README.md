# SVG Injector (MathsOnline)

## Overview
This project contains two Tampermonkey userscripts designed to extract and inject solution visuals (such as answer arrows) from MathsOnline SVG-based questions.

MathsOnline uses multiple formats for delivering SVG interactives.  
These scripts handle both known formats:

- **Script 1 (JSON Mode)** → Extracts SVG directly from JSON responses  
- **Script 2 (TranslateX Mode)** → Tracks slide movement and injects SVGs based on position  

---

## Scripts

### 1. SVG Injector – JSON Mode
Handles newer MathsOnline interactives where SVG data is returned inside JSON responses.
Eg:
<img width="2242" height="1146" alt="image" src="https://github.com/user-attachments/assets/35939c32-85c0-4557-8c93-3bfd95f9cd6e" />


#### Key Features
- Intercepts:
  - `/ajax/svg_interactives/startQuestionSet`
  - `/ajax/svg_interactives/getNextSvgInteractive`
- Extracts `svg` string from JSON
- Parses SVG into DOM
- Injects solution groups (`g.solutionX`)
- Heavy debug logging
- Handles dynamic rendering timing

#### How It Works
1. Hooks into **fetch + XHR**
2. Detects relevant API calls
3. Extracts:
   ```json
   {
     "svg": "<svg>...</svg>"
   }

### 2. SVG Injector – TranslateX Mode

Handles older/alternate interactives where each question is a sliding panel.
Eg:
<img width="2300" height="1118" alt="image" src="https://github.com/user-attachments/assets/5cf4ffff-ac99-49a4-b292-37260b4a64a4" />


#### Key Features

* Captures `.svg` file requests
* Stores SVG URLs in order
* Tracks question changes using `translateX(...)`
* Injects corresponding SVG when slide changes
* Heavy debug logging

#### How It Works

1. Intercepts all `.svg` network requests
2. Stores URLs in an array
3. Watches:

   ```html
   #svgui-content-host
   ```
4. Reads:

   ```css
   transform: translateX(-100%)
   ```
5. Converts position → question index
6. Fetches and injects correct SVG

---

## Installation

1. Install **Tampermonkey**
2. Add both scripts:

   * Script 1 (JSON Mode)
   * Script 2 (TranslateX Mode)
3. Ensure they are enabled
4. Visit: 
   ```
   https://www.mathsonline.com.au/
   ```
If you do not have tamper monkey or another script manager, Script 1 can be injected (pasted into console) at any point before clicking "start questions", however Script 2 has to be injected before svg requests are made, so if you are quick you can refresh and paste before the questions start loading, or go to the "network" tab in dev tools, set throttling to 3g, refresh. This should give much more time. then go back to console and paste then to network tab to set throttling to none

---

## Logging

Both scripts include **heavy console logging** for debugging.

### Script 1 Logs

* Request interception
* JSON parsing
* SVG parsing
* Solution detection
* Injection status

### Script 2 Logs

* SVG request capture
* Stored SVG list
* translateX parsing
* Slide index calculation
* Injection events

Example:

```
SVG Injector [Script1]: Intercepted fetch
SVG Injector [Script1]: Injected solution 1

SVG Injector [Script2]: Slide changed: 1 → 2
SVG Injector [Script2]: Injected for question 2
```

---

## Disclaimer

This project modifies client-side behaviour of MathsOnline for debugging and educational purposes.

Use responsibly.

```
```
