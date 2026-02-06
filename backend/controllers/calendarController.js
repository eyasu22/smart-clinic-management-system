const ClinicClosure = require('../models/ClinicClosure');
const { toEthiopian } = require('../utils/ethiopianCalendar');
const { createAuditLog } = require('../middleware/authMiddleware');

/**
 * @desc    Get all clinic closures and holidays
 * @route   GET /api/calendar/closures
 * @access  Private
 */
const getClosures = async (req, res) => {
    try {
        const closures = await ClinicClosure.find({}).sort({ date: 1 });
        res.json(closures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Add a clinic closure (Holiday/Ceremony/Emergency)
 * @route   POST /api/calendar/closures
 * @access  Private/Admin
 */
const addClosure = async (req, res) => {
    const { title, date, type, isFullDay, startTime, endTime, note } = req.body;

    try {
        const existing = await ClinicClosure.findOne({ date });
        if (existing) {
            return res.status(400).json({ message: 'A closure already exists for this date.' });
        }

        const ethInfo = toEthiopian(new Date(date));
        const ethDate = {
            ...ethInfo,
            display: `${ethInfo.monthName} ${ethInfo.day}, ${ethInfo.year}`
        };

        const closure = await ClinicClosure.create({
            title,
            date,
            ethDate,
            type,
            isFullDay,
            startTime,
            endTime,
            note,
            createdBy: req.user._id
        });

        await createAuditLog(req.user._id, 'CREATE', 'ClinicClosure', closure._id, { title, date, ethDate: ethDate.display }, req);

        res.status(201).json(closure);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete a clinic closure
 * @route   DELETE /api/calendar/closures/:id
 * @access  Private/Admin
 */
const deleteClosure = async (req, res) => {
    try {
        const closure = await ClinicClosure.findById(req.params.id);
        if (!closure) {
            return res.status(404).json({ message: 'Closure not found' });
        }

        await closure.remove();
        await createAuditLog(req.user._id, 'DELETE', 'ClinicClosure', req.params.id, { title: closure.title, date: closure.date }, req);

        res.json({ message: 'Closure removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get ceremony-aware scheduling suggestions
 * @route   GET /api/calendar/suggestions
 * @access  Private
 */
const getSuggestions = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = new Date(date || new Date());
        const ethInfo = toEthiopian(targetDate);

        // Find if any major ceremony happened in the last 3 days
        const threeDaysAgo = new Date(targetDate);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const recentCeremony = await ClinicClosure.findOne({
            date: { $gte: threeDaysAgo.toISOString().split('T')[0], $lte: targetDate.toISOString().split('T')[0] },
            type: 'Ceremony'
        });

        let suggestion = "Standard scheduling load expected.";
        let alert = false;

        if (recentCeremony) {
            suggestion = `Post-ceremony surge expected. Recommendation: Extend shift buffers for Dr. ${recentCeremony.title} recovery period.`;
            alert = true;
        }

        res.json({
            date,
            ethDate: ethInfo.display,
            suggestion,
            alert,
            ceremony: recentCeremony ? recentCeremony.title : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getClosures,
    addClosure,
    deleteClosure,
    getSuggestions
};
