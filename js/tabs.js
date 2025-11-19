/* ===== TABS.JS - TAB NAVIGATION HANDLER ===== */

// Main Tab Switching (Sekolah, Pegawai, Query)
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab
    this.classList.add('active');
    
    // Show corresponding content
    const tabName = this.getAttribute('data-tab');
    document.getElementById('tab-' + tabName).classList.add('active');
  });
});

// Sub-Tab Switching (Borang, Semak Status)
document.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active class from all sub-tabs
    document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked sub-tab
    this.classList.add('active');
    
    // Show corresponding content
    const subtabName = this.getAttribute('data-subtab');
    document.getElementById('subtab-' + subtabName).classList.add('active');
  });
});