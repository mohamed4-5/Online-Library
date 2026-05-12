// التعريفات الأساسية
const borrowBtn = document.getElementById("borrow-btn");
const containerRelated = document.getElementById("related-books");
let currentBook = null;
let booksCatalog = [];

// جلب البيانات من Django (تم تمريرها في HTML)
if (typeof bookData !== 'undefined' && bookData) {
    currentBook = bookData;
    booksCatalog = typeof allBooksData !== 'undefined' ? allBooksData : [bookData];
    
    displayBookDetails(currentBook);
    syncFavoriteButton(currentBook);
    renderBorrowState(currentBook.id);
    updateReadButton(currentBook);

    // عرض الكتب المرتبطة
    const related = booksCatalog.filter(b => b.category === currentBook.category && b.id != currentBook.id);
    displayRelated(related.slice(0, 5));
}

// 2. عرض تفاصيل الكتاب
function displayBookDetails(book) {
    document.getElementById("book-img").src = book.image;
    document.getElementById("book-title").innerText = book.title;
    document.getElementById("book-author").innerText = "Author: " + book.author;
    document.getElementById("book-category").innerText = "Category: " + book.category;
    document.getElementById("book-description").innerText = book.description;
    document.getElementById("book-bg").style.backgroundImage = `url(${book.image})`;
}

// 3. حالة زر الاستعارة
function renderBorrowState(bookId) {
  if (!borrowBtn) return;
  const borrowed = isBookBorrowed(bookId);

  if (borrowed) {
    borrowBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> <span>Return book</span>';
    borrowBtn.classList.add("return-mode");
    borrowBtn.title = "Return this book to library";
  } else {
    borrowBtn.innerHTML = "<span>Borrow Now</span>";
    borrowBtn.classList.remove("return-mode");
    borrowBtn.title = "Borrow this book";
  }
}

// 4. حدث الضغط على الاستعارة
if (borrowBtn) {
  borrowBtn.addEventListener("click", () => {
    if (!currentBook) return;

    if (isBookBorrowed(currentBook.id)) {
      returnBookById(currentBook.id);
      alert("Book returned successfully!");
    } else {
      const result = borrowBookById(currentBook.id);
      if (!result.ok) {
        if (result.msg === "Choose a plan first!") {
          alert("Please choose a subscription plan first.");
          window.location.href = "plans.html";
        } else { alert(result.msg); }
        return;
      }
      //alert("Book borrowed successfully! Enjoy reading 📖");
    }
    renderBorrowState(currentBook.id);
    updateReadButton(currentBook);
  });
}

// 5. زر المفضلة
function syncFavoriteButton(book) {
    const btn = document.getElementById("favorite-btn");
    if (!btn) return;
    const active = isFavorite(book.id);
    btn.classList.toggle("active", active);
    btn.querySelector("i").className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";

    btn.onclick = () => toggleFavorite(book.id, btn);
}

// 6. زر القراءة (يفتح فقط إذا تم استعارة الكتاب)
function updateReadButton(book) {
  const readBtn = document.getElementById("read-book-btn");
  if (!readBtn) return;
  const borrowed = isBookBorrowed(book.id);
  const hasPdf = book.pdf && book.pdf !== "#";

  if (borrowed && hasPdf) {
    readBtn.disabled = false;
    readBtn.classList.remove("read-book-btn--locked");
    readBtn.onclick = () => window.open(book.pdf, "_blank");
  } else {
    readBtn.disabled = true;
    readBtn.classList.add("read-book-btn--locked");
  }
}