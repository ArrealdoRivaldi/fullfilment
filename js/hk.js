// Optimized Main script for Table and Filters
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

// Utility functions
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        let date;
        if (typeof dateStr === 'object' && dateStr?.seconds) {
            date = new Date(dateStr.seconds * 1000);
        } else if (typeof dateStr === 'string' && dateStr.trim()) {
            date = new Date(dateStr);
        } else {
            date = new Date(dateStr);
        }
        return !isNaN(date.getTime()) 
            ? `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
            : 'Invalid Date';
    } catch (e) {
        console.error('Error formatting date:', dateStr, e);
        return 'Format Error';
    }
}

function truncateText(text, maxLength = 50) {
    return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text || '';
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
        if (item.branch) filters.branch.add(item.branch);
        if (item.wok) filters.wok.add(item.wok);
        if (item.sto_co) filters.sto_co.add(item.sto_co);
        if (item.symptom) filters.symptom.add(item.symptom);
        if (item.status_ps) filters.status_ps.add(item.status_ps);
    });

    ['branch', 'wok', 'sto_co', 'symptom', 'status_ps'].forEach(filter => {
        const select = document.getElementById(`${filter === 'status_ps' ? 'statusPS' : filter}Filter`);
        if (!select) return;
        
        select.innerHTML = '<option value="">All</option>';
        [...filters[filter]].sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    });

    // Initialize Status HK filter
    const statusHKSelect = document.getElementById('statusHKFilter');
    if (statusHKSelect) {
        statusHKSelect.innerHTML = `
            <option value="">All</option>
            <option value="done">Done</option>
            <option value="notyet">Not Yet</option>
        `;
    }
}

function hitungAgingHari(provi_ts) {
    let proviDate;
    if (typeof provi_ts === 'object' && provi_ts?.seconds) {
        proviDate = new Date(provi_ts.seconds * 1000);
    } else if (typeof provi_ts === 'string' && provi_ts.trim()) {
        proviDate = new Date(provi_ts);
    } else {
        proviDate = new Date(provi_ts);
    }
    
    if (isNaN(proviDate.getTime())) return null;
    
    const now = new Date();
    proviDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    return Math.floor((now - proviDate) / (1000 * 60 * 60 * 24));
}

function mapAging(hari) {
    if (hari <= 3) return '1-3 hari';
    if (hari <= 7) return '4-7 hari';
    if (hari <= 14) return '8-14 hari';
    if (hari <= 30) return '14-30 hari';
    return '> 30 Hari';
}

function parseMDYInput(str) {
    if (!str) return null;
    const [mm, dd, yyyy] = str.split('/');
    return mm && dd && yyyy ? new Date(`${mm}/${dd}/${yyyy}`) : null;
}

function convertDMYtoMDY(dmy) {
    if (!dmy) return '';
    const [dd, mm, yyyy] = dmy.split('/');
    return `${mm}/${dd}/${yyyy}`;
}

function formatDateTimeMDY(dateInput) {
    let date;
    if (typeof dateInput === 'object' && dateInput?.seconds) {
        date = new Date(dateInput.seconds * 1000);
    } else if (typeof dateInput === 'string' && dateInput.trim()) {
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

// Filter and search functions
function filterData() {
    const branch = document.getElementById('branchFilter')?.value || '';
    const wok = document.getElementById('wokFilter')?.value || '';
    const sto = document.getElementById('sto_coFilter')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    const statusHK = document.getElementById('statusHKFilter')?.value || '';
    const symptom = document.getElementById('symptomFilter')?.value || '';
    const statusPS = document.getElementById('statusPSFilter')?.value || '';
    const agingFallout = document.getElementById('agingFalloutFilter')?.value || '';

    return filteredByNopData.filter(item => {
        // Date filtering
        let itemDate;
        if (typeof item.provi_ts === 'object' && item.provi_ts?.seconds) {
            itemDate = new Date(item.provi_ts.seconds * 1000);
        } else {
            itemDate = new Date(item.provi_ts);
        }
        
        const start = parseMDYInput(convertDMYtoMDY(startDate));
        const end = parseMDYInput(convertDMYtoMDY(endDate));
        if (end) end.setHours(23, 59, 59, 999);

        // Status HK filtering
        let statusHKMatch = true;
        if (statusHK === 'done') {
            statusHKMatch = !!(item.status_hk && item.status_hk.trim());
        } else if (statusHK === 'notyet') {
            statusHKMatch = !(item.status_hk && item.status_hk.trim());
        }

        // Aging filtering
        let agingMatch = true;
        if (agingFallout) {
            const hari = hitungAgingHari(item.provi_ts);
            const agingCat = mapAging(hari);
            agingMatch = agingCat === agingFallout;
        }

        return (!branch || item.branch === branch) &&
            (!wok || item.wok === wok) &&
            (!sto || item.sto_co === sto) &&
            (!symptom || item.symptom === symptom) &&
            (!statusPS || item.status_ps === statusPS) &&
            statusHKMatch &&
            (!start || itemDate >= start) &&
            (!end || itemDate <= end) &&
            agingMatch;
    });
}

function getFilteredAndSearchedData() {
    const filtered = filterData();
    const searchQuery = (document.getElementById('tableSearch')?.value || '').toLowerCase();
    
    if (!searchQuery) return filtered;
    
    return filtered.filter(item => {
        const searchableFields = [
            item.order_id,
            item.provi_ts,
            item.branch,
            item.wok,
            item.sto_co,
            item.fallout_reason,
            item.symptom,
            item.status_hk,
            item.status_ps,
            item.new_order_id,
            (item.remark && item.remark.length > 0 ? item.remark.map(r => r.text).join(' | ') : '')
        ];
        
        return searchableFields.some(field => 
            field && field.toString().toLowerCase().includes(searchQuery)
        );
    });
}

// Export functionality - FIXED
function exportFilteredData(type) {
    const filteredData = getFilteredAndSearchedData();
    const headers = [
        'No', 'Order ID', 'Provi ts', 'Branch', 'WOK', 'STO', 'Fallout Reason', 
        'Symptom', 'Status HK', 'Remark', 'Status PS', 'Aging Fallout', 'New Order id'
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
        mapAging(hitungAgingHari(item.provi_ts)),
        item.new_order_id || ''
    ]);

    if (type === 'copy') {
        const text = [headers, ...rows].map(r => r.join('\t')).join('\n');
        navigator.clipboard.writeText(text).then(() => showToast('Data copied!', 'success'));
    } else if (type === 'csv') {
        const csv = [headers, ...rows].map(r => 
            r.map(v => '"' + (v||'').toString().replace(/"/g,'""') + '"').join(',')
        ).join('\n');
        const blob = new Blob([csv], {type: 'text/csv'});
        saveAs(blob, 'export-housekeeping.csv');
    } else if (type === 'excel') {
        const xls = '<table><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>' +
            rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>';
        const blob = new Blob([xls], {type: 'application/vnd.ms-excel'});
        saveAs(blob, 'export-housekeeping.xls');
    }
}

function addExportButtons() {
    const exportButtons = document.getElementById('exportButtons');
    if (!exportButtons) return;
    
    exportButtons.innerHTML = '';
    
    // Upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.id = 'iconUploadBtn';
    uploadBtn.className = 'flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition text-base';
    uploadBtn.title = 'Upload File';
    uploadBtn.innerHTML = '<i class="fa fa-upload"></i> <span class="hidden sm:inline">Upload</span>';
    exportButtons.appendChild(uploadBtn);

    // File input
    let fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'fileInput';
        fileInput.accept = '.csv,.xls,.xlsx,.json';
        fileInput.className = 'hidden';
        exportButtons.appendChild(fileInput);
    }

    // Export buttons
    const exportBtnConfigs = [
        {id: 'copy', label: 'Copy', icon: '<i class="fa fa-copy"></i>', color: 'from-blue-400 to-blue-600'},
        {id: 'csv', label: 'CSV', icon: '<i class="fa fa-file-csv"></i>', color: 'from-green-400 to-green-600'},
        {id: 'excel', label: 'Excel', icon: '<i class="fa fa-file-excel"></i>', color: 'from-green-500 to-green-700'}
    ];

    exportBtnConfigs.forEach(config => {
        const btn = document.createElement('button');
        btn.id = 'export-' + config.id;
        btn.className = `flex items-center gap-2 px-4 py-2 rounded text-white bg-gradient-to-r ${config.color} hover:opacity-90 transition text-base`;
        btn.innerHTML = `${config.icon} <span>${config.label}</span>`;
        
        // Add event listener for export functionality
        btn.addEventListener('click', () => exportFilteredData(config.id));
        
        exportButtons.appendChild(btn);
    });
}

function attachUploadEvents() {
    const iconUploadBtn = document.getElementById('iconUploadBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (iconUploadBtn && fileInput) {
        iconUploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
        });
    }
}

// Table rendering
function renderPagination(totalItems, filteredData) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;

    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300';
        prevBtn.textContent = 'Previous';
        prevBtn.onclick = () => {
            currentPage--;
            renderTableWithPagination();
        };
        pagination.appendChild(prevBtn);
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderTableWithPagination();
        };
        pagination.appendChild(pageBtn);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300';
        nextBtn.textContent = 'Next';
        nextBtn.onclick = () => {
            currentPage++;
            renderTableWithPagination();
        };
        pagination.appendChild(nextBtn);
    }
}

function renderTableWithPagination(filteredData = null) {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const data = filteredData || getFilteredAndSearchedData();
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = data.slice(startIdx, endIdx);

    pageData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.dataset.docId = item.id;
        
        const aging = mapAging(hitungAgingHari(item.provi_ts));
        const coords = item.latitude && item.longitude 
            ? `<div class="flex items-center gap-2">
                <span class="coords-text">${item.longitude}, ${item.latitude}</span>
                <button class="open-map-btn px-1 py-0.5 bg-gray-200 rounded hover:bg-blue-200 border text-blue-600 text-xs" 
                        title="Open in Google Maps" 
                        data-mapurl="https://www.google.com/maps?q=${item.latitude},${item.longitude}">
                    <i class="fa fa-map-marker-alt"></i>
                </button>
                <button class="copy-coords-btn px-1 py-0.5 bg-gray-200 rounded hover:bg-gray-300 border text-gray-700 text-xs" 
                        title="Copy coordinates" 
                        data-coords="${item.longitude}, ${item.latitude}">
                    <i class="fa fa-copy"></i>
                </button>
                <span class="copy-success-msg hidden text-green-500 text-xs ml-1">Copied!</span>
               </div>`
            : '-';

        const falloutReason = item.fallout_reason && item.fallout_reason.length > 20 
            ? item.fallout_reason.substring(0, 20) + '...' 
            : (item.fallout_reason || '');

        row.innerHTML = `
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${startIdx + index + 1}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.order_id}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.branch}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.wok}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.sto_co}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <div class="flex items-center">
                    <span>${falloutReason}</span>
                    <button class="ml-2 text-blue-600 hover:text-blue-800 details-btn" data-fallout="${item.fallout_reason}">Details</button>
                </div>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.symptom}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${coords}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${formatDateTimeMDY(item.provi_ts)}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${aging}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <select class="status-hk-select border rounded px-2 py-1">
                    <option value="">Select Status</option>
                    ${statusHKOptions.map(opt => 
                        `<option value="${opt.value}" ${item.status_hk && item.status_hk.trim() === opt.value ? 'selected' : ''}>${opt.label}</option>`
                    ).join('')}
                </select>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <button class="remark-detail-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-doc-id="${item.id}">Detail</button>
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <input type="text" class="new-order-id border rounded px-2 py-1" value="${item.new_order_id || ''}" placeholder="New Order id">
            </td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">${item.status_ps || ''}</td>
            <td class="px-2 py-2 border border-gray-300 text-gray-900">
                <button class="update-btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Update</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    renderPagination(data.length, data);
}

