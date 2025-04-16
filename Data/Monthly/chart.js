google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var monthLabels = ['Jan', 'Feb', 'Mar', 'Apr'];
    var rawData = [
        [27, '27', 17, '17', 18, '18', 0.6477 * 80, '64.77%'],
        [26, '26', 16, '16', 19, '19', 0.6097 * 80, '60.97%'],
        [22, '22', 14, '14', 19, '19', 0.6379 * 80, '63.79%'],
        [ 6,  '6',  4,  '4', 17, '17', 0.2463 * 80, '24.63%']
    ];

    var dataArray = [['Month', 'Reg', { role: 'annotation' }, 'PS', { role: 'annotation' }, 'Target PS', { role: 'annotation' }, 'PS/Reg', { role: 'annotation' }]];
    for (var i = 0; i < rawData.length; i++) {
        dataArray.push([monthLabels[i]].concat(rawData[i]));
    }

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        title: '',
        vAxes: {
            0: {title: 'Thousands'},
            1: {title: 'Percentage', format: 'percent', viewWindow: {min: 0, max: 1}}
        },
        hAxis: {
            title: 'Month',
            slantedText: true,
            slantedTextAngle: 45,
            showTextEvery: 1,
            textStyle: { fontSize: 12 }
        },
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
