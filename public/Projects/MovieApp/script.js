const apiUrl = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=db78d22e7943c647ed0e32ab21fa7cbd&page=1';
const imgPath = 'https://image.tmdb.org/t/p/w1280';
const searchUrl = 'https://api.themoviedb.org/3/search/movie?api_key=db78d22e7943c647ed0e32ab21fa7cbd&query="';

const form = document.getElementById('form');
const search = document.getElementById('search');
const main = document.getElementById('main');

const getClassByRate = (vote) => {
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    };
};

const showMovies = (movies) => {
    main.innerHTML = '';

    movies.forEach((movie) => {
        const {title, poster_path, vote_average, overview} = movie;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        movieEl.innerHTML = `
            <img src="${imgPath + poster_path}" alt="${title}">
            <div class="movie-info">
				<h3>${title}</h3>
				<span class="${getClassByRate(vote_average)}">${vote_average}</span>
			</div>
			<div class="overview">
				<h3>Overview</h3>
                ${overview}
            </div>
        `;

        main.appendChild(movieEl);
    })
}

const getMovies = async (url) => {
    const response = await fetch(url);
    const data = await response.json();

    showMovies(data.results);
};

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const searchTerm = search.value;

    if (searchTerm && searchTerm !== '') {
        getMovies(searchUrl + searchTerm);

        search.value = '';
    } else {
        window.location.reload();
    }
})

getMovies(apiUrl);