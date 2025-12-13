/* ===== QUERY.JS - TAB QUERY ===== */
whenReady(() => {
  safeRun('btnQuerySearch', () => {

const btnQuerySearch = document.getElementById('btnQuerySearch');
const queryKodSekolahInput = document.getElementById('queryKodSekolah');
const queryResultDiv = document.getElementById('queryResult');

if (btnQuerySearch) {
  btnQuerySearch.addEventListener('click', searchQuery);
}

if (queryKodSekolahInput) {
  queryKodSekolahInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchQuery();
  });
}

async function searchQuery() {
  const input = queryKodSekolahInput.value.trim().toUpperCase();

  if (!input) {
    Swal.fire({
      icon: 'warning',
      title: 'Input Diperlukan',
      text: 'Sila masukkan Kod Sekolah atau Request ID.',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }

  Swal.fire({
    title: 'Mencari...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Try Request ID OR Kod Sekolah (backend auto detect)
let response = await fetch(buildGET('getRequest', { requestId: input }));
let result = await response.json();

Swal.close();

if (result.success && result.data) {

  // 🔑 NORMALISE: pastikan SENTIASA array
  const apps = Array.isArray(result.data) ? result.data : [result.data];

  // 🔍 FILTER QUERY SAHAJA
  const queryApps = apps.filter(app =>
    String(app.Status || '').toLowerCase() === 'query'
  );

  if (queryApps.length === 0) {
    queryResultDiv.innerHTML = `
      <div class="no-data">
        <i class="fas fa-inbox" style="font-size:3rem; color:#ccc;"></i>
        <p>Tiada permohonan Query untuk ${input}</p>
      </div>
    `;
    return;
  }

  // ✅ CatatanPegawai sudah datang terus dari borang kategori
  displayQueryResults(queryApps);
  return;
}
 else {
      queryResultDiv.innerHTML = `
        <div class="no-data">
          <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#ccc;"></i>
          <p>Tidak dijumpai</p>
        </div>
      `;
    }
  } catch (error) {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Ralat',
      text: 'Tidak dapat berhubung dengan server.',
      confirmButtonColor: '#D4AF37'
    });
  }
}

function displayQueryResults(applications) {
  let html = '<div class="query-results">';

  applications.forEach(app => {
    // Dapatkan catatan dari column CatatanPegawai
    const catatan = app.CatatanPegawai || app.Catatan || 'Tiada catatan';
    
    html += `
      <div class="query-card">
        <div class="query-header">
          <h3><i class="fas fa-file-alt"></i> ${app.RequestID}</h3>
          <span class="status-badge query">${app.Status}</span>
        </div>
        <div class="query-body">
          <p><strong>Kategori:</strong> ${app.Kategori}</p>
          <p><strong>Kod Sekolah:</strong> ${app.KodSekolah || '-'}</p>
          <p><strong>Nama Sekolah:</strong> ${app.NamaSekolah || '-'}</p>
          <p><strong>Tarikh Hantar:</strong> ${formatDate(app.TarikhHantar)}</p>
          <div class="query-note">
            <strong><i class="fas fa-comment-dots"></i> Catatan Pegawai:</strong><br>
            <div style="background: #FEF3C7; padding: 0.75rem; border-radius: 5px; margin-top: 0.5rem;">
              ${catatan}
            </div>
          </div>
        </div>
        <div class="query-footer">
          <h4 style="margin-bottom:1rem;"><i class="fas fa-upload"></i> Hantar Semula Dokumen (Opsional)</h4>
          
          <div class="query-upload">
            <label>Surat Permohonan (PDF)</label>
            <input type="file" id="qfile_surat_${app.RequestID}" accept=".pdf" class="file-input" />
          </div>
          
          <div class="query-upload">
            <label>Borang Permohonan (PDF)</label>
            <input type="file" id="qfile_borang_${app.RequestID}" accept=".pdf" class="file-input" />
          </div>
          
          <div class="query-upload">
            <label>Kertas Cadangan (PDF)</label>
            <input type="file" id="qfile_cadangan_${app.RequestID}" accept=".pdf" class="file-input" />
          </div>
          
          <button class="btn-primary" onclick="resubmitQuery('${app.RequestID}')">
            <i class="fas fa-paper-plane"></i> Hantar Semula
          </button>
        </div>
      </div>
    `;
  });

  html += '</div>';
  queryResultDiv.innerHTML = html;
}

async function resubmitQuery(requestId) {
  // Collect files
  const fileSurat = document.getElementById(`qfile_surat_${requestId}`).files[0];
  const fileBorang = document.getElementById(`qfile_borang_${requestId}`).files[0];
  const fileCadangan = document.getElementById(`qfile_cadangan_${requestId}`).files[0];

  if (!fileSurat && !fileBorang && !fileCadangan) {
    Swal.fire({
      icon: 'warning',
      title: 'Tiada Fail',
      text: 'Sila pilih sekurang-kurangnya satu fail untuk dihantar semula.',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }

  Swal.fire({
    title: 'Menghantar semula...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const files = [];

    if (fileSurat) {
      const base64 = await readFileAsBase64(fileSurat);
      files.push({ name: fileSurat.name, base64, mime: 'application/pdf', type: 'surat' });
    }

    if (fileBorang) {
      const base64 = await readFileAsBase64(fileBorang);
      files.push({ name: fileBorang.name, base64, mime: 'application/pdf', type: 'borang' });
    }

    if (fileCadangan) {
      const base64 = await readFileAsBase64(fileCadangan);
      files.push({ name: fileCadangan.name, base64, mime: 'application/pdf', type: 'cadangan' });
    }

    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify({
        action: 'resubmitQuery',
        requestId,
        files
      })
    });

    const result = await response.json();

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berjaya!',
        text: 'Permohonan telah dihantar semula.',
        confirmButtonColor: '#D4AF37'
      });
      queryResultDiv.innerHTML = '';
      queryKodSekolahInput.value = '';
    } else {
      Swal.fire('Ralat', result.message || 'Gagal hantar semula', 'error');
    }
  } catch (error) {
    Swal.fire('Ralat', 'Tidak dapat berhubung dengan server', 'error');
  }
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}
window.resubmitQuery = resubmitQuery;
}); // End safeRun('btnQuerySearch')

}); // End whenReady
