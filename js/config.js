/* ===== CONFIGURATION ===== */
/* GANTI URL ini dengan Web App URL anda selepas deploy Apps Script */

const GAS_WEBAPP_BASE = 'https://script.google.com/macros/s/AKfycbwafWP1mQirWNqEQFoCNY7ISJI5BNqkQmfTx5ZD7nHaw2DfIxRjfvF0XB9MFdU2RJo4/exec';

// Helper function to build GET URLs
function buildGET(action, params = {}) {
  let url = GAS_WEBAPP_BASE + '?action=' + action;
  Object.keys(params).forEach(key => {
    url += '&' + key + '=' + encodeURIComponent(params[key]);
  });
  return url;
}

// Legacy support
const GAS_GET = GAS_WEBAPP_BASE + '?action=getAllSchools';
const GAS_POST = GAS_WEBAPP_BASE;

/* ===== FILE SIZE LIMITS ===== */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

const ACCEPTED_FILE_TYPE = 'application/pdf';
