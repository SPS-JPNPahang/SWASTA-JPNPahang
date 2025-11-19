/* ===== AGENSI.JS - VIEW PERMOHONAN AGENSI (PUBLIC) ===== */
whenReady(() => {
  safeRun('btnLoadAgensi', () => {

const btnAgensiSearch = document.getElementById('btnAgensiSearch');
const agensiSearchInput = document.getElementById('agensiSearch');
const agensiTableDiv = document.getElementById('agensiTable');

// Load all agency applications on tab load
loadAgensiApplications();

btnAgensiSearch.addEventListener('click', () => {
  loadAgensiApplications(agensiSearchInput.value.trim());
});

agensiSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loadAgensiApplications(agensiSearchInput.value.trim());
  }
});

async function loadAgensiApplications(searchTerm = '') {
  try {
    Swal.fire({
      title: 'Memuatkan data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Fetch applications from Agensi category
    const url = buildGET('listAgensi');
    const response = await fetch(url);
    const result = await response.json();
    
    Swal.close();
    
    if (result && result.success && result.data) {
      let applications = result.data;
      
      // Filter by search term if provided
      if (searchTerm) {
        applications = applications.filter(app => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (app.RequestID && app.RequestID.toLowerCase().includes(searchLower)) ||
            (app.NamaAgensi && app.NamaAgensi.toLowerCase().includes(searchLower)) ||
            (app.NamaSekolah && app.NamaSekolah.toLowerCase().includes(searchLower))
          );
        });
      }
      
      displayAgensiTable(applications);
    } else {
      agensiTableDiv.innerHTML = '<p class="text-center" style="color:#666;">Tiada permohonan agensi ditemui.</p>';
    }
    
  } catch (error) {
    console.error('Load agensi error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Ralat',
      text: 'Tidak dapat memuatkan data.',
      confirmButtonColor: '#D4AF37'
    });
  }
}

function displayAgensiTable(applications) {
  if (applications.length === 0) {
    agensiTableDiv.innerHTML = '<p class="text-center" style="color:#666;">Tiada permohonan ditemui.</p>';
    return;
  }
  
  let html = '<table>';
  html += '<thead>';
  html += '<tr>';
  html += '<th>Request ID</th>';
  html += '<th>Nama Agensi</th>';
  html += '<th>Nama Sekolah</th>';
  html += '<th>Tarikh Hantar</th>';
  html += '<th>Status</th>';
  html += '<th>Tindakan</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';
  
  applications.forEach(app => {
    const statusClass = getStatusClass(app.Status);
    const tarikhHantar = formatDate(app.TarikhHantar);
    
    html += '<tr>';
    html += '<td><strong>' + (app.RequestID || '-') + '</strong></td>';
    html += '<td>' + (app.NamaAgensi || '-') + '</td>';
    html += '<td>' + (app.NamaSekolah || '-') + '</td>';
    html += '<td>' + tarikhHantar + '</td>';
    html += '<td><span class="status-badge ' + statusClass + '">' + (app.Status || 'Baru') + '</span></td>';
    html += '<td><button class="btn-table btn-view" onclick="viewAgensiApplication(\'' + app.RequestID + '\')"><i class="fas fa-eye"></i> Lihat</button></td>';
    html += '</tr>';
  });
  
  html += '</tbody>';
  html += '</table>';
  
  agensiTableDiv.innerHTML = html;
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

async function viewAgensiApplication(requestId) {
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
      showAgensiDetails(result.data);
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

function showAgensiDetails(data) {
  let html = '<div style="text-align:left;">';
  html += '<h3 style="color:#D4AF37; margin-bottom:1rem;">Maklumat Permohonan Agensi</h3>';
  html += '<table style="width:100%; border-collapse:collapse;">';
  
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

window.viewAgensiApplication = viewAgensiApplication;
});
});