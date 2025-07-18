// dashboard.js
// Script utama untuk Dashboard Fullfilment FBB
// Refactor besar: modularisasi, optimasi, dan keterbacaan

// ===================== UTILITY =====================
const formatAngka = num => num.toLocaleString('id-ID');
const formatPersen = num => num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ===================== FILTER & DATA =====================
let allData = [];
let filteredByNopData = [];
let userNop = null;

function filterData(data, branch, startDate, endDate) {
  return data.filter(d => {
    if (!d.provi_ts) return false;
    if (branch && (d.branch || '').trim() !== branch.trim()) return false;
    let proviDate;
    if (typeof d.provi_ts === 'object' && d.provi_ts !== null && typeof d.provi_ts._seconds === 'number') {
      proviDate = new Date(d.provi_ts._seconds * 1000);
    } else if (typeof d.provi_ts === 'string' && d.provi_ts.trim() !== '') {
      proviDate = new Date(d.provi_ts);
    } else {
      return false;
    }
    if (isNaN(proviDate.getTime())) return false;
    if (startDate || endDate) {
    }
    if (startDate && proviDate < startDate) return false;
    if (endDate && proviDate > endDate) return false;
    return true;
  });
}

// Fungsi filter berdasarkan NOP user
function filterByBranchUser(data) {
  // Deteksi role guest dari sessionStorage
  let userRole = null;
  try {
    const user = JSON.parse(sessionStorage.getItem('fbb_user') || '{}');
    userRole = user.role;
  } catch (e) {}
  if (userRole === 'guest') return data; // Guest bisa lihat semua data
  if (!userBranch) return [];
  if (userBranch.trim().toLowerCase() === 'kalimantan') {
    return data;
  }
  return data.filter(d => (d.branch || '').trim().toLowerCase() === userBranch.trim().toLowerCase());
}

