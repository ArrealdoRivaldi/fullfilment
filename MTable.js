async function fetchData() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ArrealdoRivaldi/fullfilment/refs/heads/main/Monthly%20arch%20PS/Januari.json");
        const data = await response.json();
        generateTable(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function generateTable(data) {
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
        table += `<tr>
            <td>${row.NOP}</td>
            <td>${row.Re}</td>
            <td>${row.PS}</td>
            <td style="color: ${parseFloat(row["Reg to PS"].replace('%', '')) < 65 ? 'red' : 'black'}">${row["Reg to PS"]}</td>
            <td>${row["Target PS"]}</td>
            <td>${row["Achievement PS"]}</td>
        </tr>`;
    });

    table += `</table>`;

    document.getElementById("card_table").innerHTML = table;
}

fetchData();
