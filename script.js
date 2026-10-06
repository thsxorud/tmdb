const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const resultsEl = document.getElementById('results');
const wishlistEl = document.getElementById('wishlist');
const IMG = 'https://image.tmdb.org/t/p/w300';

// 찜 목록: 브라우저 localStorage 에 저장 (새로고침해도 유지됨)
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function isWished(id) {
  return wishlist.some(m => m.id === id);
}

function toggleWish(movie) {
  wishlist = isWished(movie.id)
    ? wishlist.filter(m => m.id !== movie.id)   // 이미 있으면 제거
    : [...wishlist, movie];                     // 없으면 추가
  saveWishlist();
  renderWishlist();
  document.querySelectorAll('#results .card').forEach(updateButton);
}

function updateButton(card) {
  const btn = card.querySelector('button');
  const wished = isWished(Number(card.dataset.id));
  btn.textContent = wished ? '찜 해제' : '찜하기';
  btn.classList.toggle('on', wished);
}

function createCard(movie) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = movie.id;
  const poster = movie.poster_path ? IMG + movie.poster_path : '';
  card.innerHTML = `
    <img src="${poster}" alt="${movie.title} 포스터">
    <div class="info"><strong>${movie.title}</strong><br>
      <small>${movie.release_date || '개봉일 미정'}</small></div>
    <button type="button"></button>`;
  card.querySelector('button').addEventListener('click', () => toggleWish(movie));
  updateButton(card);
  return card;
}

function renderWishlist() {
  wishlistEl.innerHTML = '';
  if (wishlist.length === 0) {
    wishlistEl.innerHTML = '<p class="empty">찜한 영화가 없습니다.</p>';
    return;
  }
  wishlist.forEach(m => wishlistEl.appendChild(createCard(m)));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();                       // 페이지 새로고침 방지
  resultsEl.innerHTML = '<p class="empty">검색 중...</p>';
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(input.value)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.status_message || data.error);
    resultsEl.innerHTML = '';
    if (data.results.length === 0) {
      resultsEl.innerHTML = '<p class="empty">검색 결과가 없습니다.</p>';
      return;
    }
    data.results.forEach(m => resultsEl.appendChild(createCard(m)));
  } catch (err) {
    resultsEl.innerHTML = `<p class="empty">오류: ${err.message}</p>`;
  }
});

renderWishlist();
