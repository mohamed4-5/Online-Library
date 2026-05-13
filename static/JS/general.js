/* --- 0. متغيرات عامة --- */
let userFavorites = [];
let userBorrowedIds = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchUserFavorites();
  fetchUserBorrowed();
});

/* --- 1. إدارة القائمة (Mobile Menu) --- */
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.getElementById("mobile-menu");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav") && mobileMenu?.classList.contains("open")) {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
  }
});

/* --- Modal (borrow / return only) --- */
function closeAppModal() {
  const root = document.getElementById("app-modal-root");
  if (root) {
    root.remove();
  }
  document.body.classList.remove("app-modal-open");
}

function showAppModal(title, message, type = "info") {
  closeAppModal();

  const root = document.createElement("div");
  root.id = "app-modal-root";
  root.innerHTML = `
    <div class="app-modal-overlay" id="app-modal-overlay" aria-hidden="true"></div>
    <div class="app-modal" id="app-modal" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
      <button type="button" class="app-modal-close" id="app-modal-close" aria-label="Close">&times;</button>
      <h3 id="app-modal-title" class="app-modal-title"></h3>
      <p id="app-modal-body" class="app-modal-body"></p>
      <button type="button" class="app-modal-ok" id="app-modal-ok">OK</button>
    </div>`;
  document.body.appendChild(root);

  const close = () => closeAppModal();
  document.getElementById("app-modal-close").addEventListener("click", close);
  document.getElementById("app-modal-ok").addEventListener("click", close);
  document.getElementById("app-modal-overlay").addEventListener("click", close);

  const modal = document.getElementById("app-modal");
  const overlay = document.getElementById("app-modal-overlay");
  document.getElementById("app-modal-title").textContent = title || "Notice";
  document.getElementById("app-modal-body").textContent = message || "";
  modal.classList.remove("app-modal--success", "app-modal--error", "app-modal--info");
  modal.classList.add(
    type === "success" ? "app-modal--success" : type === "error" ? "app-modal--error" : "app-modal--info",
  );
  overlay.classList.add("is-open");
  modal.classList.add("is-open");
  document.body.classList.add("app-modal-open");
}

/* --- 2. المفضلات --- */
function toggleFavorite(bookId, button) {
  fetch(`/toggle-favorite/${bookId}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCookie("csrftoken") || "",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 403 || response.status === 401) {
        showMessage("Please log in first.", "error");
        return null;
      }
      return response.json();
    })
    .then((data) => {
      if (!data) return;
      const icon = button.querySelector("i");
      if (data.status === "added") {
        button.classList.add("active");
        icon.classList.replace("fa-regular", "fa-solid");
        showMessage("Added to favorites!", "success");
        const n = Number(bookId);
        if (!userFavorites.includes(n)) userFavorites.push(n);
      } else if (data.status === "removed") {
        button.classList.remove("active");
        icon.classList.replace("fa-solid", "fa-regular");
        showMessage("Removed from favorites", "info");
        const n = Number(bookId);
        userFavorites = userFavorites.filter((id) => id !== n);
      }
    })
    .catch((err) => console.error("Error:", err));
}

function fetchUserFavorites() {
  return fetch("/api/user-favorites/")
    .then((response) => (response.ok ? response.json() : { favorites: [] }))
    .then((data) => {
      userFavorites = (data.favorites || []).map(Number);
      return userFavorites;
    })
    .catch(() => {
      userFavorites = [];
      return userFavorites;
    });
}

function isFavorite(bookId) {
  return userFavorites.includes(Number(bookId));
}

function fetchUserBorrowed() {
  return fetch("/api/my-borrows/")
    .then((response) => (response.ok ? response.json() : { borrowed_ids: [] }))
    .then((data) => {
      userBorrowedIds = (data.borrowed_ids || []).map(Number);
      return userBorrowedIds;
    })
    .catch(() => {
      userBorrowedIds = [];
      return userBorrowedIds;
    });
}

function isBookBorrowed(bookId) {
  return userBorrowedIds.includes(Number(bookId));
}

async function borrowBookById(bookId) {
  try {
    const r = await fetch(`/api/borrow/${bookId}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken") || "",
        "Content-Type": "application/json",
      },
    });
    let data = {};
    try {
      data = await r.json();
    } catch (_) {
      /* ignore */
    }
    if (r.status === 401) {
      return { ok: false, msg: data.msg || "Please log in to borrow books." };
    }
    return {
      ok: !!data.ok,
      msg: data.msg || "",
      needs_plan: !!data.needs_plan,
      borrow_limit: data.borrow_limit,
      borrowed_count: data.borrowed_count,
      remaining: data.remaining,
    };
  } catch (e) {
    return { ok: false, msg: "Network error. Try again." };
  }
}

async function returnBookById(bookId) {
  try {
    const r = await fetch(`/api/return/${bookId}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken") || "",
        "Content-Type": "application/json",
      },
    });
    let data = {};
    try {
      data = await r.json();
    } catch (_) {
      /* ignore */
    }
    if (r.status === 401) {
      return { ok: false, msg: data.msg || "Please log in." };
    }
    return {
      ok: !!data.ok,
      msg: data.msg || "",
      borrow_limit: data.borrow_limit,
      borrowed_count: data.borrowed_count,
      remaining: data.remaining,
    };
  } catch (e) {
    return { ok: false, msg: "Network error." };
  }
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function showMessage(text, type) {
  const msg = document.getElementById("message");
  if (!msg) return;
  msg.textContent = text;
  msg.className = `show ${type}`;
  setTimeout(() => {
    msg.className = "";
  }, 3000);
}

/* --- Dark mode --- */
const toggleBtn = document.getElementById("dark-mode-toggle");
const body = document.body;
if (toggleBtn) {
  const icon = toggleBtn.querySelector("i");
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    if (icon) icon.classList.replace("fa-moon", "fa-sun");
  }
  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (!icon) return;
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      icon.classList.replace("fa-moon", "fa-sun");
    } else {
      localStorage.setItem("theme", "light");
      icon.classList.replace("fa-sun", "fa-moon");
    }
  });
}
