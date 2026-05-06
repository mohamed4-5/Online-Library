(function () {
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

    if (!title || !author || !category || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing…';

    const imageFile = imageInput.files[0];
    const pdfFile = pdfInput.files[0];

    const readFile = (file) => {
      return new Promise((resolve) => {
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    };

    Promise.all([readFile(imageFile), readFile(pdfFile)])
      .then(([imageData, pdfData]) => {
        const newBook = {
          id: Date.now(),
          title,
          author,
          category,
          description,
          image: imageData || "../images/book-placeholder.jpg",
          pdf: pdfData || "#",
          rating: 0,
          latest: true,
          mostRead: false,
          userAdded: true,
        };

        let stored = [];
        try {
          stored = JSON.parse(localStorage.getItem("userBooks")) || [];
        } catch {
          stored = [];
        }

        stored.push(newBook);
        localStorage.setItem("userBooks", JSON.stringify(stored));

        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-plus-circle"></i> Add Book to Library';

        document.getElementById("toastMsg").textContent =
          `"${title}" by ${author} has been added to the library!`;
        document.getElementById("successToast").classList.add("show");
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-plus-circle"></i> Add Book to Library';
        alert("Something went wrong processing the files. Please try again.");
      });
  });

  function addAnother() {
    document.getElementById("successToast").classList.remove("show");
    form.reset();

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
