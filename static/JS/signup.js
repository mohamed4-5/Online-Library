document.addEventListener("DOMContentLoaded", function () {
    const toggles = document.querySelectorAll(".toggle-password");
    toggles.forEach(icon => {
        icon.addEventListener("click", () => {
            const input = icon.parentElement.querySelector("input");
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    });
    // تأكد أنه لا يوجد أي كود هنا يحاول عمل submit للفورم!
});