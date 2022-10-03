import puppeteer from 'puppeteer'
import os from 'os'
import date from 'date-and-time'

import { login } from './modules/login'
import { Course } from './models/course-model'
import { scrapeData } from './modules/scrape-data'
import { compareData } from './modules/compare-data'

async function main() {
	const browserOptions: puppeteer.LaunchOptions = {}
	if (os.platform() != 'win32') browserOptions.executablePath = 'chromium-browser'

	const startTime = Date.now()

	const browser = await puppeteer.launch(browserOptions)
	const page = await browser.newPage()

	await login(page)

	const courses: Course[] = await scrapeData(page)

	const changes = await compareData(courses)
	console.log(changes);

	await browser.close()

	const operationTime = (Date.now() - startTime) / 1000
	let now = new Date()
	console.log(`Check @ ${date.format(now, 'YYYY-MM-DDTHH:mm:ss')} completed in ${operationTime.toFixed(2)} seconds`)
}

console.log(`Starting scraper`)
main()
// setInterval(main, 15 * 60 * 1000)
