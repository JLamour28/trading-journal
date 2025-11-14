/**
 * Settings Page JavaScript
 * Handles settings management and data operations
 */

// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeSettings();
});

/**
 * Initialize settings page
 */
function initializeSettings() {
  // Initialize mobile menu
  initializeMobileMenu();

  // Load current settings
  loadSettings();

  // Initialize event listeners
  initializeEventListeners();

  console.log("Settings page initialized");
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Import file change
  const importFile = document.getElementById("importFile");
  if (importFile) {
    importFile.addEventListener("change", handleFileImport);
  }
}

/**
 * Load settings into form
 */
function loadSettings() {
  try {
    const settings = tradeManager.loadSettings();

    // Populate form fields
    Object.keys(settings).forEach((key) => {
      const element = document.querySelector(`[name="${key}"]`);
      if (element) {
        element.value = settings[key];
      }
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    showErrorMessage("Failed to load settings");
  }
}

/**
 * Save settings
 */
function saveSettings() {
  try {
    const formData = getFormData();

    // Validate settings
    const validationErrors = validateSettings(formData);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    // Save to LocalStorage
    tradeManager.saveSettings(formData);

    showSuccessMessage("Settings saved successfully");
  } catch (error) {
    console.error("Error saving settings:", error);
    showErrorMessage("Failed to save settings");
  }
}

/**
 * Get form data
 */
function getFormData() {
  const formData = {};
  const form = document.getElementById("settingsForm");
  const formDataObj = new FormData(form);

  // Convert FormData to object
  for (let [key, value] of formDataObj.entries()) {
    formData[key] = value;
  }

  // Convert numeric fields
  const numericFields = ["accountSize", "riskPerTrade"];
  numericFields.forEach((field) => {
    if (formData[field] !== "") {
      formData[field] = parseFloat(formData[field]);
    }
  });

  return formData;
}

/**
 * Validate settings
 */
function validateSettings(settings) {
  const errors = [];

  if (settings.accountSize && settings.accountSize <= 0) {
    errors.push("Account size must be greater than 0");
  }

  if (
    settings.riskPerTrade &&
    (settings.riskPerTrade <= 0 || settings.riskPerTrade > 100)
  ) {
    errors.push("Risk per trade must be between 0.1% and 100%");
  }

  return errors;
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
  if (
    !confirm("Are you sure you want to reset all settings to default values?")
  ) {
    return;
  }

  try {
    const defaultSettings = tradeManager.getDefaultSettings();
    tradeManager.saveSettings(defaultSettings);
    loadSettings();
    showSuccessMessage("Settings reset to defaults");
  } catch (error) {
    console.error("Error resetting settings:", error);
    showErrorMessage("Failed to reset settings");
  }
}

/**
 * Export all data
 */
function exportAllData() {
  try {
    const trades = tradeManager.getAllTrades();

    if (trades.length === 0) {
      showErrorMessage("No trades to export");
      return;
    }

    const csvContent = tradeManager.exportToCSV(trades);

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trading-journal-backup-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
    showSuccessMessage("All trades exported successfully");
  } catch (error) {
    console.error("Error exporting data:", error);
    showErrorMessage("Failed to export data");
  }
}

/**
 * Handle file import
 */
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".csv")) {
    showErrorMessage("Please select a CSV file");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const csvContent = e.target.result;
      const importedCount = tradeManager.importFromCSV(csvContent);

      showSuccessMessage(`Successfully imported ${importedCount} trades`);

      // Clear file input
      event.target.value = "";
    } catch (error) {
      console.error("Error importing file:", error);
      showErrorMessage("Failed to import file: " + error.message);
    }
  };

  reader.onerror = function () {
    showErrorMessage("Failed to read file");
  };

  reader.readAsText(file);
}

/**
 * Clear all data
 */
function clearAllData() {
  const confirmation = prompt(
    'This will permanently delete ALL your trading data. Type "DELETE" to confirm:',
    ""
  );

  if (confirmation !== "DELETE") {
    showErrorMessage("Confirmation text did not match. Operation cancelled.");
    return;
  }

  try {
    // Clear trades
    tradeManager.saveTrades([]);

    // Clear settings (optional - keep user preferences)
    // tradeManager.saveSettings(tradeManager.getDefaultSettings());

    showSuccessMessage("All data cleared successfully");

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  } catch (error) {
    console.error("Error clearing data:", error);
    showErrorMessage("Failed to clear data");
  }
}

/**
 * Show validation errors
 */
function showValidationErrors(errors) {
  const errorHTML = `
        <div class="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
                ${errors.map((error) => `<li>${error}</li>`).join("")}
            </ul>
        </div>
    `;

  // Remove existing errors
  const existingErrors = document.querySelector(".validation-errors");
  if (existingErrors) {
    existingErrors.remove();
  }

  // Add new errors
  const form = document.getElementById("settingsForm");
  form.insertAdjacentHTML("afterbegin", errorHTML);

  // Scroll to top
  form.scrollIntoView({ behavior: "smooth" });

  // Auto-remove after 10 seconds
  setTimeout(() => {
    const errorsElement = document.querySelector(".validation-errors");
    if (errorsElement) {
      errorsElement.remove();
    }
  }, 10000);
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  showNotification(message, "success");
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  showNotification(message, "error");
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  // Add to page
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "fa-check-circle";
    case "error":
      return "fa-exclamation-circle";
    case "warning":
      return "fa-exclamation-triangle";
    default:
      return "fa-info-circle";
  }
}

/**
 * Initialize mobile menu
 */
function initializeMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !mobileMenuToggle.contains(event.target) &&
        !navMenu.contains(event.target)
      ) {
        navMenu.classList.remove("active");
      }
    });
  }
}

// Global functions
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.exportAllData = exportAllData;
window.clearAllData = clearAllData;
