/* ===== PEGAWAI.JS - PORTAL PEGAWAI (2 JENIS: SEMAK & LULUS) ===== */
whenReady(() => {
  safeRun('pegawai-login', () => {

let currentOfficerRole = null; // 'semak', 'lulus', or 'ppd'
let currentApplications = [];
let currentFilters = {
  kategori: 'Semua',
  daerah: 'Semua'
};
let currentPpdDaerah = null;
let ppdAllData = [];
let ppdFilteredData = [];
let ppdFilters = {
  kategori: 'Semua',
  status: 'Semua'
};

// DOM Elements
const pegawaiLoginDiv = document.getElementById('pegawai-login');
const pegawaiDashboardDiv = document.getElementById('pegawai-dashboard');
const pegawaiPasswordInput = document.getElementById('pegawaiPassword');
const btnPegawaiLogin = document.getElementById('btnPegawaiLogin');
const btnPegawaiLogout = document.getElementById('btnPegawaiLogout');
const btnRefreshDashboard = document.getElementById('btnRefreshDashboard');

// Login handler
btnPegawaiLogin.addEventListener('click', handleLogin);
pegawaiPasswordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleLogin();
});

/* ========================= LOGIN ========================== */
async function handleLogin() {
  const password = pegawaiPasswordInput.value.trim();

  if (!password) {
    Swal.fire({
      icon: 'warning',
      title: 'Kata Laluan Diperlukan',
      text: 'Sila masukkan kata laluan.',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }

  try {
    Swal.fire({
      title: 'Mengesahkan...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        password: password
      })
    });

    const result = await response.json();

    if (result && result.success) {
      currentOfficerRole = result.role; // 'semak', 'lulus', or 'ppd'
      
      if (result.role === 'ppd') {
        currentPpdDaerah = result.daerah;
        showPpdDashboard();
      } else {
        showDashboard();
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Kata Laluan Salah',
        text: 'Sila cuba lagi.',
        confirmButtonColor: '#D4AF37'
      });
      pegawaiPasswordInput.value = '';
    }

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Ralat',
      text: 'Tidak dapat berhubung dengan server.',
      confirmButtonColor: '#D4AF37'
    });
  }
}

/* ========================= DASHBOARD ========================== */
function showDashboard() {
  pegawaiLoginDiv.style.display = 'none';
  pegawaiDashboardDiv.style.display = 'block';

  const dashboardTitle = document.querySelector('.dashboard-header h2');

  if (currentOfficerRole === 'semak') {
    dashboardTitle.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard Pegawai Semak';
  } else {
    dashboardTitle.innerHTML = '<i class="fas fa-crown"></i> Dashboard Timbalan Pengarah';
  }

  loadApplications();

  Swal.fire({
    icon: 'success',
    title: 'Berjaya Log Masuk',
    text: currentOfficerRole === 'semak' ? 'Pegawai Semak' : 'Timbalan Pengarah',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000
  });
}

// Logout
btnPegawaiLogout.addEventListener('click', () => {
  currentOfficerRole = null;
  currentApplications = [];
  pegawaiPasswordInput.value = '';
  pegawaiLoginDiv.style.display = 'block';
  pegawaiDashboardDiv.style.display = 'none';

  Swal.fire({
    icon: 'info',
    title: 'Log Keluar Berjaya',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000
  });
});

