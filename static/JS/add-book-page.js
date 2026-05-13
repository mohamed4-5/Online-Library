(function () {
  const cfg = typeof window.ADD_BOOK_CONFIG !== "undefined" ? window.ADD_BOOK_CONFIG : {};
  const form = document.getElementById("addBookForm");
  const imageInput = document.getElementById("bookImageFile");
  const imageUploadBtn = document.getElementById("imageUploadBtn");
  const imageFileNameDisplay = document.getElementById("imageFileName");
  const coverPreview = document.getElementById("coverPreview");
  const pdfInput = document.getElementById("bookPdfFile");
  const pdfUploadBtn = document.getElementById("pdfUploadBtn");
  const pdfFileNameDisplay = document.getElementById("pdfFileName");
  const submitBtn = document.getElementById("submitBtn");

  if (
    !form ||
    !imageInput ||
    !imageUploadBtn ||
    !imageFileNameDisplay ||
    !coverPreview ||
    !pdfInput ||
    !pdfUploadBtn ||
    !pdfFileNameDisplay ||
    !submitBtn
  ) {
    return;
  }

  function getCsrfToken() {
    const inp = form.querySelector("[name=csrfmiddlewaretoken]");
    if (inp && inp.value) return inp.value;
    if (typeof getCookie === "function") return getCookie("csrftoken") || "";
    return "";
  }

  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      imageFileNameDisplay.classList.add("is-visible");
      imageFileNameDisplay.querySelector("span").textContent = file.name;
      imageUploadBtn.classList.add("has-file");
      imageUploadBtn.querySelector("span").textContent = "Change image";

      const reader = new FileReader();
      reader.onload = function (e) {
        coverPreview.classList.remove("empty");
        coverPreview.innerHTML = `<img src="${e.target.result}" alt="Cover preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  pdfInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      pdfFileNameDisplay.classList.add("is-visible");
      pdfFileNameDisplay.querySelector("span").textContent = file.name;
      pdfUploadBtn.classList.add("has-file");
      pdfUploadBtn.querySelector("span").textContent = "Change PDF";
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const category = document.getElementById("bookCategory").value;
    const description = document.getElementById("bookDescription").value.trim();
    const latestEl = document.getElementById("bookLatest");
    const mostReadEl = document.getElementById("bookMostRead");

    if (!title || !author || !category || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    const imageFile = imageInput.files[0];
    const pdfFile = pdfInput.files[0];
    if (!imageFile || !pdfFile) {
      alert("Please upload both a cover image and a PDF file.");
      return;
    }

    const postUrl = cfg.postUrl || form.getAttribute("action") || "/add_book/";
    const fd = new FormData();
    fd.append("title", title);
    fd.append("author", author);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("cover", imageFile);
    fd.append("pdf", pdfFile);
    if (latestEl && latestEl.checked) fd.append("latest", "on");
    if (mostReadEl && mostReadEl.checked) fd.append("most_read", "on");

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving…';

    fetch(postUrl, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCsrfToken(),
      },
      body: fd,
    })
      .then(async (res) => {
        let data = {};
        try {
          data = await res.json();
        } catch (_) {
          data = {};
        }
        if (!res.ok || !data.ok) {
          const err =
            data.error ||
            (res.status === 403
              ? "You do not have permission to add books."
              : "Could not save the book. Please try again.");
          throw new Error(err);
        }
        return data;
      })
      .then((data) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-plus-circle"></i> Add Book to Library';

        const toastMsg = document.getElementById("toastMsg");
        if (toastMsg) {
          toastMsg.textContent =
            data.message ||
            `"${title}" by ${author} has been added to the library.`;
        }
        const viewBook = document.getElementById("viewNewBookBtn");
        if (viewBook && data.book_id) {
          viewBook.href = `/book/${data.book_id}/`;
          viewBook.style.display = "inline-flex";
        }
        document.getElementById("successToast").classList.add("show");
      })
      .catch((e) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-plus-circle"></i> Add Book to Library';
        alert(e.message || "Something went wrong. Please try again.");
      });
  });

  function addAnother() {
    document.getElementById("successToast").classList.remove("show");
    form.reset();

    const viewBook = document.getElementById("viewNewBookBtn");
    if (viewBook) {
      viewBook.style.display = "none";
      viewBook.removeAttribute("href");
    }

    imageUploadBtn.classList.remove("has-file");
    imageUploadBtn.querySelector("span").textContent = "Choose cover image";
    imageFileNameDisplay.classList.remove("is-visible");
    coverPreview.classList.add("empty");
    coverPreview.innerHTML =
      '<div><i class="fa-regular fa-image"></i> Preview will appear here</div>';

    pdfUploadBtn.classList.remove("has-file");
    pdfUploadBtn.querySelector("span").textContent = "Choose PDF file";
    pdfFileNameDisplay.classList.remove("is-visible");
  }

  const addAnotherBtn = document.getElementById("addAnotherBtn");
  if (addAnotherBtn) addAnotherBtn.addEventListener("click", addAnother);
})();
