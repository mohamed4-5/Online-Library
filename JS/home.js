document.addEventListener('DOMContentLoaded', () => {
    fetch("../data/books.json")
    .then(res => res.json())
    .then(data => {
        const mostRead = data.filter(book => book.mostRead);
        const latest   = data.filter(book => book.latest);

        displayBooks(mostRead, "most-read");
        displayBooks(latest, "latest");
    })
    .catch(error => console.error("Error loading books:", error));

    document.querySelectorAll('.slide-btn[data-slider-target]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-slider-target');
            if (!id) return;
            if (btn.classList.contains('left')) slideLeft(id);
            else slideRight(id);
        });
    });
});


/* Favorites: getFavorites / toggleFavorite — defined in general.js */

/* ── Display books ── */
function displayBooks(books, containerId) {
    const container = document.getElementById(containerId);

    books.forEach(book => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        const favorited = isFavorite(book.id);

        card.innerHTML = `
            <div class="book-image-wrapper">
                <img src="${book.image}" alt="${book.title}">
                <span class="category-badge">${book.category}</span>
                <button class="fav-btn ${favorited ? 'active' : ''}"
                        title="${favorited ? 'Remove from favorites' : 'Add to favorites'}"
                        onclick="event.stopPropagation(); toggleFavorite(${book.id}, this)">
                    <i class="fa-${favorited ? 'solid' : 'regular'} fa-heart"></i>
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
}


/* ── Slider ── */
function slideRight(containerId) {
    const container = document.getElementById(containerId);
    container.scrollBy({ left: (220 + 15) * 2, behavior: 'smooth' });
}

function slideLeft(containerId) {
    const container = document.getElementById(containerId);
    container.scrollBy({ left: -(220 + 15) * 2, behavior: 'smooth' });
}