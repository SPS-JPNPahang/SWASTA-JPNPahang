/* ===== DOWNLOAD.JS - TAB MUAT TURUN ===== */
whenReady(() => {
  
  // ⭐ FILE IDs
  const FILE_IDS = {
    spi_bil3_2008: '1IvJiJGKEoPNxb_Ngw1lkTU2LuFZPTP3b',
    spi_bil7_1991: '1UUPH8zo4V123JQzu6xYj4_lWVKHqh8ZW',
    spi_bil5_2018: '1hTzryGiUoWzqGdiJEUeki85qVhQqw532',
    spi_bil12_1988: '1r8KjPw3B_a9ZAuLUAQPL4wEYLO6cLBeC'
  };

  // ⭐ FILE INFO
  const FILE_INFO = {
    spi_bil3_2008: { title: 'SPI Bil. 4/2023' },
    spi_bil7_1991: { title: 'SPI Bil. 7/1991' },
    spi_bil5_2018: { title: 'SPI Bil. 5/2018' },
    spi_bil12_1988: { title: 'SPI Bil. 12/1988' }
  };

  // ⭐ PREVIEW FUNCTION (Opens in browser)
  window.viewFileOnline = function(type) {
    const fileId = FILE_IDS[type];
    
    if (!fileId) {
      Swal.fire({
        icon: 'error',
        title: 'Fail Tidak Dijumpai',
        confirmButtonColor: '#D4AF37'
      });
      return;
    }
    
    // Open Google Drive preview
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    window.open(viewUrl, '_blank');
    
    Swal.fire({
      icon: 'info',
      title: 'Membuka Pratonton',
      text: 'Fail dibuka dalam tab baru',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  }

  // ⭐ DOWNLOAD FUNCTION (Force download)
  window.downloadFile = function(type) {
    const fileId = FILE_IDS[type];
    const info = FILE_INFO[type];
    
    if (!fileId) {
      Swal.fire({
        icon: 'error',
        title: 'Fail Tidak Dijumpai',
        confirmButtonColor: '#D4AF37'
      });
      return;
    }

    // Force download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    window.open(downloadUrl, '_blank');
    
    Swal.fire({
      icon: 'success',
      title: 'Memuat Turun',
      html: `Fail <strong>${info.title}</strong> sedang dimuat turun...`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  console.log('✅ download.js loaded - Both functions ready!');

}); // End whenReady

