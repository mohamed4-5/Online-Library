document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".slide-btn[data-slider-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-slider-target");
      if (!id) return;
      if (btn.classList.contains("left")) slideLeft(id);
      else slideRight(id);
    });
  });
});

function slideRight(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.scrollBy({ left: (220 + 15) * 2, behavior: "smooth" });
}

function slideLeft(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.scrollBy({ left: -(220 + 15) * 2, behavior: "smooth" });
}
