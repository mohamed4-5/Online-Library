document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    
    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();
            
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (password !== confirmPassword) {
                showMessage("Passwords do not match", "error");
                return;
            }

            const allUsers = JSON.parse(localStorage.getItem("users") || "[]");

            if (allUsers.some(u => u.email === email)) {
                showMessage("Email already registered!", "error");
                return;
            }

            // إضافة المستخدم
            allUsers.push({ username, email, password, admin: false });
            localStorage.setItem("users", JSON.stringify(allUsers));

            // تسجيل الدخول فوراً للمستخدم الجديد
            localStorage.removeItem("currentUser");
            localStorage.setItem("currentUser", JSON.stringify({ username, email, admin: false }));

            // إنشاء مفتاح الخطة (Plan)
            const safeEmail = email.replace(/[^a-zA-Z0-9]/g, ""); 
            localStorage.setItem(`userPlan_${safeEmail}`, "basic");

            showMessage("Account created! Welcome " + username, "success");
            
            setTimeout(() => {
                window.location.href = "profile.html";
            }, 1000);
        });
    }
});

const toggles = document.querySelectorAll(".toggle-password");

toggles.forEach(icon => {
  icon.addEventListener("click", () => {
    const input = icon.parentElement.querySelector("input");

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
      icon.classList.add("active");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
      icon.classList.remove("active");
    }
  });
});