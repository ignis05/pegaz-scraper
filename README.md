# pegaz-scraper
Simple webscraper written in typescript, that notifies user about [pegaz](https://pegaz.uj.edu.pl/) changes through discord webhooks.

## Requirements:
- node.js: "^16.0.0"
- typescript: "^4.8.0"
- chromium-browser (if running on linux)

## Setup:
1. Clone repo and install modules with `npm i`
2. Rename all placeholder files in `/src/data` folders like: `auth.placeholder.json => auth.json`
3. Fill-in discord url hooks and pegaz auth information
4. Start the app with `npm run start`, or build and launch through pm2 with `npm run deploy`
