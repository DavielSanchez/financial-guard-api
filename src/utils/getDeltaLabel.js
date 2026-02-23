function getDeltaLabel(period) {
    const labels = { Day: 'vs yesterday', Week: 'vs last week', Month: 'vs last month', Year: 'vs last year' };
    return labels[period] || labels.Month;
}

module.exports = getDeltaLabel;