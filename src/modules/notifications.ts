import axios from 'axios'
import { Course } from '../models/course-model'
import { DataComparisonResults } from './compare-data'
import webhooks from '../data/webhooks.json'
import date from 'date-and-time'

const webhookStyle = {
	username: 'Pegaz Webscraper',
	avatar_url: 'https://cdn.discordapp.com/app-icons/664770478640070666/28638da5c2d0781edf7139c6ef123fb8.png?size=256',
}

export class Notifications {
	static sendChanges(courseChanges: DataComparisonResults) {
		if (courseChanges.new.length > 0) sendNewCourses(courseChanges.new)
		if (courseChanges.missing.length > 0) sendMissingCourses(courseChanges.missing)
		if (courseChanges.updated.length > 0) sendUpdatedCourses(courseChanges.updated)
	}
	static log(message: string, consoleToo?: boolean) {
		if (consoleToo) console.log(message)
		for (let url of webhooks.log) {
			axios.post(url, { ...webhookStyle, content: message }).catch(console.error)
		}
	}
	static error(message: string) {
		console.error(message)
		for (let url of webhooks.error) {
			axios.post(url, { ...webhookStyle, content: message }).catch(console.error)
		}
	}
}

function sendNewCourses(newCourses: Course[]) {
	const content = {
		...webhookStyle,
		embeds: [
			{
				title: 'New courses found!',
				color: 0x00ff00,
				description: `Found ${newCourses.length} new courses`,
				fields: [
					{
						name: 'New Courses:',
						value: newCourses.map((c) => `[${c.name}](${c.url}) - ${c.sections.length} sections, ${c.activities.length} links`).join('\n'),
					},
				],
				footer: { text: `${date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}` },
			},
		],
	}

	if (content.embeds[0].fields[0].value.length > 1024)
		content.embeds[0].fields[0].value = content.embeds[0].fields[0].value.slice(0, 1021) + '...'

	for (let url of webhooks.main) {
		axios.post(url, content).catch((err) => Notifications.error(`Failed to send NewCourses to webhook: ${err}`))
	}
}

function sendMissingCourses(oldCourses: Course[]) {
	const content = {
		...webhookStyle,
		embeds: [
			{
				title: 'Courses removed!',
				color: 0xff0000,
				description: `${oldCourses.length} tracked courses are no longer accessible`,
				fields: [
					{
						name: 'Removed Courses:',
						value: oldCourses.map((c) => `[${c.name}](${c.url})`).join('\n'),
					},
				],
				footer: { text: `${date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}` },
			},
		],
	}

	if (content.embeds[0].fields[0].value.length > 1024)
		content.embeds[0].fields[0].value = content.embeds[0].fields[0].value.slice(0, 1021) + '...'

	for (let url of webhooks.main) {
		axios.post(url, content).catch((err) => Notifications.error(`Failed to send MissingCourses to webhook: ${err}`))
	}
}

function sendUpdatedCourses(courses: Course[]) {
	const fields: any[] = []
	for (let course of courses) {
		let title = `===== ${course.name} =====`
		let value = `[course](${course.url})\n`
		if (course.sections.length) {
			value += '\n**New sections found:**\n'
			value += course.sections.join('\n')
			value += '\n'
		}
		if (course.activities.length) {
			value += '\n**New resources found:**\n'
			value += course.activities.map((a) => `${a.type}: [${a.name}](${a.url})`).join('\n')
			value += '\n'
		}
		if (course.grades.length) {
			value += '\n**Grade changes found:**\n'
			value += course.grades.map((g) => `${g.name}: \`${g.value}\``).join('\n')
			value += '\n'
		}
		if (course.forums.length) {
			value += '\n**Forum updates found:**\n'
			value += course.forums.map((f) => f.entries.map((e) => `[${f.name}](${f.url}): ${e.topic} (${e.author})`)).join('\n')
			value += '\n'
		}

		fields.push({ name: title, value })
	}

	const content = {
		...webhookStyle,
		embeds: [
			{
				title: 'Course updates detected!',
				color: 0x0000ff,
				description: `Found updates in ${courses.length} courses`,
				fields,
				footer: { text: `${date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}` },
			},
		],
	}

	for (let field of content.embeds[0].fields) {
		if (field.value.length > 1024) field.value = field.value.slice(0, 1021) + '...'
	}

	for (let url of webhooks.main) {
		axios.post(url, content).catch((err) => Notifications.error(`Failed to send UpdatedCourses to webhook: ${err}`))
	}
}
