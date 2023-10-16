import puppeteer from 'puppeteer';
import fs from 'fs';

// Scrape Playstations
async function scrapePlaystations() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
  await page.goto('https://www.coolblue.be/nl/consoles/playstation5', { waitUntil: 'networkidle0' });

  const pageTitle = await page.$eval('.filtered-search__header h1', (element) => element.textContent.trim());

  const products = await page.$$eval('.product-card', (rows) => {
    return rows.map((row) => ({
      productTitle: row.querySelector('.product-card__title').textContent.trim(),
      price: parseInt(row.querySelector('.sales-price__current').textContent.trim().replace(',-', '')),
      // TODO: Voeg beschikbaarheid toe
      available: row.querySelector('.icon-with-text__text') ? true : false,
    }));
  });

  const filteredProducts = products.filter((product) => {
    return product.price > 600;
  });

  fs.writeFile('./filteredProducts.json', JSON.stringify(filteredProducts), (err) => {
    if (err) throw err;
    console.log('filteredProducts array has been written to filteredProducts.json');
  });

  // console.log(pageTitle);
  // console.log(products);
  // console.log(filteredProducts);

  await browser.close();
}

export { scrapePlaystations };
