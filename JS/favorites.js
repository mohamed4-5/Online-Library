/**
 * Favorites page — same storage keys & heart UI as the home page (general.js).
 */
let allBooks = [];

async function loadAllBooks() {
  try {
    const res = await fetch("../data/books.json");
    allBooks = await res.json();
  } catch {
    allBooks = [];
  }
  try {
    const userBooks = JSON.parse(localStorage.getItem("userBooks")) || [];
    userBooks.forEach((b) => {
      if (!allBooks.find((x) => x.id === b.id)) allBooks.push(b);
    });
  } catch {
    /* ignore */
  }
  renderFavorites();
}

function showEmptyState() {
  const container = document.getElementById("favorites-container");
  if (!container) return;
  container.innerHTML = `
        <div class="favorites-empty">
            <i class="fa-regular fa-heart" aria-hidden="true"></i>
            <h2> No favorite books yet</h2>
            <p>Click the heart icon next to any book to add it here instantly</p>
            <a href="library.html" class="favorites-empty-cta">Browse Library</a>
        </div>`;
}

function removeFromFavoritesPage(bookId) {
  toggleFavorite(bookId, null);
  renderFavorites();
}

function createFavoriteCard(book) {
  const card = document.createElement("div");
  card.classList.add("book-card");
  card.innerHTML = `
        <div class="book-image-wrapper">
            <img src="${book.image}" alt="${book.title}" onerror="this.src='../images/book-placeholder.jpg'">
            <span class="category-badge">${book.category}</span>
            <button type="button" class="fav-btn active"
                    title="Remove from favorites"
                    aria-label="Remove from favorites"
                    onclick="event.stopPropagation(); removeFromFavoritesPage(${book.id})">
                <i class="fa-solid fa-heart"></i>
            </button>
        </div>
        <div class="book-info">
            <h3>${book.title}</h3>
            <p class="author-name">${book.author}</p>
        </div>`;
  card.onclick = () => {
    window.location.href = `book.html?id=${book.id}`;
  };
  return card;
}

function renderFavorites() {
  const container = document.getElementById("favorites-container");
  if (!container) return;

  const favoriteIds = getFavorites();
  if (favoriteIds.length === 0) {
    showEmptyState();
    return;
  }

  const favoriteBooks = favoriteIds
    .map((id) => allBooks.find((b) => b.id == id))
    .filter(Boolean);

  if (favoriteBooks.length === 0) {
    showEmptyState();
    return;
  }

  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "favorites-grid";
  favoriteBooks.forEach((book) => grid.appendChild(createFavoriteCard(book)));
  container.appendChild(grid);
}

document.addEventListener("DOMContentLoaded", loadAllBooks);
