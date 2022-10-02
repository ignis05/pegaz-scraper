import puppeteer from 'puppeteer'
import os from 'os'

import { login } from './modules/login'
import { Course } from './models/course-model'
import { scrapeData } from './modules/scrape-data'
import { generateConfigPlaceholders } from './modules/placeholder-generator'

async function main() {
	const browserOptions: puppeteer.LaunchOptions = {}
	if (os.platform() != 'win32') browserOptions.executablePath = 'chromium-browser'

	const browser = await puppeteer.launch(browserOptions)
	const page = await browser.newPage()

	await login(page)

	const courses: Course[] = await scrapeData(page)

	console.log(courses)

	await browser.close()
}

async function wrapper() {
	let canStart = await generateConfigPlaceholders()
	if (!canStart) process.exit(0)

	console.log(`Starting scraper`)
	main()
	// setInterval(main, 15 * 60 * 1000)
}
wrapper()
