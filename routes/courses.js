const express = require('express');
const { 
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses')

const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

const advancedResults = require('../middleware/advancedResults');

router.route('/').get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name decription'
}), getCourses).post(protect, authorize('publisher', 'admin'), addCourse);

router.route('/:id').get( getCourse).put(protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse);


module.exports = router;