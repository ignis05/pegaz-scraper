import fs from 'fs'
import { Course } from '../models/course-model'
import jsonData from '../data/courses.json'

const oldCourses: Course[] = jsonData

export function compareData(newCourses: Course[]) {
	return new Promise(async (resolve) => {
		fs.writeFileSync('./data/courses.json', JSON.stringify(newCourses, null, 2))

		resolve({})
	})
}
