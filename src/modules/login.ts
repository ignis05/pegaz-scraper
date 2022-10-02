import { Page } from 'puppeteer'
import auth from '../data/auth.json'

/**
 * Logs-in to pegaz using credentials in auth.json file
 * @param page puppeteer page
 * @returns resolves promise when done
 */
export function login(page: Page): Promise<void> {
	return new Promise(async (resolve) => {
		await page.goto('https://pegaz.uj.edu.pl/my/')
		// sign in
		await page.focus('input#userNameInput')
		await page.keyboard.type(auth.login)
		await page.focus('input#passwordInput')
		await page.keyboard.type(auth.password)
		await page.click('span#submitButton')
		// wait for main page to load
		await page.waitForSelector('a.coursename', { visible: true })
		resolve()
	})
}
