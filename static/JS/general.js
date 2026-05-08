/* --- 1. إدارة القائمة (Mobile Menu) --- */
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const rigester = document.querySelector(".rigester");

if (hamburger && navLinks && rigester) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("open");
        navLinks.classList.toggle("open");
        rigester.classList.toggle("open");
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
        } else {
            button.classList.remove('active');
            icon.classList.replace('fa-solid', 'fa-regular');
            showMessage("Removed from favorites", "info");
        }
    })
    .catch(err => console.error("Error:", err));
}

/* --- 3. وظائف مساعدة --- */
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