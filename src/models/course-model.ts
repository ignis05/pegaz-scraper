export interface Course {
	id: string
	name: string
	url: string
	sections: string[]
	activities: Activity[]
	grades: Grade[]
	forums: Forum[]
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

export interface ForumEntry {
	topic: string
	author: string
	lastUpdate: string
}

export interface Forum {
	name: string
	url: string
	entries: ForumEntry[]
}
