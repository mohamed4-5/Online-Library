document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); // هذا السطر يمنع ظهور البيانات في الرابط ويوقف الـ Refresh
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            
            // جلب المستخدمين
            const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
            const user = allUsers.find(u => u.email === email && u.password === password);

            if (!user) {
              showMessage("Invalid email or password", "error");
                return;
            }

            localStorage.removeItem("currentUser");
            localStorage.setItem("currentUser", JSON.stringify({
                username: user.username,
                email: user.email,
                admin: !!user.admin
            }));
              showMessage("Login successful! Redirecting...", "success");
            setTimeout(() => {
               window.location.href = "profile.html";
            }, 1000);
           
        });
    }
});