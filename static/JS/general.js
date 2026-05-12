/* --- 0. متغيرات عامة --- */
let userFavorites = []; // قائمة المفضلات الخاصة بالمستخدم من قاعدة البيانات

// جلب المفضلات من قاعدة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    fetchUserFavorites();
});

/* --- 1. إدارة القائمة (Mobile Menu) --- */
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.getElementById("mobile-menu"); // ← غيّرت دي

if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("open");
        mobileMenu.classList.toggle("open"); // ← وغيّرت دي
    });
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav") && mobileMenu?.classList.contains("open")) {
        hamburger.classList.remove("open");
        mobileMenu.classList.remove("open"); // ← وغيّرت دي
    }
});

/* --- 2. منطق المفضلات (Toggle Favorite) --- */
function toggleFavorite(bookId, button) {
    // إرسال الطلب لـ Django View
    fetch(`/toggle-favorite/${bookId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 403) {
            showMessage("Please login first!", "error");
            return;
        }
        return response.json();
    })
    .then(data => {
        if (!data) return;
        const icon = button.querySelector('i');
        if (data.status === 'added') {
            button.classList.add('active');
            icon.classList.replace('fa-regular', 'fa-solid');
            showMessage("Added to favorites!", "success");
            // إضافة book ID إلى القائمة المحلية
            if (!userFavorites.includes(bookId)) {
                userFavorites.push(bookId);
            }
        } else {
            button.classList.remove('active');
            icon.classList.replace('fa-solid', 'fa-regular');
            showMessage("Removed from favorites", "info");
            // إزالة book ID من القائمة المحلية
            userFavorites = userFavorites.filter(id => id !== bookId);
        }
    })
    .catch(err => console.error("Error:", err));
}

/* --- 3. وظائف المفضلات --- */
function fetchUserFavorites() {
    /**
     * جلب قائمة المفضلات من قاعدة البيانات
     * تعمل فقط للمستخدمين المسجلين
     */
    fetch('/api/user-favorites/')
        .then(response => response.json())
        .then(data => {
            userFavorites = data.favorites || [];
        })
        .catch(err => {
            // إذا حدث خطأ، يعني المستخدم غير مسجل دخول
            userFavorites = [];
        });
}

function isFavorite(bookId) {
    /**
     * تتحقق إذا كان الكتاب مضافاً للمفضلات
     */
    return userFavorites.includes(bookId);
}

/* --- 4. وظائف مساعدة --- */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
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
    setTimeout(() => { msg.className = ""; }, 3000);
}

// general.js
const toggleBtn = document.getElementById('dark-mode-toggle');
const body = document.body;
const icon = toggleBtn.querySelector('i');

// 1. التشيك على الموود المحفوظ أول ما الصفحة تفتح
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
}

// 2. التبديل عند الضغط
toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        localStorage.setItem('theme', 'light');
        icon.classList.replace('fa-sun', 'fa-moon');
    }
});