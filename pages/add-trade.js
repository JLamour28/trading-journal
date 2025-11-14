/**
 * Add Trade Page JavaScript
 * Handles trade form functionality and validation
 */

// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeTradeForm();
});

/**
 * Initialize trade form
 */
function initializeTradeForm() {
  // Initialize mobile menu
  initializeMobileMenu();

  // Set default values
  setDefaultValues();

  // Initialize event listeners
  initializeFormEventListeners();

  // Initialize rating system
  initializeRatingSystem();

  // Initialize tags system
  initializeTagsSystem();

  // Initialize real-time calculations
  initializeCalculations();

  console.log("Add Trade form initialized");
}

/**
 * Set default values
 */
function setDefaultValues() {
  // Set current date/time for entry date
  const entryDateInput = document.getElementById("entryDate");
  if (entryDateInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    entryDateInput.value = now.toISOString().slice(0, 16);
  }

  // Load settings for default values
  const settings = tradeManager.loadSettings();
  const accountSizeInput = document.getElementById("accountSize");
  if (accountSizeInput && settings.accountSize) {
    accountSizeInput.value = settings.accountSize;
  }
}

/**
 * Initialize form event listeners
 */
function initializeFormEventListeners() {
  const form = document.getElementById("tradeForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // Status change handler
  const statusSelect = document.getElementById("status");
  if (statusSelect) {
    statusSelect.addEventListener("change", handleStatusChange);
  }

  // Asset type change handler
  const assetTypeSelect = document.getElementById("assetType");
  if (assetTypeSelect) {
    assetTypeSelect.addEventListener("change", handleAssetTypeChange);
  }
}

/**
 * Initialize rating system
 */
function initializeRatingSystem() {
  const ratingInput = document.getElementById("rating");
  const ratingValue = document.getElementById("ratingValue");
  const ratingStars = document.querySelectorAll(".rating-stars i");

  if (ratingInput && ratingValue && ratingStars.length > 0) {
    // Update display when input changes
    ratingInput.addEventListener("input", function () {
      const value = parseInt(this.value);
      ratingValue.textContent = value;
      updateRatingStars(value);
    });

    // Handle star clicks
    ratingStars.forEach((star) => {
      star.addEventListener("click", function () {
        const rating = parseInt(this.dataset.rating);
        ratingInput.value = rating;
        ratingValue.textContent = rating;
        updateRatingStars(rating);
      });
    });

    // Initialize stars
    updateRatingStars(parseInt(ratingInput.value));
  }
}

/**
 * Update rating stars display
 */
function updateRatingStars(rating) {
  const stars = document.querySelectorAll(".rating-stars i");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

/**
 * Initialize tags system
 */
function initializeTagsSystem() {
  const tagsInput = document.getElementById("tagsInput");
  const tagsList = document.getElementById("tagsList");

  if (tagsInput && tagsList) {
    let tags = [];

    // Handle Enter key press
    tagsInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const tag = this.value.trim();
        if (tag && !tags.includes(tag)) {
          tags.push(tag);
          renderTags(tags);
          this.value = "";
        }
      }
    });

    // Render tags function
    function renderTags(tagsArray) {
      tagsList.innerHTML = tagsArray
        .map(
          (tag) => `
                <span class="tag">
                    ${tag}
                    <button type="button" class="tag-remove" onclick="removeTag('${tag}')">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `
        )
        .join("");
    }

    // Make removeTag function globally available
    window.removeTag = function (tagToRemove) {
      tags = tags.filter((tag) => tag !== tagToRemove);
      renderTags(tags);
    };

    // Store tags getter
    window.getTags = function () {
      return tags;
    };
  }
}

/**
 * Initialize real-time calculations
 */
function initializeCalculations() {
  const inputs = [
    "positionSize",
    "entryPrice",
    "stopLoss",
    "takeProfit",
    "accountSize",
  ];

  inputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener("input", updateRiskMetrics);
    }
  });

  // Initial calculation
  updateRiskMetrics();
}

/**
 * Update risk metrics in real-time
 */