// PPD Logout
const btnPpdLogout = document.getElementById('btnPpdLogout');
if (btnPpdLogout) {
  btnPpdLogout.addEventListener('click', () => {
    currentOfficerRole = null;
    currentApplications = [];
    currentPpdDaerah = null;
    ppdAllData = [];
    ppdFilteredData = [];
    pegawaiPasswordInput.value = '';
    pegawaiLoginDiv.style.display = 'block';
    
    const ppdDashboard = document.getElementById('ppd-dashboard');
    if (ppdDashboard) ppdDashboard.style.display = 'none';

    Swal.fire({
      icon: 'info',
      title: 'Log Keluar Berjaya',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  });
}

// Refresh
btnRefreshDashboard.addEventListener('click', loadApplications);
// Pegawai Filter event listeners
const filterKategori = document.getElementById('filterKategori');
const filterDaerah = document.getElementById('filterDaerah');

if (filterKategori) {
  filterKategori.addEventListener('change', function() {
    currentFilters.kategori = this.value;
    applyFilters();
  });
}

if (filterDaerah) {
  filterDaerah.addEventListener('change', function() {
    currentFilters.daerah = this.value;
    applyFilters();
  });
}

// PPD Filter Listeners
const ppdFilterKategori = document.getElementById('ppdFilterKategori');
const ppdFilterStatus = document.getElementById('ppdFilterStatus');
const btnPpdRefresh = document.getElementById('btnPpdRefresh');

if (ppdFilterKategori) {
  ppdFilterKategori.addEventListener('change', function() {
    ppdFilters.kategori = this.value;
    applyPpdFilters();
  });
}

if (ppdFilterStatus) {
  ppdFilterStatus.addEventListener('change', function() {
    ppdFilters.status = this.value;
    applyPpdFilters();
  });
}

if (btnPpdRefresh) {
  btnPpdRefresh.addEventListener('click', () => {
    loadPpdData();
  });
}

/* ========================= LOAD APPLICATIONS ========================== */
function loadApplications() {
  Swal.fire({
    title: 'Memuatkan data...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  /* ======================= PEGAWAI SEMAK (3 JADUAL) ======================= */
  if (currentOfficerRole === 'semak') {
    fetch(buildGET('listMaster'))
      .then(r => r.json())
      .then(res => {
        Swal.close();

        const data = res.data || [];
        const norm = s => String(s || '').trim().toLowerCase();
        
        // Helper function to sort by date
        const sortByDate = (arr) => {
          return arr.sort((a, b) => {
            const dateA = new Date(a.TarikhHantar || a.LastUpdated || 0);
            const dateB = new Date(b.TarikhHantar || b.LastUpdated || 0);
            return dateB - dateA; // Descending (newest first)
          });
        };
        
        const baru = sortByDate(data.filter(x => norm(x.Status) === 'baru'));
        currentApplications = data; // Store for filtering
        const query = sortByDate(data.filter(x => norm(x.Status) === 'query'));
        const disahkan = sortByDate(data.filter(x => 
          norm(x.Status) === 'disahkan' ||
          norm(x.Status) === 'ditolak' || 
          norm(x.Status) === 'lulus' || 
          norm(x.Status) === 'tolak'  
        ));
        
        const multiDiv = document.getElementById('pegawai-multi');
        const singleDiv = document.getElementById('pegawai-single');
        
        if (multiDiv) multiDiv.style.display = 'block';
        if (singleDiv) singleDiv.style.display = 'none';

        const baruDiv = document.getElementById('tbl-baru');
        const queryDiv = document.getElementById('tbl-query');
        const disahkanDiv = document.getElementById('tbl-disahkan');
        
        if (baruDiv) baruDiv.innerHTML = buildTableHtml(baru, 'semak', 'Baru');
        if (queryDiv) queryDiv.innerHTML = buildTableHtml(query, 'semak', 'Query');
        if (disahkanDiv) disahkanDiv.innerHTML = buildTableHtml(disahkan, 'semak', 'Disahkan/Ditolak/Lulus');
      })
      .catch(err => {
        Swal.close();
        Swal.fire('Ralat', 'Tidak dapat memuatkan data', 'error');
        console.error(err);
      });
  }

  /* ======================= TIMBALAN (1 JADUAL) ======================= */
  else {
    // TP should see both Disahkan AND Ditolak items
    fetch(buildGET('listMaster'))
      .then(r => r.json())
      .then(res => {
        Swal.close();

        const data = res.data || [];
        const norm = s => String(s || '').trim().toLowerCase();
        
        // Filter for both Disahkan and Ditolak
        const filtered = data.filter(x => 
          norm(x.Status) === 'disahkan' || norm(x.Status) === 'ditolak'
        );
        // ⭐ TAMBAH sorting
        const sortedFiltered = filtered.sort((a, b) => {
        const dateA = new Date(a.LastUpdated || a.TarikhHantar || 0);
        const dateB = new Date(b.LastUpdated || b.TarikhHantar || 0);
          return dateB - dateA; // Newest first
          });
        currentApplications = data; // Store ALL data for filtering

        const multiDiv = document.getElementById('pegawai-multi');
        const singleDiv = document.getElementById('pegawai-single');
        
        if (multiDiv) multiDiv.style.display = 'none';
        if (singleDiv) {
          singleDiv.style.display = 'block';
          singleDiv.innerHTML = buildTableHtml(sortedFiltered, 'lulus', 'Disahkan/Ditolak');
        }
      })
      .catch(err => {
        Swal.close();
        Swal.fire('Ralat', 'Tidak dapat memuatkan data', 'error');
        console.error(err);
      });
  }
}
/* ========================= APPLY FILTERS ========================== */
function applyFilters() {
  if (!currentApplications || currentApplications.length === 0) {
    return;
  }

  if (currentOfficerRole === 'semak') {
    const norm = s => String(s || '').trim().toLowerCase();
    
    let filtered = currentApplications;
    
    if (currentFilters.kategori !== 'Semua') {
      filtered = filtered.filter(x => x.Kategori === currentFilters.kategori);
    }
    
    if (currentFilters.daerah !== 'Semua') {
      filtered = filtered.filter(x => {
        const daerahUpper = String(x.Daerah || '').toUpperCase();
        return daerahUpper === currentFilters.daerah;
      });
    }
    
    const sortByDate = (arr) => {
      return arr.sort((a, b) => {
        const dateA = new Date(a.TarikhHantar || a.LastUpdated || 0);
        const dateB = new Date(b.TarikhHantar || b.LastUpdated || 0);
        return dateB - dateA;
      });
    };
    
    const baru = sortByDate(filtered.filter(x => norm(x.Status) === 'baru'));
    const query = sortByDate(filtered.filter(x => norm(x.Status) === 'query'));
    const disahkan = sortByDate(filtered.filter(x => 
      norm(x.Status) === 'disahkan' ||
      norm(x.Status) === 'ditolak' || 
      norm(x.Status) === 'lulus' || 
      norm(x.Status) === 'tolak'  
    ));
    
    const baruDiv = document.getElementById('tbl-baru');
    const queryDiv = document.getElementById('tbl-query');
    const disahkanDiv = document.getElementById('tbl-disahkan');
    
    if (baruDiv) baruDiv.innerHTML = buildTableHtml(baru, 'semak', 'Baru');
    if (queryDiv) queryDiv.innerHTML = buildTableHtml(query, 'semak', 'Query');
    if (disahkanDiv) disahkanDiv.innerHTML = buildTableHtml(disahkan, 'semak', 'Disahkan/Ditolak/Lulus');
  }
  
  else {
    const norm = s => String(s || '').trim().toLowerCase();
    
    let filtered = currentApplications.filter(x => 
      norm(x.Status) === 'disahkan' || norm(x.Status) === 'ditolak'
    );
    
    if (currentFilters.kategori !== 'Semua') {
      filtered = filtered.filter(x => x.Kategori === currentFilters.kategori);
    }
    
    if (currentFilters.daerah !== 'Semua') {
      filtered = filtered.filter(x => {
        const daerahUpper = String(x.Daerah || '').toUpperCase();
        return daerahUpper === currentFilters.daerah;
      });
    }
    
    const sortedFiltered = filtered.sort((a, b) => {
      const dateA = new Date(a.LastUpdated || a.TarikhHantar || 0);
      const dateB = new Date(b.LastUpdated || b.TarikhHantar || 0);
      return dateB - dateA;
    });
    
    const singleDiv = document.getElementById('pegawai-single');
    if (singleDiv) {
      singleDiv.innerHTML = buildTableHtml(sortedFiltered, 'lulus', 'Disahkan/Ditolak');
    }
  }
}
/* ========================= TABLE BUILDER ========================== */
function buildTableHtml(items, role, statusLabel) {
  if (!items || items.length === 0) {
    return `<p class="text-center" style="color:#666; padding:2rem;">
      Tiada permohonan ${statusLabel || ''} ditemui.
    </p>`;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Request ID</th>
          <th>Kod Sekolah</th>
          <th>Nama Sekolah</th>
          <th>Kategori</th>
          <th>Tarikh</th>
          <th>Status</th>
          <th>Link Surat</th>
          <th>Tindakan</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach(app => {
    // Check for Link Surat
    const linkSurat = app.SuratURL 
      ? `<a href="${app.SuratURL}" target="_blank" class="btn-table btn-view" style="font-size:0.9rem;">
          <i class="fas fa-file-pdf"></i> Lihat
         </a>`
      : '-';

    html += `
      <tr>
        <td><strong>${app.RequestID || '-'}</strong></td>
        <td>${app.KodSekolah || '-'}</td>
        <td>${app.NamaSekolah || '-'}</td>
        <td>${app.Kategori || '-'}</td>
        <td>${formatDate(app.TarikhHantar)}</td>
        <td><span class="status-badge ${getStatusClass(app.Status)}">${app.Status || 'Baru'}</span></td>
        <td>${linkSurat}</td>
        <td>${getActionButtons(app, role)}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';

  // Bulk Approve (Timbalan) - only for Disahkan items
  if (role === 'lulus' && items.length > 1) {
  const approveCount = items.filter(x => {
    const s = String(x.Status || '').toLowerCase();
    return s === 'disahkan' || s === 'ditolak';
  }).length;
  
  if (approveCount > 0) {
    html += `
      <div style="margin-top:1rem; text-align:right;">
        <button class="btn-primary" onclick="bulkApprove()">
          <i class="fas fa-check-double"></i> Lulus Semua (${approveCount})
        </button>
      </div>
    `;
  }
}

  return html;
}

/* ========================= BUTTON BUILDER ========================== */
function getActionButtons(app, role) {
  const status = String(app.Status || '').trim();
  const kategori = String(app.Kategori || '').trim();

  // PEGAWAI SEMAK
  if (role === 'semak') {
    let b = `<button class="btn-table btn-view" onclick="viewApplicationDetails('${app.RequestID}')">
      <i class="fas fa-eye"></i> Lihat
    </button>`;

    if (status === 'Baru') {
      b += `
      <button class="btn-table btn-query" onclick="sendQuery('${app.RequestID}')">
        <i class="fas fa-question-circle"></i> Query
      </button>
      <button class="btn-table btn-approve" onclick="sahkan('${app.RequestID}')">
        <i class="fas fa-check"></i> Sahkan
      </button>`;
      
      // Tambah butang TOLAK untuk Premis DAN Agensi
      if (kategori === 'Premis') {
        b += `
        <button class="btn-table btn-reject" onclick="tolakPremis('${app.RequestID}')">
          <i class="fas fa-times"></i> Tolak
        </button>`;
      } else if (kategori === 'Agensi') {
        b += `
        <button class="btn-table btn-reject" onclick="tolakAgensi('${app.RequestID}')">
          <i class="fas fa-times"></i> Tolak
        </button>`;
      }
    }

    return b;
  }

  // TIMBALAN PENGARAH
  else {
    return `
      <button class="btn-table btn-approve" onclick="approveLetter('${app.RequestID}', 'Lulus')">
        <i class="fas fa-check-circle"></i> Lulus
      </button>
    `;
  }
}

/* ========================= HELPERS ========================== */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return day + '/' + month + '/' + year;
}

function getStatusClass(status) {
  const statusMap = {
    'Baru': 'baru',
    'Query': 'query', 
    'Disahkan': 'disahkan',
    'Ditolak': 'tolak',
    'Lulus': 'lulus',
    'Tolak': 'tolak'
  };
  return statusMap[status] || 'baru';
}

/* ========================= VIEW DETAILS ========================== */
async function viewApplicationDetails(requestId) {
  Swal.fire({
    title: 'Memuatkan...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(buildGET('getRequest', { requestId }));
    const result = await response.json();

    if (result.success) {
      showFullDetails(result.data);
    } else {
      Swal.fire('Ralat', 'Tidak dapat memuatkan maklumat', 'error');
    }
  } catch (err) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}

function showFullDetails(data) {
  let html = '<div style="max-height:500px; overflow-y:auto; text-align:left;">';
  
  // ⭐ BASIC INFO TABLE
  html += '<h4 style="color:#D4AF37; margin-bottom:0.5rem;">Maklumat Permohonan</h4>';
  html += '<table style="width:100%; margin-bottom:1.5rem;">';

  Object.keys(data).forEach(key => {
    // Skip file columns - akan display separate
    if (key.includes('File_') || key === 'SuratPermohonan' || key === 'BorangPermohonan' || key === 'KertasCadangan') {
      return;
    }
    
    const value = data[key] || '-';
    html += `
      <tr>
        <td style="padding:8px; font-weight:600; width:40%; border-bottom:1px solid #eee;">${key}</td>
        <td style="padding:8px; width:60%; border-bottom:1px solid #eee;">${value}</td>
      </tr>
    `;
  });

  html += '</table>';

  // ⭐ FILES SECTION - Ambil dari data terus
  html += '<div style="padding:1rem; background:#F3F4F6; border-radius:8px;">';
  html += '<h4 style="color:#D4AF37; margin:0 0 1rem 0;"><i class="fas fa-paperclip"></i> Dokumen Dimuat Naik</h4>';

  let hasFiles = false;
  let fileCount = 0;

  // Check for files in data
  const fileFields = [
    { key: 'File_Surat', alt: 'SuratPermohonan', label: 'Surat Permohonan' },
    { key: 'File_Borang', alt: 'BorangPermohonan', label: 'Borang Permohonan' },
    { key: 'File_KertaCadangan', alt: 'KertasCadangan', label: 'Kertas Cadangan' }
  ];

  fileFields.forEach(field => {
    const fileUrl = data[field.key] || data[field.alt] || '';
    
    if (fileUrl && fileUrl !== '-') {
      hasFiles = true;
      fileCount++;
      
      html += `
        <div style="padding:0.75rem; background:white; margin-bottom:0.5rem; border-radius:5px; border-left:3px solid #3B82F6;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
            <span style="color:#374151; font-size:0.9rem; flex:1;">
              <i class="fas fa-file-pdf" style="color:#EF4444;"></i> 
              ${fileCount}. ${field.label}
            </span>
            <a href="${fileUrl}" target="_blank" style="padding:0.5rem 1rem; background:#3B82F6; color:white; text-decoration:none; border-radius:4px; font-size:0.85rem; white-space:nowrap;">
              <i class="fas fa-external-link-alt"></i> Buka
            </a>
          </div>
        </div>
      `;
    }
  });

  if (!hasFiles) {
    html += '<p style="color:#9CA3AF; font-style:italic; text-align:center; padding:1rem;">Tiada dokumen dimuat naik</p>';
  } else {
    html += `<p style="color:#6B7280; font-size:0.85rem; margin-top:0.5rem;">Jumlah: ${fileCount} dokumen</p>`;
  }

  html += '</div>'; // Close files section
  html += '</div>'; // Close main container

  Swal.fire({
    title: 'Request ID: ' + data.RequestID,
    html,
    width: '900px',
    showConfirmButton: true,
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#D4AF37'
  });
}
/* ========================= SEMAK → QUERY ========================== */
async function sendQuery(requestId) {
  const { value: note } = await Swal.fire({
    title: 'Hantar Query',
    input: 'textarea',
    inputPlaceholder: 'Nyatakan isu yang perlu diperbaiki...',
    showCancelButton: true,
    confirmButtonText: 'Hantar Query',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#F97316'
  });

  if (!note || !note.trim()) return;

  Swal.fire({
    title: 'Menghantar query...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateStatus',
        requestId,
        newStatus: 'Query',
        note: note.trim()
      })
    });

    const res = await response.json();

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Query Dihantar',
        text: 'Permohonan telah dikembalikan kepada sekolah',
        confirmButtonColor: '#D4AF37'
      });
      loadApplications();
    } else {
      Swal.fire('Ralat', res.message || 'Tidak dapat menghantar query', 'error');
    }
  } catch (err) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}

/* ========================= SEMAK → SAHKAN PREMIS - STEP 1 ========================== */
async function sahkan(requestId) {
  const { value: formValues } = await Swal.fire({
    title: 'Sahkan Permohonan',
    html: `
      <div style="text-align:left; padding:1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Jilid *</label>
        <input id="sjilid" class="swal2-input" type="text" placeholder="Contoh: 1" style="margin-top:0;">
        
        <label style="display:block; margin-bottom:0.5rem; margin-top:1rem; font-weight:600;">Bil Surat *</label>
        <input id="sbil" class="swal2-input" type="text" placeholder="Contoh: 100/2025" style="margin-top:0;">
        
        <label style="display:block; margin-bottom:0.5rem; margin-top:1rem; font-weight:600;">Tarikh Surat *</label>
        <input id="starikh" class="swal2-input" type="date" style="margin-top:0;">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Sahkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#8B5CF6',
    preConfirm: () => {
      const jilid = document.getElementById('sjilid').value.trim();
      const bilSurat = document.getElementById('sbil').value.trim();
      const tarikhSurat = document.getElementById('starikh').value;

      if (!jilid || !bilSurat || !tarikhSurat) {
        Swal.showValidationMessage('Semua medan diperlukan!');
        return false;
      }

      return { jilid, bilSurat, tarikhSurat };
    }
  });

  if (!formValues) return;

  Swal.fire({
    title: 'Mengemaskini status...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'sahkan',
        requestId,
        jilid: formValues.jilid,
        bilSurat: formValues.bilSurat,
        tarikhSurat: formValues.tarikhSurat
      })
    });

    const res = await response.json();

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berjaya Disahkan',
        text: 'Permohonan telah dihantar ke Timbalan Pengarah',
        confirmButtonColor: '#D4AF37'
      });
      loadApplications();
    } else {
      Swal.fire('Ralat', res.message || 'Gagal mengesahkan', 'error');
    }
  } catch (err) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}
