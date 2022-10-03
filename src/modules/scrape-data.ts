import { Page } from 'puppeteer'
import { Activity, Course, Grade } from '../models/course-model'
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

			const id = await page.$eval('h1.h2>span', (node) => node.textContent).catch((err) => {})
			if (!id) {
				Notifications.error(`found course with no id: ${courseLink}`)
				continue
			}
			const title = (await page.$eval('h1.h2', (node) => node.textContent).catch((err) => {}))?.slice(0, 0 - id.length).trim() || 'unknown'

			const activities = await getActivities(page)
			const sections = await getSections(page)

			const gradeLink = await page
				.$eval('div.secondary-navigation a[href^="https://pegaz.uj.edu.pl/grade/"]', (node) => node.getAttribute('href'))
				.catch((err) => {})

			const grades = gradeLink ? await getGrades(page, gradeLink) : []

			const course: Course = { id: id.trim(), name: title, url: courseLink, sections, activities, grades }
			courses.push(course)
		}

		resolve(courses)
	})
}

/**
 * Collects all files, pdfs, assignments and other links
 * @param page
 * @returns
 */
function getActivities(page: Page): Promise<Activity[]> {
	let counter = 0
	return new Promise<Activity[]>(async (resolve) => {
		const result: Activity[] = []

		let activities = await page.$$('div.activitytitle')

		for (let activity of activities) {
			let url = (await activity.$eval('a.aalink', (node) => node.getAttribute('href')).catch((err) => {})) || `noUrlElement${counter++}`
			let name = (await activity.$eval('span.instancename', (n) => n.textContent).catch((err) => {}))?.trim() || 'unknown'
			let type = (await activity.$eval('div.media-body>div.text-uppercase', (n) => n.textContent).catch((err) => {}))?.trim() || 'none'

			// remove duplicate type in invisible span
			if (name.endsWith(type)) name = name.slice(0, 0 - type.length).trim()

			result.push({ name, type, url })
		}

		resolve(result)
	})
}

/**
 * Collects all section titles
 * @param page
 * @returns
 */
function getSections(page: Page): Promise<string[]> {
	return new Promise(async (resolve) => {
		let activities = await page.$$eval('h3.sectionname', (els) => els.map((el) => el.textContent?.trim() || 'unknown'))
		resolve(activities)
	})
}

/**
 * Collects grades, moves to given url
 * @param page 
 * @param url 
 * @returns 
 */
function getGrades(page: Page, url: string): Promise<Grade[]> {
	return new Promise(async (resolve) => {
		let grades: Grade[] = []
		await page.goto(url)

		let names = await page.$$eval(`th.column-itemname`, (els) =>
			els.map((el) => ({ name: el.textContent || '-', row: el.id }))
		)
		let values = await page.$$eval(`td.column-grade`, (els) =>
			els.map((el) => ({ value: el.textContent || '-', headers: el.getAttribute('headers') || '' }))
		)

		for (let name of names) {
			let value = values.find((el) => el.headers.includes(name.row))
			if (value) grades.push({ name: name.name, value: value.value })
		}

		resolve(grades)
	})
}
