const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClinicClosure = require('../models/ClinicClosure');
const { toEthiopian, getEthiopianHolidays } = require('../utils/ethiopianCalendar');

dotenv.config();

const holidays = [
    { title: 'Enkutatash (New Year)', month: 1, day: 1, type: 'Holiday' },
    { title: 'Meskel (Finding of True Cross)', month: 1, day: 17, type: 'Ceremony' },
    { title: 'Genna (Ethiopian Christmas)', month: 4, day: 29, type: 'Holiday' },
    { title: 'Timkat (Epiphany)', month: 5, day: 11, type: 'Ceremony' },
    { title: 'Victory at Adwa Day', month: 6, day: 23, type: 'Holiday' },
    { title: 'Ethiopian Good Friday', month: 8, day: 9, type: 'Ceremony' }, // Variable, but fixed for demo
    { title: 'Fasika (Ethiopian Easter)', month: 8, day: 11, type: 'Ceremony' },
    { title: 'International Labor Code', month: 8, day: 23, type: 'Holiday' }
];

const seedHolidays = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        // Clear existing closures for demo
        await ClinicClosure.deleteMany({ type: 'Holiday' });
        await ClinicClosure.deleteMany({ type: 'Ceremony' });

        const currentEthYear = 2018; // Current EC year or relative

        // Here we map these back to approximate Gregorian dates for the seeder
        // In a real system, the admin would pick the Gregorian date from a picker
        // For seeding, we'll just seed a few closures in early 2018 EC (Sept 2025 GC)

        const demoClosures = [
            { title: 'Enkutatash', date: '2025-09-11', type: 'Holiday' },
            { title: 'Meskel', date: '2025-09-27', type: 'Ceremony' },
            { title: 'Genna (Christmas)', date: '2026-01-07', type: 'Holiday' },
            { title: 'Timkat', date: '2026-01-19', type: 'Ceremony' },
            { title: 'Adwa Victory', date: '2026-03-02', type: 'Holiday' }
        ];

        for (const item of demoClosures) {
            const ethInfo = toEthiopian(new Date(item.date));
            await ClinicClosure.create({
                ...item,
                ethDate: {
                    ...ethInfo,
                    display: `${ethInfo.monthName} ${ethInfo.day}, ${ethInfo.year}`
                },
                isFullDay: true,
                note: 'National Holiday'
            });
        }

        console.log('✅ Ethiopian Holidays Seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding holidays:', error);
        process.exit(1);
    }
};

seedHolidays();
