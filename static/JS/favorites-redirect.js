(function () {
  try {
    var raw = localStorage.getItem("currentUser");
    if (!raw) {
      window.location.replace("login.html");
      return;
    }
    JSON.parse(raw);
  } catch (e) {
    window.location.replace("login.html");
    return;
  }
  window.location.replace("profile.html#favorites");
})();
