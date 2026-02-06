/**
 * Frontend Ethiopian Date Utilities
 */

export const ETHIOPIAN_MONTHS = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasse', 'Pagume'
];

/**
 * Converts JS Date to Ethiopian Date Object
 */
export const toEthiopian = (date) => {
    if (!date) return null;
    const d = new Date(date);

    // Algorithm for conversion
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();

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
        display: `${ETHIOPIAN_MONTHS[ethMonth - 1]} ${ethDay}, ${ethYear}`
    };
};

/**
 * Checks if a Gregorian date is today in Ethiopian calendar
 */
export const isTodayEth = (day, month, year) => {
    const today = toEthiopian(new Date());
    return today.day === day && today.month === month && today.year === year;
};

/**
 * Get days in a specific Ethiopian month
 */
export const getDaysInEthMonth = (month, year) => {
    if (month < 13) return 30;
    // Pagume: 5 days normally, 6 in leap year
    // Ethiopian leap year occurs when ethYear % 4 === 3
    return (year % 4 === 3) ? 6 : 5;
};
