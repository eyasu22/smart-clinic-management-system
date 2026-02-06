/**
 * Utility for Gregorian to Ethiopian Date Conversion
 * Based on the JDN (Julian Day Number) algorithm
 */

const ETHIOPIAN_MONTHS = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasse', 'Pagume'
];

/**
 * Converts Gregorian Date to Ethiopian Date
 * @param {Date} date - JS Date object
 * @returns {Object} - { day, month, year, monthName, ethDateStr }
 */
const toEthiopian = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    // Intermediate calculations based on standard algorithm
    let jdn = (1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4 +
        (367 * (month - 2 - 12 * (Math.floor((month - 14) / 12)))) / 12 -
        (3 * (Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100))) / 4 +
        day - 32075;

    let r = (jdn - 1724220) % 1461;
    let n = (r % 365) + 365 * Math.floor(r / 1460);

    let ethYear = 4 * Math.floor((jdn - 1724220) / 1461) + Math.floor(r / 365) - (r === 1460 ? 1 : 0);
    let ethMonth = Math.floor(n / 30) + 1;
    let ethDay = (n % 30) + 1;

    if (ethMonth > 13) {
        ethMonth = 1;
        ethYear++;
    }

    return {
        day: ethDay,
        month: ethMonth,
        year: ethYear,
        monthName: ETHIOPIAN_MONTHS[ethMonth - 1],
        ethDateStr: `${ethDay}/${ethMonth}/${ethYear}`
    };
};

/**
 * Basic list of Ethiopian Public Holidays (Fixed Dates)
 */
const getEthiopianHolidays = (ethYear) => {
    return [
        { name: 'Enkutatash (New Year)', month: 1, day: 1, type: 'Holidays' },
        { name: 'Meskel', month: 1, day: 17, type: 'Ceremony' },
        { name: 'Genna (Christmas)', month: 4, day: 29, type: 'Holidays' },
        { name: 'Timkat (Epiphany)', month: 5, day: 11, type: 'Ceremony' },
        { name: 'Adwa Victory Day', month: 6, day: 23, type: 'Holidays' },
        { name: 'Labor Day', month: 8, day: 23, type: 'Holidays' },
        { name: 'Patriots Victory Day', month: 9, day: 27, type: 'Holidays' },
        { name: 'Downfall of Derg', month: 9, day: 20, type: 'Holidays' }
    ];
};

module.exports = {
    toEthiopian,
    ETHIOPIAN_MONTHS,
    getEthiopianHolidays
};
