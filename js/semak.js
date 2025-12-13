/* ===== SEMAK.JS - SEMAK STATUS PERMOHONAN ===== */
whenReady(() => {
  safeRun('btnSemakStatus', () => {

const btnSemakStatus = document.getElementById('btnSemakStatus');
const semakKodSekolahInput = document.getElementById('semakKodSekolah');
const semakResultDiv = document.getElementById('semakResult');

/* ========================= SEARCH HANDLER ========================= */
btnSemakStatus.addEventListener('click', async () => {
  const searchValue = semakKodSekolahInput.value.trim().toUpperCase();
  
  if (!searchValue) {
    Swal.fire({
      icon: 'warning',
      title: 'Medan Kosong',
      text: 'Sila masukkan Kod Sekolah atau Request ID',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }
  
  try {
    Swal.fire({
      title: 'Mencari permohonan...',
      text: 'Sila tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    let url;
    
    // ⭐ DETECT: Request ID (ABC12345) or Kod Sekolah (PEA1234)
    if (/^[A-Z]{3}\d{5}$/.test(searchValue)) {
      // Request ID format: 3 letters + 5 numbers
      url = buildGET('getRequest', { requestId: searchValue });
    } else {
      // Kod Sekolah
      url = buildGET('listBySchool', { kodSekolah: searchValue });
    }
    
    const response = await fetch(url);
    const result = await response.json();
    
    Swal.close();
    
    if (result && result.success) {
      // Handle both single result (getRequest) and array (listBySchool)
      const apps = result.data ? (Array.isArray(result.data) ? result.data : [result.data]) : [];
      
      if (apps.length > 0) {
        displayResults(apps);
      } else {
        semakResultDiv.innerHTML = `
          <div class="content-card text-center" style="padding:3rem;">
            <i class="fas fa-search" style="font-size:3rem; color:#D4AF37; margin-bottom:1rem;"></i>
            <p style="color:#666; font-size:1.1rem;">Tiada permohonan ditemui</p>
          </div>
        `;
      }
    } else {
      semakResultDiv.innerHTML = `
        <div class="content-card text-center" style="padding:3rem;">
          <i class="fas fa-inbox" style="font-size:3rem; color:#ccc; margin-bottom:1rem;"></i>
          <p style="color:#666;">Tiada permohonan ditemui untuk ${searchValue}</p>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('Semak error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Ralat',
      text: 'Tidak dapat berhubung dengan server.',
      confirmButtonColor: '#D4AF37'
    });
  }
});

/* ========================= DISPLAY RESULTS ========================= */
function displayResults(applications) {
  if (applications.length === 0) {
    semakResultDiv.innerHTML = '<p class="no-data">Tiada permohonan dijumpai.</p>';
    return;
  }

  let html = `
    <h3 style="margin-top:2rem; margin-bottom:1.5rem; color:#D4AF37;">
      <i class="fas fa-list-check"></i> Permohonan Dijumpai: ${applications.length}
    </h3>
  `;

  // ⭐ CARD LAYOUT
  applications.forEach(app => {
    const status = String(app.Status || '').toLowerCase();
    const statusInfo = getStatusInfo(app.Status);
    
    // Check for letter URL
    const suratUrl = app.SuratKelulusan || app.SuratURL || '';
    
    html += `
      <div class="application-card">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
          <div>
            <h4 style="margin:0; color:#000; font-size:1.2rem;">
              <i class="fas fa-hashtag"></i> ${app.RequestID}
            </h4>
            <p style="margin:0.25rem 0 0 0; color:#666;">
              ${app.NamaSekolah || 'N/A'}
            </p>
          </div>
          <span class="status-badge ${statusInfo.class}">
            <i class="${statusInfo.icon}"></i> ${app.Status || 'Baru'}
          </span>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:1rem; margin:1rem 0; padding:1rem 0; border-top:1px solid #E5E7EB; border-bottom:1px solid #E5E7EB;">
          <div>
            <p style="margin:0; font-size:0.8rem; color:#9CA3AF; text-transform:uppercase;">Kategori</p>
            <p style="margin:0.25rem 0 0 0; font-weight:600; color:#374151;">${app.Kategori || '-'}</p>
          </div>
          <div>
            <p style="margin:0; font-size:0.8rem; color:#9CA3AF; text-transform:uppercase;">Tarikh Hantar</p>
            <p style="margin:0.25rem 0 0 0; font-weight:600; color:#374151;">${formatDate(app.TarikhHantar)}</p>
          </div>
          <div style="grid-column: 1 / -1;">
            <p style="margin:0; font-size:0.8rem; color:#9CA3AF; text-transform:uppercase;">Kod Sekolah</p>
            <p style="margin:0.25rem 0 0 0; font-weight:600; color:#374151;">${app.KodSekolah || '-'}</p>
          </div>
        </div>
        
        ${status === 'query' ? `
          <div style="background:#FEF3C7; border-left:4px solid #F59E0B; padding:1.25rem; border-radius:6px; margin:1rem 0;">
            <p style="margin:0 0 0.75rem 0; font-weight:700; color:#92400E; font-size:1rem;">
              <i class="fas fa-exclamation-triangle"></i> Tindakan Diperlukan
            </p>
            
            ${app.CatatanPegawai ? `
              <div style="background:#FFF; padding:0.875rem; border-radius:4px; margin-bottom:0.875rem; border:1px solid #FDE68A;">
                <p style="margin:0 0 0.375rem 0; font-size:0.75rem; color:#78350F; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">
                  Catatan Pegawai:
                </p>
                <p style="margin:0; font-size:0.925rem; color:#1F2937; line-height:1.5;">
                  ${app.CatatanPegawai}
                </p>
              </div>
            ` : ''}
            
            <div style="background:#FFFBEB; padding:0.875rem; border-radius:4px; margin-bottom:0.875rem; border:1px solid #FDE68A;">
              <p style="margin:0 0 0.5rem 0; font-size:0.875rem; color:#78350F; font-weight:600;">
                <i class="fas fa-arrow-right"></i> Langkah seterusnya:
              </p>
              <ol style="margin:0; padding-left:1.25rem; color:#78350F; font-size:0.875rem; line-height:1.6;">
                <li>Pergi ke tab <strong>QUERY</strong></li>
                <li>Masukkan <strong>Request ID</strong> atau <strong>Kod Sekolah</strong></li>
                <li>Muat naik dokumen yang telah dikemaskini</li>
              </ol>
            </div>
            
            <div style="display:flex; align-items:start; gap:0.5rem; font-size:0.8125rem; color:#92400E; background:#FEF3C7; padding:0.625rem; border-radius:4px;">
              <i class="fas fa-envelope" style="margin-top:0.125rem; flex-shrink:0;"></i>
              <span>Maklumat lengkap telah dihantar ke email. Sila semak folder spam jika perlu.</span>
            </div>
          </div>
        ` : ''}
        
        ${app.CatatanPegawai && status !== 'query' ? `
          <div style="background:#FEF3C7; border-left:3px solid #F59E0B; padding:1rem; border-radius:4px; margin:1rem 0;">
            <p style="margin:0; font-size:0.85rem; color:#92400E;">
              <i class="fas fa-comment-dots"></i> <strong>Catatan Pegawai:</strong><br>
              ${app.CatatanPegawai}
            </p>
          </div>
        ` : ''}
        
        <div style="display:flex; gap:0.75rem; margin-top:1rem;">
          <button onclick="viewApplication('${app.RequestID}')" class="btn-table btn-view" style="flex:1;">
            <i class="fas fa-eye"></i> Lihat Detail
          </button>
          
          ${suratUrl && suratUrl !== '' ? `
            <a href="${suratUrl}" target="_blank" class="btn-table" style="flex:1; background:#10B981; color:white; text-decoration:none;">
              <i class="fas fa-file-pdf"></i> Muat Turun Surat
            </a>
          ` : ''}
        </div>
      </div>
    `;
  });

  semakResultDiv.innerHTML = html;
}

/* ========================= HELPER FUNCTIONS ========================= */
function getStatusInfo(status) {
  const statusMap = {
    'Baru': { class: 'baru', icon: 'fas fa-paper-plane' },
    'Query': { class: 'query', icon: 'fas fa-question-circle' },
    'Disahkan': { class: 'disahkan', icon: 'fas fa-check-circle' },
    'Lulus': { class: 'lulus', icon: 'fas fa-check-double' },
    'Ditolak': { class: 'tolak', icon: 'fas fa-times-circle' },
    'Tolak': { class: 'tolak', icon: 'fas fa-times-circle' }
  };
  return statusMap[status] || statusMap['Baru'];
}

function getStatusClass(status) {
  const statusMap = {
    'Baru': 'baru',
    'Query': 'query',
    'Disahkan': 'disahkan',
    'Lulus': 'lulus',
    'Ditolak': 'tolak',
    'Tolak': 'tolak'
  };
  return statusMap[status] || 'baru';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return day + '/' + month + '/' + year;
}

/* ========================= VIEW APPLICATION DETAILS ========================= */
window.viewApplication = async function(requestId) {
  try {
    Swal.fire({
      title: 'Memuatkan maklumat...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const url = buildGET('getRequest', { requestId: requestId });
    const response = await fetch(url);
    const result = await response.json();
    
   if (result && result.success && result.data) {
  const app = Array.isArray(result.data)
    ? result.data[0]
    : result.data;

      showApplicationDetails(app);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Ralat',
        text: 'Tidak dapat memuatkan maklumat permohonan.',
        confirmButtonColor: '#D4AF37'
      });
    }

    
  } catch (error) {
    console.error('View error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Ralat',
      text: 'Tidak dapat berhubung dengan server.',
      confirmButtonColor: '#D4AF37'
    });
  }
}

function showApplicationDetails(data) {
  let html = '<div style="text-align:left; max-height:500px; overflow-y:auto;">';
  html += '<h3 style="color:#D4AF37; margin-bottom:1rem;">Maklumat Lengkap</h3>';
  html += '<table style="width:100%; border-collapse:collapse;">';
  
  Object.keys(data).forEach(key => {
    if (key.startsWith('File_') && data[key]) {
      html += '<tr style="border-bottom:1px solid #eee;">';
      html += '<td style="padding:0.75rem; font-weight:600; width:40%;">' + key.replace('File_', '') + '</td>';
      html += '<td style="padding:0.75rem;"><a href="' + data[key] + '" target="_blank" style="color:#3B82F6;"><i class="fas fa-external-link-alt"></i> Buka Fail</a></td>';
      html += '</tr>';
    } else if (data[key] && !key.includes('URL') && key !== 'SuratKelulusan') {
      html += '<tr style="border-bottom:1px solid #eee;">';
      html += '<td style="padding:0.75rem; font-weight:600; width:40%; color:#666;">' + key + '</td>';
      html += '<td style="padding:0.75rem; color:#374151;">' + data[key] + '</td>';
      html += '</tr>';
    }
  });
  
  html += '</table>';
  html += '</div>';
  
  Swal.fire({
    title: 'Request ID: ' + data.RequestID,
    html: html,
    width: '900px',
    confirmButtonColor: '#D4AF37',
    confirmButtonText: 'Tutup'
  });
}

  }); // End safeRun
}); // End whenReady

