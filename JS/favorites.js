document.addEventListener("DOMContentLoaded", () => {
    loadFavorites();
});

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const container = document.getElementById("favorites-container");
    const emptyState = document.getElementById("empty-state");

    fetch("../data/books.json")
        .then(res => res.json())
        .then(data => {

            const favBooks = data.filter(book => favorites.includes(book.id));

            container.innerHTML = "";

            if (favBooks.length === 0) {
                emptyState.style.display = "block";
                return;
            }

            emptyState.style.display = "none";

            favBooks.forEach(book => {
                const card = document.createElement("div");
                card.classList.add("book-card");

                card.innerHTML = `
                    <div class="book-image-wrapper">
                        <img src="${book.image}">
                        <span class="category-badge">${book.category}</span>

                        <button class="fav-btn active"
                            onclick="event.stopPropagation(); removeFavorite(${book.id})">
                            <i class="fa-solid fa-heart"></i>
                        </button>
                    </div>

                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p class="author-name">${book.author}</p>
                    </div>
                `;

                card.onclick = () => {
                    window.location.href = `book.html?id=${book.id}`;
                };

                container.appendChild(card);
            });

        });
}

function removeFavorite(bookId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    favorites = favorites.filter(id => id !== bookId);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    loadFavorites(); // 🔥 إعادة تحميل
}