document.addEventListener("DOMContentLoaded", () => {
    // لم نعد بحاجة لفحص localStorage للمستخدم لأن Django أرسل البيانات بالفعل
    
    // إذا كنت لا تزال تستخدم localStorage للمفضلات (مؤقتاً):
    renderProfileFavorites();
});

function renderProfileFavorites() {
    const grid = document.getElementById("profile-favorites-grid");
    if (!grid) return;

    // كود عرض المفضلات الخاص بك هنا...
    // تأكد من تغيير أي رابط "book.html" إلى مسار دجانجو
    // مثال: card.onclick = () => window.location.href = "/books/" + id;
}