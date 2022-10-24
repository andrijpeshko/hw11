import '../sass/_style.scss';
import { Notify } from 'notiflix';
const axios = require('axios').default;
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let searchQueryResult = '';
let q = '';
let pageN = 1;
let gallery = new SimpleLightbox('.gallery a', {
  enableKeyboard: true,
});

const pixabayAPI = {
  baseUrl: 'https://pixabay.com/api/',
  key: '30693264-9f2d2acf319fb28e9e78d56a0',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  page: '1',
  per_page: '40',
};

const markupData = {
  markup: '',
  htmlCode: '',
};

const searchForm = document.querySelector('.search-form');
const gallerySelector = document.querySelector('.gallery');
const decoration = document.querySelector('.animation-decor');

searchForm.addEventListener('submit', onSubmit);
async function onSubmit(e) {
  e.preventDefault();
  searchQueryResult = e.currentTarget.elements.searchQuery.value
    .toLowerCase()
    .trim();
  e.target.reset();
  console.log('searchQueryResult:', `${searchQueryResult}`);

  if (searchQueryResult === '') {
    cleanContainer();
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  if (searchQueryResult !== q) {
    pageN = 1;
    pixabayAPI.page = `${pageN}`;
    cleanContainer();
  } else {
    pageN += 1;
    pixabayAPI.page = `${pageN}`;
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  q = searchQueryResult;
  console.log('q:', `${q}`);

  try {
    const results = await fetchPhotos(searchQueryResult);
    markupData.htmlCode = await renderedPhotos(results);
    gallerySelector.insertAdjacentHTML('beforeend', markupData.htmlCode);
    gallery.refresh();
    const {
      baseUrl,
      key,
      image_type,
      orientation,
      safesearch,
      page,
      per_page,
    } = pixabayAPI;
    const { total, totalHits, hits } = results;
    const totalPages = Math.ceil(totalHits / per_page);
    if (page < totalPages) {
      btnLoadMore.classList.remove('is-hidden');
    }
    decoration.style.display = 'none';
    Notify.success(`'Hooray! We found ${results.totalHits} images.'`);
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

const btnLoadMore = document.querySelector('.load-more');
btnLoadMore.addEventListener('click', onBtnClick);
async function onBtnClick() {
  pageN += 1;
  pixabayAPI.page = `${pageN}`;
  try {
    const results = await fetchPhotos(searchQueryResult);
    markupData.htmlCode = await renderedPhotos(results);
    gallerySelector.insertAdjacentHTML('beforeend', markupData.htmlCode);
    gallery.refresh();

    const {
      baseUrl,
      key,
      image_type,
      orientation,
      safesearch,
      page,
      per_page,
    } = pixabayAPI;
    const { total, totalHits, hits } = results;
    const totalPages = Math.ceil(totalHits / per_page);
  } catch (error) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

async function fetchPhotos(searchQueryResult) {
  const { baseUrl, key, image_type, orientation, safesearch, page, per_page } =
    pixabayAPI;
  pixabayAPI.page = `${pageN}`;
  console.log('page', page);

  const response = await axios.get(
    `${baseUrl}?key=${key}&q=${q}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}&page=${page}&per_page=${per_page}`
  );
  const results = response.data;
  const { total, totalHits, hits } = results;
  const totalPages = Math.ceil(totalHits / per_page);

  if (total === 0) {
    throw new Error();
  }

  if (page >= totalPages) {
    btnLoadMore.classList.remove('is-hidden');
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    btnLoadMore.classList.add('is-hidden');
    return results;
  }
  console.log('totalHits', totalHits);
  console.log('per_page', per_page);
  console.log('totalPages=', totalPages);
  return results;
}

async function renderedPhotos(results) {
  const { hits } = results;

  markupData.markup = hits
    .map(
      hit =>
        `<a href="${hit.largeImageURL}"><div class="photo-card">
        <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy"
          class="img-item" />
        <div class="info">
    <p class="info-item">
      <b>Likes:</b>${hit.likes}
    </p>
    <p class="info-item">
      <b>Views:</b>${hit.views}
    </p>
    <p class="info-item">
      <b>Comments:</b>${hit.comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b>${hit.downloads}
    </p>
  </div>
</div></a>`
    )
    .join('');
  return markupData.markup;
}

function cleanContainer() {
  gallerySelector.innerHTML = '';
}
