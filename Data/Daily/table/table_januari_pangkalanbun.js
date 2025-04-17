var data = [
    { "tanggal": 1, "RE": 108, "PS": 31 },
    { "tanggal": 2, "RE": 205, "PS": 66 },
    { "tanggal": 3, "RE": 163, "PS": 74 },
    { "tanggal": 4, "RE": 160, "PS": 78 },
    { "tanggal": 5, "RE": 135, "PS": 77 },
    { "tanggal": 6, "RE": 232, "PS": 86 },
    { "tanggal": 7, "RE": 204, "PS": 90 },
    { "tanggal": 8, "RE": 163, "PS": 119 },
    { "tanggal": 9, "RE": 116, "PS": 118 },
    { "tanggal": 10, "RE": 142, "PS": 88 },
    { "tanggal": 11, "RE": 106, "PS": 96 },
    { "tanggal": 12, "RE": 92, "PS": 66 },
    { "tanggal": 13, "RE": 124, "PS": 81 },
    { "tanggal": 14, "RE": 113, "PS": 58 },
    { "tanggal": 15, "RE": 142, "PS": 98 },
    { "tanggal": 16, "RE": 150, "PS": 104 },
    { "tanggal": 17, "RE": 126, "PS": 109 },
    { "tanggal": 18, "RE": 113, "PS": 95 },
    { "tanggal": 19, "RE": 103, "PS": 88 },
    { "tanggal": 20, "RE": 201, "PS": 111 },
    { "tanggal": 21, "RE": 182, "PS": 95 },
    { "tanggal": 22, "RE": 174, "PS": 95 },
    { "tanggal": 23, "RE": 186, "PS": 113 },
    { "tanggal": 24, "RE": 180, "PS": 91 },
    { "tanggal": 25, "RE": 181, "PS": 109 },
    { "tanggal": 26, "RE": 120, "PS": 54 },
    { "tanggal": 27, "RE": 173, "PS": 102 },
    { "tanggal": 28, "RE": 216, "PS": 94 },
    { "tanggal": 29, "RE": 183, "PS": 87 },
    { "tanggal": 30, "RE": 143, "PS": 87 },
    { "tanggal": 31, "RE": 181, "PS": 70 }
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
