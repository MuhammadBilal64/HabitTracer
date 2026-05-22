import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    await page.goto('http://localhost:5176/');
    
    // Type in the input
    await page.fill('input[aria-label="New habit name"]', 'Drink Water');
    await page.waitForTimeout(2000);
    
    // Check if the input value actually changed in the DOM
    const value = await page.$eval('input[aria-label="New habit name"]', el => el.value);
    console.log("Input value:", value);
    
    // Check if the button is disabled
    const disabled = await page.$eval('button:has-text("Add")', el => el.disabled);
    console.log("Button disabled:", disabled);

  } catch (err) {
    console.error("FAILED", err);
  } finally {
    await browser.close();
  }
})();
