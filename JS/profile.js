document.addEventListener("DOMContentLoaded", () => {

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser ) {
        document.getElementById("userName").textContent = currentUser.username;
    } else {
    }

});