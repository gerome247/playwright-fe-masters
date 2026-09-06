import { defineConfig } from '@playwright/test';

export default defineConfig({
	expect: {
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
			maxDiffPixelRatio: 0.01
		}
	},
	testDir: 'tests',
	testIgnore: ['**/labs/fixtures/**', '**/labs/broken-traces/**'],
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://127.0.0.1:4173',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'setup',
			testMatch: 'auth.setup.ts'
		},
		{
			name: 'chromium',
			use: {
				browserName: 'chromium',
				storageState: 'playwright/.authentication/user.json'
			},
			dependencies: ['setup']
		}
	],
	reporter: [
		['html', { open: 'never', outputFolder: 'playwright-report/html' }],
		['json', { outputFile: 'playwright-report/report.json' }],
		['list']
	]
});
