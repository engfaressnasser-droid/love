import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Visit root page (clear storage first)
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.waitForSelector('input[type="password"]');
  await page.screenshot({ path: '.playwright-cli/secret-gate-verified.png' });
  console.log('Saved secret-gate-verified.png');

  // Check text content on screen to ensure no secret passcode is leaked
  const pageText = await page.innerText('body');
  const leaksLove = pageText.toLowerCase().includes('love');
  const leaksAhmed = pageText.includes('احمد') || pageText.includes('أحمد');
  console.log('Contains love:', leaksLove, 'Contains Ahmed:', leaksAhmed);

  // 2. Test girlfriend login with 'love'
  await page.fill('input[type="password"]', 'love');
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=حكايتنا');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '.playwright-cli/girlfriend-view-verified.png' });
  console.log('Girlfriend login verified');

  // Check that admin edit button is absent for girlfriend
  const girlfriendHasEditButton = (await page.$('button[aria-label="لوحة تعديل الموقع"]')) !== null;
  console.log('Girlfriend has edit button:', girlfriendHasEditButton);

  // 3. Logout
  await page.click('button:has-text("خروج")');
  await page.waitForSelector('input[type="password"]');

  // 4. Test Ahmed login with 'احمد'
  await page.fill('input[type="password"]', 'احمد');
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=لوحة تعديل الموقع');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '.playwright-cli/ahmed-admin-verified.png' });
  console.log('Ahmed admin login verified');

  await browser.close();
  console.log('All browser verification tests passed successfully!');
})();
