document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".plan-card button[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-plan");
      if (plan && typeof selectPlan === "function") selectPlan(plan);
    });
  });
});
