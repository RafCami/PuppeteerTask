import puppeteer from "puppeteer";
import fs from "fs";

// Scrape Laptops
async function scrapeLaptops() {
  const browser = await puppeteer.launch({ headless: "new" });
  //array of pages to scrape
  const scrapePages = [
    "https://www.coolblue.be/nl/laptops/kleine-windows-laptops/prijs:-1500/intern-werkgeheugen-ram:16000000000/processor:intel-core-i7",
    "https://www.coolblue.be/nl/laptops/apple-macbook/filter/intern-werkgeheugen-ram:16000000000/prijs:-1500",
  ];

  const products = [];
  for (let x = 0; x < scrapePages.length; x++) {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    );
    await page.goto(scrapePages[x], { waitUntil: "networkidle0" });

    //get all links to the product pages
    //skip items not in stock
    const productPages = await page.$$eval(".product-card", (rows) => {
      return rows
        .map((row) =>
          row.querySelector(".icon-with-text__text")
            ? row
                .querySelector(".product-card__title")
                .getElementsByTagName("a")[0].href
            : null
        )
        .filter((url) => url != null);
    });

    //main page no longer needed
    page.close();

    //goto each page to get the product details
    for (let i = 0; i < productPages.length; i++) {
      const url = productPages[i];
      let productPage = await browser.newPage();
      await productPage.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
      );
      await productPage.goto(url, { waitUntil: "networkidle0" });
      //get data from page
      const pageContent = await productPage.$$eval("body", (element) => {
        //get product name
        const title = element[0]
          .querySelector(".js-product-name")
          .textContent.trim();
        //get price and format to parse as int
        const price = parseInt(
          element[0]
            .querySelector(".js-sales-price-current")
            .textContent.trim()
            .replace(",-", "")
            .replace(".", "")
        );
        //check if available
        const available = element[0].querySelector(".icon-with-text__text")
          ? true
          : false;
        //get number of reviews using regex
        const reviewsString = element[0]
          .querySelector(".review-rating__reviews")
          .textContent.trim();
        const regex = /(\d+)\s+reviews/;
        const match = reviewsString.match(regex);
        const reviews = match ? parseInt(match[1]) : 0;
        // get specifications table
        const specTable = element[0]
          .querySelector(".data-table")
          .querySelectorAll(".data-table__row");
        //2d array of [0][key] [1][value] pairs
        const spectableContent = [[], []];
        specTable.forEach((element) => {
          element
            .querySelectorAll(".data-table__cell")
            .forEach((cell, index) => {
              spectableContent[index % 2].push(cell.textContent.trim());
            });
        });
        //format key strings
        //camelCase and remove special characters
        spectableContent[0] = spectableContent[0].map((key) => {
          return (
            key.charAt(0).toLowerCase() +
            key.slice(1).replace(/(?:^|\s)\S/g, function (a) {
              return a.toUpperCase().trim();
            })
          ).replace(/[()\.\-]/g, "");
        });
        //create specifiations object
        const specifications = spectableContent[0].reduce((obj, key, index) => {
          switch (key) {
            case "schermdiagonaal":
              obj[key] = parseInt(
                spectableContent[1][index].replace(/ inch/g, "")
              );
              break;
            case "internWerkgeheugenRAM":
            case "totaleOpslagcapaciteit":
              obj[key] = parseInt(
                spectableContent[1][index].replace(/ GB/g, "")
              );
              break;
            default:
              obj[key] = spectableContent[1][index];
              break;
          }
          return obj;
        }, {});

        return {
          productTitle: title,
          price: price,
          reviews: reviews,
          available: available,
          specifications: specifications,
        };
      });

      //add laptop object to products array and close the page
      products.push(pageContent);
      productPage.close();
    }
  }

  //write array of objects to json file
  fs.writeFile("./laptopData.json", JSON.stringify(products), (err) => {
    if (err) throw err;
  });

  await browser.close();
}

export { scrapeLaptops };
