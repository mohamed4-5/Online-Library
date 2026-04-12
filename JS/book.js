// 1. التعريفات في البداية لضمان وجودها
const borrowBtn = document.getElementById("borrow-btn");
const containerRelated = document.getElementById("related-books");
let currentBook = null; 

// جلب المعرف من الرابط
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

// 2. تنفيذ الجلب (Fetch)
fetch("../data/books.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load books");
    return res.json();
  })
  .then(data => {
    const book = data.find(b => b.id == bookId);
    
    if (!book) {
      document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Book not found! 📚</h2>";
      return;
    }

    currentBook = book;
    displayBookDetails(book);
    renderBorrowState(book.id);

    // جلب الكتب المشابهة
    const related = data.filter(b => b.category === book.category && b.id != book.id);
    displayRelated(related.slice(0, 4));
  })
  .catch(err => console.error("Error:", err));

// 3. وظيفة عرض بيانات الكتاب
function displayBookDetails(book) {
    document.getElementById("book-img").src = book.image;
    document.getElementById("book-title").innerText = book.title;
    document.getElementById("book-author").innerText = "Author: " + book.author;
    document.getElementById("book-category").innerText = "Category: " + book.category;
    document.getElementById("book-description").innerText = book.description;
    document.getElementById("book-bg").style.backgroundImage = `url(${book.image})`;
}

function displayRelated(books) {
  const container = document.getElementById("related-books");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  // 1. تفريغ الحاوية تماماً في البداية
  container.innerHTML = "";

  // 2. التحقق لو مفيش كتب (قائمة فاضية)
  if (books.length === 0) {
    // إخفاء أزرار التنقل لأن ملهاش لازمة
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";

    // عرض رسالة "لا توجد كتب" بتنسيق شيك
    container.innerHTML = `
      <div style="width: 100%; text-align: center; padding: 50px 0; color: #94a3b8;">
        <i class="fa-solid fa-book-open" style="font-size: 40px; margin-bottom: 15px; display: block; opacity: 0.5;"></i>
        <p style="font-size: 18px; font-weight: 500;">No related books found in this category... 📚</p>
        <p style="font-size: 14px; margin-top: 5px;">Try exploring other categories!</p>
      </div>
    `;
    return; // نوقف التنفيذ هنا
  }

  // 3. لو فيه كتب، نحدد أول 5 فقط
  const relatedBooks = books.slice(0, 5);

  // 4. التحكم في ظهور الأزرار والسنترة بناءً على العدد
  if (relatedBooks.length <= 4) {
    if (prevBtn) prevBtn.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");
    container.classList.remove("has-scroll");
  } else {
    if (prevBtn) prevBtn.classList.remove("hidden");
    if (nextBtn) nextBtn.classList.remove("hidden");
    container.classList.add("has-scroll");
  }

  // 5. بناء الكروت وعرضها
  relatedBooks.forEach(book => {
    const card = document.createElement("div");
    card.classList.add("book-card");
    card.onclick = () => window.location.href = `book.html?id=${book.id}`;
    
    card.innerHTML = `
      <div class="book-image-wrapper">
        <img src="${book.image}" alt="${book.title}">
        <span class="category-badge">${book.category}</span>
      </div>
      <div class="book-info">
        <h3>${book.title}</h3>
        <p style="font-size: 13px; color: #777; margin-top:5px;">${book.author}</p>
      </div>
    `;
    container.appendChild(card);
  });

  // 6. برمجة حركة الأزرار (لو موجودة)
  if (nextBtn) nextBtn.onclick = () => container.scrollBy({ left: 250, behavior: 'smooth' });
  if (prevBtn) prevBtn.onclick = () => container.scrollBy({ left: -250, behavior: 'smooth' });
}


// 5. التحكم في زر الاستعارة
function renderBorrowState(bookId) {
  if (!borrowBtn) return;

  if (isBookBorrowed(bookId)) {
    borrowBtn.innerText = "Borrowed ✓";
    borrowBtn.classList.add("borrowed");
    borrowBtn.disabled = true;
    borrowBtn.style.opacity = "0.6"; // لمسة UX لبيان التعطيل
  } else {
    borrowBtn.innerText = "Borrow Now";
    borrowBtn.classList.remove("borrowed");
    borrowBtn.disabled = false;
    borrowBtn.style.opacity = "1";
  }
}

// 6. حدث الضغط على الزر
borrowBtn.addEventListener("click", () => {
  if (!currentBook) return;

  const result = borrowBookById(currentBook.id);

  if (!result.ok) {
    // لو الرسالة بتقول اختار خطة، وّديه الصفحة فوراً
    if (result.msg === "Choose a plan first!") {
      alert("You need to choose a plan before borrowing! 📚");
      window.location.href = "plans.html"; // تأكد من اسم ملف صفحة الخطط عندك
    } else {
      // لو المشكلة تانية (زي إنه وصل للـ limit) يظهر alert عادي
      alert(result.msg);
    }
    return;
  }

  // تحديث الشكل فوراً
  renderBorrowState(currentBook.id);
  
  // إضافة تأثير بصري بسيط (Optional UX)
  borrowBtn.style.transform = "scale(0.95)";
  setTimeout(() => borrowBtn.style.transform = "scale(1)", 100);
});