function updateRiskMetrics() {
  const positionSize =
    parseFloat(document.getElementById("positionSize")?.value) || 0;
  const entryPrice =
    parseFloat(document.getElementById("entryPrice")?.value) || 0;
  const stopLoss = parseFloat(document.getElementById("stopLoss")?.value) || 0;
  const takeProfit =
    parseFloat(document.getElementById("takeProfit")?.value) || 0;
  const accountSize =
    parseFloat(document.getElementById("accountSize")?.value) || 0;
  const direction =
    document.querySelector('input[name="direction"]:checked')?.value || "long";

  // Calculate risk amount
  let riskAmount = 0;
  if (stopLoss > 0 && positionSize > 0 && entryPrice > 0) {
    const priceRisk =
      direction === "long" ? entryPrice - stopLoss : stopLoss - entryPrice;
    riskAmount = priceRisk * positionSize;
  }

  // Calculate reward amount
  let rewardAmount = 0;
  if (takeProfit > 0 && positionSize > 0 && entryPrice > 0) {
    const priceReward =
      direction === "long" ? takeProfit - entryPrice : entryPrice - takeProfit;
    rewardAmount = priceReward * positionSize;
  }

  // Calculate risk/reward ratio
  const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0;

  // Calculate risk percentage
  const riskPercent = accountSize > 0 ? (riskAmount / accountSize) * 100 : 0;

  // Update display
  updateMetricDisplay("riskAmount", riskAmount, "currency");
  updateMetricDisplay("rewardAmount", rewardAmount, "currency");
  updateMetricDisplay("riskRewardRatio", riskRewardRatio, "ratio");
  updateMetricDisplay("riskPercent", riskPercent, "percentage");
}

/**
 * Update metric display
 */
function updateMetricDisplay(elementId, value, type) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let formattedValue;
  switch (type) {
    case "currency":
      formattedValue = formatCurrency(value);
      break;
    case "ratio":
      formattedValue = `${value.toFixed(2)}:1`;
      break;
    case "percentage":
      formattedValue = `${value.toFixed(2)}%`;
      break;
    default:
      formattedValue = value.toFixed(2);
  }

  element.textContent = formattedValue;

  // Add color coding for risk percentage
  if (type === "percentage") {
    element.className = "metric-value";
    if (value > 5) {
      element.classList.add("negative");
    } else if (value > 2) {
      element.classList.add("warning");
    } else {
      element.classList.add("positive");
    }
  }
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
  event.preventDefault();

  try {
    // Get form data
    const formData = getFormData();

    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    // Add tags to form data
    formData.tags = getTags ? getTags() : [];

    // Save trade
    const trade = tradeManager.addTrade(formData);

    // Show success message
    showSuccessMessage("Trade saved successfully!");

    // Redirect to dashboard or trade detail
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  } catch (error) {
    console.error("Error saving trade:", error);
    showErrorMessage("Failed to save trade: " + error.message);
  }
}

/**
 * Get form data
 */
function getFormData() {
  const formData = {};
  const form = document.getElementById("tradeForm");
  const formDataObj = new FormData(form);

  // Convert FormData to object
  for (let [key, value] of formDataObj.entries()) {
    formData[key] = value;
  }

  // Convert numeric fields
  const numericFields = [
    "positionSize",
    "entryPrice",
    "exitPrice",
    "commission",
    "stopLoss",
    "takeProfit",
    "accountSize",
    "rating",
  ];

  numericFields.forEach((field) => {
    if (formData[field] !== "") {
      formData[field] = parseFloat(formData[field]);
    } else {
      delete formData[field];
    }
  });

  // Handle direction radio button
  const direction = document.querySelector('input[name="direction"]:checked');
  if (direction) {
    formData.direction = direction.value;
  }

  return formData;
}

/**
 * Validate form data
 */
function validateFormData(formData) {
  const errors = [];

  // Required fields
  if (!formData.assetType) errors.push("Asset type is required");
  if (!formData.symbol || formData.symbol.trim() === "")
    errors.push("Symbol is required");
  if (!formData.direction) errors.push("Trade direction is required");
  if (!formData.positionSize || formData.positionSize <= 0)
    errors.push("Position size must be greater than 0");
  if (!formData.entryPrice || formData.entryPrice <= 0)
    errors.push("Entry price must be greater than 0");
  if (!formData.entryDate) errors.push("Entry date is required");

  // Optional fields validation
  if (formData.exitPrice && formData.exitPrice <= 0) {
    errors.push("Exit price must be greater than 0");
  }

  if (formData.stopLoss && formData.stopLoss <= 0) {
    errors.push("Stop loss must be greater than 0");
  }

  if (formData.takeProfit && formData.takeProfit <= 0) {
    errors.push("Take profit must be greater than 0");
  }

  // Business logic validation
  if (formData.exitDate && formData.entryDate) {
    const entryDate = new Date(formData.entryDate);
    const exitDate = new Date(formData.exitDate);
    if (exitDate < entryDate) {
      errors.push("Exit date cannot be before entry date");
    }
  }

  // Stop loss and take profit validation
  if (formData.stopLoss && formData.entryPrice) {
    const isValidSL =
      formData.direction === "long"
        ? formData.stopLoss < formData.entryPrice
        : formData.stopLoss > formData.entryPrice;

    if (!isValidSL) {
      errors.push(
        "Stop loss must be below entry price for long positions and above for short positions"
      );
    }
  }

  if (formData.takeProfit && formData.entryPrice) {
    const isValidTP =
      formData.direction === "long"
        ? formData.takeProfit > formData.entryPrice
        : formData.takeProfit < formData.entryPrice;

    if (!isValidTP) {
      errors.push(
        "Take profit must be above entry price for long positions and below for short positions"
      );
    }
  }

  // Risk validation
  if (
    formData.accountSize &&
    formData.positionSize &&
    formData.entryPrice &&
    formData.stopLoss
  ) {
    const positionValue = formData.positionSize * formData.entryPrice;
    if (positionValue > formData.accountSize) {
      errors.push("Position value cannot exceed account size");
    }
  }

  return errors;
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
  const form = document.getElementById("tradeForm");
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
 * Handle status change
 */
function handleStatusChange() {
  const status = this.value;
  const exitPrice = document.getElementById("exitPrice");
  const exitDate = document.getElementById("exitDate");

  if (status === "open") {
    exitPrice.value = "";
    exitDate.value = "";
    exitPrice.disabled = true;
    exitDate.disabled = true;
  } else {
    exitPrice.disabled = false;
    exitDate.disabled = false;

    // Set current date/time for closed trades
    if (status === "closed" && !exitDate.value) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      exitDate.value = now.toISOString().slice(0, 16);
    }
  }
}

