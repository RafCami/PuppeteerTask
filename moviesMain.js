import readline from "readline";
import { scrapeMoviesByGenre } from "./moviesScrape.js";
import fs from "fs";

async function MovieList() {
  //create initial Genre array
  //gets expanded as new genres are found
  const genres = [
    { name: "Action", rating: 0 },
    { name: "Comedy", rating: 0 },
    { name: "Drama", rating: 0 },
    { name: "Horror", rating: 0 },
    { name: "Romance", rating: 0 },
  ];

  console.log("Welcome to the Movie suggestion app!");
  console.log("------------------------------------\n\n");

  console.log(
    "Please rate the following 5 genres from 1-10, 1 being the least and 10 being the most\n"
  );

  //get scores for the 5 initial genres
  const initGenres = [0, 1, 2, 3, 4];
  const scores = await new Promise((resolve) => {
    getGenreScores(genres, initGenres, [], 0, (scores) => {
      resolve(scores);
    });
  });
  for (let i = 0; i < initGenres.length; i++) {
    genres[initGenres[i]].rating += scores[i] - 5;
  }
  
  //loop start point
  let approval = false;
  do {
    //sort genres by rating
    genres.sort((a, b) => {
      return b.rating - a.rating;
    });

    //get 5 random numbers from 0 to genres.length bias to lower numbers (higher scores)
    const randomNumbers = [];
    while (randomNumbers.length < 5) {
      const randomNumber = Math.floor(biasedRandomNumber(2) * genres.length);
      if (!randomNumbers.includes(randomNumber)) {
        randomNumbers.push(randomNumber);
      }
    }
    console.log('\n\nGetting new suggestions...\n\n');

    //foreach random genre get 2 movies, don't add duplicates
    const movies = [];
    for (let i = 0; i < randomNumbers.length; i++) {
      const genre = genres[randomNumbers[i]];
      console.log(`Getting movies for ${genre.name}`);
      const genreMovies = await scrapeMoviesByGenre(genre.name, 2);
      genreMovies.forEach(movie => {
        if (!movies.find(m => m.Title === movie.Title && m.Year === movie.Year)) {
          movies.push(movie);
        }
      });
    }

    //print movies (title, year, rating, genre)
    console.log("\nHere are your movie suggestions:\n");
    for (let i = 0; i < movies.length; i++) {
      console.log(
        `${movies[i].Title} - (${movies[i].Year}) - Rating: ${
          movies[i].Rating
        } - Genre(s): ${movies[i].Genres.join(", ")}`
      );
    }

    //ask if list is good. if yes export list to json and exit, else continue
    approval = await new Promise((resolve) => {
      getApproval((response) => {
        resolve(response);
      });
    });

    if (approval) {
      console.log("\n\nThank you for using the Movie suggestion app!");
      console.log("---------------------------------------------\n");
      console.log(movies);
      console.log("\nYou can also find the movie list in movieList.JSON\n");
      console.log("Goodbye!");

      //write array of objects to json file
      fs.writeFile("./movieList.json", JSON.stringify(movies), (err) => {
        if (err) throw err;
      });
      return;
    }

    //rate movies from 1-10
    //and adjust scores of every genre of the movie by the rating
    console.log(`\nPlease rate the following ${movies.length} movies\n`);
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      const score = await new Promise((resolve) => {
        getMovieScore(movie.Title, (response) => {
          resolve(response);
        });
      });

      //get indexes of genres in genres array, add the genre if not in array yet
      const genreIndexes = [];
      for (let j = 0; j < movie.Genres.length; j++) {
        let index = genres.findIndex((genre) => genre.name === movie.Genres[j]);
        if (index === -1) {
          genres.push({ name: movie.Genres[j], rating: 0 });
          index = genres.length - 1;
        }
        genreIndexes.push(index);
      }
      //adjust genre rating by score
      for (let j = 0; j < genreIndexes.length; j++) {
        genres[genreIndexes[j]].rating += score - 5;
      }
    }

    //repeat loop starting back at genres.sort (line 35)
  } while (approval === false);
}

//get genre scores from user
function getGenreScores(genres, randomGenres, scores, index, callback) {
    //after scores for all genres are entered, call callback function
  if (index >= randomGenres.length) {
    callback(scores);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`${genres[randomGenres[index]].name}: `, (str) => {
    const score = parseInt(str);
    //check if input is a number between 1 and 10
    if (isNaN(score) || score < 1 || score > 10) {
      console.log("Please enter a number between 1 and 10: ");
      rl.close();
      getGenreScores(genres, randomGenres, scores, index, callback);
      //if input is valid, add score to scores array and call function again for next index
    } else {
      scores.push(score);
      rl.close();
      getGenreScores(genres, randomGenres, scores, index + 1, callback);
    }
  });
}

//get movie scores from user
function getMovieScore(title, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`\nPlease rate "${title}" from 1-10: `, (str) => {
    const score = parseInt(str);
    if (isNaN(score) || score < 1 || score > 10) {
      console.log("Please enter a number between 1 and 10!");
      rl.close();
      getMovieScore(title, callback);
    } else {
      rl.close();
      callback(score);
    }
  });
}

//get approval to export and finish movie list
function getApproval(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nAre you happy with these suggestions? (y/n) ", (str) => {
    rl.close();
    if (str.toLocaleLowerCase() === "y") {
      callback(true);
    } else if (str.toLocaleLowerCase() === "n") {
      callback(false);
    } else {
      console.log("Please enter y or n");
      getApproval(callback);
    }
  });
}

//returns a random number between 0 and 1 with a bias
//use higher bias for lower numbers, vice versa
function biasedRandomNumber(bias) {
  const randomNumber = Math.random();
  const biasedNumber = Math.pow(randomNumber, bias);
  return biasedNumber;
}

export { MovieList };