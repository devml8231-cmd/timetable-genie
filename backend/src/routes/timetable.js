const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  generateTimetable,
  getTimetable,
  getFacultyTimetable,
  deleteTimetable
} = require('../controllers/timetableController');

const router = express.Router();

// Validation rules
const generateValidation = [
  body('department').notEmpty().withMessage('Department is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
];

// Routes
router.post('/generate', authenticate, authorize('admin'), generateValidation, validate, generateTimetable);
router.get('/:department/:semester', authenticate, getTimetable);
router.get('/faculty/:id', authenticate, getFacultyTimetable);
router.delete('/:department/:semester', authenticate, authorize('admin'), deleteTimetable);

module.exports = router;
