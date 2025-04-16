google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Category', 'Reg', { role: 'annotation' }, 'PS', { role: 'annotation' }, 'Target PS', { role: 'annotation' }, 'PS/Reg', { role: 'annotation' }],
        ['1', 27, '27', 17, '17', 18, '18', 0.6477 * 80, '64.77%'],
        ['2', 26, '26', 16, '16', 19, '19', 0.6097 * 80, '60.97%'],
        ['3', 22, '22', 14, '14', 19, '19', 0.6379 * 80, '63.79%'],
        ['4',  6,  '6',  4,  '4', 17, '17', 0.2463 * 80, '24.63%'],
    ]);
  
    
    var options = {
        title: '',
        vAxes: {
            0: { title: 'Jumlah' },
            1: { title: 'Persentase', format: 'percent', viewWindow: { min: 0, max: 1 } }
        },
        hAxis: { 
            title: 'Bulan',
            slantedText: false
        },
        seriesType: 'bars',
        series: {
            2: { 
                type: 'line', 
                targetAxisIndex: 1, 
                lineWidth: 4, 
                pointSize: 7, 
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
        chartArea: { left: '10%', top: '10%', width: '85%', height: '70%' },
        bar: { groupWidth: "60%" },
        colors: ['#e67e22', '#1a237e']
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

window.addEventListener('resize', drawChart);
