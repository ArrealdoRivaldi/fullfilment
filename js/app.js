$(document).ready(function () {
    let table1, table2, table3;

    function initializeTables() {
        table1 = $('#table1').DataTable({
            paging: false,
            lengthChange: false,
            ordering: false,
            info: false,
            searching: false,
            dom: 'Bfrtip',
            buttons: [
                'copy',
                {
                    extend: 'excel',
                    text: 'Download Excel',
                    title: 'Data Table 1'
                }
            ],
            columns: [
                { data: "NOP", title: "NOP" },
                { data: "PS", title: "PS" },
                { data: "PT2", title: "PT2" },
                { data: "PT3", title: "PT3" },
                { data: "Reorder", title: "Reorder" },
                { data: "Revoke", title: "Revoke" },
                { data: "Stay Fallout", title: "Stay Fallout" },
                { data: "Offering Orbit", title: "Offering Orbit" },
                { data: "Cancel", title: "Cancel" },
                { data: "NY Feedback", title: "NY Feedback" },
                { data: "Grand Total", title: "Grand Total" },
                { data: "Ach PS", title: "Ach PS" }
            ]
        });

        table2 = $('#table2').DataTable({
            paging: false,
            lengthChange: false,
            ordering: false,
            info: false,
            searching: false,
            dom: 'Bfrtip',
            buttons: [
                'copy',
                {
                    extend: 'excel',
                    text: 'Download Excel',
                    title: 'Data Table 2'
                }
            ],
            columns: [
                { data: "Symptom", title: "Symptom" },
                { data: "PS", title: "PS" },
                { data: "PT2", title: "PT2" },
                { data: "PT3", title: "PT3" },
                { data: "Reorder", title: "Reorder" },
                { data: "Revoke", title: "Revoke" },
                { data: "Stay Fallout", title: "Stay Fallout" },
                { data: "Offering Orbit", title: "Offering Orbit" },
                { data: "Cancel", title: "Cancel" },
                { data: "NY Feedback", title: "NY Feedback" },
                { data: "Grand Total", title: "Grand Total" },
                { data: "Ach PS", title: "Ach PS" }
            ]
        });

        table3 = $('#table3').DataTable({
            paging: false,
            lengthChange: false,
            ordering: false,
            info: false,
            searching: false,
            dom: 'Bfrtip',
            buttons: [
                'copy',
                {
                    extend: 'excel',
                    text: 'Download Excel',
                    title: 'Data Table 3'
                }
            ],
            columns: [
                { data: "Symptom", title: "Symptom" },
                { data: "1-3 hari", title: "1-3 Hari" },
                { data: "4-7 hari", title: "4-7 Hari" },
                { data: "8-14 hari", title: "8-14 Hari" },
                { data: ">14 hari", title: ">14 Hari" },
                { data: "Grand Total", title: "Grand Total" }
            ]
        });
    }

    function loadTableData(table, jsonFile) {
        $.getJSON(jsonFile, function (response) {
            console.log("Data dari " + jsonFile + " berhasil dimuat:", response);

            if (response && response.data && Array.isArray(response.data)) {
                table.clear().rows.add(response.data).draw();
            } else {
                console.error("Format JSON tidak sesuai:", response);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Gagal memuat " + jsonFile, textStatus, errorThrown);
        });
    }

    $('#dataSelector').on('change', function () {
        let selectedOption = $(this).find(':selected');
        let file1 = selectedOption.data('table1');
        let file2 = selectedOption.data('table2');
        let file3 = selectedOption.data('table3');

        if (file1 && file2 && file3) {
            // Selalu reset tabel dulu agar data lama hilang
            table1.clear().draw();
            table2.clear().draw();
            table3.clear().draw();

            // Load data baru dari file JSON
            loadTableData(table1, file1);
            loadTableData(table2, file2);
            loadTableData(table3, file3);
        }
    });

    // Inisialisasi DataTable saat halaman dimuat
    initializeTables();

    // Load data default dari opsi 'April'
    let defaultOption = $('#dataSelector option[value="Apr"]');
    let file1 = defaultOption.data('table1');
    let file2 = defaultOption.data('table2');
    let file3 = defaultOption.data('table3');

    if (file1 && file2 && file3) {
        loadTableData(table1, file1);
        loadTableData(table2, file2);
        loadTableData(table3, file3);
    }
});
