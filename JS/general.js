/* ============================================
   hamburger.js
   ============================================ */

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const rigester = document.querySelector(".rigester");

function positionRigester() {
  if (!navLinks || !rigester) return;
  if (window.innerWidth <= 768) {
    const navEl = document.querySelector(".nav");
    const navHeight = navEl ? navEl.offsetHeight : 0;
    const linksHeight = navLinks.scrollHeight;
    rigester.style.top = navHeight + linksHeight + "px";
  } else {
    rigester.style.top = "";
  }
}

if (hamburger && navLinks && rigester) {
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    navLinks.classList.toggle("open", isOpen);
    positionRigester();
    rigester.classList.toggle("open", isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      rigester.classList.remove("open");
    });
  });

  rigester.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      rigester.classList.remove("open");
    }
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav")) {
    if (hamburger) hamburger.classList.remove("open");
    if (navLinks) navLinks.classList.remove("open");
    if (rigester) rigester.classList.remove("open");
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    if (hamburger) hamburger.classList.remove("open");
    if (navLinks) navLinks.classList.remove("open");
    if (rigester) {
      rigester.classList.remove("open");
      rigester.style.top = "";
    }
  }
});

function parseCurrentUser() {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Remove Favorites, Plans, Cart from nav.
 * Profile: not in nav-links — logged-in users get a pill on the far right (inside .rigester).
 */
function initAccountNav() {
  const navLinks = document.querySelector(".nav-links");
  const rig = document.querySelector(".rigester");
  if (!navLinks || !rig) return;

  navLinks
    .querySelectorAll(
      'a[href="favorites.html"], a[href="plans.html"], a[href="library cart.html"], a[href*="library%20cart"]'
    )
    .forEach((a) => a.remove());

  navLinks.querySelectorAll("a").forEach((a) => {
    const h = (a.getAttribute("href") || "").toLowerCase();
    if (h.includes("cart")) a.remove();
  });

  rig.querySelectorAll("a.nav-profile-pill").forEach((a) => a.remove());

  const profileInNav = navLinks.querySelector('a[href="profile.html"]');
  if (profileInNav) profileInNav.remove();

  const currentUser = parseCurrentUser();
  if (currentUser && (currentUser.username || currentUser.email)) {
    const pill = document.createElement("a");
    pill.href = "profile.html";
    pill.className = "nav-profile-pill";
    pill.title = "My profile";
    pill.setAttribute("aria-label", "My profile");

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-circle-user";
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "nav-profile-pill-text";
    label.textContent = currentUser.username || currentUser.email;

    pill.appendChild(icon);
    pill.appendChild(label);
    rig.appendChild(pill);
  }
}

function setActiveNavLink() {
  document.querySelectorAll(".nav-links a, a.nav-profile-pill").forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav");

  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});
function showMessage(text, type) {
    let msg = document.getElementById("message");
    if (!msg) return;
    msg.textContent = text;
    msg.className = type;

    setTimeout(() => {
        msg.textContent = "";
        msg.className = "";
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  initAccountNav();
  setActiveNavLink();

  const currentUser = parseCurrentUser();
  const loginBtn = document.querySelector(".login");
  const signupBtn = document.querySelector(".sign-up");

  if (currentUser) {
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
  }

  if (document.querySelector(".plans-container")) {
    updatePlanUI();
  }
});

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function selectPlan(plan) {
  // 1. نجيب عدد الكتب اللي اليوزر مستلفها حالياً
  const borrowedBooksCount = getBorrowedBooks().length;
  
  // 2. نجيب ليميت الخطة الجديدة اللي هو عايز يشترك فيها
  const newPlanLimit = getPlanLimit(plan);

  // 3. الفحص: هل عدد الكتب الحالية أكبر من ليميت الخطة الجديدة؟
  if (borrowedBooksCount > newPlanLimit) {
    alert(
      `Warning! ⚠️\n\n` +
      `You currently have ${borrowedBooksCount} books, but the ${plan} plan only allows ${newPlanLimit} books.\n\n` +
      `Please return some books first before downgrading your plan.`
    );
    return; // بنوقف التنفيذ هنا ومش بنغير الخطة
  }

  // 4. لو الفحص تمام (أو بيعمل Upgrade لخطة أعلى) بنكمل عادي
  localStorage.setItem("userPlan", plan);
  
  alert("Success! Your plan has been updated to: " + plan + " 🎉");

  // تحديث الـ UI
  if (typeof updatePlanUI === "function") updatePlanUI();

  // تحويل للبروفايل
  window.location.href = "profile.html";
}

// جلب الخطة الحالية
function getUserPlan() {
  return localStorage.getItem("userPlan");
}

// وظيفة تحديث شكل الكروت بناءً على الخطة المختارة
function updatePlanUI() {
  const currentPlan = getUserPlan();
  if (!currentPlan) return;

  const cards = document.querySelectorAll('.plan-card');
  
  cards.forEach(card => {
    const btn = card.querySelector('button');
    // استخراج اسم الخطة من حدث onclick (basic, standard, premium)
    const onclickAttr = btn.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes(currentPlan)) {
      // تمييز الكارد المختار
      card.classList.add('active-plan');
      btn.innerText = "Current Plan";
      btn.disabled = true;
      btn.style.background = "#555"; // لون محايد للتعطيل
      btn.style.cursor = "default";
    } else {
      card.classList.remove('active-plan');
      btn.innerText = "Choose Plan";
      btn.disabled = false;
      btn.style.background = ""; // يرجع للون الـ CSS الأصلي
      btn.style.cursor = "pointer";
    }
  });
}

function getBorrowedBooks() {
  return JSON.parse(localStorage.getItem("borrowed")) || [];
}

function getPlanLimit(plan) {
  if (plan === "basic") return 2;
  if (plan === "standard") return 5;
  if (plan === "premium") return 10;
  return 0;
}

function isBookBorrowed(bookId) {
  const borrowed = getBorrowedBooks();
  return borrowed.includes(bookId);
}

function canBorrowMore() {
  const plan = getUserPlan();
  if (!plan) return { ok: false, msg: "Choose a plan first!" };

  const borrowed = getBorrowedBooks();
  const limit = getPlanLimit(plan);

  if (borrowed.length >= limit) {
    return { ok: false, msg: "You reached your limit!" };
  }

  return { ok: true };
}

function borrowBookById(bookId) {
  const check = canBorrowMore();
  if (!check.ok) return check;

  let borrowed = getBorrowedBooks();

  if (borrowed.includes(bookId)) {
    return { ok: false, msg: "Already borrowed" };
  }

  borrowed.push(bookId);
  localStorage.setItem("borrowed", JSON.stringify(borrowed));

  return { ok: true };
}

/* ── Favorites (home, library, book details, favorites page) ── */
function getFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem("favorites"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(bookId) {
  return getFavorites().some((id) => id == bookId);
}

/**
 * @param bookId  id of the book
 * @param btn     optional heart button; updates icon/classes when provided
 */
function toggleFavorite(bookId, btn) {
  let favorites = getFavorites();
  const idx = favorites.findIndex((id) => id == bookId);

  if (idx !== -1) {
    favorites.splice(idx, 1);
    if (btn) {
      btn.classList.remove("active");
      btn.title = "Add to favorites";
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
      }
    }
  } else {
    favorites.push(bookId);
    if (btn) {
      btn.classList.add("active");
      btn.title = "Remove from favorites";
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      }
    }
  }

  saveFavorites(favorites);
}