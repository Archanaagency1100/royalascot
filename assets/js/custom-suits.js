(() => {
  "use strict";

  const initialisePage = () => {
    window.requestAnimationFrame(() => {
      const aosElement = document.querySelector("[data-aos]");

      if (
        window.AOS &&
        aosElement &&
        !aosElement.classList.contains("aos-init")
      ) {
        AOS.init({
          once: true,
          duration: 800,
          easing: "ease-out-cubic",
          offset: 35,
        });
      }
    });

    const markCustomSuitsActive = () => {
      document
        .querySelectorAll(
          '#headerPlaceholder a[href$="custom-suits.html"], ' +
          '#headerPlaceholder a[href="custom-suits.html"], ' +
          '#headerPlaceholder a[data-page="custom-suits"]'
        )
        .forEach((link) => {
          link.classList.add("active");
        });
    };

    markCustomSuitsActive();

    const headerPlaceholder =
      document.getElementById("headerPlaceholder");

    if (headerPlaceholder) {
      const observer = new MutationObserver(() => {
        markCustomSuitsActive();

        if (headerPlaceholder.children.length) {
          observer.disconnect();
        }
      });

      observer.observe(headerPlaceholder, {
        childList: true,
        subtree: true,
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialisePage,
      { once: true }
    );
  } else {
    initialisePage();
  }
})();