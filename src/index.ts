import puppeteer from 'puppeteer'
import os from 'os'
import date from 'date-and-time'

import { login } from './modules/login'
import { Course } from './models/course-model'
import { scrapeData } from './modules/scrape-data'
import { compareData } from './modules/compare-data'
import { Notifications } from './modules/notifications'

async function main() {
	const browserOptions: puppeteer.LaunchOptions = {}
	if (os.platform() != 'win32') browserOptions.executablePath = 'chromium-browser'

	const startTime = Date.now()

	const browser = await puppeteer.launch(browserOptions)
	const page = await browser.newPage()

	await login(page)

	const courses: Course[] = await scrapeData(page)

	const changes = await compareData(courses)

	await browser.close()

	const operationTime = (Date.now() - startTime) / 1000
	Notifications.log(
		`Check @ ${date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')} collected ${courses.length} ` +
			`courses in ${operationTime.toFixed(2)} seconds`
	)

	Notifications.sendChanges(changes)
}

Notifications.log(`Starting scraper @ ${date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}`, true)
main()
setInterval(main, 15 * 60 * 1000)
