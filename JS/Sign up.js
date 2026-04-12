let users = JSON.parse(localStorage.getItem("users"));

if (users === null) {
  users = [];
}
function signup() {
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  let email = document.getElementById("email").value.trim();
  let admin = document.getElementById("admin").checked;
  if (password !== confirmPassword) {
    showMessage("Passwords do not match","error");
    return;
  }

  let exists = users.some(user => user.email === email);
  if (exists) {
    showMessage("Email already exists!","error");
    return;
  }

  users.push({ username, email, password, admin });
  localStorage.setItem("users", JSON.stringify(users));

  showMessage("User registered successfully!","success");

  window.location.href = "login.html"; 

}