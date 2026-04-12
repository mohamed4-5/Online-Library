let users = JSON.parse(localStorage.getItem("users") || "[]");

function signup() {
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  let email = document.getElementById("email").value.trim();
  let admin = document.getElementById("admin").checked;

  if (password !== confirmPassword) {
    showMessage("Passwords do not match", "error");
    return;
  }

  let exists = users.some((user) => user.email === email);
  if (exists) {
    showMessage("Email already exists!", "error");
    return;
  }

  const newUser = { username, email, password, admin };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  const session = { username, email, admin: !!admin };
  localStorage.setItem("currentUser", JSON.stringify(session));

  showMessage("Account created! Opening your profile…", "success");
  setTimeout(() => {
    window.location.href = "profile.html";
  }, 800);
}
