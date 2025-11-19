/* ===== UTILS.JS - HELPER FUNCTIONS ===== */

/**
 * safeRun - Only run code if element exists
 * Prevents "Cannot read properties of null" errors
 * 
 * @param {string} elementId - ID of element to check
 * @param {function} callback - Code to run if element exists
 * 
 * Usage: safeRun('btnSubmit', () => { your code here });
 */
function safeRun(elementId, callback) {
  const element = document.getElementById(elementId);
  
  if (element) {
    try {
      callback();
    } catch (error) {
      console.error(`❌ Error in safeRun(${elementId}):`, error);
    }
  } else {
    console.log(`⚠️ Element #${elementId} not found, skipping...`);
  }
}

/**
 * whenReady - Run code when DOM is fully loaded
 * Ensures all HTML elements are available before running JS
 * 
 * @param {function} callback - Code to run when ready
 * 
 * Usage: whenReady(() => { your code here });
 */
function whenReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * buildGET - Build GET request URL (already exists in config.js, but included here for reference)
 */
// Keep your existing buildGET in config.js

console.log('✅ utils.js loaded');