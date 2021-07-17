const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
  }
};
initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesArray = `SELECT * FROM movie WHERE movie_id;`;
  const getMovies = await db.all(getMoviesArray);
  response.send(
    getMovies.map((eachData) => ({
      movieName: eachData.movie_name,
    }))
  );
});

app.post("/movies", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieData = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (
        ${directorId},'${movieName}','${leadActor}');`;
  await db.run(createMovieData);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieObject = `SELECT * FROM movie 
  WHERE movie_id=${movieId} ;`;
  const getMovie = await db.get(getMovieObject);
  response.send({
    movieId: getMovie.movie_id,
    directorId: getMovie.director_id,
    movieName: getMovie.movie_name,
    leadActor: getMovie.lead_actor,
  });
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieData = `UPDATE movie SET director_id=${directorId},
    movie_name='${movieName}',
    lead_actor = '${leadActor}' 
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieData);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieData = `DELETE FROM movie WHERE 
    movie_id=${movieId};`;
  await db.run(deleteMovieData);
  response.send("Movie Removed");
});

app.get("/directors", async (request, response) => {
  const getDirectorsData = `SELECT * FROM director;`;
  const getDirectors = await db.all(getDirectorsData);
  response.send(
    getDirectors.map((eachData) => ({
      directorId: eachData.director_id,
      directorName: eachData.director_name,
    }))
  );
});

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `SELECT * FROM movie WHERE director_id=${directorId};`;
  const getMoviesData = await db.all(getDirectorMovies);
  response.send(
    getMoviesData.map((eachData) => ({
      movieName: eachData.movie_name,
    }))
  );
});

module.exports = app;
