/* ===== ANALISIS.JS - DASHBOARD ANALISIS ===== */
whenReady(() => {
  
  const btnRefreshAnalysis = document.getElementById('btnRefreshAnalysis');
  
  if (btnRefreshAnalysis) {
    btnRefreshAnalysis.addEventListener('click', loadAnalysisData);
  }
  
  const btnTabAnalisis = document.querySelector('[data-tab="analisis"]');
  if (btnTabAnalisis) {
    btnTabAnalisis.addEventListener('click', () => {
      setTimeout(loadAnalysisData, 100);
    });
  }
  
  async function loadAnalysisData() {
    try {
      Swal.fire({
        title: 'Memuatkan analisis...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      const response = await fetch(buildGET('listMaster'));
      const result = await response.json();
      
      Swal.close();
      
      if (result && result.success && result.data) {
        const data = result.data;
        
        displayStatsCards(data);
        displayCategoryBreakdown(data);
        displayDistrictBreakdown(data);
        displayStatusBreakdown(data);
        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ralat',
          text: 'Tidak dapat memuatkan data analisis.',
          confirmButtonColor: '#D4AF37'
        });
      }
      
    } catch (error) {
      Swal.close();
      console.error('Load analysis error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Ralat',
        text: 'Tidak dapat berhubung dengan server.',
        confirmButtonColor: '#D4AF37'
      });
    }
  }
  
  function displayStatsCards(data) {
    const total = data.length;
    const baru = data.filter(x => String(x.Status || '').toLowerCase() === 'baru').length;
    const query = data.filter(x => String(x.Status || '').toLowerCase() === 'query').length;
    const lulus = data.filter(x => String(x.Status || '').toLowerCase() === 'lulus').length;
    const disahkan = data.filter(x => String(x.Status || '').toLowerCase() === 'disahkan').length;
    const tolak = data.filter(x => {
      const s = String(x.Status || '').toLowerCase();
      return s === 'tolak' || s === 'ditolak';
    }).length;
    
    const statsCardsDiv = document.getElementById('statsCards');
    
    statsCardsDiv.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
        <div style="font-size: 2.5rem; font-weight: bold;">${total}</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">JUMLAH PERMOHONAN</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
        <div style="font-size: 2.5rem; font-weight: bold;">${baru}</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">BARU</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
        <div style="font-size: 2.5rem; font-weight: bold;">${query}</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">QUERY</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
        <div style="font-size: 2.5rem; font-weight: bold;">${disahkan}</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">DISAHKAN</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
        <div style="font-size: 2.5rem; font-weight: bold;">${lulus}</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">LULUS</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
        <div style="font-size: 2.5rem; font-weight: bold;">${tolak}</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">DITOLAK</div>
      </div>
    `;
  }
  
  function displayCategoryBreakdown(data) {
    const kenamaan = data.filter(x => x.Kategori === 'Kenamaan').length;
    const agensi = data.filter(x => x.Kategori === 'Agensi').length;
    const premis = data.filter(x => x.Kategori === 'Premis').length;
    const total = data.length || 1;
    
    const categoryDiv = document.getElementById('categoryBreakdown');
    
    categoryDiv.innerHTML = `
      ${createBarChart('Kenamaan', kenamaan, total, '#D4AF37')}
      ${createBarChart('Agensi', agensi, total, '#3B82F6')}
      ${createBarChart('Premis', premis, total, '#10B981')}
    `;
  }
  
  function displayDistrictBreakdown(data) {
    const districts = {};
    
    data.forEach(item => {
      const daerah = item.Daerah || 'Tidak Dinyatakan';
      districts[daerah] = (districts[daerah] || 0) + 1;
    });
    
    const sorted = Object.entries(districts).sort((a, b) => b[1] - a[1]);
    const total = data.length || 1;
    
    const districtDiv = document.getElementById('districtBreakdown');
    
    let html = '';
    sorted.forEach(([daerah, count]) => {
      html += createBarChart(daerah, count, total, '#6366F1');
    });
    
    districtDiv.innerHTML = html;
  }
  
  function displayStatusBreakdown(data) {
    const statuses = {};
    
    data.forEach(item => {
      const status = item.Status || 'Tidak Dinyatakan';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    
    const total = data.length || 1;
    const statusDiv = document.getElementById('statusBreakdown');
    
    let html = '';
    Object.entries(statuses).forEach(([status, count]) => {
      const color = getStatusColor(status);
      html += createBarChart(status, count, total, color);
    });
    
    statusDiv.innerHTML = html;
  }
  
  function createBarChart(label, value, total, color) {
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
  }
  
  function getStatusColor(status) {
    const colorMap = {
      'Baru': '#F59E0B',
      'Query': '#EF4444',
      'Disahkan': '#3B82F6',
      'Lulus': '#10B981',
      'Tolak': '#DC2626',
      'Ditolak': '#DC2626'
    };
    return colorMap[status] || '#6B7280';
  }
  
  console.log('✅ analisis.js loaded');
});
