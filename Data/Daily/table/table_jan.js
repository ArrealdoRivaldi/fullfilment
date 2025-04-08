var data = [
    { "tanggal": 1, "RE": 576, "PS": 222 },
    { "tanggal": 2, "RE": 1140, "PS": 527 },
    { "tanggal": 3, "RE": 1132, "PS": 573 },
    { "tanggal": 4, "RE": 973, "PS": 506 },
    { "tanggal": 5, "RE": 702, "PS": 415 },
    { "tanggal": 6, "RE": 1171, "PS": 534 },
    { "tanggal": 7, "RE": 1038, "PS": 672 },
    { "tanggal": 8, "RE": 999, "PS": 658 },
    { "tanggal": 9, "RE": 864, "PS": 680 },
    { "tanggal": 10, "RE": 801, "PS": 564 },
    { "tanggal": 11, "RE": 713, "PS": 517 },
    { "tanggal": 12, "RE": 547, "PS": 468 },
    { "tanggal": 13, "RE": 792, "PS": 557 },
    { "tanggal": 14, "RE": 703, "PS": 585 },
    { "tanggal": 15, "RE": 890, "PS": 650 },
    { "tanggal": 16, "RE": 844, "PS": 603 },
    { "tanggal": 17, "RE": 784, "PS": 654 },
    { "tanggal": 18, "RE": 725, "PS": 627 },
    { "tanggal": 19, "RE": 546, "PS": 474 },
    { "tanggal": 20, "RE": 967, "PS": 600 },
    { "tanggal": 21, "RE": 1011, "PS": 618 },
    { "tanggal": 22, "RE": 959, "PS": 700 },
    { "tanggal": 23, "RE": 1013, "PS": 674 },
    { "tanggal": 24, "RE": 1020, "PS": 633 },
    { "tanggal": 25, "RE": 988, "PS": 552 },
    { "tanggal": 26, "RE": 741, "PS": 412 },
    { "tanggal": 27, "RE": 912, "PS": 600 },
    { "tanggal": 28, "RE": 897, "PS": 579 },
    { "tanggal": 29, "RE": 913, "PS": 532 },
    { "tanggal": 30, "RE": 1012, "PS": 525 },
    { "tanggal": 31, "RE": 1132, "PS": 555 }  
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
