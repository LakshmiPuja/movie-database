const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running att http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDbServer();

//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name AS movieName FROM movie ORDER BY movie_id;`;
  const movieList = await db.all(getMoviesQuery);
  response.send(movieList);
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getSingleMovieQuery = `SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName,lead_actor AS leadActor FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getSingleMovieQuery);
  response.send(movie);
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE 
        movie 
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id =${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT director_id AS directorId, director_name AS directorName  FROM director ORDER BY director_id;`;
  const directorsList = await db.all(getDirectorsQuery);
  response.send(directorsList);
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT movie_name AS movieName FROM movie NATURAL JOIN director WHERE director_id = ${directorId};`;
  const directorsWithMovieNames = await db.all(getDirectorMoviesQuery);
  response.send(directorsWithMovieNames);
});

module.exports = app;
