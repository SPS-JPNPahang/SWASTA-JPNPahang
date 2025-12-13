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

/**
 * formatDateMY - Format tarikh dalam Bahasa Melayu
 * 
 * @param {string} dateStr - Date string
 * @param {string} format - 'short' (09/12/2025), 'medium' (09 Dis 2025), 'long' (09 Disember 2025)
 */
function formatDateMY(dateStr, format = 'short') {
  if (!dateStr) return '-';
  
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const bulanPendek = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'];
  const bulanPenuh = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  
  if (format === 'short') {
    return `${day}/${String(month).padStart(2, '0')}/${year}`;
  } else if (format === 'medium') {
    return `${day} ${bulanPendek[date.getMonth()]} ${year}`;
  } else if (format === 'long') {
    return `${day} ${bulanPenuh[date.getMonth()]} ${year}`;
  }
  
  return `${day}/${String(month).padStart(2, '0')}/${year}`;
}

// ================================
// MODAL INFO PPD / NEGERI (AGENSI)
// ================================
function openPpdInfoModal() {
  const modal = document.getElementById('ppdInfoModal');
  if (modal) modal.style.display = 'block';
}

function closePpdInfoModal() {
  const modal = document.getElementById('ppdInfoModal');
  if (modal) modal.style.display = 'none';
}

console.log('✅ utils.js loaded');

