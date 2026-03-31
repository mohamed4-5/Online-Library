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