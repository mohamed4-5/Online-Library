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
<<<<<<< HEAD

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
=======
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


  function showMessage(text, type) {
    let msg = document.getElementById("message");
    msg.textContent = text;
    msg.className = type; 

    setTimeout(() => {
        msg.textContent = "";
        msg.className = "";
    }, 3000);
}
>>>>>>> 63a60b0 (profile)
