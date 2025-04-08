const data = [
    { "tanggal": 1, "RE": 1044, "PS": 404 },
    { "tanggal": 2, "RE": 753, "PS": 480 },
    { "tanggal": 3, "RE": 1164, "PS": 632 },
    { "tanggal": 4, "RE": 997, "PS": 667 },
    { "tanggal": 5, "RE": 608, "PS": 590 },
    { "tanggal": 6, "RE": 982, "PS": 527 },
    { "tanggal": 7, "RE": 805, "PS": 434 },
    { "tanggal": 8, "RE": 668, "PS": 584 },
    { "tanggal": 9, "RE": 663, "PS": 377 },
    { "tanggal": 10, "RE": 797, "PS": 554 },
    { "tanggal": 11, "RE": 807, "PS": 522 },
    { "tanggal": 12, "RE": 779, "PS": 549 },
    { "tanggal": 13, "RE": 741, "PS": 546 },
    { "tanggal": 14, "RE": 653, "PS": 482 },
    { "tanggal": 15, "RE": 544, "PS": 471 },
    { "tanggal": 16, "RE": 529, "PS": 376 },
    { "tanggal": 17, "RE": 14, "PS": null },
    { "tanggal": 18, "RE": null, "PS": null },
    { "tanggal": 19, "RE": null, "PS": null },
    { "tanggal": 20, "RE": null, "PS": null },
    { "tanggal": 21, "RE": null, "PS": null },
    { "tanggal": 22, "RE": null, "PS": null },
    { "tanggal": 23, "RE": null, "PS": null },
    { "tanggal": 24, "RE": null, "PS": null },
    { "tanggal": 25, "RE": null, "PS": null },
    { "tanggal": 26, "RE": null, "PS": null },
    { "tanggal": 27, "RE": null, "PS": null },
    { "tanggal": 28, "RE": null, "PS": null },
    { "tanggal": 29, "RE": null, "PS": null },
    { "tanggal": 30, "RE": null, "PS": null },
    { "tanggal": 31, "RE": null, "PS": null }
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
