// Plans.js
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".plan-card button[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const plan = btn.getAttribute("data-plan");
      
      // إرسال الطلب للسيرفر لتغيير الخطة
      fetch('/select-plan/', {
          method: 'POST',
          headers: {
              'X-CSRFToken': getCookie('csrftoken'), // دالة getCookie موجودة عندك في general.js
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ plan: plan })
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === 'success') {
              // عمل ريفريش للصفحة عشان الـ CSS الجديد يظهر (Active Plan)
              window.location.reload();
          }
      })
      .catch(err => console.error("Error:", err));
    });
  });
});