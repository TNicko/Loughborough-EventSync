<p align="left">
  <img src="public/images/icon.png" alt="Extension Icon" height="50"> <!-- Adjust the height to match your title size -->
  <h1>Loughborough Timetable Extension</h1>
</p>

Browser extension to download university timetable for integration with personal calenders.

- Designed for students and staff at Loughborough University.

## Overview

With this extension, users can download their semester 1 & 2 timetable
from the Loughborough website as an iCal file, which can then be added to various
personal calender systems.

## Compatibility

- Built using Chrome-specific APIs, which means it is primarily compatible with Google Chrome.
- May also work with other browsers that support Chrome APIs, but full functionality cannot be guaranteed outside of Google Chrome.

## Local Installation

<h4>Prerequisites</h4>
<ul>
  <li>Node.js and npm</li>
</ul>

<h4>Step 1: Clone the Repository</h4>

<pre><code>git clone https://github.com/TNicko/Loughborough-EventSync.git
</code></pre>

<h4>Step 2: Install Dependencies and Build</h4>
<p>Navigate to the cloned directory, install dependencies and build:</p>

<pre><code>cd Loughborough-EventSync
npm install
npm run build 
</code></pre>

<p>Now should have a <code>dist</code> directory in your project folder, which contains the built extension.</p>

<h4>Step 4: Load Extension into Chrome</h4>
<p>To load the built extension into Chrome, follow these steps:</p>
<ol>
  <li>Open the Chrome browser.</li>
  <li>Go to <code>chrome://extensions/</code>.</li>
  <li>Enable <code>Developer mode</code> by toggling the switch in the top right corner.</li>
  <li>Click on <code>Load unpacked</code>.</li>
  <li>Navigate to and select the <code>dist</code> folder in your project directory.</li>
  <li>The extension should now be added to your Chrome browser and visible in the extensions list.</li>
</ol>
