google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Bulan', 'Reg', { role: 'annotation' }, 'PS', { role: 'annotation' }, 'Target PS', { role: 'annotation' }, 'PS/Reg', { role: 'annotation' }],
        ['Jan', 27, '27', 17, '17', 18, '18', 0.6477 * 80, '64.77%'],
        ['Feb', 26, '26', 16, '16', 19, '19', 0.6097 * 80, '60.97%'],
        ['Mar', 22, '22', 14, '14', 19, '19', 0.6379 * 80, '63.79%'],
        ['Apr',  6,  '6',  4,  '4', 17, '17', 0.2463 * 80, '24.63%'],
    ]);

    var options = {
        title: 'Performance Funnel per Bulan',
        titleTextStyle: {
            fontSize: 18,
            bold: true,
            color: '#e60000',
        },
        hAxes: {
            0: {
                title: 'Jumlah',
                textStyle: { color: '#333' },
                titleTextStyle: { color: '#555', bold: true },
                gridlines: { count: 5, color: '#eee' }
            },
            1: {
                title: 'Percentage',
                format: 'percent',
                viewWindow: { min: 0, max: 1 },
                textStyle: { color: '#e60000' },
                titleTextStyle: { color: '#e60000', bold: true }
            }
        },
        vAxis: {
            title: 'Bulan',
            textStyle: { fontSize: 12, color: '#000' },
            titleTextStyle: { fontSize: 14, bold: true }
        },
        seriesType: 'bars',
        series: {
            0: { color: '#e60000' },        // Reg
            1: { color: '#f39c12' },        // PS
            2: { color: '#27ae60' },        // Target PS
            3: { type: 'line', color: '#2980b9', targetAxisIndex: 1, lineWidth: 3, pointSize: 6 } // PS/Reg
        },
        annotations: {
            alwaysOutside: true,
            textStyle: {
                fontSize: 11,
                bold: true,
                color: '#333'
            }
        },
        legend: { position: 'bottom', textStyle: { fontSize: 12 } },
        chartArea: { width: '75%', height: '70%' },
        backgroundColor: '#fff'
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
