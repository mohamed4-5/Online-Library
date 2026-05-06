// التعريفات الأساسية
const borrowBtn = document.getElementById("borrow-btn");
const containerRelated = document.getElementById("related-books");
let currentBook = null;
let booksCatalog = [];

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

// 1. جلب البيانات ودمجها
fetch("../data/books.json")
  .then((res) => res.json())
  .then((data) => {
    booksCatalog = [...data];
    
    // جلب الكتب المضافة بواسطة المستخدم الحالي فقط
    const user = parseCurrentUser();
    if (user) {
      const userKey = `userBooks_${user.username || user.email}`;
      const userBooks = JSON.parse(localStorage.getItem(userKey)) || [];
      userBooks.forEach((b) => {
        if (!booksCatalog.find((x) => x.id === b.id)) booksCatalog.push(b);
      });
    }

    const book = booksCatalog.find((b) => b.id == bookId);
    if (!book) {
      document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Book not found! 📚</h2>";
      return;
    }

    currentBook = book;
    displayBookDetails(book);
    syncFavoriteButton(book);
    renderBorrowState(book.id);
    updateReadButton(book);

    const related = booksCatalog.filter(b => b.category === book.category && b.id != book.id);
    displayRelated(related.slice(0, 5));
  })
  .catch(err => console.error("Error loading book:", err));

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