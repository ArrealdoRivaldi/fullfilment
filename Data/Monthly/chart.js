var options = {
    hAxis: { 
        title: 'Bulan',
        slantedText: true,
        slantedTextAngle: 45,
        ticks: ['Januari', 'Februari', 'Maret', 'April'] // Explicitly set the ticks for the x-axis
    },
    vAxes: {
        0: {title: 'Thousands'},
        1: {title: 'Percentage', format: 'percent', viewWindow: {min: 0, max: 1}}
    },
    seriesType: 'bars',
    series: {
        3: {type: 'line', targetAxisIndex: 0, lineWidth: 3, pointSize: 8, color: '#3498db'}
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
    chartArea: { left: '10%', top: '10%', width: '85%', height: '70%' },
    bar: { groupWidth: "60%" }
};
