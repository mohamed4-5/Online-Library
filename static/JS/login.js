document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".toggle-password");
    const input = document.getElementById("password");

    if (toggle && input) {
        toggle.addEventListener("click", () => {
            if (input.type === "password") {
                input.type = "text";
                toggle.classList.replace("fa-eye", "fa-eye-slash");
                toggle.classList.add("active");
            } else {
                input.type = "password";
                toggle.classList.replace("fa-eye-slash", "fa-eye");
                toggle.classList.remove("active");
            }
        });
    }
});