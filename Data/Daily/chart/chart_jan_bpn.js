google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Category', 'Re', 'PS Current', 'PS/Reg', { role: 'annotation' }],
        ['1', 108, 31, 0.2870, '28.70%'],
        ['2', 205, 66, 0.3210, '32.10%'],
        ['3', 163, 74, 0.4534, '45.34%'],
        ['4', 160, 78, 0.4875, '48.75%'],
        ['5', 135, 77, 0.5704, '57.04%'],
        ['6', 232, 86, 0.3707, '37.07%'],
        ['7', 204, 90, 0.4412, '44.12%'],
        ['8', 163, 119, 0.7301, '73.01%'],
        ['9', 116, 118, 1.0172, '101.72%'],
        ['10', 142, 88, 0.6197, '61.97%'],
        ['11', 106, 96, 0.9057, '90.57%'],
        ['12', 92, 66, 0.7174, '71.74%'],
        ['13', 124, 81, 0.6532, '65.32%'],
        ['14', 113, 58, 0.5133, '51.33%'],
        ['15', 142, 98, 0.6901, '69.01%'],
        ['16', 150, 104, 0.6933, '69.33%'],
        ['17', 126, 109, 0.8651, '86.51%'],
        ['18', 113, 95, 0.8407, '84.07%'],
        ['19', 103, 88, 0.8544, '85.44%'],
        ['20', 201, 111, 0.5522, '55.22%'],
        ['21', 182, 95, 0.5220, '52.20%'],
        ['22', 174, 95, 0.5460, '54.60%'],
        ['23', 186, 113, 0.6075, '60.75%'],
        ['24', 180, 91, 0.5056, '50.56%'],
        ['25', 181, 109, 0.6022, '60.22%'],
        ['26', 120, 54, 0.4500, '45.00%'],
        ['27', 173, 102, 0.5890, '58.90%'],
        ['28', 216, 94, 0.4352, '43.52%'],
        ['29', 183, 87, 0.4754, '47.54%'],
        ['30', 143, 87, 0.6084, '60.84%'],
        ['31', 181, 70, 0.3867, '38.67%']
    ]);

    var options = {
        title: '',
        vAxes: {
            0: { title: 'Thousands' },
            1: { title: 'Percentage', format: 'percent', viewWindow: { min: 0, max: 1.2 } } // Menambah ruang di atas garis
        },
        hAxis: { 
            title: '',
            slantedText: true,
            slantedTextAngle: 45 
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
            alwaysOutside: true, // Pastikan angka di atas garis biru
            highContrast: true,
            textStyle: {
                fontSize: 12,
                color: '#000',
                bold: true
            }
        },
        chartArea: { left: '10%', top: '10%', width: '85%', height: '70%' }, // Memberi ruang untuk teks
        bar: { groupWidth: "60%" } // Mengatur lebar batang agar tidak terlalu besar
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

window.addEventListener('resize', drawChart);
