const data = [
    { "tanggal": 1, "RE": 1149, "PS": 476 },
    { "tanggal": 2, "RE": 878, "PS": 488 },
    { "tanggal": 3, "RE": 1174, "PS": 629 },
    { "tanggal": 4, "RE": 1189, "PS": 677 },
    { "tanggal": 5, "RE": 1160, "PS": 674 },
    { "tanggal": 6, "RE": 1081, "PS": 501 },
    { "tanggal": 7, "RE": 1066, "PS": 753 },
    { "tanggal": 8, "RE": 900, "PS": 584 },
    { "tanggal": 9, "RE": 776, "PS": 505 },
    { "tanggal": 10, "RE": 1096, "PS": 564 },
    { "tanggal": 11, "RE": 1078, "PS": 496 },
    { "tanggal": 12, "RE": 853, "PS": 813 },
    { "tanggal": 13, "RE": 879, "PS": 578 },
    { "tanggal": 14, "RE": 798, "PS": 477 },
    { "tanggal": 15, "RE": 814, "PS": 494 },
    { "tanggal": 16, "RE": 699, "PS": 494 },
    { "tanggal": 17, "RE": 985, "PS": 560 },
    { "tanggal": 18, "RE": 1059, "PS": 573 },
    { "tanggal": 19, "RE": 1018, "PS": 603 },
    { "tanggal": 20, "RE": 934, "PS": 599 },
    { "tanggal": 21, "RE": 925, "PS": 578 },
    { "tanggal": 22, "RE": 908, "PS": 563 },
    { "tanggal": 23, "RE": 739, "PS": 482 },
    { "tanggal": 24, "RE": 993, "PS": 601 },
    { "tanggal": 25, "RE": 981, "PS": 604 },
    { "tanggal": 26, "RE": 1015, "PS": 623 },
    { "tanggal": 27, "RE": 989, "PS": 606 },
    { "tanggal": 28, "RE": 1001, "PS": 546 }      
];

// Fungsi untuk membuat tabel
function generateTable(data) {
// Membuat elemen tabel
let table = document.createElement("table");
table.style.width = "100%";
table.style.borderCollapse = "collapse";
table.style.marginTop = "10px";

// Membuat header tabel
let thead = document.createElement("thead");
let headerRow = document.createElement("tr");

["Tanggal", "RE", "PS"].forEach(text => {
    let th = document.createElement("th");
    th.textContent = text;
    th.style.border = "1px solid #ddd";
    th.style.padding = "8px";
    th.style.backgroundColor = "#f4f4f4";
    th.style.textAlign = "center";
    headerRow.appendChild(th);
});

thead.appendChild(headerRow);
table.appendChild(thead);

// Membuat body tabel
let tbody = document.createElement("tbody");

data.forEach(row => {
    let tr = document.createElement("tr");

    ["tanggal", "RE", "PS"].forEach(key => {
        let td = document.createElement("td");
        td.textContent = row[key] !== null ? row[key] : "-";
        td.style.border = "1px solid #ddd";
        td.style.padding = "8px";
        td.style.textAlign = "center";
        tr.appendChild(td);
    });

    tbody.appendChild(tr);
});

table.appendChild(tbody);

// Menambahkan tabel ke dalam elemen dengan ID "table_monthly"
document.getElementById("table_monthly").appendChild(table);
}

// Panggil fungsi untuk membuat tabel
generateTable(data);
