import { scrapePlaystations } from "./playstation.js";
import { scrapeLaptops } from "./laptops.js";
import { MovieList } from "./moviesMain.js";
import { scrapeMoviesByGenre } from "./moviesScrape.js";

// scrapeLaptops();
// MovieList();
scrapeMoviesByGenre('Horror', 2);