// Filter management
function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filters = {
        branch: { element: 'branchFilter', icon: 'fa-code-branch', color: 'blue', label: 'Branch' },
        wok: { element: 'wokFilter', icon: 'fa-industry', color: 'purple', label: 'WOK' },
        sto: { element: 'sto_coFilter', icon: 'fa-warehouse', color: 'pink', label: 'STO' },
        startDate: { element: 'startDate', icon: 'fa-calendar', color: 'green', label: 'Start Date', prefix: 'Dari: ' },
        endDate: { element: 'endDate', icon: 'fa-calendar', color: 'yellow', label: 'End Date', prefix: 'Sampai: ' },
        statusHK: { element: 'statusHKFilter', icon: 'fa-check-circle', color: 'orange', label: 'Status HK' },
        symptom: { element: 'symptomFilter', icon: 'fa-stethoscope', color: 'teal', label: 'Symptom' },
        statusPS: { element: 'statusPSFilter', icon: 'fa-tasks', color: 'indigo', label: 'Status PS' },
        agingFallout: { element: 'agingFalloutFilter', icon: 'fa-clock', color: 'red', label: 'Aging Fallout' }
    };

    Object.entries(filters).forEach(([key, config]) => {
        const element = document.getElementById(config.element);
        if (element && element.value) {
            let displayValue = element.value;
            if (config.prefix) displayValue = config.prefix + displayValue;
            if (key === 'statusHK') {
                displayValue = element.value === 'done' ? 'Done' : (element.value === 'notyet' ? 'Not Yet' : element.value);
            }
            
            const chip = document.createElement('span');
            chip.className = `bg-${config.color}-100 text-${config.color}-700 px-2 py-1 rounded flex items-center text-xs gap-1`;
            chip.innerHTML = `<i class="fa ${config.icon}"></i> ${displayValue} <button class="ml-1 text-${config.color}-500 hover:text-red-500" onclick="removeFilter('${key}')"><i class="fa fa-times"></i></button>`;
            container.appendChild(chip);
        }
    });
}

