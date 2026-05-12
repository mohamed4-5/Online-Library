document.addEventListener("DOMContentLoaded", () => {
    // جلب المفضلات من قاعدة البيانات وعرضها
    renderProfileFavorites();
});

function renderProfileFavorites() {
    const grid = document.getElementById("profile-favorites-grid");
    if (!grid) return;

    // جلب المفضلات من الـ API
    fetch('/api/user-favorites/')
        .then(response => response.json())
        .then(data => {
            const favoriteIds = data.favorites || [];
            
            if (favoriteIds.length === 0) {
                grid.innerHTML = `
                    <div class="no-favorites">
                        <i class="fa-regular fa-heart"></i>
                        <p>You haven't added any favorites yet.</p>
                    </div>
                `;
                return;
            }

            // جلب تفاصيل الكتب
            fetch('/api/get-books/')
                .then(res => res.json())
                .then(booksData => {
                    const books = booksData.books || [];
                    const favoriteBooks = books.filter(b => favoriteIds.includes(b.id));
                    
                    grid.innerHTML = favoriteBooks.map(book => `
                        <div class="favorite-book-card" onclick="window.location.href='/book/${book.id}/'">
                            <img src="${book.image}" alt="${book.title}" class="favorite-book-image" onerror="this.style.display='none'">
                            <h3>${book.title}</h3>
                            <p class="favorite-book-author">${book.author}</p>
                            <button type="button" class="fav-btn active"
                                    onclick="event.stopPropagation(); toggleFavorite(${book.id}, this)"
                                    title="Remove from favorites">
                                <i class="fa-solid fa-heart"></i>
                            </button>
                        </div>
                    `).join('');
                })
                .catch(err => {
                    console.error('Error loading books:', err);
                    grid.innerHTML = '<p>Error loading favorites</p>';
                });
        })
        .catch(err => {
            console.error('Error loading favorites:', err);
            grid.innerHTML = '<p>Error loading favorites</p>';
        });
}