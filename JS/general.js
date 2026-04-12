/* ============================================
   hamburger.js
   ============================================ */

const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
const rigester  = document.querySelector('.rigester');

// حساب موضع rigester تحت nav-links
function positionRigester() {
  if (window.innerWidth <= 768) {
    const navHeight   = document.querySelector('.nav').offsetHeight;
    const linksHeight = navLinks.scrollHeight;
    rigester.style.top = (navHeight + linksHeight) + 'px';
  } else {
    rigester.style.top = '';
  }
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  positionRigester();
  rigester.classList.toggle('open', isOpen);
});

// إغلاق لو دوس على لينك
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    rigester.classList.remove('open');
  });
});

// إغلاق لو دوس برا القايمة
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    rigester.classList.remove('open');
  }
});

// reset لو اتفتحت على desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    rigester.classList.remove('open');
    rigester.style.top = '';
  }
});

const links = document.querySelectorAll(".nav-links a");

links.forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});

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
    msg.textContent = text;
    msg.className = type;

    setTimeout(() => {
        msg.textContent = "";
        msg.className = "";
    }, 3000);
}
document.addEventListener("DOMContentLoaded", () => {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let loginBtn = document.querySelector(".login");
    let signupBtn = document.querySelector(".sign-up");
    let logoutBtn = document.querySelector(".logout");

    if (currentUser) {
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
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

// تشغيل التحديث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تشغيل الهامبرجر والميزات الأخرى
    // ... كود الهامبرجر بتاعك ...

    // تشغيل تحديث الخطط لو في صفحة الخطط
    if (document.querySelector('.plans-container')) {
        updatePlanUI();
    }
});

// باقي وظائف الاستعارة (Keep them as they are)
function getBorrowedBooks() { return JSON.parse(localStorage.getItem("borrowed")) || []; }
function isBookBorrowed(bookId) { return getBorrowedBooks().includes(bookId); }
// ... إلخ


function getBorrowedBooks() {
  return JSON.parse(localStorage.getItem("borrowed")) || [];
}

function getUserPlan() {
  return localStorage.getItem("userPlan");
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