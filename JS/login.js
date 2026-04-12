
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    login();
  });
});
function login() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
    let users = JSON.parse(localStorage.getItem("users") || "[]");
let user=users.find(function(user){
return (user.password===password && user.email===email)
})
console.log(user);
  if (!user) {
        showMessage("Invalid email or password", "error");
    return;
  }
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      username: user.username,
      email: user.email,
      admin: !!user.admin,
    })
  );
 showMessage("Login successful!", "success");
    setTimeout(() => {
       window.location.href = "profile.html";
}, 1000);
}

 

