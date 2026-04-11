document.addEventListener('DOMContentLoaded', () => {
    fetch("../data/books.json")
    .then(res => res.json())
    .then(data => {
        const mostRead = data.filter(book => book.mostRead);  
        const latest = data.filter(book => book.latest);  
        
        displayBooks(mostRead, "most-read");  
        displayBooks(latest, "latest");

    })
    .catch(error => console.error("Error loading books:", error));
});


function displayBooks(books, containerId) {
    const container = document.getElementById(containerId);
    
    books.forEach(book => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        card.onclick = () =>{
            window.location.href = `book.html?id=${book.id}`;
        };
        
        card.innerHTML = `  
            <div class="book-image-wrapper">
                <img src="${book.image}" alt="${book.title}">
                <span class="category-badge">${book.category}</span>
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>  
                <p class="author-name">${book.author}</p>   
            </div>
        `;  
        
        container.appendChild(card);
    });
}

function openBook(pdf) {
    window.open(pdf, "_blank");
}

function slideRight(containerId) {
    const container = document.getElementById(containerId);
    const cardWidth = 220 + 15; // عرض الكارد + gap
    container.scrollBy({ left: cardWidth * 2, behavior: 'smooth' }); // ضربنا في 2 عشان يقلب كتابين مع كل ضغطة
}

function slideLeft(containerId) {
    const container = document.getElementById(containerId);
    const cardWidth = 220 + 15;
    container.scrollBy({ left: -(cardWidth * 2), behavior: 'smooth' });
}