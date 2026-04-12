/**
 * Profile: requires login. Shows personal info, subscription plan, favorites (same heart UX as home).
 */

function readCurrentUser() {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let profileBooks = [];

async function loadProfileBooks() {
  try {
    const res = await fetch("../data/books.json");
    profileBooks = await res.json();
  } catch {
    profileBooks = [];
  }
  try {
    const userBooks = JSON.parse(localStorage.getItem("userBooks") || "[]");
    userBooks.forEach((b) => {
      if (!profileBooks.find((x) => x.id === b.id)) profileBooks.push(b);
    });
  } catch {
    /* ignore */
  }
}

function planDisplayName(plan) {
  if (!plan) return "";
  const p = String(plan).toLowerCase();
  if (p === "basic") return "Basic — free, up to 2 books";
  if (p === "standard") return "Standard — up to 5 books";
  if (p === "premium") return "Premium — up to 10 books";
  return plan;
}

function renderPlanSection() {
  const line = document.getElementById("planLine");
  const cta = document.getElementById("planCta");
  const plan = typeof getUserPlan === "function" ? getUserPlan() : null;
  if (!line) return;

  if (plan) {
    line.textContent = "Your current plan: " + planDisplayName(plan);
    if (cta) {
      cta.textContent = "Change plan";
      cta.href = "plans.html";
    }
  } else {
    line.textContent =
      "You have not chosen a plan yet. Pick one to borrow books according to your limit.";
    if (cta) {
      cta.textContent = "View plans & subscribe";
      cta.href = "plans.html";
    }
  }
}

function bookHasReadablePdf(book) {
  if (!book || !book.pdf) return false;
  const p = String(book.pdf).trim();
  return p !== "" && p !== "#";
}

function renderBorrowedBooks() {
  const grid = document.getElementById("profile-borrowed-grid");
  const empty = document.getElementById("profile-borrowed-empty");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  const ids =
    typeof getBorrowedBooks === "function" ? getBorrowedBooks() : [];
  const books = ids
    .map((id) => profileBooks.find((b) => b.id == id))
    .filter(Boolean);

  if (books.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card profile-borrowed-card";

    const wrap = document.createElement("div");
    wrap.className = "book-image-wrapper";

    const img = document.createElement("img");
    img.src = book.image;
    img.alt = book.title;
    img.onerror = () => {
      img.src = "../images/book-placeholder.jpg";
    };

    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = book.category;

    wrap.appendChild(img);
    wrap.appendChild(badge);

    const info = document.createElement("div");
    info.className = "book-info";
    const h3 = document.createElement("h3");
    h3.textContent = book.title;
    const author = document.createElement("p");
    author.className = "author-name";
    author.textContent = book.author;
    info.appendChild(h3);
    info.appendChild(author);

    const actions = document.createElement("div");
    actions.className = "profile-borrowed-actions";

    const readPdf = document.createElement("button");
    readPdf.type = "button";
    readPdf.className = "profile-read-pdf-btn";
    readPdf.innerHTML =
      '<i class="fa-solid fa-file-pdf" aria-hidden="true"></i> Read PDF';
    if (bookHasReadablePdf(book)) {
      readPdf.disabled = false;
      readPdf.title = "Open PDF in a new tab";
      readPdf.addEventListener("click", (e) => {
        e.stopPropagation();
        window.open(book.pdf, "_blank", "noopener,noreferrer");
      });
    } else {
      readPdf.disabled = true;
      readPdf.title = "No PDF for this book";
    }

    const openBook = document.createElement("button");
    openBook.type = "button";
    openBook.className = "profile-open-book-btn";
    openBook.textContent = "Book page";
    openBook.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `book.html?id=${book.id}`;
    });

    actions.appendChild(readPdf);
    actions.appendChild(openBook);

    info.appendChild(actions);

    card.appendChild(wrap);
    card.appendChild(info);
    card.addEventListener("click", () => {
      window.location.href = `book.html?id=${book.id}`;
    });

    grid.appendChild(card);
  });
}

function renderProfileFavorites() {
  const grid = document.getElementById("profile-favorites-grid");
  const empty = document.getElementById("profile-fav-empty");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  const ids = typeof getFavorites === "function" ? getFavorites() : [];
  const books = ids
    .map((id) => profileBooks.find((b) => b.id == id))
    .filter(Boolean);

  if (books.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";

    const wrap = document.createElement("div");
    wrap.className = "book-image-wrapper";

    const img = document.createElement("img");
    img.src = book.image;
    img.alt = book.title;
    img.onerror = () => {
      img.src = "../images/book-placeholder.jpg";
    };

    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = book.category;

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "fav-btn active";
    favBtn.title = "Remove from favorites";
    favBtn.setAttribute("aria-label", "Remove from favorites");
    favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(book.id, null);
      renderProfileFavorites();
    });

    wrap.appendChild(img);
    wrap.appendChild(badge);
    wrap.appendChild(favBtn);

    const info = document.createElement("div");
    info.className = "book-info";
    const h3 = document.createElement("h3");
    h3.textContent = book.title;
    const author = document.createElement("p");
    author.className = "author-name";
    author.textContent = book.author;
    info.appendChild(h3);
    info.appendChild(author);

    card.appendChild(wrap);
    card.appendChild(info);
    card.addEventListener("click", () => {
      window.location.href = `book.html?id=${book.id}`;
    });

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = readCurrentUser();
  if (!currentUser) {
    window.location.replace("login.html");
    return;
  }

  const nameEl = document.getElementById("displayName");
  const emailEl = document.getElementById("displayEmail");
  if (nameEl) nameEl.textContent = currentUser.username || "—";
  if (emailEl) emailEl.textContent = currentUser.email || "—";

  const adminBlock = document.querySelector(".admin");
  if (adminBlock) {
    adminBlock.style.display = currentUser.admin ? "block" : "none";
    const adminName = document.getElementById("adminDisplayName");
    if (adminName) adminName.textContent = currentUser.username || "";
  }

  await loadProfileBooks();
  renderPlanSection();
  renderProfileFavorites();
  renderBorrowedBooks();

  if (window.location.hash === "#favorites") {
    const el = document.getElementById("favorites-section");
    if (el) {
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }
});