/**
 * Handle asset type change
 */
function handleAssetTypeChange() {
  const assetType = this.value;
  const symbol = document.getElementById("symbol");
  const exchange = document.getElementById("exchange");

  // Update placeholder based on asset type
  switch (assetType) {
    case "stocks":
      symbol.placeholder = "e.g., AAPL, TSLA, MSFT";
      break;
    case "forex":
      symbol.placeholder = "e.g., EUR/USD, GBP/JPY";
      break;
    case "crypto":
      symbol.placeholder = "e.g., BTC/USD, ETH/USD";
      break;
    case "options":
      symbol.placeholder = "e.g., AAPL250117C00150000";
      break;
    default:
      symbol.placeholder = "e.g., AAPL, BTC/USD, EUR/USD";
  }
}

/**
 * Reset form
 */
function resetForm() {
  if (
    confirm("Are you sure you want to reset the form? All data will be lost.")
  ) {
    document.getElementById("tradeForm").reset();
    setDefaultValues();
    updateRiskMetrics();

    // Clear tags
    const tagsList = document.getElementById("tagsList");
    if (tagsList) {
      tagsList.innerHTML = "";
    }

    // Clear validation errors
    const errors = document.querySelector(".validation-errors");
    if (errors) {
      errors.remove();
    }
  }
}

/**
 * Save as draft
 */
function saveAsDraft() {
  const formData = getFormData();
  formData.status = "draft";
  formData.tags = getTags ? getTags() : [];

  // Save to localStorage as draft
  localStorage.setItem("tradeDraft", JSON.stringify(formData));

  showSuccessMessage("Trade saved as draft");
}

/**
 * Load draft
 */
function loadDraft() {
  const draftData = localStorage.getItem("tradeDraft");
  if (draftData) {
    try {
      const draft = JSON.parse(draftData);

      // Populate form fields
      Object.keys(draft).forEach((key) => {
        const element = document.querySelector(`[name="${key}"]`);
        if (element) {
          if (element.type === "radio") {
            const radio = document.querySelector(
              `[name="${key}"][value="${draft[key]}"]`
            );
            if (radio) radio.checked = true;
          } else {
            element.value = draft[key];
          }
        }
      });

      // Load tags
      if (draft.tags && draft.tags.length > 0) {
        draft.tags.forEach((tag) => {
          const tagsInput = document.getElementById("tagsInput");
          if (tagsInput) {
            tagsInput.value = tag;
            tagsInput.dispatchEvent(
              new KeyboardEvent("keypress", { key: "Enter" })
            );
          }
        });
      }

      // Update calculations
      updateRiskMetrics();

      showSuccessMessage("Draft loaded");
    } catch (error) {
      console.error("Error loading draft:", error);
      showErrorMessage("Failed to load draft");
    }
  }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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

// Global functions
window.resetForm = resetForm;
window.saveAsDraft = saveAsDraft;
window.loadDraft = loadDraft;

// Check for draft on page load
document.addEventListener("DOMContentLoaded", function () {
  const draftData = localStorage.getItem("tradeDraft");
  if (draftData) {
    if (confirm("You have a saved draft. Would you like to load it?")) {
      loadDraft();
    }
  }
});
