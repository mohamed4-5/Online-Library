const borrowBtn = document.getElementById("borrow-btn");
const containerRelated = document.getElementById("related-books");
let currentBook = null;
let booksCatalog = [];

/** Extra line for borrow/return popup: slots remaining on your plan */
function borrowSlotsLine(d) {
  if (!d || d.remaining === undefined || d.borrow_limit === undefined) return "";
  const { remaining, borrowed_count, borrow_limit } = d;
  return `\n\nYou can borrow ${remaining} more book(s). (${borrowed_count} of ${borrow_limit} currently on loan.)`;
}

function displayBookDetails(book) {
  const img = document.getElementById("book-img");
  const bg = document.getElementById("book-bg");
  if (img) img.src = book.image;
  const t = document.getElementById("book-title");
  if (t) t.innerText = book.title;
  const a = document.getElementById("book-author");
  if (a) a.innerText = "Author: " + book.author;
  const c = document.getElementById("book-category");
  if (c) c.innerText = "Category: " + book.category;
  const d = document.getElementById("book-description");
  if (d) d.innerText = book.description;
  if (bg) bg.style.backgroundImage = `url(${book.image})`;
}

function renderBorrowState(bookId) {
  if (!borrowBtn) return;
  const borrowed = typeof isBookBorrowed === "function" && isBookBorrowed(bookId);

  if (borrowed) {
    borrowBtn.innerHTML =
      '<i class="fa-solid fa-rotate-left"></i> <span>Return book</span>';
    borrowBtn.classList.add("return-mode");
    borrowBtn.title = "Return this book to library";
  } else {
    borrowBtn.innerHTML = "<span>Borrow Now</span>";
    borrowBtn.classList.remove("return-mode");
    borrowBtn.title = "Borrow this book";
  }
}

function syncFavoriteButton(book) {
  const btn = document.getElementById("favorite-btn");
  if (!btn) return;
  const active = typeof isFavorite === "function" && isFavorite(book.id);
  btn.classList.toggle("active", active);
  const ic = btn.querySelector("i");
  if (ic) ic.className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
  btn.onclick = () => toggleFavorite(book.id, btn);
}

function updateReadButton(book) {
  const readBtn = document.getElementById("read-book-btn");
  if (!readBtn) return;
  const borrowed =
    typeof isBookBorrowed === "function" && isBookBorrowed(book.id);
  const hasPdf = book.pdf && book.pdf !== "#";

  if (borrowed && hasPdf) {
    readBtn.disabled = false;
    readBtn.classList.remove("read-book-btn--locked");
    readBtn.onclick = () => window.open(book.pdf, "_blank", "noopener,noreferrer");
  } else {
    readBtn.disabled = true;
    readBtn.classList.add("read-book-btn--locked");
    readBtn.onclick = null;
  }
}

function displayRelated(books) {
  if (!containerRelated) return;
  if (!books.length) {
    containerRelated.innerHTML =
      '<p class="related-empty">No related books in this category yet.</p>';
    return;
  }
  containerRelated.classList.toggle("has-scroll", books.length > 3);
  containerRelated.innerHTML = books
    .map(
      (b) => `
    <div class="book-card" role="link" tabindex="0" data-href="/book/${b.id}/">
      <div class="book-image-wrapper">
        <img src="${b.image}" alt="${(b.title || "").replace(/"/g, "&quot;")}">
        <span class="category-badge">${b.category || ""}</span>
      </div>
      <div class="book-info">
        <h3>${b.title || ""}</h3>
        <p class="author-name">${b.author || ""}</p>
      </div>
    </div>`,
    )
    .join("");

  containerRelated.querySelectorAll(".book-card").forEach((card) => {
    const go = () => {
      const href = card.getAttribute("data-href");
      if (href) window.location.href = href;
    };
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
}

function wireRelatedSlider() {
  const prev = document.getElementById("prev-btn");
  const next = document.getElementById("next-btn");
  if (!containerRelated || !prev || !next) return;

  function updateNav() {
    const el = containerRelated;
    const maxScroll = el.scrollWidth - el.clientWidth - 2;
    prev.classList.toggle("hidden", el.scrollLeft <= 4);
    next.classList.toggle("hidden", el.scrollLeft >= maxScroll);
  }

  prev.addEventListener("click", () => {
    containerRelated.scrollBy({ left: -260, behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    containerRelated.scrollBy({ left: 260, behavior: "smooth" });
  });
  containerRelated.addEventListener("scroll", updateNav);
  window.addEventListener("resize", updateNav);
  updateNav();
}

async function initBookPage() {
  if (typeof bookData === "undefined" || !bookData) return;

  await Promise.all([
    typeof fetchUserFavorites === "function"
      ? fetchUserFavorites()
      : Promise.resolve(),
    typeof fetchUserBorrowed === "function"
      ? fetchUserBorrowed()
      : Promise.resolve(),
  ]);

  currentBook = bookData;
  booksCatalog =
    typeof allBooksData !== "undefined" && Array.isArray(allBooksData)
      ? allBooksData
      : [bookData];

  displayBookDetails(currentBook);
  syncFavoriteButton(currentBook);
  renderBorrowState(currentBook.id);
  updateReadButton(currentBook);

  const related = booksCatalog.filter(
    (b) => b.category === currentBook.category && b.id != currentBook.id,
  );
  displayRelated(related.slice(0, 12));
  wireRelatedSlider();

  if (borrowBtn) {
    borrowBtn.addEventListener("click", async () => {
      if (!currentBook) return;

      if (typeof isBookBorrowed === "function" && isBookBorrowed(currentBook.id)) {
        const ret = await returnBookById(currentBook.id);
        if (ret.ok) {
          await fetchUserBorrowed();
          if (typeof showAppModal === "function") {
            showAppModal(
              "Book returned",
              (ret.msg || "Book returned successfully.") + borrowSlotsLine(ret),
              "success",
            );
          }
        } else if (typeof showMessage === "function") {
          showMessage(ret.msg || "Could not return this book.", "error");
        }
      } else {
        const result = await borrowBookById(currentBook.id);
        if (!result.ok) {
          if (result.needs_plan) {
            if (typeof showMessage === "function") {
              showMessage(
                (result.msg || "Borrow limit reached.") + " Opening plans…",
                "info",
              );
            }
            setTimeout(() => {
              window.location.href = "/plans/";
            }, 1600);
            return;
          }
          if (
            (result.msg || "").toLowerCase().includes("log in") ||
            (result.msg || "").toLowerCase().includes("login")
          ) {
            if (typeof showMessage === "function") {
              showMessage((result.msg || "Please log in.") + " Redirecting…", "info");
            }
            setTimeout(() => {
              window.location.href = "/login/";
            }, 1400);
            return;
          }
          if (typeof showMessage === "function") {
            showMessage(result.msg || "Could not borrow this book.", "error");
          }
          return;
        }
        await fetchUserBorrowed();
        if (typeof showAppModal === "function") {
          showAppModal(
            "Borrowed",
            (result.msg || "Book borrowed successfully.") + borrowSlotsLine(result),
            "success",
          );
        }
      }
      renderBorrowState(currentBook.id);
      updateReadButton(currentBook);
    });
  }
}

document.addEventListener("DOMContentLoaded", initBookPage);
