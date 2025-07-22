// Simple toolbar test - bypassing main-grid.js complexity
// This will help us determine if the main-grid.js is causing the issue

(function () {
  console.log("🧪 Testing simple toolbar functionality...");

  // Wait for DOM to be ready
  function initSimpleToolbar() {
    const filterBtn = document.querySelector(".filter-btn");
    const sortBtn = document.querySelector(".sort-btn");
    const filterDropdown = document.querySelector(".filter-dropdown");
    const sortDropdown = document.querySelector(".sort-dropdown");

    if (!filterBtn || !sortBtn || !filterDropdown || !sortDropdown) {
      console.log("❌ Toolbar elements not found");
      console.log({
        filterBtn: !!filterBtn,
        sortBtn: !!sortBtn,
        filterDropdown: !!filterDropdown,
        sortDropdown: !!sortDropdown,
      });
      return;
    }

    console.log("✅ All toolbar elements found");

    // Remove all existing event listeners by cloning elements
    const newFilterBtn = filterBtn.cloneNode(true);
    const newSortBtn = sortBtn.cloneNode(true);
    filterBtn.parentNode.replaceChild(newFilterBtn, filterBtn);
    sortBtn.parentNode.replaceChild(newSortBtn, sortBtn);

    console.log("🔄 Cloned buttons to remove existing listeners");

    // Add simple click handlers
    newFilterBtn.addEventListener("click", function (e) {
      console.log("🖱️ SIMPLE FILTER CLICK WORKS!");
      e.preventDefault();
      e.stopPropagation();

      // Simple toggle
      const isVisible = filterDropdown.style.display === "block";
      filterDropdown.style.display = isVisible ? "none" : "block";
      newFilterBtn.setAttribute("aria-expanded", !isVisible);

      // Hide sort dropdown
      sortDropdown.style.display = "none";
      newSortBtn.setAttribute("aria-expanded", "false");

      console.log(`Filter dropdown is now: ${filterDropdown.style.display}`);
    });

    newSortBtn.addEventListener("click", function (e) {
      console.log("🖱️ SIMPLE SORT CLICK WORKS!");
      e.preventDefault();
      e.stopPropagation();

      // Simple toggle
      const isVisible = sortDropdown.style.display === "block";
      sortDropdown.style.display = isVisible ? "none" : "block";
      newSortBtn.setAttribute("aria-expanded", !isVisible);

      // Hide filter dropdown
      filterDropdown.style.display = "none";
      newFilterBtn.setAttribute("aria-expanded", "false");

      console.log(`Sort dropdown is now: ${sortDropdown.style.display}`);
    });

    // Add simple document click to close dropdowns
    document.addEventListener("click", function (e) {
      if (
        !newFilterBtn.contains(e.target) &&
        !filterDropdown.contains(e.target)
      ) {
        filterDropdown.style.display = "none";
        newFilterBtn.setAttribute("aria-expanded", "false");
      }

      if (!newSortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
        sortDropdown.style.display = "none";
        newSortBtn.setAttribute("aria-expanded", "false");
      }
    });

    console.log("✅ Simple toolbar functionality attached!");
    console.log("💡 Try clicking the filter and sort buttons now");

    // Add visual indicators
    newFilterBtn.style.border = "2px solid green";
    newSortBtn.style.border = "2px solid blue";

    // Test the functionality programmatically
    setTimeout(() => {
      console.log("🧪 Testing programmatic click...");
      newFilterBtn.click();
    }, 1000);
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSimpleToolbar);
  } else {
    // Give main-grid a chance to initialize first
    setTimeout(initSimpleToolbar, 2000);
  }

  // Also expose as global function for manual testing
  window.testSimpleToolbar = initSimpleToolbar;
})();
