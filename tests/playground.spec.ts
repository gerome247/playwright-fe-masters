import { expect, test } from '@playwright/test';

test('Locate the add to shelf button', async ({ page }) => {
	await page.goto('/playground');
	const addToShelfButton = page.getByRole('button', { name: 'Add to shelf' });

	await expect(addToShelfButton).toBeVisible();
});

test('Locate the add to cancel', async ({ page }) => {
	await page.goto('/playground');
	const cancelButton = page.getByRole('button', { name: 'cancel' });

	await expect(cancelButton).toBeVisible();
});

test('Locate the out of stock button and check if its disabled', async ({ page }) => {
	await page.goto('/playground');
	const outOfStockButton = page.getByRole('button', { name: 'Out of stock' });

	await expect(outOfStockButton).toBeDisabled();
});

test('Locate the search input by its label', async ({ page }) => {
	await page.goto('/playground');
	const searchInput = page.getByLabel('Search');

	await expect(searchInput).toBeVisible();
});

test('locate the first delete button', async ({ page }) => {
	await page.goto('/');

	const primaryNavigation = page.getByRole('navigation', { name: 'Primary' });

	await primaryNavigation.getByRole('link', { name: 'Playground' }).click();

	const deleteButton = page.getByRole('button', { name: 'Delete' });

	await expect(deleteButton.first()).toBeVisible();
});

test('locate the third remove button', async ({ page }) => {
	await page.goto('/playground');

	const readingList = page.getByRole('list', { name: 'Reading List' });

	await expect(readingList).toBeVisible();

	const thirdItem = readingList.getByRole('listitem').nth(2);

	const removeButton = thirdItem.getByRole('button', { name: 'Remove' });

	await expect(removeButton).toBeVisible();
});

test('Inside the article labeled “Piranesi by Susanna Clarke,” locate the “Rate this book” button', async ({
	page
}) => {
	await page.goto('/playground');

	const article = page
		.getByRole('article', { name: 'Piranesi by Susanna Clarke' })
		.getByRole('button', { name: 'rate this book' });

	await expect(article).toBeVisible();
});

test('Locate the “Author” input and assert that its hint text (“Last name, first name”) is visible.', async ({
	page
}) => {
	await page.goto('/playground');

	const authorLabel = page.getByLabel('Author');

	await expect(authorLabel).toBeVisible();
	await expect(authorLabel).toHaveAccessibleDescription('Last name, first name');
});

test('Find the paragraph that mentions “42 days.”', async ({ page }) => {
	await page.goto('/playground');

	const text = page.getByText('42 days');

	await expect(text).toBeVisible();
	const textNode = await page.getByRole('paragraph').filter({ hasText: '42 days' });

	await expect(textNode).toBeVisible();
});

test('Find the text “3 of 12 books finished.”', async ({ page }) => {
	await page.goto('/playground');

	const textNode = page.getByText('3 of 12 books finished', { exact: true });

	await expect(textNode).toBeVisible();
});

test('Two paragraphs on the page contain the word “shelf.” Find the one that says “You have 4 books on your shelf right now”', async ({
	page
}) => {
	await page.goto('/playground');

	const textNode = page.getByText('You have 4 books on your shelf right now');

	await expect(textNode).toBeVisible();
});

test('Count the data rows in the “Book ratings” table (not including the header row). Assert there are exactly 3.', async ({
	page
}) => {
	await page.goto('/playground');

	const bookRating = page.getByRole('table', { name: 'Book rating' });
	const dataRows = bookRating.getByRole('row').filter({
		hasNot: page.getByRole('columnheader')
	});

	const alternative = bookRating.getByRole('row').filter({ has: page.getByRole('cell') });

	await expect(alternative).toHaveCount(3);

	await expect(dataRows).toHaveCount(3);
});

test('Locate the “Reading list” and assert it has exactly 4 items', async ({ page }) => {
	await page.goto('/playground');

	const readingList = page.getByRole('list', { name: 'Reading list' });
	const listItems = readingList.getByRole('listitem');

	await expect(listItems).toHaveCount(4);
});

test('Click “Show details” and assert that the detail paragraph about Station Eleven appears.', async ({
	page
}) => {
	await page.goto('/playground');

	await page.getByRole('button', { name: 'Show details' }).click();

	const details = page.getByRole('paragraph').filter({
		hasText: /Station Eleven is a post-apocalyptic novel/
	});

	await expect(details).toBeVisible();
});

test('Click “Show details” and assert that the detail paragraph about Station Eleven appears. with hidden assert', async ({
	page
}) => {
	await page.goto('/playground');

	const details = page.getByRole('paragraph').filter({
		hasText: /Station Eleven is a post-apocalyptic novel/
	});

	await expect(details).toBeHidden();
	await page.getByRole('button', { name: 'Show details' }).click();
	await expect(details).toBeVisible();
});

