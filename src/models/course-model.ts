export interface Course {
	id: string
	name: string
	url: string
	activities: Activity[]
}

export interface Activity {
	name: string
	type: string
	url: string
}
