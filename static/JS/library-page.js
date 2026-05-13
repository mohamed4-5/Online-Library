const BOOKS_PER_PAGE = 8;
let allBooks = [];

let currentFilter = "All";
let currentPage = 1;
let searchQuery = "";

async function loadBooks() {
  try {
    if (typeof fetchUserFavorites === "function") {
      await fetchUserFavorites();
    }
  } catch (e) {
    /* ignore */
  }

  try {
    const res = await fetch("/api/get-books/");
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    allBooks = data.books || [];
  } catch (e) {
    console.warn("Could not load books from API:", e);
    allBooks = [];
  }

  buildFilters();
  render();
}

function getCategories() {
  return ["All", "Latest", ...new Set(allBooks.map((b) => b.category))];
}

function buildFilters() {
  const categories = getCategories();
  const container = document.getElementById("filtersContainer");
  if (!container) return;
  container.innerHTML = categories
    .map(
      (cat) => `
        <button type="button" class="filter-pill ${cat === currentFilter ? "active" : ""}"
                onclick="setFilter('${cat.replace(/'/g, "\\'")}')">${cat}</button>
    `,
    )
    .join("");
}

function setFilter(cat) {
  currentFilter = cat;
  currentPage = 1;
  buildFilters();
  render();
}

function handleSearch() {
  const el = document.getElementById("searchInput");
  searchQuery = (el ? el.value : "").toLowerCase().trim();
  currentPage = 1;
  render();
}

function getFiltered() {
  let books = [...allBooks];
  if (currentFilter === "Latest") books = books.filter((b) => b.latest);
  else if (currentFilter !== "All")
    books = books.filter((b) => b.category === currentFilter);
  if (searchQuery) {
    books = books.filter(
      (b) =>
        (b.title && b.title.toLowerCase().includes(searchQuery)) ||
        (b.author && b.author.toLowerCase().includes(searchQuery)),
    );
  }
  return books;
}

function starsHtml(rating) {
  const r = Number(rating) || 0;
  const full = Math.floor(r);
  const half = r % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '<span class="stars">' +
    '<i class="fa-solid fa-star"></i>'.repeat(full) +
    (half ? '<i class="fa-solid fa-star-half-stroke"></i>' : "") +
    '<i class="fa-regular fa-star"></i>'.repeat(empty) +
    "</span>"
  );
}

function bookDetailUrl(id) {
  return `/book/${id}/`;
}

function render() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / BOOKS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * BOOKS_PER_PAGE;
  const pageBooks = filtered.slice(start, start + BOOKS_PER_PAGE);

  const titleEl = document.getElementById("sectionTitle");
  const countEl = document.getElementById("resultsCount");
  if (titleEl)
    titleEl.textContent =
      currentFilter === "All" ? "All Books" : currentFilter;
  if (countEl)
    countEl.textContent = `${filtered.length} book${filtered.length !== 1 ? "s" : ""} found`;

  const grid = document.getElementById("booksGrid");
  if (!grid) return;

  if (pageBooks.length === 0) {
    grid.innerHTML = `
            <div class="no-results library-no-results">
                <i class="fa-regular fa-face-sad-tear"></i>
                <h3>No books found</h3>
                <p>Try a different search or filter</p>
            </div>`;
  } else {
    grid.innerHTML = pageBooks
      .map((book) => {
        const fav =
          typeof isFavorite === "function" && isFavorite(book.id);
        const href = bookDetailUrl(book.id);
        return `
            <div class="book-card" onclick="window.location.href='${href}'">
                <div class="book-cover">
                    <img src="${book.image}"
                         alt="${(book.title || "").replace(/"/g, "&quot;")}"
                         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <div class="book-cover-placeholder book-cover-placeholder--hidden">${book.title || ""}</div>
                    <span class="book-badge">${book.category || ""}</span>
                    <button type="button" class="fav-btn ${fav ? "active" : ""}"
                            title="${fav ? "Remove from favorites" : "Add to favorites"}"
                            aria-label="${fav ? "Remove from favorites" : "Add to favorites"}"
                            onclick="event.stopPropagation(); toggleFavorite(${book.id}, this)">
                        <i class="fa-${fav ? "solid" : "regular"} fa-heart"></i>
                    </button>
                </div>
                <div class="book-info">
                    <h3>${book.title || ""}</h3>
                    <p class="author">${book.author || ""}</p>
                    <div class="book-stars">
                        ${starsHtml(book.rating)}
                        <span class="rating-num">${book.rating}</span>
                    </div>
                    <a href="${href}" class="btn-view" onclick="event.stopPropagation()">View Book</a>
                </div>
            </div>
        `;
      })
      .join("");
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pg = document.getElementById("pagination");
  if (!pg) return;
  if (totalPages <= 1) {
    pg.innerHTML = "";
    return;
  }

  let html = "";

  html += `<button type="button" class="page-btn" onclick="goPage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>
            <i class="fa-solid fa-angles-left"></i>
            </button>`;

  const pages = getPageRange(currentPage, totalPages);
  pages.forEach((p) => {
    if (p === "...") {
      html += `<button type="button" class="page-btn" disabled>…</button>`;
    } else {
      html += `<button type="button" class="page-btn ${
        p === currentPage ? "active" : ""
      }" onclick="goPage(${p})">${p}</button>`;
    }
  });

  html += `<button type="button" class="page-btn" onclick="goPage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>
            <i class="fa-solid fa-angles-right"></i>
            </button>`;

  pg.innerHTML = html;
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}

function goPage(p) {
  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE);
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", function () {
  const si = document.getElementById("searchInput");
  if (si) si.addEventListener("input", handleSearch);
  loadBooks();
});

const addDiv = document.querySelector(".library-main");
if (addDiv) {
  const cfg = window.LIBRARY_CONFIG || {};
  const addBookUrl = cfg.addBookUrl || "/add_book/";
  const showAdminStrip = !!cfg.isStaff;

  addDiv.innerHTML = `
  <!-- FILTERS -->
      <div class="filters" id="filtersContainer">
        <!-- populated by JS -->
      </div>

      <!-- RESULTS HEADER -->
      <div class="results-header">
        <h2 id="sectionTitle">All Books</h2>
        <span class="results-count" id="resultsCount"></span>
      </div>

      <!-- BOOKS GRID -->
      <div class="books-grid" id="booksGrid">
        <!-- populated by JS -->
      </div>

      <!-- PAGINATION -->
      <div class="pagination" id="pagination"></div>
    ${
      showAdminStrip
        ? `
    <div class="add-book-strip">
        <div>
            <h2>Add Your Book</h2>
            <p>Share your favorite reads with the community</p>
        </div>
        <a href="${addBookUrl}" class="btn-add"><i class="fa-solid fa-plus"></i> Add Book</a>
    </div>
    `
        : ""
    } 
  `;
}
