document.addEventListener("DOMContentLoaded", async () => {
  const currentPage =
    window.location.pathname.split("/").pop().toLowerCase() || "index.html";
  const isHomePage = currentPage === "index.html";

  document.body.classList.add(isHomePage ? "site-home-page" : "site-inner-page");

  const loadTemplate = async (placeholderId, templatePath) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Could not load ${templatePath}: ${response.status}`);
      }
      placeholder.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  };

  const headerPromise = loadTemplate(
    "headerPlaceholder",
    "assets/templates/header-index.html",
  );
  const footerPromise = loadTemplate(
    "footerPlaceholder",
    "assets/templates/footer.html",
  );

  await headerPromise;

  const header =
    document.getElementById("mainHeader") ||
    document.getElementById("royalHeader");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle(
      "nav-scrolled",
      !isHomePage || window.scrollY > 25,
    );
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const pageNavKey = {
    "index.html": "home",
    "custom-suits.html": "suits",
    "wedding-suits.html": "suits",
    "bespoke-suits.html": "suits",
    "shirts.html": "shirts",
    "fabrics.html": "fabrics",
    "alterations.html": "alterations",
    "gallery.html": "gallery",
    "blog.html": "blog",
    "contact.html": "contact",
  }[currentPage];

  if (pageNavKey) {
    document
      .querySelectorAll(`[data-nav-link="${pageNavKey}"]`)
      .forEach((link) => link.classList.add("active"));
  }

  document
    .querySelectorAll(`a[href="${currentPage}"]`)
    .forEach((link) => link.setAttribute("aria-current", "page"));

  await footerPromise;

  if (typeof AOS !== "undefined") {
    AOS.init({
      once: true,
      duration: 850,
      easing: "ease-out-cubic",
      offset: 35,
    });
  }

  const yearElements = document.querySelectorAll(
    "[data-current-year], #currentYear, #year",
  );

  yearElements.forEach((year) => {
    year.textContent = new Date().getFullYear();
  });

  const reviewsTrack = document.querySelector(".reviews-track");

  if (reviewsTrack && !reviewsTrack.dataset.carouselReady) {
    reviewsTrack.dataset.carouselReady = "true";
    [...reviewsTrack.children].forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("button").forEach((button) => {
        button.setAttribute("tabindex", "-1");
      });
      reviewsTrack.appendChild(clone);
    });

    reviewsTrack.querySelectorAll("img").forEach((image) => {
      image.draggable = false;
    });

    const reviewsViewport = reviewsTrack.closest(".reviews-viewport");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let resumeAutoSlideAt = 0;
    let lastFrameTime = performance.now();

    const normalizeReviewScroll = () => {
      const loopWidth = reviewsTrack.scrollWidth / 2;
      if (!loopWidth) return;

      if (reviewsViewport.scrollLeft >= loopWidth) {
        reviewsViewport.scrollLeft -= loopWidth;
      } else if (reviewsViewport.scrollLeft <= 0) {
        reviewsViewport.scrollLeft += loopWidth;
      }
    };

    const moveReviews = (time) => {
      const elapsed = Math.min(time - lastFrameTime, 40);
      lastFrameTime = time;

      if (
        !isDragging &&
        time >= resumeAutoSlideAt &&
        !reduceMotion &&
        !document.hidden
      ) {
        reviewsViewport.scrollLeft += elapsed * 0.025;
        normalizeReviewScroll();
      }

      window.requestAnimationFrame(moveReviews);
    };

    reviewsViewport.scrollLeft = 1;
    window.requestAnimationFrame(moveReviews);

    reviewsViewport.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, a")) return;

      isDragging = true;
      dragStartX = event.clientX;
      dragStartScroll = reviewsViewport.scrollLeft;
      reviewsViewport.classList.add("is-dragging");
      reviewsViewport.setPointerCapture(event.pointerId);
    });

    reviewsViewport.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      reviewsViewport.scrollLeft =
        dragStartScroll - (event.clientX - dragStartX);
      const scrollBeforeNormalize = reviewsViewport.scrollLeft;
      normalizeReviewScroll();
      dragStartScroll +=
        reviewsViewport.scrollLeft - scrollBeforeNormalize;
    });

    const finishReviewDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      resumeAutoSlideAt = performance.now() + 1200;
      reviewsViewport.classList.remove("is-dragging");
      if (reviewsViewport.hasPointerCapture(event.pointerId)) {
        reviewsViewport.releasePointerCapture(event.pointerId);
      }
    };

    reviewsViewport.addEventListener("pointerup", finishReviewDrag);
    reviewsViewport.addEventListener("pointercancel", finishReviewDrag);
  }

  const reviewModalElement = document.getElementById("reviewModal");

  if (reviewModalElement && typeof bootstrap !== "undefined") {
    const reviewModal = new bootstrap.Modal(reviewModalElement);
    const modalImage = document.getElementById("reviewModalImage");
    const modalText = document.getElementById("reviewModalText");
    const modalTitle = document.getElementById("reviewModalTitle");
    const modalThumbnails = document.getElementById("reviewModalThumbnails");

    document.querySelectorAll(".review-read-more:not([tabindex='-1'])").forEach((button) => {
      button.addEventListener("click", () => {
        const images = button.dataset.reviewImages
          .split("|")
          .map((src) => src.trim())
          .filter(Boolean);
        const name = button.dataset.reviewName;

        modalText.textContent = `“${button.dataset.reviewText}”`;
        modalTitle.textContent = name;
        const showReviewImage = (src, index) => {
          modalImage.src = src;
          modalImage.alt = `${name} tailoring review photo ${index + 1}`;
        };

        showReviewImage(images[0], 0);
        modalThumbnails.innerHTML = "";

        images.forEach((src, index) => {
          const thumbnail = document.createElement("button");
          thumbnail.type = "button";
          thumbnail.className = `review-modal-thumb${index === 0 ? " active" : ""}`;
          thumbnail.setAttribute("aria-label", `Show review photo ${index + 1}`);
          thumbnail.innerHTML = `<img src="${src}" alt="" />`;

          thumbnail.addEventListener("click", () => {
            showReviewImage(src, index);
            modalThumbnails
              .querySelectorAll(".review-modal-thumb")
              .forEach((item) => item.classList.remove("active"));
            thumbnail.classList.add("active");
          });

          modalThumbnails.appendChild(thumbnail);
        });

        reviewModal.show();
      });
    });
  }
});
