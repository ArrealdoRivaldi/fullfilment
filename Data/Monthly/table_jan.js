async function fetchData() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ArrealdoRivaldi/fullfilment/refs/heads/main/Monthly%20arch%20PS/Januari.json");
        const data = await response.json();
        
        // Cari data referensi berdasarkan NOP "KALIMANTAN"
        const reference = data.find(row => row.NOP === "KALIMANTAN");
        
        generateTable(data, reference);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function generateTable(data, reference) {
    let table = `<table border="1" style="width: 100%; border-collapse: collapse;">
        <tr>
            <th>NOP</th>
            <th>Re</th>
            <th>PS</th>
            <th>Reg to PS</th>
            <th>Target PS</th>
            <th>Achievement PS</th>
        </tr>`;
    
    data.forEach(row => {
        let regToPsColor = reference && parseFloat(row["Reg to PS"].replace('%', '')) < parseFloat(reference["Reg to PS"].replace('%', '')) ? 'red' : 'black';
        let achievementPsColor = reference && parseFloat(row["Achievement PS "].replace('%', '')) < parseFloat(reference["Achievement PS "].replace('%', '')) ? 'red' : 'black';
        
        table += `<tr>
            <td>${row.NOP}</td>
            <td>${row.Re}</td>
            <td>${row.PS}</td>
            <td style="color: ${regToPsColor};">${row["Reg to PS"]}</td>
            <td>${row["Target PS"]}</td>
            <td style="color: ${achievementPsColor};">${row["Achievement PS "]}</td>
        </tr>`;
    });

    table += `</table>`;

    document.getElementById("card_table").innerHTML = table;
}

fetchData();
