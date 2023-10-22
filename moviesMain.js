import readline from "readline";


async function MovieList() {
    //create Genre array
    const genres = [
        { name: 'Action', rating: 0 },
        { name: 'Comedy', rating: 0 },
        { name: 'Drama', rating: 0 },
        { name: 'Horror', rating: 0 },
        { name: 'Romance', rating: 0 }
    ]


    console.log('Welcome to the Movie suggestion app!')
    console.log('------------------------------------\n\n')

    console.log('Please rate the following 5 genres from 1-10, 1 being the least and 10 being the most\n')

    //array of 5 random integers from 0 to GenresArray.length
    const randomGenres = [0, 1, 2, 3, 4]
    console.log(genres);
    
    const scores = await new Promise((resolve) => {
        getGenreScores(genres, randomGenres, [], 0, (scores) => {
            console.log('Genre scores:', scores);
            resolve(scores);
        });
    });
    for (let i = 0; i < randomGenres.length; i++) {
        genres[randomGenres[i]].rating += (scores[i] - 5);
    }
    console.log(genres);
    
    //sort genres by rating
    genres.sort((a, b) => {
        return b.rating - a.rating;
    });
    
    //get 5 random numbers from 1 to 20 bias to lower numbers (higher scores)
    const randomNumbers = [];
    while (randomNumbers.length < 5) {
    const randomNumber = Math.floor(biasedRandomNumber(2) * 20) + 1;
    if (!randomNumbers.includes(randomNumber)) {
        randomNumbers.push(randomNumber);
      }
    }
    console.log(randomNumbers);

    //foreach randomn genre get 2 movies
    const movies = [];
    for (let i = 0; i < randomGenres.length; i++) {
        const genre = genres[randomGenres[i]];
        const genreMovies = await getMovies(genre.name, 2);
        movies.push(...genreMovies);
    }

    //print movies (title, year, rating, genre)
    //ask if ok? if yes export list to json and exit else continue
    //rate movies from 1-10
    //adjust scores of every genre of each movie by the rating
    //repeat loop starting back at genres.sort (line 36)

}

function getGenreScores(genres, randomGenres, scores, index, callback) {
    if (index >= randomGenres.length) {
      callback(scores);
      return;
    }
  
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    rl.question(`${genres[randomGenres[index]].name}: `, (str) => {
      const score = parseInt(str);
      if (isNaN(score) || score < 1 || score > 10) {
        console.log('Please enter a number between 1 and 10');
        rl.close();
        getGenreScores(genres, randomGenres, scores, index, callback);
      } else {
        scores.push(score);
        rl.close();
        getGenreScores(genres, randomGenres, scores, index + 1, callback);
      }
    });
  }

  function biasedRandomNumber(bias) {
    const randomNumber = Math.random();
    const biasedNumber = Math.pow(randomNumber, bias);
    return biasedNumber;
  }

export { MovieList };