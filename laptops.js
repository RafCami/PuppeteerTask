import puppeteer from 'puppeteer';
import fs from 'fs';

// Scrape Laptops
async function scrapeLaptops() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const windowsPage = await browser.newPage();
  await windowsPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
  await windowsPage.goto('https://www.coolblue.be/nl/laptops/kleine-windows-laptops/prijs:-1500/intern-werkgeheugen-ram:16000000000/processor:intel-core-i7', { waitUntil: 'networkidle0' });
  const macPage = await browser.newPage();
  await macPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
  await macPage.goto('https://www.coolblue.be/nl/laptops/apple-macbook/filter/intern-werkgeheugen-ram:16000000000/prijs:-1500', { waitUntil: 'networkidle0' });
  

  // const pageTitle = await page.$eval('.filtered-search__header h1', (element) => element.textContent.trim());

  // const products = await windowsPage.$$eval('.product-card', (rows) => {
  //   return rows.map((row) => ({
  //     productTitle: row.querySelector('.product-card__title').textContent.trim(),
  //     price: parseInt(row.querySelector('.sales-price__current').textContent.trim().replace(',-', '')),
  //     available: row.querySelector('.icon-with-text__text') ? true : false,
  //   }));
  // });

  //get all links to the product pages
  const productPages = await windowsPage.$$eval('.product-card', (rows) => {
    return rows.map((row) => (
      (row.querySelector('.icon-with-text__text')) ? row.querySelector('.product-card__title').getElementsByTagName('a')[0].href : ""
    ));
  });
  // console.log(productPages);

  //goto each page to get the product details
  const products = [];
  for (let i = 0; i < productPages.length; i++) {
    const url = productPages[i]
    if (url == "") continue;
    let productPage = await browser.newPage();
    await productPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
    await productPage.goto(`${url}`, { waitUntil: 'networkidle0' });
    const pageContent = await productPage.$$eval('body', (element) => {
        const title = element[0].querySelector('.js-product-name').textContent.trim()
        const price = parseInt(element[0].querySelector('.js-sales-price-current').textContent.trim().replace(',-', '').replace('.', ''))
        const available = element[0].querySelector('.icon-with-text__text') ? true : false

        return {
          productTitle: title,
          price: price,
          available: available,
        }
      })
    console.log(pageContent);
    // screen: row.querySelector('.product-specs__table').getElementsByTagName('tr')[0].getElementsByTagName('td')[1].textContent.trim(),
    products.push(pageContent)
    productPage.close()
  }
  console.log(products);



  // const filteredProducts = products.filter((product) => {
  //   return product.price > 600;
  // });

  // fs.writeFile('./filteredProducts.json', JSON.stringify(filteredProducts), (err) => {
  //   if (err) throw err;
  //   console.log('filteredProducts array has been written to filteredProducts.json');
  // });

  // console.log(pageTitle);
  // console.log(products);
  // console.log(filteredProducts);

  await browser.close();
}


export { scrapeLaptops };