test('Click “Load more” and wait for the two new list items to appear. Assert the list “Newly loaded books” has 2 items.', async ({
	page
}) => {
	await page.goto('/playground');

	const newlyLoaded = page.getByRole('list', { name: 'Newly loaded books' });

	await expect(newlyLoaded).toBeHidden();
	await page.getByRole('button', { name: 'Load more' }).click();
	await expect(newlyLoaded.getByRole('listitem')).toHaveCount(2);
	await expect(newlyLoaded.getByRole('listitem')).toHaveText([
		'The Left Hand of Darkness',
		'Kindred'
	]);
});

test('Assert that “Loading…” is visible, then wait for it to disappear and “Content loaded” to appear. (The page has a 1-second delay built in—your assertions need to handle it.)', async ({
	page
}) => {
	await page.goto('/playground');

	const loading = page.getByRole('paragraph').filter({ hasText: 'Loading...' });
	const loaded = page.getByRole('paragraph').filter({ hasText: 'Content loaded' });

	await expect(loading).toBeVisible();
	await expect(loading).toBeHidden();
	await expect(loaded).toBeVisible();
});

test('Locate the alert that says “Unsaved changes will be lost.”', async ({ page }) => {
	await page.goto('/playground');

	const alert = await page.getByRole('alert').filter({ hasText: 'Unsaved changes will be lost' });

	await expect(alert).toBeVisible();
});

test('Locate the progress bar and assert its aria-valuenow is 65.', async ({ page }) => {
	await page.goto('/playground');

	const progressBar = await page.getByRole('progressbar', { name: 'Reading progress' });

	await expect(progressBar).toHaveAttribute('aria-valuenow', '65');
});

test('Locate the “Toggle panel” button. Assert that it has aria-expanded set to false. Click it. Assert that aria-expanded is now true and the panel content is visible.', async ({
	page
}) => {
	await page.goto('/playground');

	const toggleBtn = page.getByRole('button', { name: 'Toggle panel' });
	const toggleDetails = page.getByText(
		'This panel is controlled by the toggle button above. It uses aria-expanded and aria-controls to communicate its state.'
	);

	await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
	await expect(toggleDetails).toBeHidden();

	await toggleBtn.click();

	await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
	await expect(toggleDetails).toBeVisible();
});

test('Try to locate the clickable <div> by role (getByRole("button")). It won’t work—the div has no role. Locate it by its data-testid instead (fake-button). This is the teaching moment: if you can’t find it by role, the markup is broken.', async ({
	page
}) => {
	await page.goto('/playground');

	const fakeButton = await page.getByTestId('fake-button');

	await expect(fakeButton).toBeVisible();
});

test('Locate the icon-only button using data-testid (icon-only-button). This button has no accessible name—getByRole("button", { name: ... }) can’t target it. A real codebase should fix the button. A test suite should use getByTestId until it’s fixed.', async ({
	page
}) => {
	await page.goto('/playground');

	const iconOnlyButton = await page.getByTestId('icon-only-button');

	await expect(iconOnlyButton).toBeVisible();
});

test('Start from a deliberately broad locator like page.getByRole("article"), then use filter({ hasText: "Piranesi" }) or filter({ has: ... }) to narrow it to the one card you actually want. Click “Rate this book” inside that filtered card.', async ({
	page
}) => {
	await page.goto('/playground');

	const getArticle = page.getByRole('article').filter({ hasText: 'Piranesi' });

	await expect(getArticle).toBeVisible();

	const rateThisBookButton = getArticle.getByRole('button', { name: 'Rate this book' });

	await expect(rateThisBookButton).toBeVisible();
	await rateThisBookButton.click();
});

test('Write one test that waits for either the “Compose” button or a security dialog to appear by using locator.or(...).first(). If the dialog wins, dismiss it and continue.', async ({
	page
}) => {
	await page.goto('/playground');

	const composeButton = page.getByRole('button').and(page.getByTitle('Compose'));
	const securityDialog = page.getByText('Confirm security settings');

	await expect(composeButton.or(securityDialog).first()).toBeVisible();

	if (await securityDialog.isVisible()) {
		await page.getByRole('button', { name: 'Dismiss' }).click();
		await expect(securityDialog).toBeHidden();
	}

	await composeButton.click();
});

test('Pick one repeated locator from the file, give it a describe("...") label, and inspect the trace or UI Mode output so you can see the named locator show up in the tooling.', async ({
	page
}) => {
	await page.goto('/playground');
	const addToShelfButton = page
		.getByRole('button', { name: 'Add to shelf' })
		.describe('Add to shelf button');

	await expect(addToShelfButton).toBeVisible();
});