function removeFilter(type) {
    const elementMap = {
        branch: 'branchFilter',
        wok: 'wokFilter',
        sto: 'sto_coFilter',
        startDate: 'startDate',
        endDate: 'endDate',
        statusHK: 'statusHKFilter',
        symptom: 'symptomFilter',
        statusPS: 'statusPSFilter',
        agingFallout: 'agingFalloutFilter'
    };
    
    const elementId = elementMap[type];
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = '';
            applyFiltersWithChips();
        }
    }
}

function applyFiltersWithChips() {
    currentPage = 1;
    updateActiveFilters();
    renderTableWithPagination();
}

// Event bindings
function bindFilterEvents() {
    const filterElements = [
        'branchFilter', 'wokFilter', 'sto_coFilter', 'startDate', 'endDate',
        'statusHKFilter', 'symptomFilter', 'statusPSFilter', 'agingFalloutFilter'
    ];

    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFiltersWithChips);
        }
    });

    // Reset filters button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filterElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });
            applyFiltersWithChips();
        });
    }

    // Apply filters button
    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFiltersWithChips);
    }

    // Search functionality
    const searchInput = document.getElementById('tableSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTableWithPagination();
        });
    }
}

// Toast notification
function showToast(msg, type = 'info', duration = 2500) {
    let toast = document.getElementById('customToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        Object.assign(toast.style, {
            position: 'fixed',
            top: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '9999',
            minWidth: '240px',
            maxWidth: '90vw',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '1rem',
            opacity: '0',
            transition: 'opacity 0.3s, top 0.3s'
        });
        document.body.appendChild(toast);
    }

    const icons = {
        success: '<i class="fa fa-check-circle" style="color:#059669"></i>',
        error: '<i class="fa fa-exclamation-triangle" style="color:#dc2626"></i>',
        info: '<i class="fa fa-info-circle" style="color:#2563eb"></i>'
    };

    const styles = {
        success: { background: '#e6fffa', color: '#059669', border: '1.5px solid #2dd4bf' },
        error: { background: '#ffeaea', color: '#dc2626', border: '1.5px solid #dc2626' },
        info: { background: '#f0f4ff', color: '#2563eb', border: '1.5px solid #60a5fa' }
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
    Object.assign(toast.style, styles[type] || styles.info);
    toast.style.opacity = '1';
    toast.style.top = '32px';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.top = '0px';
    }, duration);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    addExportButtons();
    attachUploadEvents();
    bindFilterEvents();
    
    // Initialize date pickers
    if (window.flatpickr) {
        flatpickr('.date-mdy', { dateFormat: 'd/m/Y', allowInput: true });
    }
    
    // Event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        // Open map button
        if (e.target.closest('.open-map-btn')) {
            const btn = e.target.closest('.open-map-btn');
            const mapUrl = btn.getAttribute('data-mapurl');
            if (mapUrl) window.open(mapUrl, '_blank');
        }
        
        // Copy coordinates button
        if (e.target.closest('.copy-coords-btn')) {
            const btn = e.target.closest('.copy-coords-btn');
            const coords = btn.getAttribute('data-coords');
            if (coords) {
                navigator.clipboard.writeText(coords).then(() => {
                    const msg = btn.parentElement.querySelector('.copy-success-msg');
                    if (msg) {
                        msg.classList.remove('hidden');
                        setTimeout(() => msg.classList.add('hidden'), 2000);
                    }
                });
            }
        }
        
        // Fallout details button
        if (e.target.closest('.details-btn')) {
            const btn = e.target.closest('.details-btn');
            const fallout = btn.getAttribute('data-fallout');
            if (fallout) {
                document.getElementById('falloutDetails').textContent = fallout;
                document.getElementById('falloutModal').classList.remove('hidden');
            }
        }
        
        // Close modal button
        if (e.target.closest('#closeModal')) {
            document.getElementById('falloutModal').classList.add('hidden');
        }
    });
});

// ... existing code ...