/* ========================= STEP 2: PILIH KEPUTUSAN (TERIMA/TOLAK) ========================== */
async function pilihKeputusan(requestId, jilid, bilSurat, tarikhSurat) {
  const { value: keputusan } = await Swal.fire({
    title: 'Keputusan Permohonan',
    html: `
      <div style="text-align:left; padding:1rem;">
        <p style="margin-bottom:1rem; color:#666;">
          <strong>Maklumat Permohonan:</strong><br>
          Jilid: <span style="color:#000;">${jilid}</span><br>
          Bil Surat: <span style="color:#000;">${bilSurat}</span><br>
          Tarikh: <span style="color:#000;">${tarikhSurat}</span>
        </p>
        <hr style="margin:1rem 0;">
        <p style="font-weight:600; margin-bottom:1rem;">Pilih tindakan:</p>
      </div>
    `,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-check"></i> Terima',
    denyButtonText: '<i class="fas fa-times"></i> Tolak',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10B981',
    denyButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280'
  });

  if (keputusan === true) {
    // TERIMA - Terus ke TP (tanpa sebab)
    prosesKeputusanPegawai(requestId, 'Terima', jilid, bilSurat, tarikhSurat, '');
  } else if (keputusan === false) {
    // TOLAK - Minta sebab dulu
    mintaSebabTolak(requestId, jilid, bilSurat, tarikhSurat);
  }
}

