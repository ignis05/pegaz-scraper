export interface Course {
	id: string
	name: string
	url: string
	sections: string[]
	activities: Activity[]
	grades: Grade[]
}

export interface Activity {
	name: string
	type: string
	url: string
}

export interface Grade {
	name: string
	value: string
}
