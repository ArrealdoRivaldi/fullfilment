google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Day', 'Re', 'PS', 'PS/Reg', { role: 'annotation' }],
        ['1', 576, 222, 0.3854, '38.54%'],
        ['2', 1140, 527, 0.4623, '46.23%'],
        ['3', 1132, 573, 0.5062, '50.62%'],
        ['4', 973, 506, 0.5202, '52.02%'],
        ['5', 702, 415, 0.5912, '59.12%'],
        ['6', 1171, 534, 0.4563, '45.63%'],
        ['7', 1041, 672, 0.6455, '64.55%'],
        ['8', 999, 658, 0.6587, '65.87%'],
        ['9', 865, 680, 0.7861, '78.61%'],
        ['10', 801, 564, 0.7041, '70.41%'],
        ['11', 713, 517, 0.7251, '72.51%'],
        ['12', 547, 468, 0.8559, '85.59%'],
        ['13', 792, 557, 0.7033, '70.33%'],
        ['14', 703, 585, 0.8326, '83.26%'],
        ['15', 891, 650, 0.7295, '72.95%'],
        ['16', 845, 603, 0.7136, '71.36%'],
        ['17', 784, 654, 0.8342, '83.42%'],
        ['18', 726, 627, 0.8636, '86.36%'],
        ['19', 546, 474, 0.8681, '86.81%'],
        ['20', 967, 600, 0.6205, '62.05%'],
        ['21', 1011, 618, 0.6114, '61.14%'],
        ['22', 960, 700, 0.7292, '72.92%'],
        ['23', 1014, 674, 0.6647, '66.47%'],
        ['24', 1020, 633, 0.6206, '62.06%'],
        ['25', 990, 552, 0.5576, '55.76%'],
        ['26', 742, 412, 0.5553, '55.53%'],
        ['27', 912, 600, 0.6579, '65.79%'],
        ['28', 897, 579, 0.6455, '64.55%'],
        ['29', 913, 532, 0.5827, '58.27%'],
        ['30', 1013, 525, 0.5183, '51.83%'],
        ['31', 1134, 555, 0.4894, '48.94%']
    ]);

    var options = {
        title: 'Performance by Day',
        vAxes: {
            0: {title: 'Thousands'},
            1: {
                title: 'Percentage', 
                format: 'percent', 
                viewWindow: {
                    min: 0, 
                    max: 1.2 // Sesuaikan jika ada nilai >120%
                }
            }
        },
        hAxis: {title: 'Day'},
        seriesType: 'bars', // Default semua seri adalah bar
        series: {
            0: {targetAxisIndex: 0, color: '#e67e22'}, // Reg (bar)
            1: {targetAxisIndex: 0, color: '#1a237e'}, // PS (bar)
            2: {
                type: 'line', 
                targetAxisIndex: 1, 
                lineWidth: 3, 
                pointSize: 6, 
                color: '#3498db', 
                curveType: 'none',
                focusTarget: 'Day' // Memudahkan hover
            }
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
