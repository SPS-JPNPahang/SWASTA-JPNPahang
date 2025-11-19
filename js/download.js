/* ===== DOWNLOAD.JS - TAB MUAT TURUN ===== */
whenReady(() => {
  safeRun('downloadSection', () => {
// URL fail PDF (ganti dengan URL sebenar dari Google Drive)
const DOWNLOAD_FILES = {
  kenamaan: 'https://drive.google.com/uc?export=download&id=YOUR_KENAMAAN_FILE_ID',
  premis: 'https://drive.google.com/uc?export=download&id=YOUR_PREMIS_FILE_ID',
  agensi: 'https://drive.google.com/uc?export=download&id=YOUR_AGENSI_FILE_ID',
  panduan: 'https://drive.google.com/uc?export=download&id=YOUR_PANDUAN_FILE_ID'
};

function downloadFile(type) {
  const url = DOWNLOAD_FILES[type];
  
  if (url && url.includes('YOUR_')) {
    Swal.fire({
      icon: 'info',
      title: 'Fail Belum Tersedia',
      text: 'Fail ini akan tersedia tidak lama lagi.',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }

  if (url) {
    window.open(url, '_blank');
    
    Swal.fire({
      icon: 'success',
      title: 'Memuat Turun',
      text: 'Fail sedang dimuat turun...',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Fail Tidak Dijumpai',
      confirmButtonColor: '#D4AF37'
    });
  }
}
 });
  });