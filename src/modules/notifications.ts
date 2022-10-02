export class Notifications {
	static send(message: string) {}
	static log(message: string) {
		console.log(message)
	}
	static error(message: string) {
		console.error(message)
	}
}