// ===================== CHARTS =====================
function renderPieHK(dataToRender) {
  const ctx = document.getElementById('pieHK');
  if (!ctx) return;
  const total = dataToRender.length;
  const filled = dataToRender.filter(d => d.status_hk && d.status_hk.trim() !== '').length;
  const unfilled = total - filled;
  if (window.pieHKChart) window.pieHKChart.destroy();
  window.pieHKChart = new Chart(ctx.getContext('2d'), {
    type: 'pie',
    data: {
      labels: ['Sudah HK', 'Belum HK'],
      datasets: [{ data: [filled, unfilled], backgroundColor: ['#4ade80', '#f87171'] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: '#222', font: { weight: 'bold', size: 14 }, anchor: 'center', align: 'center',
          formatter: (value, context) => value > 0 ? `${formatAngka(value)} (${formatPersen(total > 0 ? value / total * 100 : 0)}%)` : ''
        },
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'Fallout & HK' }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function parseMonth(item) {
  if (!item || !item.provi_ts) return null;
  let date;
  if (typeof item.provi_ts === 'object' && item.provi_ts !== null && typeof item.provi_ts._seconds === 'number') {
    date = new Date(item.provi_ts._seconds * 1000);
  } else if (typeof item.provi_ts === 'string' && item.provi_ts.trim() !== '') {
    date = new Date(item.provi_ts);
  } else {
    return null;
  }
  if (isNaN(date.getTime())) return null;
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function renderBarTrend(dataToRender) {
  const ctx = document.getElementById('barTrend');
  if (!ctx) return;
  const monthsLabels = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const validItemsWithMonth = dataToRender.map(item => ({ item, parsed: parseMonth(item) })).filter(entry => entry.parsed !== null);
  const falloutPerMonth = monthsLabels.map((_, i) => validItemsWithMonth.filter(entry => entry.parsed.month === i + 1 && entry.item.order_id && entry.item.order_id !== '').length);
  const psPerMonth = monthsLabels.map((_, i) => validItemsWithMonth.filter(entry => entry.parsed.month === i + 1 && entry.item.order_id && entry.item.order_id !== '' && entry.item.status_ps === 'PS').length);
  const percentPerMonth = falloutPerMonth.map((f, i) => f > 0 ? (psPerMonth[i] / f * 100).toFixed(2) : 0);
  let datasets = [
    { label: 'Fallout', data: falloutPerMonth, backgroundColor: 'rgba(96, 165, 250, 1)', yAxisID: 'y', barPercentage: 0.7, categoryPercentage: 0.8, order: 0 },
    { label: 'PS', data: psPerMonth, backgroundColor: 'rgba(251, 191, 36, 1)', yAxisID: 'y', barPercentage: 0.7, categoryPercentage: 0.8, order: 1 },
    { label: 'Fallout to PS (%)', data: percentPerMonth, type: 'line', borderColor: '#ef4444', backgroundColor: '#ef4444', fill: false, yAxisID: 'y1', tension: 0.3, order: 99, pointRadius: 4, borderWidth: 3 }
  ];
  const allValues = datasets.flatMap(dataset => dataset.data);
  const maxBar = Math.max(...allValues.filter(v => typeof v === 'number' && !isNaN(v)), 0);
  const maxPercent = Math.max(...datasets.filter(ds => ds.type === 'line').flatMap(ds => ds.data).map(x => Number(x) || 0), 100);
  if(window.barTrendChart) window.barTrendChart.destroy();
  window.barTrendChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: { labels: monthsLabels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Trend Fallout to PS' },
        datalabels: {
          display: () => true,
          color: ctx => ctx.dataset.type === 'line' ? '#ef4444' : '#222',
          font: ctx => ctx.dataset.type === 'line' ? { weight: 'bold', size: 13 } : { weight: 'bold', size: 12 },
          anchor: () => 'end',
          align: ctx => ctx.dataset.type === 'line' ? 'end' : 'start',
          offset: ctx => ctx.dataset.type === 'line' ? -8 : 2,
          formatter: (value, ctx) => ctx.dataset.type === 'line' ? (value > 0 ? Number(value).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%' : '') : (value > 0 ? Number(value).toLocaleString('id-ID') : '')
        },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label ? ctx.dataset.label + ': ' + ctx.formattedValue : ctx.formattedValue
          }
        }
      },
      scales: {
        y: { beginAtZero: true, max: (maxBar > 0 ? maxBar * 1.2 : 10), title: { display: true, text: 'Jumlah' } },
        y1: {
          beginAtZero: true,
          max: maxPercent,
          position: 'right',
          title: { display: true, text: 'Fallout to PS (%)' },
          grid: { drawOnChartArea: false },
          ticks: { callback: v => v + '%' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function renderProgressSymptom(dataToRender) {
  const ctx = document.getElementById('progressSymptom');
  if (!ctx) return;
  const group = {};
  dataToRender.forEach(d => {
    let key = (d.symptom || 'Unknown').trim();
    if (key === '') key = 'Unknown';
    if (d.status_ps !== 'PS') group[key] = (group[key] || 0) + 1;
  });
  let arr = Object.entries(group).map(([label, value]) => ({ label, value, percent: 0 }));
  const total = arr.reduce((sum, item) => sum + item.value, 0);
  arr = arr.map(item => ({ ...item, percent: total > 0 ? (item.value / total * 100) : 0 }));
  arr.sort((a, b) => b.value - a.value);
  const displayLimit = 15;
  const dataToDisplay = arr.slice(0, displayLimit);
  const maxValue = Math.max(...dataToDisplay.map(x => x.value), 0) * 1.2;
  if (window.progressSymptomChart) window.progressSymptomChart.destroy();
  window.progressSymptomChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: dataToDisplay.map(x => x.label),
      datasets: [{ label: 'Jumlah', data: dataToDisplay.map(x => x.value), backgroundColor: '#34d399', borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.8 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Progress House Keeping (Symptom)' },
        datalabels: {
          anchor: 'end', align: 'end', color: '#222', font: { weight: 'bold', size: 12 }, clip: false,
          formatter: (value, ctx) => {
            const item = dataToDisplay[ctx.dataIndex];
            return value > 0 ? `${value} (${item.percent.toFixed(1)}%)` : '';
          }
        }
      },
      layout: { padding: { right: 60 } },
      scales: {
        x: { beginAtZero: true, title: { display: true, text: 'Jumlah Fallout Belum PS' }, max: maxValue },
        y: { title: { display: true, text: 'Symptom' } }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// ===================== TABLES =====================
function formatDateTimeMDY(dateInput) {
    let date;
    if (typeof dateInput === 'object' && dateInput !== null && typeof dateInput._seconds === 'number') {
        date = new Date(dateInput._seconds * 1000);
    } else if (typeof dateInput === 'string' && dateInput.trim() !== '') {
        date = new Date(dateInput);
    } else {
        date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) return '';
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
}

// Add mapping for Status HK to PIC Dept (should match hk.js)
const statusHKToPicDept = {
  'Revoke': 'TIF-FBB',
  'Reorder to PS': 'TA',
  'UNSC': 'TIF-FBB',
  'Expand ODP': 'TIF - Daman',
  'Tanam Tiang': 'TA',
  'Offering Orbit': 'Tsel - Branch',
  'PT2': 'Tsel - Project',
  'PT3': 'Tsel - Project',
  'Cancel': 'Tsel - Branch'
};

function getPicDept(statusHK) {
  return statusHKToPicDept[statusHK] || '';
}

function renderTablePicDept(data) {
  const tbody = document.getElementById('tablePicDept');
  if (!tbody) return;
  const group = {};
  data.forEach(d => {
    const pic = getPicDept(d.status_hk?.trim());
    if (!pic) return;
    if (!group[pic]) group[pic] = { total: 0 };
    if (d.status_ps !== 'PS' && d.status_ps !== 'Cancel') group[pic].total++;
  });
  let sortedGroups = Object.entries(group).sort(([, a], [, b]) => b.total - a.total);
  let html = `<tr><th>PIC Dept</th><th>Total HK</th></tr>`;
  let grandTotal = 0;
  sortedGroups.forEach(([pic, val]) => {
    html += `<tr><td>${pic}</td><td>${val.total}</td></tr>`;
    grandTotal += val.total;
  });
  html += `<tr><th>Grand Total</th><th>${grandTotal}</th></tr>`;
  tbody.innerHTML = html;
}

function renderTableSymptom(data) {
  const tbody = document.getElementById('tableSymptom');
  if (!tbody) return;
  const group = {};
  data.forEach(d => {
    let key = (d.symptom || 'Unknown').trim();
    if (key === '') key = 'Unknown';
    if (!group[key]) group[key] = { total: 0, hk: 0, ps: 0 };
    group[key].total++;
    if (d.status_hk && d.status_hk.trim() !== '') group[key].hk++;
    if (d.status_ps === 'PS') group[key].ps++;
  });
  let sortedGroups = Object.entries(group).sort(([, a], [, b]) => b.total - a.total);
  let html = `<tr><th>Symptom</th><th>Total</th><th>HK</th><th>Ach HK</th><th>PS</th><th>Ach PS</th></tr>`;
  let grandTotal = 0, grandHK = 0, grandPS = 0;
  sortedGroups.forEach(([symptom, val]) => {
    const achHK = val.total > 0 ? ((val.hk / val.total) * 100).toFixed(2) + '%' : '-';
    const achPS = val.total > 0 ? ((val.ps / val.total) * 100).toFixed(2) + '%' : '-';
    html += `<tr><td>${symptom}</td><td>${val.total}</td><td>${val.hk}</td><td>${achHK}</td><td>${val.ps}</td><td>${achPS}</td></tr>`;
    grandTotal += val.total;
    grandHK += val.hk;
    grandPS += val.ps;
  });
  const grandAchHK = grandTotal > 0 ? ((grandHK / grandTotal) * 100).toFixed(2) + '%' : '-';
  const grandAchPS = grandTotal > 0 ? ((grandPS / grandTotal) * 100).toFixed(2) + '%' : '-';
  html += `<tr><th>Grand Total</th><th>${grandTotal}</th><th>${grandHK}</th><th>${grandAchHK}</th><th>${grandPS}</th><th>${grandAchPS}</th></tr>`;
  tbody.innerHTML = html;
}

function renderTableNop(data) {
  const tbody = document.getElementById('tableNop');
  if (!tbody) return;
  const group = {};
  data.forEach(d => {
    let key = (d.branch || 'Unknown').trim();
    if (key === '') key = 'Unknown';
    if (!group[key]) group[key] = { total: 0, hk: 0, ps: 0 };
    group[key].total++;
    if (d.status_hk && d.status_hk.trim() !== '') group[key].hk++;
    if (d.status_ps === 'PS') group[key].ps++;
  });
  let sortedGroups = Object.entries(group).sort(([, a], [, b]) => b.total - a.total);
  let html = `<tr><th>NOP</th><th>Total Fallout</th><th>HK</th><th>Ach HK</th><th>PS</th><th>Ach PS</th></tr>`;
  let grandTotal = 0, grandHK = 0, grandPS = 0;
  sortedGroups.forEach(([branch, val]) => {
    const achHK = val.total > 0 ? ((val.hk / val.total) * 100).toFixed(2) + '%' : '-';
    const achPS = val.total > 0 ? ((val.ps / val.total) * 100).toFixed(2) + '%' : '-';
    html += `<tr><td>${branch}</td><td>${val.total}</td><td>${val.hk}</td><td>${achHK}</td><td>${val.ps}</td><td>${achPS}</td></tr>`;
    grandTotal += val.total;
    grandHK += val.hk;
    grandPS += val.ps;
  });
  const grandAchHK = grandTotal > 0 ? ((grandHK / grandTotal) * 100).toFixed(2) + '%' : '-';
  const grandAchPS = grandTotal > 0 ? ((grandPS / grandTotal) * 100).toFixed(2) + '%' : '-';
  html += `<tr><th>Grand Total</th><th>${grandTotal}</th><th>${grandHK}</th><th>${grandAchHK}</th><th>${grandPS}</th><th>${grandAchPS}</th></tr>`;
  tbody.innerHTML = html;
}

function renderTableHK(data) {
  const tbody = document.getElementById('tableHK');
  if (!tbody) return;
  const group = {};
  data.forEach(d => {
    let key = d.status_hk?.trim();
    if (!key) return;
    if (!group[key]) group[key] = { total: 0, ps: 0, cancel: 0 };
    group[key].total++;
    if (d.status_ps === 'PS') group[key].ps++;
    if (d.status_ps === 'Cancel') group[key].cancel++;
  });
  let sortedGroups = Object.entries(group).sort(([, a], [, b]) => b.total - a.total);
  let html = `<tr><th>Result</th><th>Total</th><th>Open</th><th>PS</th><th>Cancel</th></tr>`;
  let grandTotal = 0, grandPs = 0, grandCancel = 0, grandOpen = 0;
  sortedGroups.forEach(([hk, val]) => {
    const open = val.total - val.ps - val.cancel;
    html += `<tr><td>${hk}</td><td>${val.total}</td><td>${open}</td><td>${val.ps}</td><td>${val.cancel}</td></tr>`;
    grandTotal += val.total;
    grandPs += val.ps;
    grandCancel += val.cancel;
    grandOpen += open;
  });
  html += `<tr><th>Grand Total</th><th>${grandTotal}</th><th>${grandOpen}</th><th>${grandPs}</th><th>${grandCancel}</th></tr>`;
  tbody.innerHTML = html;
}

function renderTableAgingSymptom(data) {
  const filtered = data.filter(d => !['PS', 'Cancel'].includes(d.status_ps));
  const agingCategories = ['1-3 hari', '4-7 hari', '8-14 hari', '14-30 hari', '> 30 Hari'];
  function hitungAgingHari(provi_ts) {
    let proviDate;
    if (typeof provi_ts === 'object' && provi_ts !== null && typeof provi_ts._seconds === 'number') {
      proviDate = new Date(provi_ts._seconds * 1000);
    } else if (typeof provi_ts === 'string' && provi_ts.trim() !== '') {
      proviDate = new Date(provi_ts);
    } else {
      proviDate = new Date(provi_ts);
    }
    if (isNaN(proviDate.getTime())) return null;
    let now = new Date();
    // Set jam ke 00:00:00 agar hanya beda tanggal
    proviDate.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    let diffMs = now - proviDate;
    let diffHari = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffHari;
  }
  function mapAging(hari) {
    if (hari <= 3) return '1-3 hari';
    else if (hari <= 7) return '4-7 hari';
    else if (hari <= 14) return '8-14 hari';
    else if (hari <= 30) return '14-30 hari';
    else return '> 30 Hari';
  }
  const group = {};
  filtered.forEach(d => {
    let symptom = (d.symptom || 'Unknown').trim();
    if (!symptom) symptom = 'Unknown';
    // Parsing proviDate konsisten dengan filterData
    let proviDate;
    if (typeof d.provi_ts === 'object' && d.provi_ts !== null && typeof d.provi_ts._seconds === 'number') {
      proviDate = new Date(d.provi_ts._seconds * 1000);
    } else if (typeof d.provi_ts === 'string' && d.provi_ts.trim() !== '') {
      proviDate = new Date(d.provi_ts);
    } else {
      proviDate = new Date(d.provi_ts);
    }
    let agingHari = hitungAgingHari(d.provi_ts);
    let aging = mapAging(agingHari);
    // Log hanya anomali: data aging 14-30 hari di filter range
    if (aging === '14-30 hari' && window.lastAgingStartDate && window.lastAgingEndDate && proviDate >= window.lastAgingStartDate && proviDate <= window.lastAgingEndDate) {
    }
    if (!group[symptom]) group[symptom] = { total: 0 };
    if (!group[symptom][aging]) group[symptom][aging] = 0;
    group[symptom][aging]++;
    group[symptom].total++;
  });
  const customOrder = [
    'Kendala Izin', 'Kendala Jalur/Rute Tarikan', 'Kendala NTE/Device', 'ODP BELUM GO LIVE',
    'ODP Full', 'ODP Jauh', 'ODP tidak ditemukan', 'ODP Unspec'
  ];
  let sortedGroups = Object.entries(group).sort((a, b) => {
    const idxA = customOrder.indexOf(a[0]);
    const idxB = customOrder.indexOf(b[0]);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a[0].localeCompare(b[0]);
  });
  let html = `<tr><th>Symptom</th>` + agingCategories.map(a => `<th>${a}</th>`).join('') + `<th>Grand Total</th></tr>`;
  sortedGroups.forEach(([symptom, val]) => {
    html += `<tr><td>${symptom}</td>`;
    agingCategories.forEach(cat => { html += `<td>${val[cat] || 0}</td>`; });
    html += `<td>${val.total}</td></tr>`;
  });
  let grand = { total: 0 };
  agingCategories.forEach(cat => grand[cat] = 0);
  sortedGroups.forEach(([, val]) => {
    agingCategories.forEach(cat => grand[cat] += (val[cat] || 0));
    grand.total += val.total;
  });
  html += `<tr><th>Grand Total</th>` + agingCategories.map(cat => `<th>${grand[cat]}</th>`).join('') + `<th>${grand.total}</th></tr>`;
  const tbody = document.getElementById('tableAgingSymptom');
  if (tbody) tbody.innerHTML = html;
}

// ===================== FILTER UI =====================
function renderBranchFilter(data) {
  const select = document.getElementById('branchFilter');
  if (!select) return;
  const unique = new Set();
  data.forEach(d => { const norm = (d.branch || '').trim(); if (norm) unique.add(norm); });
  const branches = [...unique].sort();
  select.innerHTML = `<option value="">All Branch</option>` + branches.map(b => `<option value="${b}">${b}</option>`).join('');
}

function parseMDYInput(str) {
  if (!str) return null;
  const [mm, dd, yyyy] = str.split('/');
  if (!mm || !dd || !yyyy) return null;
  return new Date(`${mm}/${dd}/${yyyy}`);
}

function updateActiveFilters(branch, startDate, endDate) {
  const container = document.getElementById('activeFilters');
  container.innerHTML = '';
  if (branch) {
    const chip = document.createElement('span');
    chip.className = 'bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center text-xs gap-1';
    chip.innerHTML = `<i class="fa fa-code-branch"></i> ${branch} <button class="ml-1 text-blue-500 hover:text-red-500" onclick="removeFilter('branch')"><i class="fa fa-times"></i></button>`;
    container.appendChild(chip);
  }
  if (startDate) {
    const chip = document.createElement('span');
    chip.className = 'bg-green-100 text-green-700 px-2 py-1 rounded flex items-center text-xs gap-1';
    chip.innerHTML = `<i class="fa fa-calendar"></i> Dari: ${startDate} <button class="ml-1 text-green-500 hover:text-red-500" onclick="removeFilter('startDate')"><i class="fa fa-times"></i></button>`;
    container.appendChild(chip);
  }
  if (endDate) {
    const chip = document.createElement('span');
    chip.className = 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center text-xs gap-1';
    chip.innerHTML = `<i class="fa fa-calendar"></i> Sampai: ${endDate} <button class="ml-1 text-yellow-500 hover:text-red-500" onclick="removeFilter('endDate')"><i class="fa fa-times"></i></button>`;
    container.appendChild(chip);
  }
}

function removeFilter(type) {
  if (type === 'branch') document.getElementById('branchFilter').value = '';
  if (type === 'startDate') document.getElementById('startDate').value = '';
  if (type === 'endDate') document.getElementById('endDate').value = '';
  applyFilters();
}

// ===================== DASHBOARD RENDER =====================
function renderDashboard(data) {
  if (!Array.isArray(data) || data.length === 0) {
    if (window.pieHKChart) window.pieHKChart.destroy();
    if (window.barTrendChart) window.barTrendChart.destroy();
    if (window.progressSymptomChart) window.progressSymptomChart.destroy();
    document.getElementById('tableSymptom').innerHTML = '';
    document.getElementById('tableNop').innerHTML = '';
    document.getElementById('tableHK').innerHTML = '';
    document.getElementById('tablePicDept').innerHTML = '';
    document.getElementById('branchFilter').innerHTML = '<option value="">All Branch</option>';
    return;
  }
  renderBranchFilter(allData);
  // Baris 1
  renderPieHK(data);
  renderTableHK(data);
  renderTablePicDept(data);
  // Baris 2
  renderTableSymptom(data);
  renderTableNop(data);
  // Baris 3
  renderBarTrend(data);
  // Baris 4
  renderTableAgingSymptom(data);
}

// ===================== FILTER HANDLER =====================
window.applyFilters = function() {
  const branch = document.getElementById('branchFilter').value;
  const startDateRaw = document.getElementById('startDate').value;
  const endDateRaw = document.getElementById('endDate').value;
  updateActiveFilters(branch, startDateRaw, endDateRaw);
  const startDate = parseMDYInput(convertDMYtoMDY(startDateRaw));
  let endDate = parseMDYInput(convertDMYtoMDY(endDateRaw));
  if (endDate) endDate.setHours(23,59,59,999);
  window.lastAgingStartDate = startDate;
  window.lastAgingEndDate = endDate;
  // Terapkan filter NOP user terlebih dahulu
  const baseData = filterByBranchUser(allData);
  const filtered = filterData(baseData, branch, startDate, endDate);
  renderDashboard(filtered);
};

document.getElementById('resetFilters').onclick = function() {
  document.getElementById('branchFilter').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  applyFilters();
};

// ===================== DATA FETCH =====================
document.addEventListener('DOMContentLoaded', async function() {
  // Tunggu sampai userBranch tersedia di DOM
  function getUserBranchFromDOM() {
    const el = document.getElementById('user-branch');
    return el ? el.textContent.trim() : null;
  }
  function waitForUserBranch(retry = 0) {
    return new Promise(resolve => {
      const tryGet = () => {
        const branch = getUserBranchFromDOM();
        if (branch && branch !== '-') {
          resolve(branch);
        } else if (retry < 30) {
          setTimeout(() => tryGet(++retry), 100);
        } else {
          resolve(null);
        }
      };
      tryGet();
    });
  }
  userBranch = await waitForUserBranch();
  try {
    const response = await fetch('/api/realtime');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const dataArray = (data && typeof data === 'object') ? (Array.isArray(data) ? data : Object.values(data)) : [];
    allData = dataArray.map((item, idx) => ({ id: idx.toString(), ...item }));
    // Terapkan filter branch user sebelum renderDashboard
    filteredByBranchData = filterByBranchUser(allData);
    renderDashboard(filteredByBranchData);
  } catch (error) {
    // Error handling: bisa tampilkan pesan error di halaman jika perlu
  }
  // Sembunyikan filter branch jika userBranch bukan 'kalimantan'
  const branchFilter = document.getElementById('branchFilter');
  const activeFilters = document.getElementById('activeFilters');
  let userRole = null;
  try {
    const user = JSON.parse(sessionStorage.getItem('fbb_user') || '{}');
    userRole = user.role;
  } catch (e) {}
  if (userRole !== 'guest' && userBranch && userBranch.trim().toLowerCase() !== 'kalimantan') {
    if (branchFilter && branchFilter.parentElement) branchFilter.parentElement.style.display = 'none';
    // Sembunyikan chip branch di filter aktif jika ada
    if (activeFilters) {
        const chips = activeFilters.querySelectorAll('span');
        chips.forEach(chip => {
            if (chip.textContent.includes('Branch')) chip.style.display = 'none';
        });
    }
    // Ubah grid filter jadi 2 kolom agar rapi
    const filterGrid1 = document.getElementById('filterGrid1');
    if (filterGrid1) filterGrid1.classList.remove('md:grid-cols-3');
    if (filterGrid1) filterGrid1.classList.add('md:grid-cols-2');
} else {
    if (branchFilter && branchFilter.parentElement) branchFilter.parentElement.style.display = '';
    // Kembalikan grid filter ke 3 kolom
    const filterGrid1 = document.getElementById('filterGrid1');
    if (filterGrid1) filterGrid1.classList.remove('md:grid-cols-2');
    if (filterGrid1) filterGrid1.classList.add('md:grid-cols-3');
}
});

// ===================== LAST UPDATED =====================
async function fetchLastUpdated() {
  try {
    const response = await fetch('/api/realtime?last_updated=1');
    if (response.ok) {
      const data = await response.json();
      if (data.last_updated) {
        const date = new Date(data.last_updated);
        document.getElementById('lastUpdated').innerHTML = formatLastUpdated(date);
      } else {
        document.getElementById('lastUpdated').textContent = '-';
      }
    }
  } catch (e) {
    document.getElementById('lastUpdated').textContent = '-';
  }
}
function formatLastUpdated(date) {
  const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const utc = date.getTime();
  const wib = new Date(utc + 7 * 60 * 60 * 1000);
  const wita = new Date(utc + 8 * 60 * 60 * 1000);
  const wit = new Date(utc + 9 * 60 * 60 * 1000);
  return `${hari[wib.getUTCDay()]} ${pad2(wib.getUTCDate())}/${pad2(wib.getUTCMonth()+1)}/${wib.getUTCFullYear()} ` +
         `<span style=\"background:#3b82f6;color:#fff;padding:2px 8px;border-radius:4px;\">${pad2(wib.getUTCHours())}:${pad2(wib.getUTCMinutes())} WIB</span> / ` +
         `<span style=\"background:#2563eb;color:#fff;padding:2px 8px;border-radius:4px;\">${pad2(wita.getUTCHours())}:${pad2(wita.getUTCMinutes())} WITA</span> / ` +
         `<span style=\"background:#1e293b;color:#fff;padding:2px 8px;border-radius:4px;\">${pad2(wit.getUTCHours())}:${pad2(wit.getUTCMinutes())} WIT</span>`;
}
document.addEventListener('DOMContentLoaded', fetchLastUpdated);

// ===================== MOBILE MENU =====================
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const closeMobileMenu = document.getElementById('closeMobileMenu');
  function openMenu() {
    mobileMenu.classList.remove('-translate-x-full');
    mobileMenuOverlay.classList.remove('hidden');
  }
  function closeMenu() {
    mobileMenu.classList.add('-translate-x-full');
    mobileMenuOverlay.classList.add('hidden');
  }
  if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
  if(closeMobileMenu) closeMobileMenu.addEventListener('click', closeMenu);
  if(mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMenu);
});

document.addEventListener('DOMContentLoaded', function() {
  if (window.flatpickr) {
    flatpickr('.date-mdy', { dateFormat: 'd/m/Y', allowInput: true });
  }
});
function convertDMYtoMDY(dmy) {
  if (!dmy) return '';
  const [dd, mm, yyyy] = dmy.split('/');
  return `${mm}/${dd}/${yyyy}`;
} 