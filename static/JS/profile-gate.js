(function () {
  try {
    if (!localStorage.getItem("currentUser")) {
      window.location.replace("login.html");
    }
  } catch (e) {
    window.location.replace("login.html");
  }
})();
