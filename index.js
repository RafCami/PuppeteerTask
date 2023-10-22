import { scrapePlaystations } from "./playstation.js";
import { scrapeLaptops } from "./laptops.js";
import { MovieList } from "./moviesMain.js";
import { scrapeMoviesByGenre } from "./moviesScrape.js";

//Opdracht 1
console.log("scraping Playstations to filteredProducts.json");
await scrapePlaystations();

//Opdracht 2
//Takes a while to complete since it visits each product page seperately to scrape extended specifications
console.log("scraping laptops to laptopData.json");
await scrapeLaptops();

//Opdracht 3
console.log("starting MovieList\n\n\n");
await MovieList();

//uncomment for scraping example
// const movies = await scrapeMoviesByGenre('Horror');
// console.log(movies);
