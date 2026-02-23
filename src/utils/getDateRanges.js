const moment = require('moment');

function getDateRanges(period) {
    const m = moment();
    let unit = period.toLowerCase() === 'day' ? 'day' :
        period.toLowerCase() === 'week' ? 'week' :
        period.toLowerCase() === 'year' ? 'year' : 'month';

    return {
        start: m.startOf(unit).toISOString(),
        end: m.endOf(unit).toISOString(),
        prevStart: m.subtract(1, unit + 's').startOf(unit).toISOString(),
        prevEnd: m.subtract(1, unit + 's').endOf(unit).toISOString()
    };
}

module.exports = getDateRanges;