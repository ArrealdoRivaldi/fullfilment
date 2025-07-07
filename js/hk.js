// Main script for Table and Filters (refactored from hk/index.html)

let allData = [];
let currentPage = 1;
let pageSize = 50;
const statusHKOptions = [
    { value: "Cancel", label: "Cancel" },
    { value: "PT2", label: "PT2" },
    { value: "PT3", label: "PT3" },
    { value: "Reorder", label: "Reorder" },
    { value: "Revoke", label: "Revoke" },
    { value: "Offering Orbit", label: "Offering Orbit" }
];

function pad2(n) {
    return n < 10 ? '0' + n : n;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        if (typeof dateStr === 'object' && dateStr !== null && typeof dateStr.seconds === 'number') {
            const date = new Date(dateStr.seconds * 1000);
            if (!isNaN(date.getTime())) {
                return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            }
        }
        if (typeof dateStr === 'string' && dateStr.trim() !== '') {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            }
        }
        return 'Invalid Date';
    } catch (e) {
        console.error('Error formatting date:', dateStr, e);
        return 'Format Error';
    }
}
function truncateText(text, maxLength = 50) {
    if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text || '';
}
function initializeFilters(data) {
    const filters = {
        branch: new Set(),
        wok: new Set(),
        sto_co: new Set(),
        symptom: new Set(),
        status_ps: new Set(),
    };
    data.forEach(item => {
        filters.branch.add(item.branch);
        filters.wok.add(item.wok);
        filters.sto_co.add(item.sto_co);
        filters.symptom.add(item.symptom);
        filters.status_ps.add(item.status_ps);
    });
    ['branch', 'wok', 'sto_co', 'symptom', 'status_ps'].forEach(filter => {
        const select = document.getElementById(`${filter === 'status_ps' ? 'statusPS' : filter}Filter`);
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
function hitungAgingHari(provi_ts) {
    let proviDate;
    if (typeof provi_ts === 'object' && provi_ts !== null && typeof provi_ts.seconds === 'number') {
        proviDate = new Date(provi_ts.seconds * 1000);
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
function parseMDYInput(str) {
    if (!str) return null;
    const [mm, dd, yyyy] = str.split('/');
    if (!mm || !dd || !yyyy) return null;
    return new Date(`${mm}/${dd}/${yyyy}`);
}
function filterData() {
    // Always filter from allData
    const branch = document.getElementById('branchFilter').value;
    const wok = document.getElementById('wokFilter').value;
    const sto = document.getElementById('sto_coFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const statusHK = document.getElementById('statusHKFilter').value;
    const symptom = document.getElementById('symptomFilter').value;
    const statusPS = document.getElementById('statusPSFilter').value;
    const agingFallout = document.getElementById('agingFalloutFilter').value;
    return allData.filter(item => {
        let itemDate;
        if (typeof item.provi_ts === 'object' && item.provi_ts.seconds) {
            itemDate = new Date(item.provi_ts.seconds * 1000);
        } else if (typeof item.provi_ts === 'string') {
            itemDate = new Date(item.provi_ts);
        } else {
            itemDate = new Date(item.provi_ts);
        }
        let start = parseMDYInput(convertDMYtoMDY(startDate));
        let end = parseMDYInput(convertDMYtoMDY(endDate));
        if (end) end.setHours(23,59,59,999);
        if (start || end) {
            console.log('provi_ts:', item.provi_ts, 'parsed:', itemDate, 'start:', start, 'end:', end);
        }
        let statusHKMatch = true;
        if (statusHK === 'done') {
            statusHKMatch = !!(item.status_hk && item.status_hk.trim() !== '');
        } else if (statusHK === 'notyet') {
            statusHKMatch = !(item.status_hk && item.status_hk.trim() !== '');
        }
        let agingMatch = true;
        if (agingFallout) {
            const hari = hitungAgingHari(item.provi_ts);
            const agingCat = mapAging(hari);
            agingMatch = agingCat === agingFallout;
        }
        const lolos = (!branch || item.branch === branch) &&
            (!wok || item.wok === wok) &&
            (!sto || item.sto_co === sto) &&
            (!symptom || item.symptom === symptom) &&
            (!statusPS || item.status_ps === statusPS) &&
            statusHKMatch &&
            (!start || itemDate >= start) &&
            (!end || itemDate <= end) &&
            agingMatch;
        if ((start || end) && lolos) {
            console.log('LOLOS FILTER:', item);
        }
        return lolos;
    });
}
function updateActiveFilters() {
    const branch = document.getElementById('branchFilter').value;
    const wok = document.getElementById('wokFilter').value;
    const sto = document.getElementById('sto_coFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const statusHK = document.getElementById('statusHKFilter').value;
    const symptom = document.getElementById('symptomFilter').value;
    const statusPS = document.getElementById('statusPSFilter').value;
    const agingFallout = document.getElementById('agingFalloutFilter').value;
    const container = document.getElementById('activeFilters');
    container.innerHTML = '';
    function addChip(icon, text, color, type) {
        const chip = document.createElement('span');
        chip.className = `bg-${color}-100 text-${color}-700 px-2 py-1 rounded flex items-center text-xs gap-1`;
        chip.innerHTML = `<i class=\"fa ${icon}\"></i> ${text} <button class=\"ml-1 text-${color}-500 hover:text-red-500\" onclick=\"removeFilter('${type}')\"><i class=\"fa fa-times\"></i></button>`;
        container.appendChild(chip);
    }
    if (branch) addChip('fa-code-branch', branch, 'blue', 'branch');
    if (wok) addChip('fa-industry', wok, 'purple', 'wok');
    if (sto) addChip('fa-warehouse', sto, 'pink', 'sto');
    if (startDate) addChip('fa-calendar', `Dari: ${startDate}`, 'green', 'startDate');
    if (endDate) addChip('fa-calendar', `Sampai: ${endDate}`, 'yellow', 'endDate');
    if (statusHK) addChip('fa-check-circle', statusHK === 'done' ? 'Done' : (statusHK === 'notyet' ? 'Not Yet' : statusHK), 'orange', 'statusHK');
    if (symptom) addChip('fa-stethoscope', symptom, 'teal', 'symptom');
    if (statusPS) addChip('fa-tasks', statusPS, 'indigo', 'statusPS');
    if (agingFallout) addChip('fa-hourglass-half', `Aging: ${agingFallout}`, 'gray', 'agingFallout');
}
function removeFilter(type) {
    if (type === 'branch') document.getElementById('branchFilter').value = '';
    if (type === 'wok') document.getElementById('wokFilter').value = '';
    if (type === 'sto') document.getElementById('sto_coFilter').value = '';
    if (type === 'startDate') document.getElementById('startDate').value = '';
    if (type === 'endDate') document.getElementById('endDate').value = '';
    if (type === 'statusHK') document.getElementById('statusHKFilter').value = '';
    if (type === 'symptom') document.getElementById('symptomFilter').value = '';
    if (type === 'statusPS') document.getElementById('statusPSFilter').value = '';
    if (type === 'agingFallout') document.getElementById('agingFalloutFilter').value = '';
    applyFiltersWithChips();
}
function applyFiltersWithChips() {
    updateActiveFilters();
    const filteredData = filterData();
    if (filteredData.length === 0) {
        alert('Data tidak ditemukan untuk filter yang dipilih!');
    }
    currentPage = 1;
    renderTableWithPagination(filteredData);
}
function renderPagination(totalItems, filteredData) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    let pageOptions = '';
    for (let i = 1; i <= totalPages; i++) {
        pageOptions += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
    }
    const pageSizes = [10, 25, 50, 100, 200];
    let sizeOptions = '';
    for (let size of pageSizes) {
        sizeOptions += `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`;
    }
    pagination.innerHTML = `
        <span class="mr-2">${totalItems} Total Data</span>
        <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''} class="px-2 py-1 border rounded bg-gray-100 mr-1">&larr;</button>
        <label>Page <select id="pageSelect" class="border rounded px-2 py-1 mx-1">${pageOptions}</select> of ${totalPages}</label>
        <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''} class="px-2 py-1 border rounded bg-gray-100 ml-1">&rarr;</button>
        <label class="ml-4">Show <select id="sizeSelect" class="border rounded px-2 py-1 mx-1">${sizeOptions}</select></label>
    `;
    document.getElementById('prevPage').onclick = () => { if (currentPage > 1) { currentPage--; renderTableWithPagination(filteredData); } };
    document.getElementById('nextPage').onclick = () => { if (currentPage < totalPages) { currentPage++; renderTableWithPagination(filteredData); } };
    document.getElementById('pageSelect').onchange = (e) => { currentPage = parseInt(e.target.value); renderTableWithPagination(filteredData); };
    document.getElementById('sizeSelect').onchange = (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        renderTableWithPagination(filteredData);
    };
}
function renderTableWithPagination(filteredData = null) {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    const data = filteredData || filterData();
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = data.slice(startIdx, endIdx);
    pageData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.dataset.docId = item.id;
        row.innerHTML = `
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${startIdx + index + 1}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.order_id}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${formatDateTimeMDY(item.provi_ts)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.branch}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.wok}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.sto_co}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <div class="flex items-center">
                    <span>${item.fallout_reason && item.fallout_reason.length > 20 ? item.fallout_reason.substring(0, 20) + '...' : (item.fallout_reason || '')}</span>
                    <button class="ml-2 text-blue-600 hover:text-blue-800 details-btn" data-fallout="${item.fallout_reason}">Details</button>
                </div>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.symptom}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <select class="status-hk-select border rounded px-2 py-1">
                    <option value="">Select Status</option>
                    ${statusHKOptions.map(opt => `<option value="${opt.value}" ${item.status_hk && item.status_hk.trim() === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <button class="remark-detail-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-doc-id="${item.id}">Detail</button>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.status_ps ? item.status_ps : ''}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${(() => { const hari = hitungAgingHari(item.provi_ts); return mapAging(hari) })()}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900"><input type="text" class="new-order-id border rounded px-2 py-1" value="${item.new_order_id ? item.new_order_id : ''}" placeholder="New Order id"></td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900"><button class="update-btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Update</button></td>
        `;
        tbody.appendChild(row);
    });
    renderPagination(data.length, data);
}

// LAST UPDATED
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

// FILTER EVENTS
function bindFilterEvents() {
    const filterIds = [
        'branchFilter', 'wokFilter', 'sto_coFilter', 'startDate', 'endDate',
        'statusHKFilter', 'symptomFilter', 'statusPSFilter', 'agingFalloutFilter'
    ];
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', applyFiltersWithChips);
        }
    });
    document.getElementById('applyFilters').addEventListener('click', applyFiltersWithChips);
    document.getElementById('resetFilters').addEventListener('click', () => {
        filterIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        currentPage = 1;
        updateActiveFilters();
        renderTableWithPagination(allData);
        fetchLastUpdated();
    });
}

// MENU LOGIC (Unified for mobile & sidebar, improved)
document.addEventListener('DOMContentLoaded', async () => {
    await fetchLastUpdated();
    try {
        const response = await fetch('/api/realtime');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const dataArray = (data && typeof data === 'object') ? (Array.isArray(data) ? data : Object.values(data)) : [];
        allData = dataArray.map((item, idx) => ({ id: idx.toString(), ...item }));
        initializeFilters(allData);
        renderTableWithPagination(allData);
        bindFilterEvents();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    updateActiveFilters();

    // Improved Hamburger & Sidebar menu logic
    function closeAllSubMenus(menuRoot) {
        menuRoot.querySelectorAll('.js-sub-list').forEach(sub => {
            sub.style.display = 'none';
        });
        menuRoot.querySelectorAll('.js-arrow').forEach(arrow => {
            arrow.classList.remove('open');
        });
    }
    function toggleSubMenu(e) {
        e.preventDefault();
        const arrow = e.currentTarget;
        const menuRoot = arrow.closest('nav') || document;
        // Only one submenu open at a time
        closeAllSubMenus(menuRoot);
        arrow.classList.toggle('open');
        const subList = arrow.parentElement.querySelector('.js-sub-list');
        if (subList) {
            if (subList.style.display === 'block') {
                subList.style.display = 'none';
            } else {
                subList.style.display = 'block';
            }
        }
    }
    // Attach to both sidebar and mobile
    document.querySelectorAll('.navbar-sidebar .js-arrow, .navbar-mobile .js-arrow').forEach(el => {
        el.addEventListener('click', toggleSubMenu);
    });
    // Hamburger toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function () {
            this.classList.toggle('is-active');
            const navbarMobile = document.querySelector('.navbar-mobile');
            if (navbarMobile) {
                if (navbarMobile.style.display === 'block') {
                    navbarMobile.style.display = 'none';
                } else {
                    navbarMobile.style.display = 'block';
                }
            }
        });
    }
    // Close mobile menu after click on any menu item
    document.querySelectorAll('.navbar-mobile__list a').forEach(link => {
        link.addEventListener('click', function () {
            const navbarMobile = document.querySelector('.navbar-mobile');
            if (navbarMobile && window.innerWidth < 992) {
                navbarMobile.style.display = 'none';
                if (hamburger) hamburger.classList.remove('is-active');
            }
        });
    });
    // Set active class based on current URL for both menus
    function setActiveMenu() {
        const path = window.location.pathname.replace(/\/$/, '');
        document.querySelectorAll('.navbar-sidebar a, .navbar-mobile a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === path || (href === '/hk/' && path === '/hk'))) {
                link.classList.add('active');
                // Also open parent submenu if exists
                const parentSub = link.closest('.js-sub-list');
                if (parentSub) {
                    parentSub.style.display = 'block';
                    const parentArrow = parentSub.parentElement.querySelector('.js-arrow');
                    if (parentArrow) parentArrow.classList.add('open');
                }
            } else {
                link.classList.remove('active');
            }
        });
    }
    setActiveMenu();
});

// Fallout modal and update logic
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('falloutModal').classList.add('hidden');
});
document.getElementById('dataTableBody').addEventListener('click', async (e) => {
    if (e.target.classList.contains('details-btn')) {
        const details = e.target.dataset.fallout;
        document.getElementById('falloutDetails').textContent = details;
        document.getElementById('falloutModal').classList.remove('hidden');
    }
    if (e.target.classList.contains('update-btn')) {
        const row = e.target.closest('tr');
        const id = row.dataset.docId;
        const status_hk = row.querySelector('.status-hk-select').value;
        const new_order_id = row.querySelector('.new-order-id').value;
        try {
            const response = await fetch('/api/realtime', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status_hk, new_order_id })
            });
            const result = await response.json();
            if (result.success) {
                alert('Update berhasil!');
                location.reload();
                fetchLastUpdated();
            } else {
                alert('Update gagal: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Update gagal: ' + err.message);
        }
    }
});

// Event handler untuk tombol remark detail
document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('remark-detail-btn')) {
        const docId = e.target.getAttribute('data-doc-id');
        openRemarkModal(docId);
    }
});

// Modal logic
async function openRemarkModal(docId) {
    const modal = document.getElementById('remarkModal');
    const historyDiv = document.getElementById('remarkHistory');
    const remarkInput = document.getElementById('remarkInput');
    const lastEditedInfo = document.getElementById('lastEditedInfo');
    const submitBtn = document.getElementById('submitRemarkBtn');
    modal.classList.remove('hidden');
    // Fetch data dari Firestore (atau allData)
    const item = allData.find(d => d.id === docId);
    const user = firebase.auth().currentUser;
    let remarks = item.remark || [];
    // Render riwayat remark
    historyDiv.innerHTML = remarks.map((r, idx) =>
        `<div class="mb-2 p-2 rounded ${user && user.email === r.email ? 'bg-blue-50' : 'bg-gray-100'}">
            <div class="text-xs text-gray-500">[${formatDateTime(r.timestamp)}] ${r.email}:</div>
            <div class="text-gray-800">${r.text}</div>
            ${user && user.email === r.email ? `<button class="edit-remark-btn text-xs text-blue-600 mt-1" data-idx="${idx}">Edit</button> <button class="delete-remark-btn text-xs text-red-600 mt-1 ml-2" data-idx="${idx}">Delete</button>` : ''}
        </div>`
    ).join('') || '<div class="text-gray-400 italic">Belum ada remark.</div>';
    // Last edited info
    lastEditedInfo.textContent = item.lastEdited ? `Last edited: ${formatDateTime(item.lastEdited.time)} by ${item.lastEdited.email}` : '';
    // Kosongkan textarea
    remarkInput.value = '';
    // Submit remark baru
    submitBtn.onclick = async function() {
        if (!user) { alert('Anda harus login!'); return; }
        const text = remarkInput.value.trim();
        if (!text) { alert('Remark tidak boleh kosong!'); return; }
        const newRemark = { email: user.email, text, timestamp: new Date().toISOString() };
        remarks.push(newRemark);
        try {
            const response = await fetch('/api/realtime', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: docId, remark: remarks, lastEdited: { email: user.email, time: newRemark.timestamp } })
            });
            const result = await response.json();
            if (result.success) {
                item.remark = remarks;
                item.lastEdited = { email: user.email, time: newRemark.timestamp };
                renderTableWithPagination();
                openRemarkModal(docId); // refresh modal
            } else {
                alert('Update remark gagal: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Update remark gagal: ' + err.message);
        }
    };
    // Edit remark
    historyDiv.querySelectorAll('.edit-remark-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(btn.getAttribute('data-idx'));
            remarkInput.value = remarks[idx].text;
            submitBtn.onclick = async function() {
                if (!user) { alert('Anda harus login!'); return; }
                const text = remarkInput.value.trim();
                if (!text) { alert('Remark tidak boleh kosong!'); return; }
                remarks[idx].text = text;
                remarks[idx].timestamp = new Date().toISOString();
                try {
                    const response = await fetch('/api/realtime', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: docId, remark: remarks, lastEdited: { email: user.email, time: remarks[idx].timestamp } })
                    });
                    const result = await response.json();
                    if (result.success) {
                        item.remark = remarks;
                        item.lastEdited = { email: user.email, time: remarks[idx].timestamp };
                        renderTableWithPagination();
                        openRemarkModal(docId); // refresh modal
                    } else {
                        alert('Update remark gagal: ' + (result.error || 'Unknown error'));
                    }
                } catch (err) {
                    alert('Update remark gagal: ' + err.message);
                }
            };
        };
    });
    // Delete remark
    historyDiv.querySelectorAll('.delete-remark-btn').forEach(btn => {
        btn.onclick = async function() {
            const idx = parseInt(btn.getAttribute('data-idx'));
            if (!confirm('Hapus remark ini?')) return;
            remarks.splice(idx, 1);
            try {
                const response = await fetch('/api/realtime', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: docId, remark: remarks, lastEdited: remarks.length > 0 ? { email: user.email, time: new Date().toISOString() } : null })
                });
                const result = await response.json();
                if (result.success) {
                    item.remark = remarks;
                    item.lastEdited = remarks.length > 0 ? { email: user.email, time: new Date().toISOString() } : null;
                    renderTableWithPagination();
                    openRemarkModal(docId); // refresh modal
                } else {
                    alert('Hapus remark gagal: ' + (result.error || 'Unknown error'));
                }
            } catch (err) {
                alert('Hapus remark gagal: ' + err.message);
            }
        };
    });
    // Close modal
    document.getElementById('closeRemarkModal').onclick = function() {
        modal.classList.add('hidden');
    };
}
// Helper format tanggal & update Firestore
function formatDateTime(dt) {
    if (!dt) return '-';
    const d = new Date(dt);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}
// 404 redirect logic
if (window.location.pathname !== '/hk/' && window.location.pathname !== '/hk') {
    document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f7fafc;">
            <div style="text-align:center;background:#fff;padding:40px 32px;border-radius:16px;box-shadow:0 2px 16px #0001;">
                <img src="/images/icon/logo.png" alt="Fullfilment FBB" width="80" style="margin-bottom:1.5em;">
                <h1 style="font-size:5rem;color:#e53e3e;margin-bottom:0.5em;">404</h1>
                <h2 style="font-size:2rem;color:#2d3748;margin-bottom:1em;">Halaman Tidak Ditemukan</h2>
                <p style="color:#4a5568;margin-bottom:2em;">Maaf, halaman yang Anda cari tidak tersedia.<br>Anda akan diarahkan ke halaman tool house keeping dalam 5 detik.</p>
                <a href="/hk/" style="display:inline-block;background:#3182ce;color:#fff;padding:0.75em 2em;border-radius:8px;text-decoration:none;font-weight:bold;">Kembali ke Tool House Keeping</a>
            </div>
        </div>
    `;
    setTimeout(() => { window.location.href = '/hk/'; }, 5000);
}

// ===== EXPORT BUTTONS & SEARCH =====
function exportFilteredData(type) {
    const filteredData = getFilteredAndSearchedData();
    const headers = [
        'No', 'Order ID', 'Provi ts', 'Branch', 'WOK', 'STO', 'Fallout Reason', 'Symptom', 'Status HK', 'Remark', 'Status PS', 'Aging Fallout', 'New Order id'
    ];
    const rows = filteredData.map((item, idx) => [
        idx + 1,
        item.order_id || '',
        formatDate(item.provi_ts),
        item.branch || '',
        item.wok || '',
        item.sto_co || '',
        item.fallout_reason || '',
        item.symptom || '',
        item.status_hk || '',
        (item.remark && item.remark.length > 0) ? item.remark.map(r => r.text).join(' | ') : '',
        item.status_ps || '',
        (() => { const hari = hitungAgingHari(item.provi_ts); return mapAging(hari) })(),
        item.new_order_id || ''
    ]);
    if (type === 'copy') {
        const text = [headers, ...rows].map(r => r.join('\t')).join('\n');
        navigator.clipboard.writeText(text).then(() => alert('Data copied!'));
    } else if (type === 'csv') {
        const csv = [headers, ...rows].map(r => r.map(v => '"' + (v||'').toString().replace(/"/g,'""') + '"').join(',')).join('\n');
        const blob = new Blob([csv], {type: 'text/csv'});
        saveAs(blob, 'export-housekeeping.csv');
    } else if (type === 'excel') {
        let xls = '<table><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>' +
            rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>';
        const blob = new Blob([xls], {type: 'application/vnd.ms-excel'});
        saveAs(blob, 'export-housekeeping.xls');
    }
}
function addExportButtons() {
    const btns = [
        {id:'copy', label:'Copy', icon:'<i class="fa fa-copy"></i>', color:'from-blue-400 to-blue-600'},
        {id:'csv', label:'CSV', icon:'<i class="fa fa-file-csv"></i>', color:'from-green-400 to-green-600'},
        {id:'excel', label:'Excel', icon:'<i class="fa fa-file-excel"></i>', color:'from-emerald-400 to-emerald-600'}
    ];
    const container = document.getElementById('exportButtons');
    if (!container) return;
    container.innerHTML = btns.map(b => `<button class="export-btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${b.color} text-white rounded-lg shadow hover:scale-105 hover:shadow-lg transition-all duration-150 text-xs font-semibold" id="export-${b.id}">${b.icon} ${b.label}</button>`).join(' ');
    btns.forEach(b => {
        document.getElementById('export-' + b.id).onclick = () => exportFilteredData(b.id);
    });
}
// Search logic
function getFilteredAndSearchedData() {
    const filtered = filterData();
    const q = (document.getElementById('tableSearch')?.value || '').toLowerCase();
    if (!q) return filtered;
    return filtered.filter(item => {
        return [
            item.order_id, item.provi_ts, item.branch, item.wok, item.sto_co, item.fallout_reason, item.symptom, item.status_hk, item.status_ps, item.new_order_id,
            (item.remark && item.remark.length > 0 ? item.remark.map(r => r.text).join(' | ') : '')
        ].some(val => (val ? val.toString().toLowerCase().includes(q) : false));
    });
}
// Override renderTableWithPagination to use search
function renderTableWithPagination(filteredData = null) {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    const data = filteredData || getFilteredAndSearchedData();
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = data.slice(startIdx, endIdx);
    pageData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.dataset.docId = item.id;
        row.innerHTML = `
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${startIdx + index + 1}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.order_id}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${formatDateTimeMDY(item.provi_ts)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.branch}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.wok}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.sto_co}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <div class="flex items-center">
                    <span>${item.fallout_reason && item.fallout_reason.length > 20 ? item.fallout_reason.substring(0, 20) + '...' : (item.fallout_reason || '')}</span>
                    <button class="ml-2 text-blue-600 hover:text-blue-800 details-btn" data-fallout="${item.fallout_reason}">Details</button>
                </div>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.symptom}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <select class="status-hk-select border rounded px-2 py-1">
                    <option value="">Select Status</option>
                    ${statusHKOptions.map(opt => `<option value="${opt.value}" ${item.status_hk && item.status_hk.trim() === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <button class="remark-detail-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-doc-id="${item.id}">Detail</button>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.status_ps ? item.status_ps : ''}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${(() => { const hari = hitungAgingHari(item.provi_ts); return mapAging(hari) })()}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900"><input type="text" class="new-order-id border rounded px-2 py-1" value="${item.new_order_id ? item.new_order_id : ''}" placeholder="New Order id"></td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900"><button class="update-btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Update</button></td>
        `;
        tbody.appendChild(row);
    });
    renderPagination(data.length, data);
}
document.addEventListener('DOMContentLoaded', function() {
    addExportButtons();
    // Search event
    const searchInput = document.getElementById('tableSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1;
            renderTableWithPagination();
        });
    }
});

function formatDateTimeMDY(dateInput) {
    let date;
    if (typeof dateInput === 'object' && dateInput !== null && typeof dateInput.seconds === 'number') {
        date = new Date(dateInput.seconds * 1000);
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

function waitForUserAndInitHK() {
    if (window.currentUser) {
        initHKWithUser();
    } else {
        setTimeout(waitForUserAndInitHK, 100);
    }
}

function initHKWithUser() {
    const user = window.currentUser;
    document.addEventListener('DOMContentLoaded', async () => {
        await fetchLastUpdated();
        try {
            const response = await fetch('/api/realtime');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const dataArray = (data && typeof data === 'object') ? (Array.isArray(data) ? data : Object.values(data)) : [];
            allData = dataArray.map((item, idx) => ({ id: idx.toString(), ...item }));
            // Branch filtering logic
            let filteredData = allData;
            if (user.nop && user.nop.toLowerCase() !== 'kalimantan') {
                console.log('User NOP:', user.nop);
                console.log('Semua branch di allData:', allData.map(d => d.branch));
                filteredData = allData.filter(d => (d.branch || '').trim().toLowerCase() === (user.nop || '').trim().toLowerCase());
                console.log('Filtered data:', filteredData);
                // Hide branch filter UI for non-kalimantan
                const branchFilter = document.getElementById('branchFilter');
                if (branchFilter) {
                    branchFilter.style.display = 'none';
                }
            }
            initializeFilters(filteredData);
            renderTableWithPagination(filteredData);
            bindFilterEvents();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        updateActiveFilters();
        // ... existing code ...
    });
}

waitForUserAndInitHK(); 