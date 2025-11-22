/* ===== DOWNLOAD.JS - TAB MUAT TURUN ===== */
whenReady(() => {
  safeRun('downloadSection', () => {

// ⭐ DOWNLOAD FILES - SPI (Surat Pekeliling Ikhtisas)
const DOWNLOAD_FILES = {
  spi_bil3_2008: 'https://drive.google.com/uc?export=download&id=1HKcDYu8e-pE-kiXDwn6XMLxxb6ZKfG64',
  spi_bil7_1991: 'https://drive.google.com/uc?export=download&id=1UUPH8zo4V123JQzu6xYj4_lWVKHqh8ZW',
  spi_bil5_2018: 'https://drive.google.com/uc?export=download&id=1hTzryGiUoWzqGdiJEUeki85qVhQqw532',
  spi_bil12_1988: 'https://drive.google.com/uc?export=download&id=1r8KjPw3B_a9ZAuLUAQPL4wEYLO6cLBeC'
};

// ⭐ DISPLAY NAMES (Short & Clear)
const FILE_INFO = {
  spi_bil3_2008: {
    title: 'SPI Bil. 3/2008',
    desc: 'Kenamaan & Penggunaan Premis',
    icon: 'fas fa-award',
    color: 'kenamaan'
  },
  spi_bil7_1991: {
    title: 'SPI Bil. 7/1991',
    desc: 'Penggunaan Kemudahan Sekolah',
    icon: 'fas fa-building',
    color: 'premis'
  },
  spi_bil5_2018: {
    title: 'SPI Bil. 5/2018',
    desc: 'Kebenaran Agensi Luar',
    icon: 'fas fa-landmark',
    color: 'agensi'
  },
  spi_bil12_1988: {
    title: 'SPI Bil. 12/1988',
    desc: 'Larangan Jualan',
    icon: 'fas fa-ban',
    color: 'larangan'
  }
};

// ⭐ DOWNLOAD FUNCTION
window.downloadFile = function(type) {
  const url = DOWNLOAD_FILES[type];
  const info = FILE_INFO[type];
  
  if (!url) {
    Swal.fire({
      icon: 'error',
      title: 'Fail Tidak Dijumpai',
      text: 'Sila hubungi pejabat untuk mendapatkan salinan.',
      confirmButtonColor: '#D4AF37'
    });
    return;
  }

  // Open download link
  window.open(url, '_blank');
  
  // Success notification
  Swal.fire({
    icon: 'success',
    title: 'Muat Turun',
    html: `Fail <strong>${info.title}</strong> sedang dimuat turun...`,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
}

  }); // End safeRun
}); // End whenReady


