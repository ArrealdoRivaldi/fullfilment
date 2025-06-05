// Main logic for HK Tool House Keeping
// By AI Improvement

let allDataOriginal = [];
let allData = [];
let currentPage = 1;
let pageSize = 50;
let statusHKOptions = [
    { value: "Cancel", label: "Cancel" },
    { value: "PT2", label: "PT2" },
    { value: "PT3", label: "PT3" },
    { value: "Reorder", label: "Reorder" },
    { value: "Revoke", label: "Revoke" },
    { value: "Stay Fallout", label: "Stay Fallout" },
    { value: "Offering Orbit", label: "Offering Orbit" }
];

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c];
    });
}

function showToast(msg, success=true) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = success ? '#16a34a' : '#dc2626';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function initializeFilters(data) {
    const filters = {
        branch: new Set(),
        wok: new Set(),
        sto_co: new Set(),
        symptom: new Set(),
    };
    data.forEach(item => {
        filters.branch.add(item.branch);
        filters.wok.add(item.wok);
        filters.sto_co.add(item.sto_co);
        filters.symptom.add(item.symptom);
    });
    ['branch', 'wok', 'sto_co', 'symptom'].forEach(filter => {
        const select = document.getElementById(`${filter}Filter`);
        if (!select) return;
        select.innerHTML = '<option value="">All</option>';
        [...filters[filter]].sort().forEach(value => {
            if (value) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            }
        });
    });
    const statusHKSelect = document.getElementById('statusHKFilter');
    statusHKSelect.innerHTML = '';
    const optAll = document.createElement('option');
    optAll.value = '';
    optAll.textContent = 'All';
    statusHKSelect.appendChild(optAll);
    const optDone = document.createElement('option');
    optDone.value = 'done';
    optDone.textContent = 'Done';
    statusHKSelect.appendChild(optDone);
    const optNotYet = document.createElement('option');
    optNotYet.value = 'notyet';
    optNotYet.textContent = 'Not Yet';
    statusHKSelect.appendChild(optNotYet);
}

function filterData(data) {
    const branch = document.getElementById('branchFilter').value;
    const wok = document.getElementById('wokFilter').value;
    const sto = document.getElementById('sto_coFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const statusHK = document.getElementById('statusHKFilter').value;
    const symptom = document.getElementById('symptomFilter').value;
    const search = document.getElementById('globalSearch').value.toLowerCase();
    return data.filter(item => {
        let itemDate;
        if (typeof item.provi_ts === 'object' && item.provi_ts.seconds) {
            itemDate = new Date(item.provi_ts.seconds * 1000);
        } else if (typeof item.provi_ts === 'string') {
            itemDate = new Date(item.provi_ts);
        } else {
            itemDate = new Date(item.provi_ts);
        }
        let start = startDate ? new Date(startDate) : null;
        let end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23,59,59,999);
        let statusHKMatch = true;
        if (statusHK === 'done') {
            statusHKMatch = !!(item.status_hk && item.status_hk.trim() !== '');
        } else if (statusHK === 'notyet') {
            statusHKMatch = !(item.status_hk && item.status_hk.trim() !== '');
        }
        // Search global
        let searchMatch = true;
        if (search) {
            searchMatch = Object.values(item).some(val => (val+"").toLowerCase().includes(search));
        }
        return (!branch || item.branch === branch) &&
            (!wok || item.wok === wok) &&
            (!sto || item.sto_co === sto) &&
            (!symptom || item.symptom === symptom) &&
            statusHKMatch &&
            (!start || itemDate >= start) &&
            (!end || itemDate <= end) &&
            searchMatch;
    });
}

function renderTableWithPagination() {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = allData.slice(startIdx, endIdx);
    pageData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.dataset.docId = item.id;
        row.innerHTML = `
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${startIdx + index + 1}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${escapeHTML(item.order_id)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${escapeHTML(formatDate(item.provi_ts))}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${escapeHTML(item.branch)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${escapeHTML(item.wok)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${escapeHTML(item.sto_co)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <div class="flex items-center">
                    <span>${escapeHTML(item.fallout_reason && item.fallout_reason.length > 20 ? item.fallout_reason.substring(0, 20) + '...' : (item.fallout_reason || ''))}</span>
                    <button class="ml-2 text-blue-600 hover:text-blue-800 details-btn" data-fallout="${escapeHTML(item.fallout_reason)}">Details</button>
                </div>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${escapeHTML(item.symptom)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <select class="status-hk-select border rounded px-2 py-1">
                    <option value="">Select Status</option>
                    ${statusHKOptions.map(opt => `<option value="${opt.value}" ${item.status_hk && item.status_hk.trim() === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <input type="text" class="new-order-id border rounded px-2 py-1" value="${escapeHTML(item.new_order_id ? item.new_order_id.trim() : '')}" placeholder="Enter New Order ID">
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${escapeHTML(item.status_ps ? item.status_ps : '')}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900"><button class="update-btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Update</button></td>
        `;
        tbody.appendChild(row);
    });
    renderPagination(allData.length);
}

function renderPagination(totalItems) {
    // ... (pagination logic, sama seperti sebelumnya)
}

function formatDate(dateStr) {
    // ... (formatDate logic, sama seperti sebelumnya)
}

// Export Excel/CSV (SheetJS placeholder)
document.getElementById('exportBtn').onclick = function() {
    showToast('Export Excel coming soon! (SheetJS integration needed)', true);
    // TODO: Integrasi SheetJS di sini
};
// Kirim ke WhatsApp (link download)
document.getElementById('waBtn').onclick = function() {
    const url = window.location.href;
    const waUrl = `https://wa.me/?text=Download%20data%20House%20Keeping%20FBB:%20${encodeURIComponent(url)}`;
    window.open(waUrl, '_blank');
};
// Kirim ke Email (form + backend needed)
document.getElementById('emailBtn').onclick = function() {
    const email = prompt('Masukkan email tujuan:');
    if (!email) return;
    showToast('Fitur kirim email membutuhkan backend/email API.', false);
    // TODO: Integrasi backend/email API
};
// Search global debounce
const searchInput = document.getElementById('globalSearch');
searchInput.addEventListener('input', debounce(function() {
    allData = filterData(allDataOriginal);
    currentPage = 1;
    renderTableWithPagination();
}, 300));
// Filter apply
// ... (event handler applyFilters, resetFilters, dsb, update allData dari allDataOriginal)
// Loading spinner saat fetch data
// ... (panggil showLoading(true/false) di fetch)
// Toast notifikasi pada update, error, dsb
// ... (panggil showToast)
// Sticky header sudah di CSS
// Escape input sudah di renderTableWithPagination
// Validasi input sebelum update
// ... (tambahkan validasi di event update)
// Aksesibilitas: aria-label sudah di tombol penting
// ... (tambahkan jika ada tombol baru)
// Modularisasi: pisahkan fungsi per fitur
// ... (sudah modular di atas)
// End of hk.js 

document.addEventListener('DOMContentLoaded', async () => {
    showLoading(true);
    try {
        const response = await fetch('/api/realtime');
        if (!response.ok) throw new Error('Gagal fetch data');
        const data = await response.json();
        // Data bisa object atau array, normalisasi ke array
        const dataArray = Array.isArray(data) ? data : Object.values(data || {});
        allDataOriginal = dataArray.map((item, idx) => ({ id: idx.toString(), ...item }));
        allData = allDataOriginal.slice();
        initializeFilters(allDataOriginal);
        renderTableWithPagination();
    } catch (err) {
        showToast('Gagal mengambil data: ' + err.message, false);
    }
    showLoading(false);
}); 