google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Day', 'Re', 'PS', 'PS/Reg', { role: 'annotation' }],
        ['1', 108, 31, 0.2870, '28.70%'],
        ['2', 205, 66, 0.3210, '32.10%'],
        ['3', 163, 74, 0.4534, '45.34%'],
        ['4', 160, 78, 0.4875, '48.75%'],
        ['5', 135, 77, 0.5704, '57.04%'],
        ['6', 232, 86, 0.3707, '37.07%'],
        ['7', 205, 90, 0.4390, '43.90%'],
        ['8', 163, 119, 0.7301, '73.01%'],
        ['9', 116, 118, 1.0172, '101.72%'],
        ['10', 142, 88, 0.6197, '61.97%'],
        ['11', 106, 96, 0.9057, '90.57%'],
        ['12', 92, 66, 0.7174, '71.74%'],
        ['13', 124, 81, 0.6532, '65.32%'],
        ['14', 113, 58, 0.5133, '51.33%'],
        ['15', 142, 98, 0.6901, '69.01%'],
        ['16', 151, 104, 0.6887, '68.87%'],
        ['17', 126, 109, 0.8651, '86.51%'],
        ['18', 113, 95, 0.8407, '84.07%'],
        ['19', 103, 88, 0.8544, '85.44%'],
        ['20', 201, 111, 0.5522, '55.22%'],
        ['21', 182, 95, 0.5219, '52.19%'],
        ['22', 174, 95, 0.5460, '54.60%'],
        ['23', 186, 113, 0.6075, '60.75%'],
        ['24', 180, 91, 0.5056, '50.56%'],
        ['25', 182, 109, 0.5989, '59.89%'],
        ['26', 120, 54, 0.4500, '45.00%'],
        ['27', 173, 102, 0.5896, '58.96%'],
        ['28', 216, 94, 0.4352, '43.52%'],
        ['29', 183, 87, 0.4754, '47.54%'],
        ['30', 144, 87, 0.6042, '60.42%'],
        ['31', 181, 70, 0.3867, '38.67%']
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
