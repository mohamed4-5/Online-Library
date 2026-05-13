document.addEventListener("DOMContentLoaded", () => {
  renderProfileFavorites();
  renderProfileBorrowed();
});

function renderProfileFavorites() {
  const grid = document.getElementById("profile-favorites-grid");
  if (!grid) return;

  fetch("/api/user-favorites/")
    .then((response) => response.json())
    .then((data) => {
      const favoriteIds = (data.favorites || []).map(Number);

      if (favoriteIds.length === 0) {
        grid.innerHTML = `
                    <div class="no-favorites">
                        <i class="fa-regular fa-heart"></i>
                        <p>You haven't added any favorites yet.</p>
                    </div>
                `;
        return;
      }

      fetch("/api/get-books/")
        .then((res) => res.json())
        .then((booksData) => {
          const books = booksData.books || [];
          const favoriteBooks = books.filter((b) =>
            favoriteIds.includes(Number(b.id)),
          );

          grid.innerHTML = favoriteBooks
            .map(
              (book) => `
                        <div class="favorite-book-card" onclick="window.location.href='/book/${book.id}/'">
                            <img src="${book.image}" alt="${(book.title || "").replace(/"/g, "&quot;")}" class="favorite-book-image" onerror="this.style.display='none'">
                            <h3>${book.title || ""}</h3>
                            <p class="favorite-book-author">${book.author || ""}</p>
                            <button type="button" class="fav-btn active"
                                    onclick="event.stopPropagation(); toggleFavorite(${book.id}, this)"
                                    title="Remove from favorites">
                                <i class="fa-solid fa-heart"></i>
                            </button>
                        </div>
                    `,
            )
            .join("");
        })
        .catch((err) => {
          console.error("Error loading books:", err);
          grid.innerHTML = "<p>Error loading favorites</p>";
        });
    })
    .catch((err) => {
      console.error("Error loading favorites:", err);
      grid.innerHTML = "<p>Error loading favorites</p>";
    });
}

function renderProfileBorrowed() {
  const grid = document.getElementById("profile-borrowed-grid");
  if (!grid) return;

  fetch("/api/my-borrows/")
    .then((r) => (r.ok ? r.json() : { borrowed_ids: [] }))
    .then((data) => {
      const ids = (data.borrowed_ids || []).map(Number);
      if (!ids.length) {
        grid.innerHTML = `
          <div class="no-favorites">
            <i class="fa-solid fa-book-open"></i>
            <p>You have no borrowed books right now. Visit the library to borrow a title.</p>
          </div>`;
        return;
      }
      return fetch("/api/get-books/")
        .then((r) => r.json())
        .then((booksData) => {
          const books = booksData.books || [];
          const borrowed = books.filter((b) => ids.includes(Number(b.id)));
          grid.innerHTML = borrowed
            .map(
              (book) => `
            <div class="favorite-book-card" onclick="window.location.href='/book/${book.id}/'">
              <img src="${book.image}" alt="${(book.title || "").replace(/"/g, "&quot;")}" class="favorite-book-image" onerror="this.style.display='none'">
              <h3>${book.title || ""}</h3>
              <p class="favorite-book-author">${book.author || ""}</p>
              <span class="profile-borrowed-pill">On loan</span>
            </div>`,
            )
            .join("");
        });
    })
    .catch((err) => {
      console.error(err);
      grid.innerHTML = "<p>Could not load borrowed books.</p>";
    });
}
