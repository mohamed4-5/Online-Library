[
  {
    "id": 1,
    "title": "Demon Girl",
    "author": "H.M. Ward",
    "category": "Fantasy",
    "image": "../images/demon.jpeg",
    "description": "Rae Wilder is plunged into a world of dark magic, fierce creatures, and ritual sacrifice. She must choose between staying human or embracing her dangerous magical birthright.",
    "rating": 4.5,
    "mostRead": true,
    "latest": true,
    "pdf": "#"
  },
  {
    "id": 2,
    "title": "Dracula",
    "author": "Bram Stoker",
    "category": "Horror",
    "image": "../images/dracula.jpeg",
    "description": "A young Englishman travels to Transylvania and encounters Count Dracula, unleashing terror upon London.",
    "rating": 4.8,
    "mostRead": true,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 3,
    "title": "The Time Machine",
    "author": "H.G. Wells",
    "category": "Science Fiction",
    "image": "../images/time-machine.jpeg",
    "description": "A brilliant fantasy exploring time travel and the future of humanity.",
    "rating": 4.6,
    "mostRead": false,
    "latest": true,
    "pdf": "#"
  },
  {
    "id": 4,
    "title": "The Country of the Blind",
    "author": "H.G. Wells",
    "category": "Philosophical Fiction",
    "image": "../images/blind.jpeg",
    "description": "A climber discovers a hidden valley where everyone is blind and believes he can rule them using his sight.",
    "rating": 4.4,
    "mostRead": false,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 5,
    "title": "The First Men in the Moon",
    "author": "H.G. Wells",
    "category": "Science Fiction",
    "image": "../images/moon.jpeg",
    "description": "Two men سفروا إلى القمر ويكتشفوا كائنات غريبة تُدعى Selenites في قصة مليانة خيال وسياسة.",
    "rating": 4.5,
    "mostRead": true,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 6,
    "title": "The Invisible Man",
    "author": "H.G. Wells",
    "category": "Science Fiction",
    "image": "../images/invisible.jpeg",
    "description": "A scientist turns himself invisible but loses control over his sanity.",
    "rating": 4.7,
    "mostRead": true,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 7,
    "title": "The Arabian Nights",
    "author": "Various Authors",
    "category": "Classic",
    "image": "../images/arabian.jpeg",
    "description": "A collection of legendary Middle Eastern stories told by Scheherazade to delay her execution.",
    "rating": 4.9,
    "mostRead": true,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 8,
    "title": "Adventures of Huckleberry Finn",
    "author": "Mark Twain",
    "category": "Adventure",
    "image": "../images/huck.jpeg",
    "description": "A journey of freedom along the Mississippi River with Huck and Jim.",
    "rating": 4.6,
    "mostRead": false,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 9,
    "title": "1601",
    "author": "Mark Twain",
    "category": "Satire",
    "image": "../images/1601.jpeg",
    "description": "A satirical and humorous diary-style narrative set in Queen Elizabeth's court.",
    "rating": 4.0,
    "mostRead": false,
    "latest": true,
    "pdf": "#"
  },
  {
    "id": 10,
    "title": "Antony and Cleopatra",
    "author": "William Shakespeare",
    "category": "Tragedy",
    "image": "../images/antony.jpeg",
    "description": "A tragic love story between Antony and Cleopatra filled with passion and political conflict.",
    "rating": 4.7,
    "mostRead": true,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 11,
    "title": "All for Love",
    "author": "John Dryden",
    "category": "Drama",
    "image": "../images/allforlove.jpeg",
    "description": "A tragic drama about love, power, and sacrifice inspired by Antony and Cleopatra.",
    "rating": 4.3,
    "mostRead": false,
    "latest": true,
    "pdf": "#"
  },
  {
    "id": 12,
    "title": "The Call of the Wild",
    "author": "Jack London",
    "category": "Adventure",
    "image": "../images/wild.jpeg",
    "description": "A domesticated dog returns to his wild instincts in the harsh Yukon.",
    "rating": 4.8,
    "mostRead": true,
    "latest": false,
    "pdf": "#"
  },
  {
    "id": 13,
    "title": "Adventure",
    "author": "Jack London",
    "category": "Adventure",
    "image": "../images/adventure.jpeg",
    "description": "A gripping survival story set in the Solomon Islands.",
    "rating": 4.4,
    "mostRead": false,
    "latest": true,
    "pdf": "#"
  },
  {
    "id": 14,
    "title": "Fast as the Wind",
    "author": "Unknown",
    "category": "Mystery",
    "image": "../images/fast.jpeg",
    "description": "A thrilling mystery involving a prison escape and horse racing.",
    "rating": 4.2,
    "mostRead": false,
    "latest": true,
    "pdf": "#"
  }
]

// ── Get favorites from localStorage
function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

// ── Save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// ── Check if a book is in favorites
function isFavorite(bookId) {
    return getFavorites().includes(bookId);
}

// ── Add a book to favorites
function addFavorite(bookId) {
    const favorites = getFavorites();
    if (!favorites.includes(bookId)) {
        favorites.push(bookId);
        saveFavorites(favorites);
    }
}

// ── Remove a book from favorites
function removeFavorite(bookId) {
    const favorites = getFavorites().filter(id => id !== bookId);
    saveFavorites(favorites);
}

// ── Toggle favorite
function toggleFavorite(bookId) {
    if (isFavorite(bookId)) {
        removeFavorite(bookId);
    } else {
        addFavorite(bookId);
    }
}

// ── Create a book card element
function createBookCard(book) {
    const card = document.createElement("div");
    card.classList.add("book-card");
    card.innerHTML = `
        <img src="${book.cover}" alt="${book.title}" onerror="this.src='../images/placeholder.jpg'">
        <div class="book-card-body">
            <p class="book-card-title">${book.title}</p>
            <p class="book-card-author">${book.author}</p>
        </div>
        <button class="fav-btn active" title="Remove from favorites" onclick="handleRemove(${book.id})">
            <i class="fa-solid fa-heart"></i>
        </button>
    `;
    return card;
}

// ── Handle remove button click
function handleRemove(bookId) {
    removeFavorite(bookId);
    renderFavorites();
}

// ── Show empty state
function showEmptyState() {
    const container = document.getElementById("favorites-container");
    container.innerHTML = `
        <div class="favorites-empty">
            <h1>لا يوجد كتب في تلك القائمة</h1>
            <a href="library.html">تصفح المكتبة</a>
        </div>
    `;
}

// ── Render favorites grid
function renderFavorites() {
    const container = document.getElementById("favorites-container");
    const favoriteIds = getFavorites();

    if (favoriteIds.length === 0) {
        showEmptyState();
        return;
    }

    const favoriteBooks = allBooks.filter(book => favoriteIds.includes(book.id));

    if (favoriteBooks.length === 0) {
        showEmptyState();
        return;
    }

    container.innerHTML = `<div class="favorites-grid"></div>`;
    const grid = container.querySelector(".favorites-grid");
    favoriteBooks.forEach(book => grid.appendChild(createBookCard(book)));
}

// ── Run on page load
document.addEventListener("DOMContentLoaded", renderFavorites);