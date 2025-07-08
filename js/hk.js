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
let userNop = null;
let filteredByNopData = [];

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
    // Always filter from filteredByNopData
    const branch = document.getElementById('branchFilter').value;
    const wok = document.getElementById('wokFilter').value;
    const sto = document.getElementById('sto_coFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const statusHK = document.getElementById('statusHKFilter').value;
    const symptom = document.getElementById('symptomFilter').value;
    const statusPS = document.getElementById('statusPSFilter').value;
    const agingFallout = document.getElementById('agingFalloutFilter').value;
    return filteredByNopData.filter(item => {
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
        showToast('Data tidak ditemukan untuk filter yang dipilih!', 'info');
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
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${
                item.latitude && item.longitude
                    ? `<div class="flex items-center gap-2">
                        <span class="coords-text">${item.longitude}, ${item.latitude}</span>
                        <button class="open-map-btn px-1 py-0.5 bg-gray-200 rounded hover:bg-blue-200 border text-blue-600 text-xs" title="Open in Google Maps" data-mapurl="https://www.google.com/maps?q=${item.latitude},${item.longitude}"><i class="fa fa-map-marker-alt"></i></button>
                        <button class="copy-coords-btn px-1 py-0.5 bg-gray-200 rounded hover:bg-gray-300 border text-gray-700 text-xs" title="Copy coordinates" data-coords="${item.longitude}, ${item.latitude}"><i class="fa fa-copy"></i></button>
                        <span class="copy-success-msg hidden text-green-500 text-xs ml-1">Copied!</span>
                    </div>`
                    : '-'
            }</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${formatDateTimeMDY(item.provi_ts)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${(() => { const hari = hitungAgingHari(item.provi_ts); return mapAging(hari) })()}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <select class="status-hk-select border rounded px-2 py-1">
                    <option value="">Select Status</option>
                    ${statusHKOptions.map(opt => `<option value="${opt.value}" ${item.status_hk && item.status_hk.trim() === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <button class="remark-detail-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-doc-id="${item.id}">Detail</button>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900"><input type="text" class="new-order-id border rounded px-2 py-1" value="${item.new_order_id ? item.new_order_id : ''}" placeholder="New Order id"></td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.status_ps ? item.status_ps : ''}</td>
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
    // Tunggu sampai userNop tersedia di DOM
    function getUserNopFromDOM() {
        const el = document.getElementById('user-nop');
        return el ? el.textContent.trim() : null;
    }
    function waitForUserNop(retry = 0) {
        return new Promise(resolve => {
            const tryGet = () => {
                const nop = getUserNopFromDOM();
                if (nop && nop !== '-') {
                    resolve(nop);
                } else if (retry < 30) {
                    setTimeout(() => tryGet(++retry), 100);
                } else {
                    resolve(null);
                }
            };
            tryGet();
        });
    }
    userNop = await waitForUserNop();
    await fetchLastUpdated();
    try {
        const response = await fetch('/api/realtime');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const dataArray = (data && typeof data === 'object') ? (Array.isArray(data) ? data : Object.values(data)) : [];
        allData = dataArray.map((item, idx) => ({ id: idx.toString(), ...item }));
        // Filter by NOP user
        function filterByNopUser(data) {
            if (!userNop) return [];
            if (userNop.trim().toLowerCase() === 'kalimantan') {
                return data;
            }
            return data.filter(d => (d.branch || '').trim().toLowerCase() === userNop.trim().toLowerCase());
        }
        filteredByNopData = filterByNopUser(allData);
        initializeFilters(filteredByNopData);
        renderTableWithPagination(filteredByNopData);
        bindFilterEvents();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    updateActiveFilters();

    // Sembunyikan filter branch jika userNop bukan 'kalimantan'
    const branchFilter = document.getElementById('branchFilter');
    const activeFilters = document.getElementById('activeFilters');
    if (userNop && userNop.trim().toLowerCase() !== 'kalimantan') {
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
        // Validasi perubahan dan new_order_id
        const item = (window.allData || allData || []).find(d => d.id === id);
        const statusChanged = status_hk && String(status_hk).trim() !== String(item?.status_hk ?? '').trim();
        const newOrderIdChanged = new_order_id && String(new_order_id).trim() !== String(item?.new_order_id ?? '').trim();
        if (new_order_id && !isValidNewOrderId(new_order_id)) {
            showToast('New Order ID hanya boleh huruf, angka, strip, dan maksimal 32 karakter!', 'error');
            return;
        }
        if (!statusChanged && !newOrderIdChanged) {
            showToast('Tidak ada perubahan status_hk atau new_order_id.', 'info');
            return;
        }
        try {
            const response = await fetch('/api/realtime', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status_hk, new_order_id })
            });
            const result = await response.json();
            if (result.success) {
                showToast('Update berhasil!', 'success');
                location.reload();
                fetchLastUpdated();
            } else {
                showToast('Update gagal: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (err) {
            showToast('Update gagal: ' + err.message, 'error');
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
        if (!user) { showToast('Anda harus login!', 'error'); return; }
        const text = remarkInput.value.trim();
        if (!text) { showToast('Remark tidak boleh kosong!', 'error'); return; }
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
                showToast('Update remark gagal: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (err) {
            showToast('Update remark gagal: ' + err.message, 'error');
        }
    };
    // Edit remark
    historyDiv.querySelectorAll('.edit-remark-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(btn.getAttribute('data-idx'));
            remarkInput.value = remarks[idx].text;
            submitBtn.onclick = async function() {
                if (!user) { showToast('Anda harus login!', 'error'); return; }
                const text = remarkInput.value.trim();
                if (!text) { showToast('Remark tidak boleh kosong!', 'error'); return; }
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
                        showToast('Update remark gagal: ' + (result.error || 'Unknown error'), 'error');
                    }
                } catch (err) {
                    showToast('Update remark gagal: ' + err.message, 'error');
                }
            };
        };
    });
    // Delete remark
    historyDiv.querySelectorAll('.delete-remark-btn').forEach(btn => {
        btn.onclick = async function() {
            const idx = parseInt(btn.getAttribute('data-idx'));
            showConfirm('Hapus remark ini?', async () => {
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
                        showToast('Hapus remark gagal: ' + (result.error || 'Unknown error'), 'error');
                    }
                } catch (err) {
                    showToast('Hapus remark gagal: ' + err.message, 'error');
                }
            }, () => {});
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
        navigator.clipboard.writeText(text).then(() => showToast('Data copied!', 'success'));
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
    const exportButtons = document.getElementById('exportButtons');
    exportButtons.innerHTML = '';
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
    // Tambahkan tombol upload jika belum ada
    if (!document.getElementById('iconUploadBtn')) {
        const uploadBtn = document.createElement('button');
        uploadBtn.id = 'iconUploadBtn';
        uploadBtn.className = 'flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-base';
        uploadBtn.title = 'Upload File';
        uploadBtn.innerHTML = '<i class="fa fa-upload"></i> <span class="hidden sm:inline">Upload</span>';
        exportButtons.appendChild(uploadBtn);
        // Input file (hidden)
        let fileInput = document.getElementById('fileInput');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'fileInput';
            fileInput.accept = '.csv,.xls,.xlsx,.json';
            fileInput.className = 'hidden';
            exportButtons.appendChild(fileInput);
        }
        if (iconUploadBtn && fileInput) {
            iconUploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                handleFile(file);
            });
        }
    }
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
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${
                item.latitude && item.longitude
                    ? `<div class="flex items-center gap-2">
                        <span class="coords-text">${item.longitude}, ${item.latitude}</span>
                        <button class="open-map-btn px-1 py-0.5 bg-gray-200 rounded hover:bg-blue-200 border text-blue-600 text-xs" title="Open in Google Maps" data-mapurl="https://www.google.com/maps?q=${item.latitude},${item.longitude}"><i class="fa fa-map-marker-alt"></i></button>
                        <button class="copy-coords-btn px-1 py-0.5 bg-gray-200 rounded hover:bg-gray-300 border text-gray-700 text-xs" title="Copy coordinates" data-coords="${item.longitude}, ${item.latitude}"><i class="fa fa-copy"></i></button>
                        <span class="copy-success-msg hidden text-green-500 text-xs ml-1">Copied!</span>
                    </div>`
                    : '-'
            }</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${formatDateTimeMDY(item.provi_ts)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${(() => { const hari = hitungAgingHari(item.provi_ts); return mapAging(hari) })()}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <select class="status-hk-select border rounded px-2 py-1">
                    <option value="">Select Status</option>
                    ${statusHKOptions.map(opt => `<option value="${opt.value}" ${item.status_hk && item.status_hk.trim() === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <button class="remark-detail-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-doc-id="${item.id}">Detail</button>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900"><input type="text" class="new-order-id border rounded px-2 py-1" value="${item.new_order_id ? item.new_order_id : ''}" placeholder="New Order id"></td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.status_ps ? item.status_ps : ''}</td>
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

// Tambahkan event delegation untuk tombol copy koordinat
if (typeof document !== 'undefined') {
    document.addEventListener('click', function(e) {
        // Tombol buka Google Maps
        if (e.target.closest('.open-map-btn')) {
            const btn = e.target.closest('.open-map-btn');
            const mapUrl = btn.getAttribute('data-mapurl');
            if (mapUrl) {
                window.open(mapUrl, '_blank');
            }
        }
        // Tombol copy koordinat
        if (e.target.closest('.copy-coords-btn')) {
            const btn = e.target.closest('.copy-coords-btn');
            const coords = btn.getAttribute('data-coords');
            if (coords) {
                navigator.clipboard.writeText(coords).then(() => {
                    const msg = btn.parentElement.querySelector('.copy-success-msg');
                    if (msg) {
                        msg.classList.remove('hidden');
                        setTimeout(() => msg.classList.add('hidden'), 1200);
                    }
                });
            }
        }
    });
}

// ===== Upload Status HK (xls/csv/json) dengan Modal Popup =====
const uploadModal = document.getElementById('uploadModal');
const uploadModalStatus = document.getElementById('uploadModalStatus');
const uploadModalBar = document.getElementById('uploadModalBar');
const uploadModalDetail = document.getElementById('uploadModalDetail');
const uploadModalClose = document.getElementById('uploadModalClose');

function showUploadModal() {
  uploadModal.classList.remove('hidden');
  uploadModalStatus.textContent = 'Sedang mengupload data...';
  uploadModalBar.style.width = '0%';
  uploadModalBar.classList.add('animate-pulse');
  uploadModalDetail.textContent = '';
  uploadModalClose.classList.add('hidden');
}
function updateUploadModal(progress, status, detail) {
  uploadModalBar.style.width = progress + '%';
  if (status) uploadModalStatus.textContent = status;
  if (detail !== undefined) uploadModalDetail.innerHTML = detail;
}
function finishUploadModal(success, fail, errors) {
  uploadModalBar.classList.remove('animate-pulse');
  uploadModalBar.style.width = '100%';
  uploadModalStatus.innerHTML = `<span class='text-green-600'>Sukses update: ${success} baris</span> <span class='text-red-500 ml-2'>Gagal: ${fail} baris</span>`;
  uploadModalDetail.innerHTML = errors && errors.length ? `<div class='text-xs text-red-500 mt-1'>${errors.join('<br>')}</div>` : '';
  uploadModalClose.classList.remove('hidden');
}
uploadModalClose.onclick = () => { uploadModal.classList.add('hidden'); location.reload(); };

// SheetJS loader
function loadSheetJS(cb) {
  if (window.XLSX) return cb();
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  s.onload = cb;
  document.head.appendChild(s);
}

const uploadArea = document.getElementById('uploadArea');
const iconUploadBtn = document.getElementById('iconUploadBtn');
const fileInput = document.getElementById('fileInput');
const startUploadBtn = document.getElementById('startUploadBtn');
const selectedFileName = document.getElementById('selectedFileName');
const uploadPreview = document.getElementById('uploadPreview');
const uploadProgress = document.getElementById('uploadProgress');
const uploadProgressBar = document.getElementById('uploadProgressBar');
const uploadResult = document.getElementById('uploadResult');

let uploadData = [];
let chunkSize = 100;

function resetUploadUI() {
  if (selectedFileName) selectedFileName.textContent = '';
  if (uploadPreview) uploadPreview.innerHTML = '';
  if (uploadProgress) uploadProgress.classList.add('hidden');
  if (uploadProgressBar) uploadProgressBar.style.width = '0%';
  if (uploadResult) uploadResult.textContent = '';
  if (startUploadBtn) startUploadBtn.disabled = true;
  uploadData = [];
}

function previewTable(data) {
  if (!data || !data.length) return;
  let html = '<table class="min-w-full border text-xs"><thead><tr>';
  Object.keys(data[0]).forEach(k => html += `<th class='border px-2 py-1 bg-gray-100'>${k}</th>`);
  html += '</tr></thead><tbody>';
  data.slice(0, 10).forEach(row => {
    html += '<tr>';
    Object.values(row).forEach(v => html += `<td class='border px-2 py-1'>${v ?? ''}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  if (data.length > 10) html += `<div class='text-xs text-gray-400 mt-1'>Preview 10 dari ${data.length} baris</div>`;
  uploadPreview.innerHTML = html;
}

function isValidNewOrderId(val) {
  return typeof val === 'string' && /^[a-zA-Z0-9\-]{0,32}$/.test(val);
}
function filterChangedOnly(arr) {
  // Ambil data lama untuk validasi perubahan
  let oldMap = {};
  if (window.allData && Array.isArray(window.allData)) {
    window.allData.forEach(d => { if (d.order_id) oldMap[d.order_id] = d; });
  } else if (typeof allData !== 'undefined' && Array.isArray(allData)) {
    allData.forEach(d => { if (d.order_id) oldMap[d.order_id] = d; });
  }
  return arr.filter(row => {
    if (!row.order_id) return false;
    const old = oldMap[row.order_id];
    if (!old) return false;
    // Validasi new_order_id
    if (row.new_order_id && !isValidNewOrderId(row.new_order_id)) return false;
    // Perubahan status_hk
    const statusChanged = row.status_hk && String(row.status_hk).trim() !== String(old.status_hk ?? '').trim();
    // Perubahan remark
    const remarkChanged = row.remark && String(row.remark).trim() !== String(old.remark ?? '').trim();
    // Perubahan new_order_id
    const newOrderIdChanged = row.new_order_id && String(row.new_order_id).trim() !== String(old.new_order_id ?? '').trim();
    return statusChanged || remarkChanged || newOrderIdChanged;
  });
}

// ===== Upload File Logic (Preview + Progress Modal) =====
function showUploadPreviewModal(data, onConfirm) {
  let modal = document.getElementById('uploadPreviewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'uploadPreviewModal';
    modal.innerHTML = `
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl animate__animated animate__fadeInDown">
          <div class="font-semibold text-lg text-gray-700 mb-2 flex items-center gap-2"><i class="fa fa-file-upload text-blue-500"></i> Preview Data Upload</div>
          <div class="overflow-x-auto mb-2" style="max-height:220px;">
            <table class="min-w-full text-xs border">
              <thead><tr><th class="border px-2 py-1">order_id</th><th class="border px-2 py-1">status_hk</th><th class="border px-2 py-1">remark</th><th class="border px-2 py-1">new_order_id</th></tr></thead>
              <tbody id="uploadPreviewRows"></tbody>
            </table>
          </div>
          <div class="flex justify-end gap-2 mt-2">
            <button id="cancelUploadPreview" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Batal</button>
            <button id="confirmUploadPreview" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Upload & Update</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Isi preview
  const previewRows = modal.querySelector('#uploadPreviewRows');
  previewRows.innerHTML = '';
  (data.slice(0,10)).forEach(row => {
    previewRows.innerHTML += `<tr><td class="border px-2 py-1">${row.order_id||''}</td><td class="border px-2 py-1">${row.status_hk||''}</td><td class="border px-2 py-1">${row.remark||''}</td><td class="border px-2 py-1">${row.new_order_id||''}</td></tr>`;
  });
  modal.classList.remove('hidden');
  modal.querySelector('#cancelUploadPreview').onclick = () => modal.classList.add('hidden');
  modal.querySelector('#confirmUploadPreview').onclick = () => {
    modal.classList.add('hidden');
    if (onConfirm) onConfirm();
  };
}

function handleFile(file) {
  resetUploadUI && resetUploadUI();
  const allowedExt = ['csv', 'xls', 'xlsx', 'json'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedExt.includes(ext)) {
    showToast('Format file tidak didukung. Hanya xls, xlsx, csv, json.', 'error');
    return;
  }
  if (fileInput.files.length > 1) {
    showToast('Hanya boleh upload 1 file per proses.', 'error');
    return;
  }
  selectedFileName && (selectedFileName.textContent = file.name);
  // Ambil data lama untuk validasi perubahan
  let oldMap = {};
  if (window.allData && Array.isArray(window.allData)) {
    window.allData.forEach(d => { if (d.order_id) oldMap[d.order_id] = d; });
  } else if (typeof allData !== 'undefined' && Array.isArray(allData)) {
    allData.forEach(d => { if (d.order_id) oldMap[d.order_id] = d; });
  }
  // Parse file pakai SheetJS/JSON
  loadSheetJS(async () => {
    let rows = [];
    if (ext === 'json') {
      try { rows = JSON.parse(await file.text()); } catch { showToast('File JSON tidak valid', 'error'); return; }
    } else {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {type:'array'});
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    }
    // Validasi perubahan saja
    let changedRows = rows.filter(row => {
      const old = oldMap[row.order_id];
      if (!old) return true;
      return (row.status_hk !== old.status_hk) || (row.remark !== old.remark) || (row.new_order_id !== old.new_order_id);
    });
    if (!changedRows.length) {
      showToast('Tidak ada perubahan status_hk, remark, atau new_order_id yang perlu diupdate.', 'info');
      return;
    }
    // Validasi new_order_id
    changedRows = changedRows.filter(row => !row.new_order_id || isValidNewOrderId(row.new_order_id));
    if (!changedRows.length) {
      showToast('Semua new_order_id tidak valid.', 'error');
      return;
    }
    // Tampilkan preview, lanjutkan upload jika dikonfirmasi
    showUploadPreviewModal(changedRows, () => {
      showUploadModal();
      // Lanjutkan proses upload chunk seperti sebelumnya
      // ... logic upload chunk ...
    });
  });
}

if (iconUploadBtn && fileInput) {
  iconUploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFile(file);
  });
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

if (startUploadBtn) {
  startUploadBtn.addEventListener('click', async () => {
    if (!uploadData.length) return;
    showUploadModal();
    let chunks = chunkArray(uploadData, chunkSize);
    let total = uploadData.length, done = 0, fail = 0, errors = [];
    // Ambil allData dari window/allData global (sudah ada di script)
    let orderIdToId = {};
    if (window.allData && Array.isArray(window.allData)) {
      window.allData.forEach(d => { if (d.order_id) orderIdToId[d.order_id] = d.id; });
    } else if (typeof allData !== 'undefined' && Array.isArray(allData)) {
      allData.forEach(d => { if (d.order_id) orderIdToId[d.order_id] = d.id; });
    }
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      // Bagi: yang ada id dokumen, dan yang tidak
      const withId = [], withOrderId = [];
      chunk.forEach(row => {
        const id = orderIdToId[row.order_id];
        if (id) withId.push({ ...row, id });
        else withOrderId.push(row);
      });
      // Update by id (PUT /api/realtime)
      for (const row of withId) {
        try {
          const body = { id: row.id, status_hk: row.status_hk };
          if (row.new_order_id) body.new_order_id = row.new_order_id;
          const res = await fetch('/api/realtime', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const result = await res.json();
          if (result && result.success) {
            done++;
          } else {
            fail++;
            errors.push(`order_id ${row.order_id}: ${result && result.error ? result.error : 'Gagal update'}`);
          }
        } catch (err) {
          fail++;
          errors.push(`order_id ${row.order_id}: ${err.message}`);
        }
        updateUploadModal(Math.round(((i+1)/chunks.length)*100), `Mengupload chunk ${i+1} dari ${chunks.length}...`, '');
      }
      // Update by order_id (POST /api/realtime?update-status-hk=1)
      if (withOrderId.length) {
        try {
          const res = await fetch('/api/realtime?update-status-hk=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: withOrderId })
          });
          const result = await res.json();
          if (result && result.success) {
            done += result.updated;
            fail += result.failed;
            if (result.errors && result.errors.length) errors.push(...result.errors);
          } else {
            fail += withOrderId.length;
            errors.push(`Chunk ${i+1}: ${result && result.error ? result.error : 'Gagal update'}`);
          }
        } catch (err) {
          fail += withOrderId.length;
          errors.push(`Chunk ${i+1}: ${err}`);
        }
      }
      updateUploadModal(Math.round(((i+1)/chunks.length)*100), `Mengupload chunk ${i+1} dari ${chunks.length}...`, '');
    }
    finishUploadModal(done, fail, errors);
    setTimeout(() => { uploadModal.classList.add('hidden'); location.reload(); }, 2000);
  });
}

// ===== Custom Toast/Popup UI =====
function showToast(msg, type = 'info', duration = 2500) {
  let toast = document.getElementById('customToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'customToast';
    toast.style.position = 'fixed';
    toast.style.top = '32px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '9999';
    toast.style.minWidth = '240px';
    toast.style.maxWidth = '90vw';
    toast.style.padding = '16px 24px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.fontSize = '1rem';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s, top 0.3s';
    document.body.appendChild(toast);
  }
  let icon = '';
  if (type === 'success') icon = '<i class="fa fa-check-circle" style="color:#059669"></i>';
  else if (type === 'error') icon = '<i class="fa fa-exclamation-triangle" style="color:#dc2626"></i>';
  else icon = '<i class="fa fa-info-circle" style="color:#2563eb"></i>';
  toast.innerHTML = `${icon}<span>${msg}</span>`;
  if (type === 'success') {
    toast.style.background = '#e6fffa';
    toast.style.color = '#059669';
    toast.style.border = '1.5px solid #2dd4bf';
  } else if (type === 'error') {
    toast.style.background = '#ffeaea';
    toast.style.color = '#dc2626';
    toast.style.border = '1.5px solid #dc2626';
  } else {
    toast.style.background = '#f0f4ff';
    toast.style.color = '#2563eb';
    toast.style.border = '1.5px solid #60a5fa';
  }
  toast.style.opacity = '1';
  toast.style.top = '32px';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.top = '0px';
  }, duration);
}

// ===== Custom Confirm Modal =====
function showConfirm(msg, onYes, onNo) {
  let modal = document.getElementById('customConfirmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'customConfirmModal';
    modal.innerHTML = `
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs animate__animated animate__fadeInDown flex flex-col items-center">
          <span class="inline-block w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2"><i class="fa fa-exclamation-triangle text-red-500 text-2xl"></i></span>
          <div class="font-semibold text-gray-800 text-center mb-2" id="customConfirmMsg"></div>
          <div class="flex gap-3 mt-2">
            <button id="customConfirmYes" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Ya</button>
            <button id="customConfirmNo" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">Tidak</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('customConfirmMsg').textContent = msg;
  modal.classList.remove('hidden');
  document.getElementById('customConfirmYes').onclick = () => {
    modal.classList.add('hidden');
    if (onYes) onYes();
  };
  document.getElementById('customConfirmNo').onclick = () => {
    modal.classList.add('hidden');
    if (onNo) onNo();
  };
}