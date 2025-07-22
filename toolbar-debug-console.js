// Debug script to test toolbar button functionality
// Paste this into browser console on the main SimulateAI page

(function () {
  console.log("🔍 Starting toolbar button debug...");

  // Find buttons
  const filterBtn = document.querySelector(".filter-btn");
  const sortBtn = document.querySelector(".sort-btn");
  const filterDropdown = document.querySelector(".filter-dropdown");
  const sortDropdown = document.querySelector(".sort-dropdown");

  console.log("Button discovery:", {
    filterBtn: !!filterBtn,
    sortBtn: !!sortBtn,
    filterDropdown: !!filterDropdown,
    sortDropdown: !!sortDropdown,
  });

  if (!filterBtn || !sortBtn) {
    console.error("❌ Buttons not found. Are you on the scenario view?");
    return;
  }

  // Add border to buttons for visibility
  filterBtn.style.border = "3px solid red";
  sortBtn.style.border = "3px solid blue";

  // Test 1: Direct style manipulation
  console.log("🧪 Test 1: Direct dropdown manipulation");
  window.testFilterShow = function () {
    if (filterDropdown) {
      filterDropdown.style.display = "block";
      filterDropdown.style.background = "yellow";
      filterDropdown.style.zIndex = "9999";
      console.log("✅ Filter dropdown should now be visible");
    }
  };

  window.testSortShow = function () {
    if (sortDropdown) {
      sortDropdown.style.display = "block";
      sortDropdown.style.background = "lightblue";
      sortDropdown.style.zIndex = "9999";
      console.log("✅ Sort dropdown should now be visible");
    }
  };

  // Test 2: Check for existing event listeners
  console.log("🧪 Test 2: Checking existing event listeners");
  const filterListeners = getEventListeners
    ? getEventListeners(filterBtn)
    : "Cannot detect";
  const sortListeners = getEventListeners
    ? getEventListeners(sortBtn)
    : "Cannot detect";
  console.log("Filter button listeners:", filterListeners);
  console.log("Sort button listeners:", sortListeners);

  // Test 3: Add simple click detection
  console.log("🧪 Test 3: Adding simple click detection");

  filterBtn.addEventListener(
    "click",
    function (e) {
      console.log("🖱️ FILTER BUTTON CLICKED!");
      console.log("Event details:", e);
      console.log("Target:", e.target);
      console.log("Current target:", e.currentTarget);

      // Force show dropdown
      if (filterDropdown) {
        const isVisible = filterDropdown.style.display === "block";
        filterDropdown.style.display = isVisible ? "none" : "block";
        console.log(
          `Filter dropdown toggled to: ${filterDropdown.style.display}`,
        );
      }
    },
    true,
  ); // Use capture phase

  sortBtn.addEventListener(
    "click",
    function (e) {
      console.log("🖱️ SORT BUTTON CLICKED!");
      console.log("Event details:", e);
      console.log("Target:", e.target);
      console.log("Current target:", e.currentTarget);

      // Force show dropdown
      if (sortDropdown) {
        const isVisible = sortDropdown.style.display === "block";
        sortDropdown.style.display = isVisible ? "none" : "block";
        console.log(`Sort dropdown toggled to: ${sortDropdown.style.display}`);
      }
    },
    true,
  ); // Use capture phase

  // Test 4: Check MainGrid instance
  console.log("🧪 Test 4: MainGrid instance check");
  const mainGrid = window.mainGrid || window.grid || window.mainGridInstance;
  if (mainGrid) {
    console.log("✅ MainGrid found:", mainGrid);
    console.log("Current view:", mainGrid.currentView);

    // Try to force re-setup
    window.forceSetup = function () {
      console.log("🔧 Forcing setup...");
      try {
        mainGrid.setupFilterDropdown();
        mainGrid.setupSortDropdown();
        console.log("✅ Force setup complete");
      } catch (error) {
        console.error("❌ Force setup failed:", error);
      }
    };

    console.log("💡 Use forceSetup() to retry initialization");
  } else {
    console.warn("⚠️ MainGrid instance not found");
  }

  console.log("✅ Debug setup complete!");
  console.log("💡 Use testFilterShow() and testSortShow() to test dropdowns");
  console.log("💡 Try clicking the buttons (now with red/blue borders)");
})();
