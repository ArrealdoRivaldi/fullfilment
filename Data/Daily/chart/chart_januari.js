google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Category', 'Re', 'PS Current', 'PS/Reg', { role: 'annotation' }],
        ['1', 576, 222, 0.3854*80, '38.54%'],
        ['2', 1140, 527, 0.4623, '46.23%'],
        ['3', 1132, 573, 0.5062, '50.62%'],
        ['4', 973, 506, 0.5202, '52.02%'],
        ['5', 702, 415, 0.5912, '59.12%'],
        ['6', 1171, 534, 0.4563, '45.63%'],
        ['7', 1038, 672, 0.6476, '64.76%'],
        ['8', 999, 658, 0.6587, '65.87%'],
        ['9', 864, 680, 0.7870, '78.70%'],
        ['10', 801, 564, 0.7041, '70.41%'],
        ['11', 713, 517, 0.7251, '72.51%'],
        ['12', 547, 468, 0.8559, '85.59%'],
        ['13', 792, 557, 0.7033, '70.33%'],
        ['14', 703, 585, 0.8326, '83.26%'],
        ['15', 890, 650, 0.7303, '73.03%'],
        ['16', 844, 603, 0.7147, '71.47%'],
        ['17', 784, 654, 0.8342, '83.42%'],
        ['18', 725, 627, 0.8655, '86.55%'],
        ['19', 546, 474, 0.8681, '86.81%'],
        ['20', 967, 600, 0.6205, '62.05%'],
        ['21', 1011, 618, 0.6114, '61.14%'],
        ['22', 959, 700, 0.7299, '72.99%'],
        ['23', 1013, 674, 0.6657, '66.57%'],
        ['24', 1020, 633, 0.6206, '62.06%'],
        ['25', 988, 552, 0.5583, '55.83%'],
        ['26', 741, 412, 0.5561, '55.61%'],
        ['27', 912, 600, 0.6579, '65.79%'],
        ['28', 897, 579, 0.6455, '64.55%'],
        ['29', 913, 532, 0.5827, '58.27%'],
        ['30', 1012, 525, 0.5188, '51.88%'],
        ['31', 1132, 555, 0.4903, '49.03%']
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
                focusTarget: 'category' // Memudahkan hover
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
