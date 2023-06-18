const movieSearchBox = document.getElementById("movie-search-box");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");
const loadingElement = document.getElementById("loading");
let currentPage = 1;
let totalResults = 0;
let currentResults = 0;
let isLoading = false; // Track if the loading indicator is currently displayed

async function loadMovies(searchTerm, sortBy) {
  const URL = `https://www.omdbapi.com/?s=${searchTerm}&page=${currentPage}&type=movie&apikey=d3514d82&${sortBy}=true`;
  try {
    if (currentPage > 1) {
      showLoadingIndicator(); // Show the loading indicator only for page 2 onwards
    }
    const res = await fetch(URL);
    const data = await res.json();
    if (data.Response === "True") {
      totalResults = parseInt(data.totalResults);
      currentResults += parseInt(data.Search.length);
      const sortedMovies = data.Search.sort((a, b) => {
        if (sortBy === "released") {
          return new Date(b.Year) - new Date(a.Year);
        }
      });
      displayMovieList(sortedMovies);
    } else {
      displayError("No results found.");
    }
  } finally {
    hideLoadingIndicator(); // Hide the loading indicator
  }
}

function findMovies() {
  let searchTerm = movieSearchBox.value.trim();
  if (searchTerm.length > 0) {
    searchList.classList.remove("hide-search-list");
    currentPage = 1;
    totalResults = 0;
    currentResults = 0;
    resultGrid.innerHTML = ""; // Clear the main screen
    loadMovies(searchTerm);
  } else {
    searchList.classList.add("hide-search-list");
  }
}

// Event listener for Enter key press in the search input
movieSearchBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    findMovies();
  }
});

function displayMovieList(movies) {
  for (let idx = 0; idx < movies.length; idx++) {
    let movieListItem = document.createElement("div");
    movieListItem.dataset.id = movies[idx].imdbID; // setting movie id in data-id
    movieListItem.classList.add("search-list-item");

    if (movies[idx].Poster !== "N/A") {
      moviePoster = movies[idx].Poster;
    } else {
      moviePoster = "image_not_found.png";
    }

    movieListItem.innerHTML = `
      <div class="search-item-thumbnail">
          <img src="${moviePoster}">
      </div>
      <div class="search-item-info">
          <h3>${movies[idx].Title}</h3>
          <p>Year of Release: ${movies[idx].Year}</p>
          <button class="view-details-button" onclick="getMovieDetails('${movies[idx].imdbID}')">View Details</button>
      </div>
      `;

    resultGrid.appendChild(movieListItem); // Append movie item directly to the main screen
  }
}

async function getMovieDetails(movieID) {
  const detailsURL = `https://www.omdbapi.com/?i=${movieID}&apikey=d3514d82`;
  try {
    const result = await fetch(detailsURL);
    const movieDetails = await result.json();
    displayMovieDetails(movieDetails);
  } catch (error) {
    displayError("An error occurred while fetching movie details.");
  }
}

function displayMovieDetails(details) {
  // collecting movie rating , votes  and the box office earnings
  const imdbRating =
    details.imdbRating !== "N/A" ? details.imdbRating : "Not available";
  const imdbVotes =
    details.imdbVotes !== "N/A" ? details.imdbVotes : "Not available";
  const boxOffice =
    details.BoxOffice !== "N/A" ? details.BoxOffice : "Not available";

  resultGrid.innerHTML = `
    <div class="movie-poster">
        <img src="${
          details.Poster !== "N/A" ? details.Poster : "image_not_found.png"
        }" alt="movie poster">
    </div>
    <div class="movie-info">
        <h3 class="movie-title">${details.Title}</h3>
        <div class="movie-misc-info">
            <li class="year">Year: ${details.Year}</li>
            <li class="rated">Ratings: ${details.Rated}</li>
            <li class="imdb-rating">IMDb Rating: ${imdbRating}</li>
            <li class="imdb-votes">IMDb Votes: ${imdbVotes}</li>
            <li class="released">Released Date: ${details.Released}</li>
            <li class="duration">Duration: ${details.Runtime}</li>
            <li class="box-office">Box Office: ${boxOffice}</li>
        </div>
        <p class="genre"><b>Genre:</b> ${details.Genre}</p>
        <p class="writer"><b>Writer:</b> ${details.Writer}</p>
        <p class="actors"><b>Actors: </b>${details.Actors}</p>
        <p class="plot"><b>Plot:</b> ${details.Plot}</p>
        <p class="language"><b>Language:</b> ${details.Language}</p>
        <p class="awards"><b><i class="fas fa-award"></i></b> ${
          details.Awards
        }</p>
    </div>
  `;
}

function showLoadingIndicator() {
  isLoading = true; // Set isLoading to true
  setTimeout(() => {
    if (isLoading) {
      // Only show the loading indicator if isLoading is still true
      loadingElement.classList.remove("hide-loading");
    }
  }, 500); // Show the loading indicator after a delay of seconds
}

function hideLoadingIndicator() {
  isLoading = false; // Set isLoading to false
  loadingElement.classList.add("hide-loading");
}

window.addEventListener("click", (event) => {
  if (event.target.className !== "form-control") {
    searchList.classList.add("hide-search-list");
  }
});

window.addEventListener("scroll", () => {
  const isScrolledToBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight;
  if (isScrolledToBottom && currentResults < totalResults) {
    currentPage++;
    loadMovies(movieSearchBox.value.trim());
  }
});
// Sort the search using the released year from recent to oldest
const sortByReleaseButton = document.getElementById("sort-by-release-button");

sortByReleaseButton.addEventListener("click", () => {
  currentPage = 1;
  totalResults = 0;
  currentResults = 0;
  resultGrid.innerHTML = ""; // Clear the main screen
  loadMovies(movieSearchBox.value.trim(), "released");
});
