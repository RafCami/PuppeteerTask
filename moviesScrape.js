import puppeteer from "puppeteer";

async function scrapeMoviesByGenre(genre, numberOfMovies = 1) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  );
  await page.goto(
    `https://www.imdb.com/search/title/?genres=${genre}&explore=genres&title_type=movie`,
    // `https://www.imdb.com/search/title/?genres=${genre}&explore=genres`,
    { waitUntil: "networkidle0" }
  );

  const movies = await page.$$eval(
    ".lister-item",
    (rows, numberOfMovies) => {
      if (numberOfMovies > rows.length) {
        numberOfMovies = rows.length;
      }
      //select numberOfMovies random numbers of 0 to rows.length without duplicates
      //to select random movies from the page
      const randomNumbers = [];
      while (randomNumbers.length < numberOfMovies) {
        const randomNumber = Math.floor(Math.random() * rows.length);
        if (!randomNumbers.includes(randomNumber)) {
          randomNumbers.push(randomNumber);
        }
      }
      const data = [];
      for (let i = 0; i < numberOfMovies; i++) {
        data.push({
          Title: rows[randomNumbers[i]]
            .querySelector(".lister-item-header")
            .getElementsByTagName("a")[0]
            .textContent.trim(),
          Year: parseInt(
            rows[randomNumbers[i]]
              .querySelector(".lister-item-year")
              .textContent.trim()
              .replace(/[\(\)\sXIV]|(\s?\-\s?\d*)/g, "")
          ),
          Runtime: rows[randomNumbers[i]].querySelector(".runtime")
            ? parseInt(
                rows[randomNumbers[i]]
                  .querySelector(".runtime")
                  .textContent.trim()
                  .replace(/\smin/g, "")
              )
            : 0,
          Rating: rows[randomNumbers[i]].querySelector(".certificate")
            ? rows[randomNumbers[i]]
                .querySelector(".certificate")
                .textContent.trim()
            : "",
          Score: rows[randomNumbers[i]].querySelector(".ratings-imdb-rating")
            ? parseFloat(
                rows[randomNumbers[i]]
                  .querySelector(".ratings-imdb-rating")
                  .textContent.trim()
              )
            : 0,
          MetaScore: rows[randomNumbers[i]].querySelector(".metascore")
            ? parseInt(
                rows[randomNumbers[i]]
                  .querySelector(".metascore")
                  .textContent.trim()
              )
            : 0,
          Link: rows[randomNumbers[i]]
            .querySelector(".lister-item-header")
            .getElementsByTagName("a")[0].href,
          Genres: rows[randomNumbers[i]].querySelector(".genre")
            ? rows[randomNumbers[i]]
                .querySelector(".genre")
                .textContent.trim()
                .split(", ")
            : [],
          Director:
            rows[randomNumbers[i]].getElementsByTagName("p").length >= 3 &&
            rows[randomNumbers[i]]
              .getElementsByTagName("p")[2]
              .textContent.includes("Director:")
              ? {
                  Name: rows[randomNumbers[i]]
                    .getElementsByTagName("p")[2]
                    .getElementsByTagName("a")[0]
                    .textContent.trim(),
                  link: rows[randomNumbers[i]]
                    .getElementsByTagName("p")[2]
                    .getElementsByTagName("a")[0].href,
                }
              : { Name: "", link: "" },
          Stars:
            rows[randomNumbers[i]].getElementsByTagName("p").length >= 3 &&
            rows[randomNumbers[i]]
              .getElementsByTagName("p")[2]
              .textContent.includes("Stars:")
              ? [
                  ...rows[randomNumbers[i]]
                    .getElementsByTagName("p")[2]
                    .getElementsByTagName("a"),
                ].map((element) => {
                  return {
                    Name: element.textContent.trim(),
                    link: element.href,
                  };
                })
              : [],
        });
        //remove director from stars if needed
        if (data[i].Director.Name !== "" && data[i].Stars.length > 0) {
          data[i].Stars.shift();
        }
      }
      return data;
    },
    numberOfMovies
  );
  await browser.close();
  return movies;
}

export { scrapeMoviesByGenre };
