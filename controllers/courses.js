const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamps');

// @desc Get all courses
// @route GET /api/vi/courses
// @route GET /api/vi/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler( async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });
    
        return res.status(200).json({
          success: true,
          count: courses.length,
          data: courses
        });
      } else {
        res.status(200).json(res.advancedResults);
      }
});

// @desc Get single course
// @route GET /api/vi/course/:id
// @access Public
 exports.getCourse = asyncHandler( async (req, res, next) => {
         const course = await Course.findById(req.params.id).populate({
             path: 'bootcamp',
             select: 'name decription'
         })
         if (!course) {
             return next(
               new ErrorResponse(`course not found with id of ${req.params.id}`, 404)
             );
         }
         res.status(200).json({ 
             success: true, 
             data: course 
         });

     // res.status(200).json({ success: true, msg: `Show Single bootcamp ${req.params.id}` });
 });



// @desc Add course
// @route POST /api/vi/bootcamps/:bootcampId/course
// @access Private
exports.addCourse = asyncHandler( async (req, res, next) => {
        req.body.bootcamp = req.params.bootcampId;
        req.body.user = req.user.id;

        const bootcamp = await Bootcamp.findById(req.params.bootcampId)
        
        if(!bootcamp) {
            return next(new ErrorResponse(`No Bootcamp with the id of ${req.params.bootcampId}`, 404));
        }

        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authoridze to update this course`, 401)); 
        }

        const course = await Course.create(req.body);

        res.status(201).json({ 
            success: true, 
            data: course 
        });

});


// @desc Update bootcamp
// @route PUT /api/vi/bootcamps
// @access Public
exports.updateCourse = asyncHandler( async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authoridze to update course ${course._id}`, 401)); 
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

     res.status(200).json({ 
         success: true, 
         data: course 
     });

});



// @desc Delete Course
// @route DELETE /api/vi/course
// @access Public
exports.deleteCourse = asyncHandler( async (req, res, next) => {
        const course = await Course.findById(req.params.id);
        if(!course) {
            return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
        }

        if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authoridze to delete course ${course._id}`, 401)); 
        }

        course.remove();

         res.status(200).json({ 
             success: true, 
             data: {} 
         });
});