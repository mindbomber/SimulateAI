// Debug toolbar content script
// Paste this into the browser console to check toolbar content

function debugToolbarContent() {
  console.log("🔍 Debugging toolbar content...");

  const toolbar = document.querySelector(".scenario-controls-toolbar");
  if (!toolbar) {
    console.error("❌ Toolbar not found");
    return;
  }

  console.log("✅ Toolbar found:", toolbar);
  console.log("📏 Toolbar dimensions:", {
    width: toolbar.offsetWidth,
    height: toolbar.offsetHeight,
    display: getComputedStyle(toolbar).display,
    visibility: getComputedStyle(toolbar).visibility,
  });

  // Check search container
  const searchContainer = toolbar.querySelector(".search-container");
  if (searchContainer) {
    console.log("🔍 Search container found:", {
      width: searchContainer.offsetWidth,
      height: searchContainer.offsetHeight,
      display: getComputedStyle(searchContainer).display,
      children: searchContainer.children.length,
    });

    const searchInput = searchContainer.querySelector(".search-input");
    if (searchInput) {
      console.log("📝 Search input found:", {
        value: searchInput.value,
        placeholder: searchInput.placeholder,
        display: getComputedStyle(searchInput).display,
        width: searchInput.offsetWidth,
        height: searchInput.offsetHeight,
      });
    } else {
      console.error("❌ Search input not found in search container");
    }
  } else {
    console.error("❌ Search container not found");
  }

  // Check filter container
  const filterContainer = toolbar.querySelector(".filter-container");
  if (filterContainer) {
    console.log("🔽 Filter container found:", {
      width: filterContainer.offsetWidth,
      height: filterContainer.offsetHeight,
      display: getComputedStyle(filterContainer).display,
      children: filterContainer.children.length,
    });

    const filterBtn = filterContainer.querySelector(".filter-btn");
    if (filterBtn) {
      console.log("🔘 Filter button found:", {
        textContent: filterBtn.textContent.trim(),
        display: getComputedStyle(filterBtn).display,
        width: filterBtn.offsetWidth,
        height: filterBtn.offsetHeight,
      });
    } else {
      console.error("❌ Filter button not found in filter container");
    }
  } else {
    console.error("❌ Filter container not found");
  }

  // Check sort container
  const sortContainer = toolbar.querySelector(".sort-container");
  if (sortContainer) {
    console.log("📊 Sort container found:", {
      width: sortContainer.offsetWidth,
      height: sortContainer.offsetHeight,
      display: getComputedStyle(sortContainer).display,
      children: sortContainer.children.length,
    });

    const sortBtn = sortContainer.querySelector(".sort-btn");
    if (sortBtn) {
      console.log("🔘 Sort button found:", {
        textContent: sortBtn.textContent.trim(),
        display: getComputedStyle(sortBtn).display,
        width: sortBtn.offsetWidth,
        height: sortBtn.offsetHeight,
      });
    } else {
      console.error("❌ Sort button not found in sort container");
    }
  } else {
    console.error("❌ Sort container not found");
  }

  // Check controls group
  const controlsGroup = toolbar.querySelector(".controls-group");
  if (controlsGroup) {
    console.log("🎛️ Controls group found:", {
      width: controlsGroup.offsetWidth,
      height: controlsGroup.offsetHeight,
      display: getComputedStyle(controlsGroup).display,
      children: controlsGroup.children.length,
    });
  } else {
    console.error("❌ Controls group not found");
  }

  // Check if components are hidden by CSS
  console.log("🎨 CSS checks:");
  const searchInput = searchContainer?.querySelector(".search-input");
  const filterBtn = filterContainer?.querySelector(".filter-btn");
  const sortBtn = sortContainer?.querySelector(".sort-btn");

  if (searchInput) {
    console.log(
      "- Search input visibility:",
      getComputedStyle(searchInput).visibility,
    );
  }
  if (filterBtn) {
    console.log(
      "- Filter button visibility:",
      getComputedStyle(filterBtn).visibility,
    );
  }
  if (sortBtn) {
    console.log(
      "- Sort button visibility:",
      getComputedStyle(sortBtn).visibility,
    );
  }
}

// Auto-run and expose globally
window.debugToolbarContent = debugToolbarContent;
debugToolbarContent();
