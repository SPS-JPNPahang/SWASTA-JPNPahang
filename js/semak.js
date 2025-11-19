/* ===== SEMAK.JS - SEMAK STATUS PERMOHONAN ===== */
whenReady(() => {
  safeRun('btnSemakStatus', () => {

const btnSemakStatus = document.getElementById('btnSemakStatus');
const semakKodSekolahInput = document.getElementById('semakKodSekolah');
const semakResultDiv = document.getElementById('semakResult');

btnSemakStatus.addEventListener('click', async () => {
  const kodSekolah = semakKodSekolahInput.value.trim().toUpperCase();
  
  if (!kodSekolah) {
    Swal.fire({
      icon: 'warning',
      title: 'Kod Sekolah Diperlukan',
      text: 'Sila masukkan kod sekolah anda.',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }
  
  try {
    // Show loading
    Swal.fire({
      title: 'Mencari permohonan...',
      text: 'Sila tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Fetch applications by school code
    const url = buildGET('listBySchool', { kodSekolah: kodSekolah });
    const response = await fetch(url);
    const result = await response.json();
    
    Swal.close();
    
    if (result && result.success && result.data && result.data.length > 0) {
      displayResults(result.data);
    } else {
      semakResultDiv.innerHTML = `
        <div class="content-card text-center">
          <i class="fas fa-inbox" style="font-size:3rem; color:#ccc; margin-bottom:1rem;"></i>
          <p style="color:#666;">Tiada permohonan ditemui untuk kod sekolah ini.</p>
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

function displayResults(applications) {
  if (applications.length === 0) {
    semakResultDiv.innerHTML = '<p class="no-data">Tiada permohonan dijumpai.</p>';
    return;
  }

  let html = `
    <h3 style="margin-top:2rem; color:#D4AF37;">
      <i class="fas fa-list"></i> Permohonan Anda (${applications.length})
    </h3>
    <table>
      <thead>
        <tr>
          <th>Request ID</th>
          <th>Kategori</th>
          <th>Tarikh</th>
          <th>Status</th>
          <th>Catatan/Surat</th>
        </tr>
      </thead>
      <tbody>
  `;

  applications.forEach(app => {
    const status = String(app.Status || '').toLowerCase();
    
    // Link Surat atau Catatan Query
    let actionCol = '-';
    
    // Check for SuratKelulusan or SuratURL
    const suratUrl = app.SuratKelulusan || app.SuratURL || '';
    
    if ((status === 'lulus' || status === 'tolak') && suratUrl) {
      actionCol = `<a href="${suratUrl}" target="_blank" class="btn-table btn-view">
        <i class="fas fa-file-pdf"></i> Surat
      </a>`;
    } else if (status === 'query') {
      const catatan = app.Catatan || app.CatatanPegawai || '-';
      actionCol = `<div style="max-width:200px; font-size:0.85rem; color:#F59E0B;">
        ${catatan}
      </div>`;
    }

    html += `
      <tr>
        <td><strong>${app.RequestID}</strong></td>
        <td>${app.Kategori}</td>
        <td>${formatDate(app.TarikhHantar)}</td>
        <td><span class="status-badge ${getStatusClass(app.Status)}">${app.Status}</span></td>
        <td>${actionCol}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  semakResultDiv.innerHTML = html;
}

function getStatusClass(status) {
  const statusMap = {
    'Baru': 'baru',
    'Sedang Diproses': 'sedang-diproses',
    'Query': 'query',
    'Disahkan': 'disahkan',
    'Lulus': 'lulus',
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

// View application details
async function viewApplication(requestId) {
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
      showApplicationDetails(result.data);
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
  let html = '<div style="text-align:left;">';
  html += '<h3 style="color:#D4AF37; margin-bottom:1rem;">Maklumat Permohonan</h3>';
  html += '<table style="width:100%; border-collapse:collapse;">';
  
  // Display all fields
  Object.keys(data).forEach(key => {
    if (key.startsWith('File_') && data[key]) {
      html += '<tr style="border-bottom:1px solid #eee;">';
      html += '<td style="padding:0.5rem; font-weight:600;">' + key + '</td>';
      html += '<td style="padding:0.5rem;"><a href="' + data[key] + '" target="_blank" style="color:#3B82F6;">Lihat Fail</a></td>';
      html += '</tr>';
    } else if (data[key]) {
      html += '<tr style="border-bottom:1px solid #eee;">';
      html += '<td style="padding:0.5rem; font-weight:600; width:40%;">' + key + '</td>';
      html += '<td style="padding:0.5rem;">' + data[key] + '</td>';
      html += '</tr>';
    }
  });
  
  html += '</table>';
  html += '</div>';
  
  Swal.fire({
    title: 'Request ID: ' + data.RequestID,
    html: html,
    width: '800px',
    confirmButtonColor: '#D4AF37',
    confirmButtonText: 'Tutup'
  });
}
});
});