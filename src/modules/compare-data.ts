import fs from 'fs'
import { Activity, Course, Forum, Grade } from '../models/course-model'
import jsonData from '../data/courses.json'

var oldCourses: Course[] = jsonData

export interface DataComparisonResults {
	new: Course[]
	missing: Course[]
	updated: Course[]
}

export function compareData(newCourses: Course[]): DataComparisonResults {
	const newC = getNewCourses(oldCourses, newCourses)
	const missing = getMissingCourses(oldCourses, newCourses)
	const updated = getUpdatedCourses(oldCourses, newCourses)

	oldCourses = newCourses
	fs.writeFileSync('./data/courses.json', JSON.stringify(oldCourses, null, 2))

	return { new: newC, missing, updated }
}

function getNewCourses(oldCourses: Course[], newCourses: Course[]): Course[] {
	return newCourses.filter((course) => !oldCourses.find((c) => c.id === course.id))
}
function getMissingCourses(oldCourses: Course[], newCourses: Course[]): Course[] {
	return oldCourses.filter((course) => !newCourses.find((c) => c.id === course.id))
}
function getUpdatedCourses(oldCourses: Course[], newCourses: Course[]): Course[] {
	const result: Course[] = []

	for (let newCourse of newCourses) {
		let oldC = oldCourses.find((course) => course.id === newCourse.id)
		if (oldC === undefined) continue

		let oldCourse = oldC as Course

		// clone obj
		let course = Object.assign({}, newCourse)
		// report any new sections or activities
		course.sections = course.sections.filter((s) => !oldCourse.sections.includes(s))
		course.activities = course.activities.filter((a) => !oldCourse.activities.find((oa) => oa.name === a.name))
		// report new grades and grade changes
		course.grades = []
		for (let grade of newCourse.grades) {
			let oldGrade = oldCourse.grades.find((g) => g.name === grade.name)
			if (!oldGrade) {
				course.grades.push(grade)
			} else {
				if (oldGrade.value != grade.value) course.grades.push({ name: grade.name, value: `${oldGrade.value} => ${grade.value}` })
			}
		}
		// report new forums and forum changes
		course.forums = []
		for (let forum of newCourse.forums) {
			let oldForum = oldCourse.forums.find((f) => f.name === forum.name)
			if (!oldForum) {
				course.forums.push(forum)
			} else {
				forum.entries = forum.entries.filter(
					(e) => !oldForum?.entries.find((oe) => oe.author == e.author && oe.topic == e.topic && oe.lastUpdate == e.lastUpdate)
				)
				if (forum.entries.length > 0) course.forums.push(forum)
			}
		}

		if (course.sections.length + course.activities.length + course.grades.length + course.forums.length > 0) result.push(course)
	}

	return result
}
