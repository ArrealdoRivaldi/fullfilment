google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Category', 'Reg', { role: 'annotation' }, 'PS', { role: 'annotation' }, 'Target PS', { role: 'annotation' }, 'PS/Reg', { role: 'annotation' }],
        ['1', 27, '27', 17, '17', 18, '18', 0.6477 * 80, '64.77%'],
        ['2', 26, '26', 16, '16', 19, '19', 0.6097 * 80, '60.97%'],
        ['3', 7, '7', 5, '5', 19, '19', 0.6434 * 80, '64.34%'],
    ]);

    var options = {
        title: '',
        vAxes: {
            0: {title: 'Thousands'},
            1: {title: 'Percentage', format: 'percent', viewWindow: {min: 0, max: 70}}
        },
        hAxis: {title: ''},
        seriesType: 'bars',
        series: {
            3: {type: 'line', targetAxisIndex: 0, lineWidth: 3, pointSize: 8, color: '#3498db', curveType: 'none'}
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
