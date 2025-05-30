google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Month', 'Reg', { role: 'annotation' }, 'PS', { role: 'annotation' }, 'Target PS', { role: 'annotation' }, 'PS/Reg', { role: 'annotation' }],
        ['January', 27, '27', 17, '17', 18, '18', 0.6477 * 80, '64.77%'],
        ['February', 26, '26', 16, '16', 19, '19', 0.6097 * 80, '60.97%'],
        ['March', 22, '22', 14, '14', 19, '19', 0.6379 * 80, '63.79%'],
        ['April', 14, '14',  9,  '9', 17, '17', 0.6586 * 80, '65.86%'],
    ]);

    var options = {
        title: 'Performance by Month',
        vAxes: {
            0: {title: 'Thousands'},
            1: {title: 'Percentage', format: 'percent', viewWindow: {min: 0, max: 1}}
        },
        hAxis: {title: 'Month'},
        seriesType: 'bars',
        series: {
            3: {type: 'line', targetAxisIndex: 0, lineWidth: 3, pointSize: 8, color: '#3498db', curveType: 'none'}
        },
        annotations: {
            alwaysOutside: true,
            textStyle: {
                fontSize: 12,
                color: '#000',
                bold: true
            }
        },
        legend: { position: 'bottom' },
        colors: ['#e67e22', '#1a237e', '#b0bec5'],
        chartArea: {
            left: '10%',
            top: '10%',
            width: '85%',
            height: '70%'
        }
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