/* ========================= STEP 3: MINTA SEBAB TOLAK (JIKA TOLAK) ========================== */
async function mintaSebabTolak(requestId, jilid, bilSurat, tarikhSurat) {
  const { value: formValues } = await Swal.fire({
    title: 'Sebab Penolakan',
    html: `
      <div style="text-align:left; padding:1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:#EF4444;">
          Nyatakan Sebab Penolakan *
        </label>
        <textarea id="sebab_tolak" class="swal2-textarea" placeholder="Nyatakan sebab penolakan dengan jelas..." 
          style="width:100%; min-height:120px; margin-top:0;"></textarea>
        <small style="color:#666;">Sebab ini akan dimasukkan dalam surat penolakan</small>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Hantar ke TP',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#EF4444',
    preConfirm: () => {
      const sebabPenolakan = document.getElementById('sebab_tolak').value.trim();

      if (!sebabPenolakan) {
        Swal.showValidationMessage('Sebab penolakan diperlukan!');
        return false;
      }

      if (sebabPenolakan.length < 10) {
        Swal.showValidationMessage('Sila nyatakan sebab penolakan dengan lebih jelas (minimum 10 aksara)');
        return false;
      }

      return { sebabPenolakan };
    }
  });

  if (!formValues) return;

  // Confirm rejection
  const confirm = await Swal.fire({
    title: 'Sahkan Penolakan?',
    text: 'Permohonan ini akan ditolak dan dihantar ke TP',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Tolak',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#EF4444'
  });

  if (!confirm.isConfirmed) return;

  // Proses penolakan dengan sebab
  prosesKeputusanPegawai(requestId, 'Tolak', jilid, bilSurat, tarikhSurat, formValues.sebabPenolakan);
}

/* ========================= STEP 4: PROSES KEPUTUSAN DAN HANTAR KE TP ========================== */
async function prosesKeputusanPegawai(requestId, keputusan, jilid, bilSurat, tarikhSurat, sebabTolak) {
  Swal.fire({
    title: 'Menghantar ke Timbalan Pengarah...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'prosesKeputusanPegawai',
        requestId,
        keputusan,
        jilid,
        bilSurat,
        tarikhSurat,
        sebabPenolakan: sebabTolak
      })
    });

    const res = await response.json();

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: keputusan === 'Terima' ? 'Permohonan Diterima' : 'Permohonan Ditolak',
        text: 'Telah dihantar ke Timbalan Pengarah untuk kelulusan',
        confirmButtonColor: '#D4AF37'
      });
      loadApplications();
    } else {
      Swal.fire('Ralat', res.message || 'Gagal memproses', 'error');
    }
  } catch (err) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}
/* ========================= SEMAK → TOLAK (PREMIS ONLY) ========================== */
async function tolakPremis(requestId) {
  const { value: formValues } = await Swal.fire({
    title: 'Tolak Permohonan Premis',
    html: `
      <div style="text-align:left; padding:1rem;">
        <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Jilid *</label>
        <input id="tjilid" class="swal2-input" type="text" placeholder="Contoh: 1" style="margin-top:0;">
        
        <label style="display:block; margin-bottom:0.5rem; margin-top:1rem; font-weight:600;">Bil Surat *</label>
        <input id="tbil" class="swal2-input" type="text" placeholder="Contoh: 100/2025" style="margin-top:0;">
        
        <label style="display:block; margin-bottom:0.5rem; margin-top:1rem; font-weight:600;">Tarikh Surat *</label>
        <input id="ttarikh" class="swal2-input" type="date" style="margin-top:0;">
        
        <label style="display:block; margin-bottom:0.5rem; margin-top:1rem; font-weight:600; color:#EF4444;">
          Sebab Penolakan *
        </label>
        <textarea id="sebab_tolak" class="swal2-textarea" placeholder="Nyatakan sebab penolakan dengan jelas..." 
          style="width:100%; min-height:120px; margin-top:0;"></textarea>
        <small style="color:#666;">Sebab ini akan dimasukkan dalam surat penolakan</small>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Tolak Permohonan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#EF4444',
    preConfirm: () => {
      const jilid = document.getElementById('tjilid').value.trim();
      const bilSurat = document.getElementById('tbil').value.trim();
      const tarikhSurat = document.getElementById('ttarikh').value;
      const sebabPenolakan = document.getElementById('sebab_tolak').value.trim();

      if (!jilid || !bilSurat || !tarikhSurat) {
        Swal.showValidationMessage('Jilid, Bil Surat dan Tarikh Surat diperlukan!');
        return false;
      }

      if (!sebabPenolakan) {
        Swal.showValidationMessage('Sebab penolakan diperlukan!');
        return false;
      }

      if (sebabPenolakan.length < 10) {
        Swal.showValidationMessage('Sila nyatakan sebab penolakan dengan lebih jelas (minimum 10 aksara)');
        return false;
      }

      return { jilid, bilSurat, tarikhSurat, sebabPenolakan };
    }
  });

  if (!formValues) return;

  // Confirm rejection
  const confirm = await Swal.fire({
    title: 'Sahkan Penolakan?',
    text: 'Permohonan ini akan ditolak dan dihantar ke TP',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Tolak',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#EF4444'
  });

  if (!confirm.isConfirmed) return;

  Swal.fire({
    title: 'Memproses penolakan...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'tolakPremis',
        requestId,
        jilid: formValues.jilid,
        bilSurat: formValues.bilSurat,
        tarikhSurat: formValues.tarikhSurat,
        sebabPenolakan: formValues.sebabPenolakan
      })
    });

    const res = await response.json();

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Permohonan Ditolak',
        text: 'Telah dihantar ke Timbalan Pengarah untuk kelulusan',
        confirmButtonColor: '#D4AF37'
      });
      loadApplications();
    } else {
      Swal.fire('Ralat', res.message || 'Gagal menolak permohonan', 'error');
    }
  } catch (err) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}

