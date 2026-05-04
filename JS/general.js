/* --- 1. الأساسيات وجلب بيانات المستخدم الحالي --- */

/** جلب بيانات المستخدم المسجل حالياً من localStorage */
function parseCurrentUser() {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** * دالة عبقرية لإنشاء مفتاح فريد لكل مستخدم.
 * إذا كان المستخدم "ahmed" سيتحول المفتاح من "borrowed" إلى "borrowed_ahmed"
 */
function getUserKey(prefix) {
  const user = parseCurrentUser();
  if (!user || !user.email) return null;

  // تحويل الإيميل إلى نص بسيط بدون نقاط أو علامات (مثلاً mo2@gmail.com -> mo2gmailcom)
  // لضمان عدم حدوث تداخل أو أخطاء في مفاتيح الـ LocalStorage
  const safeEmail = user.email.replace(/[^a-zA-Z0-9]/g, ""); 
  
  return `${prefix}_${safeEmail}`;
}
/* --- 2. إدارة التنقل (Navigation & Mobile Menu) --- */

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

  document.querySelectorAll(".nav-links a, .rigester a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      rigester.classList.remove("open");
    });
  });
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav") && navLinks?.classList.contains("open")) {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    rigester.classList.remove("open");
  }
});

/* --- 3. تخصيص واجهة الحساب (Account UI) --- */

function initAccountNav() {
  const navLinks = document.querySelector(".nav-links");
  const rig = document.querySelector(".rigester");
  if (!navLinks || !rig) return;

  // تنظيف الروابط القديمة لتجنب التكرار
  navLinks.querySelectorAll('a[href="favorites.html"], a[href="plans.html"], a[href="profile.html"]').forEach(a => a.remove());
  rig.querySelectorAll("a.nav-profile-pill").forEach(a => a.remove());

  const currentUser = parseCurrentUser();
  if (currentUser) {
    // إخفاء أزرار تسجيل الدخول
    const loginBtn = document.querySelector(".login");
    const signupBtn = document.querySelector(".sign-up");
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";

    // إضافة "كبسولة" البروفايل في اليمين
    const pill = document.createElement("a");
    pill.href = "profile.html";
    pill.className = "nav-profile-pill";
    pill.innerHTML = `
      <i class="fa-solid fa-circle-user"></i>
      <span class="nav-profile-pill-text">${currentUser.username || currentUser.email}</span>
    `;
    rig.appendChild(pill);
  }
}

/* --- 4. منطق الاستعارة (Borrowed Books) - خاص بكل مستخدم --- */

function getBorrowedBooks() {
  const key = getUserKey("borrowed");
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key)) || [];
}

function getPlanLimit(plan) {
  const limits = { basic: 2, standard: 5, premium: 10 };
  return limits[plan] || 0;
}

function getUserPlan() {
  const key = getUserKey("userPlan");
  return key ? localStorage.getItem(key) : null;
}

function canBorrowMore() {
  const plan = getUserPlan();
  if (!plan) return { ok: false, msg: "Choose a plan first!" };
  const borrowed = getBorrowedBooks();
  if (borrowed.length >= getPlanLimit(plan)) return { ok: false, msg: "Limit reached!" };
  return { ok: true };
}

function borrowBookById(bookId) {
  const check = canBorrowMore();
  if (!check.ok) return check;

  let borrowed = getBorrowedBooks();
  if (borrowed.some(id => id == bookId)) return { ok: false, msg: "Already borrowed" };

  borrowed.push(bookId);
  localStorage.setItem(getUserKey("borrowed"), JSON.stringify(borrowed));
  return { ok: true };
}

function returnBookById(bookId) {
  const key = getUserKey("borrowed");
  if (!key) return;
  const borrowed = getBorrowedBooks().filter(id => id != bookId);
  localStorage.setItem(key, JSON.stringify(borrowed));
  return { ok: true };
}

function isBookBorrowed(bookId) {
  return getBorrowedBooks().some(id => id == bookId);
}

/* --- 5. منطق المفضلات (Favorites) - خاص بكل مستخدم --- */

function getFavorites() {
  const key = getUserKey("favorites");
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveFavorites(favorites) {
  const key = getUserKey("favorites");
  if (key) localStorage.setItem(key, JSON.stringify(favorites));
}

function toggleFavorite(bookId, btn) {
  let favorites = getFavorites();
  const idx = favorites.findIndex(id => id == bookId);

  if (idx !== -1) {
    favorites.splice(idx, 1);
    updateHeartIcon(btn, false);
  } else {
    favorites.push(bookId);
    updateHeartIcon(btn, true);
  }
  saveFavorites(favorites);
}

function updateHeartIcon(btn, isActive) {
  if (!btn) return;
  const icon = btn.querySelector("i");
  if (isActive) {
    btn.classList.add("active");
    btn.title = "Remove from favorites";
    if (icon) icon.className = "fa-solid fa-heart";
  } else {
    btn.classList.remove("active");
    btn.title = "Add to favorites";
    if (icon) icon.className = "fa-regular fa-heart";
  }
}

function isFavorite(bookId) {
  return getFavorites().some(id => id == bookId);
}

/* --- 6. منطق الخطط (Plans) --- */

function selectPlan(plan) {
  const borrowedCount = getBorrowedBooks().length;
  const newLimit = getPlanLimit(plan);

  if (borrowedCount > newLimit) {
    alert(`⚠️ Warning!\nYou have ${borrowedCount} books, but the ${plan} plan allows only ${newLimit}.\nPlease return some books first.`);
    return;
  }

  localStorage.setItem(getUserKey("userPlan"), plan);
  alert(`Plan updated to ${plan} 🎉`);
  window.location.href = "profile.html";
}

/* --- 7. التشغيل عند تحميل الصفحة --- */

document.addEventListener("DOMContentLoaded", () => {
  initAccountNav();
  
  // تفعيل رابط الصفحة الحالية في القائمة
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.href === window.location.href) link.classList.add("active");
  });

  if (document.querySelector(".plans-container")) {
    updatePlanUI();
  }
});

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}


function showMessage(text, type) {
    const msg = document.getElementById("message");
    if (!msg) return;

    msg.textContent = text;
    msg.className = type; 

    setTimeout(() => {
        msg.textContent = "";
        msg.className = "";
    }, 3000);
}