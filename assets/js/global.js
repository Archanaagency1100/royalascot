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
});
