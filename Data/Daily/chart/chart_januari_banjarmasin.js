google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Day', 'Re', 'PS', 'PS/Reg', { role: 'annotation' }],
        ['1', 122, 46, 0.3770, '37.70%'],
        ['2', 181, 165, 0.9116, '91.16%'],
        ['3', 194, 160, 0.8247, '82.47%'],
        ['4', 145, 110, 0.7586, '75.86%'],
        ['5', 67, 61, 0.9104, '91.04%'],
        ['6', 155, 77, 0.4968, '49.68%'],
        ['7', 178, 138, 0.7753, '77.53%'],
        ['8', 177, 134, 0.7571, '75.71%'],
        ['9', 196, 160, 0.8163, '81.63%'],
        ['10', 143, 118, 0.8252, '82.52%'],
        ['11', 146, 103, 0.7055, '70.55%'],
        ['12', 120, 79, 0.6583, '65.83%'],
        ['13', 168, 162, 0.9643, '96.43%'],
        ['14', 163, 136, 0.8344, '83.44%'],
        ['15', 170, 159, 0.9353, '93.53%'],
        ['16', 146, 133, 0.9110, '91.10%'],
        ['17', 133, 121, 0.9098, '90.98%'],
        ['18', 115, 129, 1.1217, '112.17%'],
        ['19', 92, 74, 0.8043, '80.43%'],
        ['20', 186, 112, 0.6022, '60.22%'],
        ['21', 167, 84, 0.5030, '50.30%'],
        ['22', 156, 152, 0.9744, '97.44%'],
        ['23', 196, 134, 0.6837, '68.37%'],
        ['24', 166, 128, 0.7711, '77.11%'],
        ['25', 161, 111, 0.6894, '68.94%'],
        ['26', 121, 93, 0.7686, '76.86%'],
        ['27', 124, 122, 0.9839, '98.39%'],
        ['28', 143, 125, 0.8741, '87.41%'],
        ['29', 181, 132, 0.7293, '72.93%'],
        ['30', 183, 104, 0.5683, '56.83%'],
        ['31', 253, 106, 0.4190, '41.90%']
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
