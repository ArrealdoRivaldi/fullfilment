google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Bulan', 'Reg', { role: 'annotation' }, 'PS', { role: 'annotation' }, 'Target PS', { role: 'annotation' }, 'PS/Reg', { role: 'annotation' }],
        ['Januari', 27, '27', 17, '17', 18, '18', 0.6477 * 100, '64.77%'],
        ['Februari', 26, '26', 16, '16', 19, '19', 0.6097 * 100, '60.97%'],
        ['Maret', 22, '22', 14, '14', 19, '19', 0.6379 * 100, '63.79%'],
        ['April', 6, '6', 4, '4', 17, '17', 0.2463 * 100, '24.63%'],
    ]);

    var options = {
        title: '',
        vAxes: {
            0: {title: 'Jumlah'},
            1: {title: 'Persentase', format: 'percent', viewWindow: {min: 0, max: 100}}
        },
        hAxis: {
            title: 'Bulan'
        },
        seriesType: 'bars',
        series: {
            3: {
                type: 'line',
                targetAxisIndex: 1,
                lineWidth: 3,
                pointSize: 8,
                color: '#3498db',
                curveType: 'none'
            }
        },
        annotations: {
            alwaysOutside: true,
            highContrast: true,
            textStyle: {
                fontSize: 12,
                color: '#000',
                bold: true
            }
        },
        legend: { position: 'bottom' },
        colors: ['#e67e22', '#1a237e', '#b0bec5'],
        chartArea: {width: '70%', height: '70%'}
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
