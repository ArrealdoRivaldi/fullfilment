google.charts.load('current', {packages: ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Month', 'Reg', 'PS', 'Target PS', 'PS/Reg'],
        ['Jan', 27, 17, 18, 0.6477],
        ['Feb', 26, 16, 19, 0.6097],
        ['Mar', 22, 14, 19, 0.6379],
        ['Apr',  6,  4, 17, 0.2463],
    ]);

    var options = {
        title: '',
        vAxes: {
            0: {title: 'Jumlah'},
            1: {title: 'PS/Reg (%)', format: 'percent', viewWindow: {min: 0, max: 1}}
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
            3: {type: 'line', targetAxisIndex: 1, color: '#3498db', lineWidth: 3, pointSize: 6}
        },
        focusTarget: 'category',
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
        chartArea: {width: '70%', height: '70%'}
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
