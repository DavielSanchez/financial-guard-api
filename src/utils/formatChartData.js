const moment = require('moment');

function formatChartData(transactions, period, start, end, isBalance = false, currentTotal = 0) {
    const data = [];
    const current = moment(start);
    const stop = moment(end);

    let unit = 'day';
    let format = 'DD/MM';

    if (period === 'Day') {
        unit = 'hour';
        format = 'HH:00';
    } else if (period === 'Year') {
        unit = 'month';
        format = 'MMM';
    }

    // 1. Agrupar transacciones por el formato de tiempo
    const grouped = transactions.reduce((acc, curr) => {
        const key = moment(curr.date).format(format);
        const amount = parseFloat(curr.amount);

        if (isBalance) {
            // Si es balance, sumamos ingresos y restamos gastos para el neto del punto
            const impact = curr.type === 'income' ? amount : -amount;
            acc[key] = (acc[key] || 0) + impact;
        } else {
            // Para ingresos/gastos normales, solo sumamos el valor absoluto
            acc[key] = (acc[key] || 0) + amount;
        }
        return acc;
    }, {});

    // 2. Llenar los puntos del periodo
    while (current <= stop) {
        const label = current.format(format);
        data.push({
            d: label,
            v: grouped[label] || 0 // Temporalmente guardamos el neto del día aquí
        });
        current.add(1, unit);
        if (data.length > 366) break;
    }

    // 3. SI ES BALANCE: Transformar netos diarios en saldo acumulado
    if (isBalance) {
        // Recorremos de futuro a pasado para reconstruir el historial
        let runningBalance = currentTotal;

        // Vamos desde el último punto hacia atrás
        for (let i = data.length - 1; i >= 0; i--) {
            const netOfPeriod = data[i].v;
            data[i].v = runningBalance; // El valor de este punto es el balance actual
            runningBalance -= netOfPeriod; // Retrocedemos el balance restando lo que pasó en este punto
        }
    }

    return data;
}

module.exports = formatChartData;