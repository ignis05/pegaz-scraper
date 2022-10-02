import { Page } from 'puppeteer'
import { Course } from '../models/course-model'
import { Notifications } from './notifications'

/**
 * Runs websraping operation, returns collected data
 * @param page puppeteer page
 * @returns courses data
 */
export function scrapeData(page: Page): Promise<Course[]> {
	return new Promise(async (resolve) => {
		const courses: Course[] = []

		const courseLinks = await page.$$eval('li a.coursename', (nodes) => nodes.map((node) => node.getAttribute('href')))
		for (let courseLink of courseLinks) {
			if (!courseLink) continue
			await page.goto(courseLink)

			const id = await page.$eval('h1.h2>span', (node) => node.textContent)
			if (!id) {
				Notifications.error(`found course with no id: $${courseLink}`)
				continue
			}
			const title = (await page.$eval('h1.h2', (node) => node.textContent))?.slice(0, 0 - id.length).trim() || 'unknown'

			const course: Course = { id, name: title, url: courseLink }
			courses.push(course)
		}

		resolve(courses)
	})
}