/* ========================= LULUS / TOLAK ========================== */
async function approveLetter(requestId, action) {
  const txt = action === 'Lulus' ? 'Luluskan' : 'Tolak';
  const color = action === 'Lulus' ? '#10B981' : '#EF4444';

  const confirm = await Swal.fire({
    title: `${txt} permohonan ini?`,
    text: action === 'Lulus' ? 'Surat kelulusan akan dijana dan dihantar' : 'Surat penolakan akan dijana',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: txt,
    cancelButtonText: 'Batal',
    confirmButtonColor: color
  });

  if (!confirm.isConfirmed) return;

  Swal.fire({
    title: 'Memproses kelulusan...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'approveLetter',
        requestId,
        status: action
      })
    });

    const res = await response.json();

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: `Permohonan Di${action}`,
        html: `Surat telah dijana dan email telah dihantar.<br><small>Letter URL: ${res.letterUrl || 'N/A'}</small>`,
        confirmButtonColor: '#D4AF37'
      });
      loadApplications();
    } else {
      Swal.fire('Ralat', res.message || 'Gagal memproses', 'error');
    }
  } catch (err) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}

/* ========================= BULK APPROVE ========================== */
async function bulkApprove() {
  if (!currentApplications || currentApplications.length === 0) {
    Swal.fire('Tiada Data', 'Tiada permohonan untuk diluluskan', 'warning');
    return;
  }

  // Include BOTH Disahkan and Ditolak
  const approveApps = currentApplications.filter(x => {
    const status = String(x.Status || '').toLowerCase();
    return status === 'disahkan' || status === 'ditolak';
  });

  if (approveApps.length === 0) {
    Swal.fire('Tiada Permohonan', 'Tiada permohonan untuk diluluskan', 'info');
    return;
  }

  const confirm = await Swal.fire({
    title: `Lulus ${approveApps.length} permohonan?`,
    html: `Termasuk:<br>
      - Disahkan: ${approveApps.filter(x => String(x.Status).toLowerCase() === 'disahkan').length}<br>
      - Ditolak: ${approveApps.filter(x => String(x.Status).toLowerCase() === 'ditolak').length}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Lulus Semua',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10B981'
  });

  if (!confirm.isConfirmed) return;

  Swal.fire({
    title: 'Meluluskan permohonan...',
    html: 'Ini mungkin mengambil sedikit masa...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const ids = approveApps.map(x => x.RequestID);

    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'bulkApprove',
        requestIds: ids
      })
    });

    const res = await response.json();

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Selesai!',
        html: `${res.successCount || ids.length} permohonan berjaya diluluskan`,
        confirmButtonColor: '#D4AF37'
      });
      loadApplications();
    } else {
      Swal.fire('Ralat', res.message || 'Gagal bulk approve', 'error');
    }
  } catch (err) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}
    window.sahkan = sahkan;
    window.sendQuery = sendQuery;
    window.viewApplicationDetails = viewApplicationDetails;
    window.tolakPremis = tolakPremis;
    window.approveLetter = approveLetter;
    window.bulkApprove = bulkApprove;
/* ========================= PPD DASHBOARD ========================== */
function showPpdDashboard() {
  pegawaiLoginDiv.style.display = 'none';
  
  const ppdDashboard = document.getElementById('ppd-dashboard');
  if (ppdDashboard) {
    ppdDashboard.style.display = 'block';
  }
  
  const dashboardTitle = document.getElementById('ppd-dashboard-title');
  if (dashboardTitle) {
    if (currentPpdDaerah === 'NEGERI') {
      dashboardTitle.innerHTML = '<i class="fas fa-map"></i> Dashboard PPD Negeri Pahang';
    } else {
      dashboardTitle.innerHTML = '<i class="fas fa-map-marker-alt"></i> Dashboard PPD ' + currentPpdDaerah;
    }
  }
  
  loadPpdData();
  
  Swal.fire({
    icon: 'success',
    title: 'Berjaya Log Masuk',
    text: currentPpdDaerah === 'NEGERI' ? 'PPD Negeri' : 'PPD ' + currentPpdDaerah,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000
  });
}

async function loadPpdData() {
  try {
    Swal.fire({
      title: 'Memuatkan data...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    
    const response = await fetch(buildGET('listMaster'));
    const result = await response.json();
    
    Swal.close();
    
    if (result && result.success && result.data) {
      let data = result.data;
      
      if (currentPpdDaerah !== 'NEGERI') {
        data = data.filter(app => {
          const daerahUpper = String(app.Daerah || '').toUpperCase();
          return daerahUpper === currentPpdDaerah;
        });
      }
      
      ppdAllData = data;
      
      ppdFilters.kategori = 'Semua';
      ppdFilters.status = 'Semua';
      
      const ppdFilterKategori = document.getElementById('ppdFilterKategori');
      const ppdFilterStatus = document.getElementById('ppdFilterStatus');
      if (ppdFilterKategori) ppdFilterKategori.value = 'Semua';
      if (ppdFilterStatus) ppdFilterStatus.value = 'Semua';
      
      applyPpdFilters();
      
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Ralat',
        text: 'Tidak dapat memuatkan data',
        confirmButtonColor: '#D4AF37'
      });
    }
    
  } catch (error) {
    Swal.close();
    console.error('Load PPD data error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Ralat',
      text: 'Tidak dapat berhubung dengan server',
      confirmButtonColor: '#D4AF37'
    });
  }
}

function applyPpdFilters() {
  if (!ppdAllData || ppdAllData.length === 0) {
    return;
  }
  
  let filtered = ppdAllData;
  
  if (ppdFilters.kategori !== 'Semua') {
    filtered = filtered.filter(app => app.Kategori === ppdFilters.kategori);
  }
  
  if (ppdFilters.status !== 'Semua') {
    filtered = filtered.filter(app => {
      const status = String(app.Status || '').toLowerCase();
      const filterStatus = ppdFilters.status.toLowerCase();
      return status === filterStatus || 
             (filterStatus === 'tolak' && (status === 'tolak' || status === 'ditolak'));
    });
  }
  
  ppdFilteredData = filtered;
  
  displayPpdStats(filtered);
  displayPpdCategoryBreakdown(filtered);
  displayPpdApplicationsTable(filtered);
}

function displayPpdStats(data) {
  const total = data.length;
  const baru = data.filter(x => String(x.Status || '').toLowerCase() === 'baru').length;
  const query = data.filter(x => String(x.Status || '').toLowerCase() === 'query').length;
  const disahkan = data.filter(x => String(x.Status || '').toLowerCase() === 'disahkan').length;
  const lulus = data.filter(x => String(x.Status || '').toLowerCase() === 'lulus').length;
  const tolak = data.filter(x => {
    const s = String(x.Status || '').toLowerCase();
    return s === 'tolak' || s === 'ditolak';
  }).length;
  
  const statsDiv = document.getElementById('ppd-stats-cards');
  if (!statsDiv) return;
  
  statsDiv.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
      <div style="font-size: 2.5rem; font-weight: bold;">${total}</div>
      <div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">JUMLAH</div>
    </div>
    
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
      <div style="font-size: 2.5rem; font-weight: bold;">${baru}</div>
      <div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">BARU</div>
    </div>
    
    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
      <div style="font-size: 2.5rem; font-weight: bold;">${query}</div>
      <div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">QUERY</div>
    </div>
    
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
      <div style="font-size: 2.5rem; font-weight: bold;">${disahkan}</div>
      <div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">DISAHKAN</div>
    </div>
    
    <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
      <div style="font-size: 2.5rem; font-weight: bold;">${lulus}</div>
      <div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">LULUS</div>
    </div>
    
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
      <div style="font-size: 2.5rem; font-weight: bold;">${tolak}</div>
      <div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">DITOLAK</div>
    </div>
  `;
}

function displayPpdCategoryBreakdown(data) {
  const kenamaan = data.filter(x => x.Kategori === 'Kenamaan').length;
  const agensi = data.filter(x => x.Kategori === 'Agensi').length;
  const premis = data.filter(x => x.Kategori === 'Premis').length;
  const total = data.length || 1;
  
  const categoryDiv = document.getElementById('ppd-category-breakdown');
  if (!categoryDiv) return;
  
  const createBar = (label, value, total, color) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="font-weight: 600;">${label}</span>
          <span style="color: #666;">${value} (${percentage}%)</span>
        </div>
        <div style="background: #E5E7EB; height: 30px; border-radius: 5px; overflow: hidden;">
          <div style="background: ${color}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
        </div>
      </div>
    `;
  };
  
  categoryDiv.innerHTML = `
    ${createBar('Kenamaan', kenamaan, total, '#D4AF37')}
    ${createBar('Agensi', agensi, total, '#3B82F6')}
    ${createBar('Premis', premis, total, '#10B981')}
  `;
}

function displayPpdApplicationsTable(data) {
  const tableDiv = document.getElementById('ppd-applications-table');
  if (!tableDiv) return;
  
  if (data.length === 0) {
    tableDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Tiada permohonan ditemui.</p>';
    return;
  }
  
  const sorted = data.sort((a, b) => {
    const dateA = new Date(a.TarikhHantar || 0);
    const dateB = new Date(b.TarikhHantar || 0);
    return dateB - dateA;
  });
  
  let html = '<table>';
  html += '<thead>';
  html += '<tr>';
  html += '<th>Request ID</th>';
  html += '<th>Sekolah</th>';
  html += '<th>Kategori</th>';
  html += '<th>Tarikh</th>';
  html += '<th>Status</th>';
  html += '<th>Tindakan</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';
  
  sorted.forEach(app => {
    html += '<tr>';
    html += '<td><strong>' + (app.RequestID || '-') + '</strong></td>';
    html += '<td>' + (app.NamaSekolah || '-') + '</td>';
    html += '<td>' + (app.Kategori || '-') + '</td>';
    html += '<td>' + formatDate(app.TarikhHantar) + '</td>';
    html += '<td><span class="status-badge ' + getStatusClass(app.Status) + '">' + (app.Status || 'Baru') + '</span></td>';
    html += '<td><button class="btn-table btn-view" onclick="viewApplicationDetails(\'' + app.RequestID + '\')"><i class="fas fa-eye"></i> Lihat</button></td>';
    html += '</tr>';
  });
  
  html += '</tbody>';
  html += '</table>';
  
  tableDiv.innerHTML = html;
}

/* ========================= TOLAK AGENSI ========================== */
window.tolakAgensi = async function(requestId) {
  const { value: formValues } = await Swal.fire({
    title: 'Tolak Permohonan Agensi',
    html: `
      <div style="text-align: left;">
        <p style="margin-bottom: 1rem; color: #666;">
          <i class="fas fa-info-circle"></i> Masukkan maklumat surat penolakan
        </p>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Jilid Surat *
          </label>
          <input id="jilid-agensi" class="swal2-input" placeholder="Contoh: JPN.PHG(SPS)" style="width: 90%;">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Bilangan Surat *
          </label>
          <input id="bilSurat-agensi" class="swal2-input" placeholder="Contoh: 1234" style="width: 90%;">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Tarikh Surat *
          </label>
          <input id="tarikhSurat-agensi" type="date" class="swal2-input" style="width: 90%;">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Sebab Penolakan *
          </label>
          <textarea id="sebabPenolakan-agensi" class="swal2-textarea" placeholder="Nyatakan sebab permohonan ditolak..." style="width: 90%; min-height: 100px;"></textarea>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-paper-plane"></i> Hantar Penolakan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    width: '600px',
    preConfirm: () => {
      const jilid = document.getElementById('jilid-agensi').value;
      const bilSurat = document.getElementById('bilSurat-agensi').value;
      const tarikhSurat = document.getElementById('tarikhSurat-agensi').value;
      const sebabPenolakan = document.getElementById('sebabPenolakan-agensi').value;
      
      if (!jilid || !bilSurat || !tarikhSurat || !sebabPenolakan) {
        Swal.showValidationMessage('Sila lengkapkan semua maklumat');
        return false;
      }
      
      return { jilid, bilSurat, tarikhSurat, sebabPenolakan };
    }
  });
  
  if (formValues) {
    try {
      Swal.fire({
        title: 'Menghantar penolakan...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      const response = await fetch(GAS_POST, {
        method: 'POST',
        body: JSON.stringify({
          action: 'tolakAgensi',
          requestId: requestId,
          jilid: formValues.jilid,
          bilSurat: formValues.bilSurat,
          tarikhSurat: formValues.tarikhSurat,
          sebabPenolakan: formValues.sebabPenolakan
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berjaya Ditolak',
          text: 'Surat penolakan telah dihantar ke agensi.',
          confirmButtonColor: '#D4AF37'
        }).then(() => {
          loadApplications();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ralat',
          text: result.message || 'Gagal menolak permohonan',
          confirmButtonColor: '#D4AF37'
        });
      }
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Ralat',
        text: 'Tidak dapat berhubung dengan server',
        confirmButtonColor: '#D4AF37'
      });
    }
  }
}

}); // End safeRun('pegawai-login')
}); // End whenReady

