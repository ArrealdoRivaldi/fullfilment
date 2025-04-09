$(document).ready(function () {
    let table1, table2, table3;
    let currentSelection = '';

    function showLoading(show = true) {
        $('#loading').toggle(show);
    }

    function showMessage(msg) {
        $('#message').text(msg).show();
        $('#error').hide();
    }

    function showError(msg) {
        $('#error').text(msg).show();
        $('#message').hide();
    }

    function clearMessages() {
        $('#loading, #message, #error').hide().text('');
    }

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

    function loadTableData(table, jsonFile, callback) {
        $.getJSON(jsonFile, function (response) {
            console.log("Data dari " + jsonFile + " berhasil dimuat:", response);

            if (response && response.data && Array.isArray(response.data)) {
                table.clear().rows.add(response.data).draw();
                callback(true);
            } else {
                callback(false, "Format JSON tidak sesuai: " + jsonFile);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            callback(false, "Gagal memuat " + jsonFile + ": " + errorThrown);
        });
    }

    function loadSelectedData(value, file1, file2, file3) {
        if (currentSelection === value) {
            showMessage("✅ Data sudah ditampilkan.");
            return;
        }

        currentSelection = value;
        clearMessages();
        showLoading(true);

        let successCount = 0;
        let total = 3;
        let errorMessages = [];

        loadTableData(table1, file1, function (success, errMsg) {
            if (!success) errorMessages.push(errMsg);
            checkComplete();
        });

        loadTableData(table2, file2, function (success, errMsg) {
            if (!success) errorMessages.push(errMsg);
            checkComplete();
        });

        loadTableData(table3, file3, function (success, errMsg) {
            if (!success) errorMessages.push(errMsg);
            checkComplete();
        });

        function checkComplete() {
            successCount++;
            if (successCount === total) {
                showLoading(false);
                if (errorMessages.length > 0) {
                    showError(errorMessages.join("<br>"));
                } else {
                    showMessage("✅ Data berhasil dimuat.");
                }
            }
        }
    }

    initializeTables();

    $('#dataSelector').off('change').on('change', function () {
        let selectedOption = $(this).find(':selected');
        let value = selectedOption.val();
        let file1 = selectedOption.data('table1');
        let file2 = selectedOption.data('table2');
        let file3 = selectedOption.data('table3');

        if (file1 && file2 && file3) {
            loadSelectedData(value, file1, file2, file3);
        }
    });

    // Default load
    let defaultOption = $('#dataSelector option[value="Apr"]');
    if (defaultOption.length) {
        let file1 = defaultOption.data('table1');
        let file2 = defaultOption.data('table2');
        let file3 = defaultOption.data('table3');
        loadSelectedData("Apr", file1, file2, file3);
    }
});
