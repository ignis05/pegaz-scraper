import { Page } from 'puppeteer'
import { Activity, Course } from '../models/course-model'
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

			let activities = await getActivities(page)

			const course: Course = { id: id.trim(), name: title, url: courseLink, activities: activities }
			courses.push(course)
		}

		resolve(courses)
	})
}

function getActivities(page: Page): Promise<Activity[]> {
	return new Promise<Activity[]>(async (resolve) => {
		const result: Activity[] = []

		let activities = await page.$$('div.activitytitle')

		for (let activity of activities) {
			let url = await activity.$eval('a', (node) => node.getAttribute('href'))
			let name = (await activity.$eval('span.instancename', (node) => node.textContent)) || 'unknown'
			let type = (await activity.$eval('div.media-body>div.text-uppercase', (node) => node.textContent)) || 'unknown'

			if (!url) continue
			result.push({ name, type, url })
		}

		resolve(result)
	})
}
