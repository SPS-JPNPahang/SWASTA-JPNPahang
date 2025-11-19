/* ===== FORMS.JS - FORM HANDLING WITH SWEETALERT2 ===== */
whenReady(() => {
  safeRun('kategori', () => {

let SCHOOLS = [];

// DOM Elements
const kategoriEl = document.getElementById('kategori');
const forms = {
  'Kenamaan': document.getElementById('form-kenamaan'),
  'Premis': document.getElementById('form-premis'),
  'Agensi': document.getElementById('form-agensi')
};

/* ===== INITIALIZATION ===== */
async function init() {
  // Always show form first
  showFormFor(kategoriEl.value);
  setupFileInputs();
  
  // Then load schools in background
  try {
    const response = await fetch(GAS_GET);
    const json = await response.json();
    
    if (json && json.success) {
      SCHOOLS = json.schools || [];
      console.log('✅ Loaded ' + SCHOOLS.length + ' schools');
    }
  } catch (error) {
    console.log('⚠️ Schools not loaded, manual entry required');
    SCHOOLS = [];
  }
}

// Panggil selepas DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ===== FORM SWITCHING ===== */
function showFormFor(kategori) {
  // Hide all forms
  Object.keys(forms).forEach(key => {
    forms[key].classList.remove('active');
  });
  
  // Show selected form
  forms[kategori].classList.add('active');
}

// Listen to kategori change
kategoriEl.addEventListener('change', (e) => {
  showFormFor(e.target.value);
});

/* ===== HELPER FUNCTIONS ===== */
function norm(text) {
  return String(text || '').toUpperCase().trim();
}

function dayMalay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  return days[date.getDay()];
}

/* ===== AUTO-FILL SCHOOL DATA ===== */
function wireAutofill(prefix) {
  const kodInput = document.getElementById('kodSekolah_' + prefix);
  const namaInput = document.getElementById('namaSekolah_' + prefix);
  const daerahInput = document.getElementById('daerah_' + prefix);
  const peringkatInput = document.getElementById('peringkat_' + prefix);
  
  if (!kodInput) return;
  
  kodInput.addEventListener('input', (e) => {
    e.target.value = norm(e.target.value);
  });
  
  kodInput.addEventListener('blur', () => {
    const kod = norm(kodInput.value);
    const school = SCHOOLS.find(s => s.kod === kod);
    
    if (school) {
      if (namaInput) namaInput.value = school.nama || '';
      if (daerahInput) daerahInput.value = school.daerah || '';
      if (peringkatInput) peringkatInput.value = school.peringkat || '';
      
      // Show success notification
      Swal.fire({
        icon: 'success',
        title: 'Sekolah Ditemui',
        text: school.nama,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    } else {
      if (namaInput) namaInput.value = '';
      if (daerahInput) daerahInput.value = '';
      if (peringkatInput) peringkatInput.value = '';
      
      if (kod !== '') {
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'Kod Tidak Ditemui',
          text: 'Sila semak kod sekolah',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      }
    }
  });
}

['k', 'p', 'a'].forEach(prefix => wireAutofill(prefix));

/* ===== AUTO-FILL HARI FOR KENAMAAN ===== */
const tarikhProgramInput = document.getElementById('tarikhProgram_k');
const hariProgramInput = document.getElementById('hariProgram_k');

if (tarikhProgramInput && hariProgramInput) {
  tarikhProgramInput.addEventListener('change', () => {
    hariProgramInput.value = dayMalay(tarikhProgramInput.value);
  });
}

/* ===== FILE UPLOAD HANDLING ===== */
function setupFileInputs() {
  const fileInputs = [
    { input: 'fileSurat', preview: 'previewSurat' },
    { input: 'fileBorang', preview: 'previewBorang' },
    { input: 'fileCadangan', preview: 'previewCadangan' }
  ];
  
  fileInputs.forEach(item => {
    const inputEl = document.getElementById(item.input);
    const previewEl = document.getElementById(item.preview);
    
    if (inputEl && previewEl) {
      inputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
          previewEl.innerHTML = `
            <span>${file.name} (${formatFileSize(file.size)})</span>
            <button type="button" class="btn-remove-file" data-input="${item.input}" data-preview="${item.preview}">✕</button>
          `;
          previewEl.classList.add('show');
          
          const removeBtn = previewEl.querySelector('.btn-remove-file');
          removeBtn.addEventListener('click', function() {
            inputEl.value = '';
            previewEl.innerHTML = '';
            previewEl.classList.remove('show');
          });
        } else {
          previewEl.innerHTML = '';
          previewEl.classList.remove('show');
        }
      });
    }
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

async function collectFiles() {
  const fileSurat = document.getElementById('fileSurat').files[0];
  const fileBorang = document.getElementById('fileBorang').files[0];
  const fileCadangan = document.getElementById('fileCadangan').files[0];
  
  if (!fileSurat && !fileBorang && !fileCadangan) {
    return [];
  }
  
  const filesToUpload = [];
  
  if (fileSurat) {
    if (!fileSurat.type.includes('pdf')) {
      throw new Error('Surat Permohonan mesti dalam format PDF');
    }
    if (fileSurat.size > MAX_FILE_SIZE) {
      throw new Error('Surat Permohonan terlalu besar. Maksimum ' + formatFileSize(MAX_FILE_SIZE));
    }
    const suratBase64 = await readFileAsBase64(fileSurat);
    filesToUpload.push({ 
      name: fileSurat.name, 
      base64: suratBase64, 
      mime: 'application/pdf',
      type: 'surat'
    });
  }
  
  if (fileBorang) {
    if (!fileBorang.type.includes('pdf')) {
      throw new Error('Borang Permohonan mesti dalam format PDF');
    }
    if (fileBorang.size > MAX_FILE_SIZE) {
      throw new Error('Borang Permohonan terlalu besar. Maksimum ' + formatFileSize(MAX_FILE_SIZE));
    }
    const borangBase64 = await readFileAsBase64(fileBorang);
    filesToUpload.push({ 
      name: fileBorang.name, 
      base64: borangBase64, 
      mime: 'application/pdf',
      type: 'borang'
    });
  }
  
  if (fileCadangan) {
    if (!fileCadangan.type.includes('pdf')) {
      throw new Error('Kertas Cadangan mesti dalam format PDF');
    }
    if (fileCadangan.size > MAX_FILE_SIZE) {
      throw new Error('Kertas Cadangan terlalu besar. Maksimum ' + formatFileSize(MAX_FILE_SIZE));
    }
    const cadanganBase64 = await readFileAsBase64(fileCadangan);
    filesToUpload.push({ 
      name: fileCadangan.name, 
      base64: cadanganBase64, 
      mime: 'application/pdf',
      type: 'cadangan'
    });
  }
  
  return filesToUpload;
}

/* ===== COLLECT FORM DATA ===== */
function collectFormData(kategori) {
  const data = { kategori: kategori };
  
  if (kategori === 'Kenamaan') {
    data.kodSekolah = norm(document.getElementById('kodSekolah_k').value);
    data.poskod = document.getElementById('poskod_k').value.trim();
    data.jawatanKetua = document.getElementById('jawatanKetua_k').value;
    data.tarikhProgram = document.getElementById('tarikhProgram_k').value;
    data.masaProgram = document.getElementById('masaProgram_k').value;
    data.hariProgram = document.getElementById('hariProgram_k').value;
    data.lokasi = document.getElementById('lokasi_k').value.trim();
    data.namaProgram = document.getElementById('namaProgram_k').value.trim();
    data.namaPerasmi = document.getElementById('namaPerasmi_k').value.trim();
    data.jawatanPerasmi = document.getElementById('jawatanPerasmi_k').value.trim();
    data.namaPenghubung = document.getElementById('namaPenghubung_k').value.trim();
    data.emailPenghubung = document.getElementById('emailPenghubung_k').value.trim();
    data.telefonPenghubung = document.getElementById('telefonPenghubung_k').value.trim();
    
  } else if (kategori === 'Premis') {
    data.kodSekolah = norm(document.getElementById('kodSekolah_p').value);
    data.pemilikPremis = document.getElementById('pemilikPremis_p').value.trim();
    data.alamatPremis = document.getElementById('alamatPremis_p').value.trim();
    data.butiranPremis = document.getElementById('butiranPremis_p').value.trim();
    data.namaPenghubung = document.getElementById('namaPenghubung_p').value.trim();
    data.emailPenghubung = document.getElementById('emailPenghubung_p').value.trim();
    
  } else if (kategori === 'Agensi') {
    data.kodSekolah = norm(document.getElementById('kodSekolah_a').value);
    data.namaAgensi = document.getElementById('namaAgensi_a').value.trim();
    data.butiranAgensi = document.getElementById('butiranAgensi_a').value.trim();
    data.namaPenghubung = document.getElementById('namaPenghubung_a').value.trim();
    data.emailPenghubung = document.getElementById('emailPenghubung_a').value.trim();
  }
  
  return data;
}

/* ===== FORM SUBMISSION ===== */
document.getElementById('btnSubmit').addEventListener('click', async () => {
  const kategori = kategoriEl.value;
  const data = collectFormData(kategori);
  
  // Validation
  if (!data.kodSekolah || !data.namaPenghubung || !data.emailPenghubung) {
    Swal.fire({
      icon: 'error',
      title: 'Maklumat Tidak Lengkap',
      text: 'Sila lengkapkan Kod Sekolah, Nama Penghubung dan Email Penghubung.',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }
  
  // Check files
  let files = [];
  try {
    files = await collectFiles();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Ralat Fail',
      text: error.message,
      confirmButtonColor: '#D4AF37'
    });
    return;
  }
  
  // Prepare payload
  const payload = {
    action: 'submit',
    data: data,
    files: files
  };
  
  // Submit
  try {
    Swal.fire({
      title: 'Menghantar permohonan...',
      text: 'Sila tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const response = await fetch(GAS_POST, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result && result.success) {
      // SUCCESS
      Swal.fire({
        icon: 'success',
        title: 'Berjaya!',
        html: `
          <p>Permohonan anda telah berjaya dihantar.</p>
          <p><strong>Request ID:</strong> <span style="color:#D4AF37; font-size:1.5rem;">${result.requestId}</span></p>
          <p style="font-size:0.9rem; color:#666;">Sila simpan Request ID ini untuk semakan status.</p>
        `,
        confirmButtonColor: '#D4AF37',
        confirmButtonText: 'OK'
      });
      
      // Clear form and scroll to top
      clearForm(kategori);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Reset kategori to first option
      kategoriEl.value = 'Kenamaan';
      showFormFor('Kenamaan');
      
    } else {
      // ERROR
      Swal.fire({
        icon: 'error',
        title: 'Ralat',
        text: result.message || result.error || 'Unknown error',
        confirmButtonColor: '#D4AF37'
      });
    }
    
  } catch (error) {
    console.error('Submit error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Ralat Sambungan',
      text: 'Tidak dapat berhubung dengan server. Sila cuba lagi.',
      confirmButtonColor: '#D4AF37'
    });
  }
});

/* ===== CLEAR FORM ===== */
function clearForm(kategori) {
  document.getElementById('fileSurat').value = '';
  document.getElementById('fileBorang').value = '';
  document.getElementById('fileCadangan').value = '';
  
  document.getElementById('previewSurat').textContent = '';
  document.getElementById('previewSurat').classList.remove('show');
  document.getElementById('previewBorang').textContent = '';
  document.getElementById('previewBorang').classList.remove('show');
  document.getElementById('previewCadangan').textContent = '';
  document.getElementById('previewCadangan').classList.remove('show');
  
  if (kategori === 'Kenamaan') {
    document.getElementById('kodSekolah_k').value = '';
    document.getElementById('namaSekolah_k').value = '';
    document.getElementById('daerah_k').value = '';
    document.getElementById('peringkat_k').value = '';
    document.getElementById('poskod_k').value = '';
    document.getElementById('jawatanKetua_k').value = '';
    document.getElementById('tarikhProgram_k').value = '';
    document.getElementById('masaProgram_k').value = '';
    document.getElementById('hariProgram_k').value = '';
    document.getElementById('lokasi_k').value = '';
    document.getElementById('namaProgram_k').value = '';
    document.getElementById('namaPerasmi_k').value = '';
    document.getElementById('jawatanPerasmi_k').value = '';
    document.getElementById('namaPenghubung_k').value = '';
    document.getElementById('emailPenghubung_k').value = '';
    document.getElementById('telefonPenghubung_k').value = '';
    
  } else if (kategori === 'Premis') {
    document.getElementById('kodSekolah_p').value = '';
    document.getElementById('namaSekolah_p').value = '';
    document.getElementById('pemilikPremis_p').value = '';
    document.getElementById('alamatPremis_p').value = '';
    document.getElementById('butiranPremis_p').value = '';
    document.getElementById('namaPenghubung_p').value = '';
    document.getElementById('emailPenghubung_p').value = '';
    
  } else if (kategori === 'Agensi') {
    document.getElementById('kodSekolah_a').value = '';
    document.getElementById('namaSekolah_a').value = '';
    document.getElementById('namaAgensi_a').value = '';
    document.getElementById('butiranAgensi_a').value = '';
    document.getElementById('namaPenghubung_a').value = '';
    document.getElementById('emailPenghubung_a').value = '';
  }
}

}); // End safeRun('kategori')
}); // End whenReady