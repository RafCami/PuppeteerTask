import puppeteer from "puppeteer";

async function scrapeMoviesByGenre(genre, numberOfMovies = 2) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  );
  await page.goto(
    `https://www.imdb.com/search/title/?genres=${genre}&explore=genres`,
    { waitUntil: "networkidle0" }
  );

  const movies = await page.$$eval(".lister-item", (rows, numberOfMovies) => {
    if (numberOfMovies > rows.length) { numberOfMovies = rows.length; }
    const data = []
    for (let i = 0; i < numberOfMovies; i++) {
      data.push(
        {
            Title: rows[i]
              .querySelector(".lister-item-header")
              .getElementsByTagName("a")[0]
              .textContent.trim(),
            Year: parseInt(
              rows[i]
                .querySelector(".lister-item-year")
                .textContent.trim()
                .replace(/[\(\)\sXIV]|(\s?\-\s?\d*)/g, "")
            ),
            Runtime: rows[i].querySelector(".runtime")
              ? parseInt(
                  rows[i]
                    .querySelector(".runtime")
                    .textContent.trim()
                    .replace(/\smin/g, "")
                )
              : 0,
            Rating: rows[i].querySelector(".certificate")
              ? rows[i].querySelector(".certificate").textContent.trim()
              : "",
            Score: rows[i].querySelector(".ratings-imdb-rating")
              ? parseFloat(
                  rows[i].querySelector(".ratings-imdb-rating").textContent.trim()
                )
              : 0,
            MetaScore: rows[i].querySelector(".metascore")
              ? parseInt(rows[i].querySelector(".metascore").textContent.trim())
              : 0,
            Genres: rows[i].querySelector(".genre")
              ? rows[i].querySelector(".genre").textContent.trim().split(", ")
              : [],
            Director:
              rows[i].getElementsByTagName("p").length >= 3 &&
              rows[i].getElementsByTagName("p")[2].textContent.includes("Director:")
                ? {
                    Name: rows[i]
                      .getElementsByTagName("p")[2]
                      .getElementsByTagName("a")[0]
                      .textContent.trim(),
                    link: rows[i]
                      .getElementsByTagName("p")[2]
                      .getElementsByTagName("a")[0].href,
                  }
                : { Name: "", link: "" },
            Stars:
              rows[i].getElementsByTagName("p").length >= 3 &&
              rows[i].getElementsByTagName("p")[2].textContent.includes("Stars:")
                ? [...rows[i].getElementsByTagName("p")[2].getElementsByTagName("a")].map(
                    (element) => {
                      return { Name: element.textContent.trim(), link: element.href };
                    }
                  )
                : [],
          } );
          if (data[i].Director.Name !== "" && data[i].Stars.length > 0) { data[i].Stars.shift(); }
    }
    // const data2 = rows.map((row) => ({
    //   Title: row
    //     .querySelector(".lister-item-header")
    //     .getElementsByTagName("a")[0]
    //     .textContent.trim(),
    //   Year: parseInt(
    //     row
    //       .querySelector(".lister-item-year")
    //       .textContent.trim()
    //       .replace(/[\(\)\sXIV]|(\s?\-\s?\d*)/g, "")
    //   ),
    //   Runtime: row.querySelector(".runtime")
    //     ? parseInt(
    //         row
    //           .querySelector(".runtime")
    //           .textContent.trim()
    //           .replace(/\smin/g, "")
    //       )
    //     : 0,
    //   Rating: row.querySelector(".certificate")
    //     ? row.querySelector(".certificate").textContent.trim()
    //     : "",
    //   Score: row.querySelector(".ratings-imdb-rating")
    //     ? parseFloat(
    //         row.querySelector(".ratings-imdb-rating").textContent.trim()
    //       )
    //     : 0,
    //   MetaScore: row.querySelector(".metascore")
    //     ? parseInt(row.querySelector(".metascore").textContent.trim())
    //     : 0,
    //   Genres: row.querySelector(".genre")
    //     ? row.querySelector(".genre").textContent.trim().split(", ")
    //     : [],
    //   Director:
    //     row.getElementsByTagName("p").length >= 3 &&
    //     row.getElementsByTagName("p")[2].textContent.includes("Director:")
    //       ? {
    //           Name: row
    //             .getElementsByTagName("p")[2]
    //             .getElementsByTagName("a")[0]
    //             .textContent.trim(),
    //           link: row
    //             .getElementsByTagName("p")[2]
    //             .getElementsByTagName("a")[0].href,
    //         }
    //       : { Name: "", link: "" },
    //   Stars:
    //     row.getElementsByTagName("p").length >= 3 &&
    //     row.getElementsByTagName("p")[2].textContent.includes("Stars:")
    //       ? [...row.getElementsByTagName("p")[2].getElementsByTagName("a")].map(
    //           (element) => {
    //             return { Name: element.textContent.trim(), link: element.href };
    //           }
    //         )
    //       : [],
    // }));
    // for (let i = 0; i < data.length; i++) {
    //     if (data[i].Director.Name !== "" && data[i].Stars.length > 0) { data[i].Stars.shift(); }
    // }
    return data;
}, numberOfMovies);

//   console.log(JSON.stringify(movies, null, 2));
  console.log(movies);

  await browser.close();
    // return movies;
}

export { scrapeMoviesByGenre };
