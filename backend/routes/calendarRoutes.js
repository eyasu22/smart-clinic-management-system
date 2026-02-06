const express = require('express');
const router = express.Router();
const { getClosures, addClosure, deleteClosure, getSuggestions } = require('../controllers/calendarController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/suggestions', protect, getSuggestions);

router.route('/closures')
    .get(protect, getClosures)
    .post(protect, admin, addClosure);

router.route('/closures/:id')
    .delete(protect, admin, deleteClosure);

module.exports = router;
