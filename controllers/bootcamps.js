const path = require('path');
const Bootcamp = require('../models/Bootcamps');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc Get all bootcamps
// @route GET /api/vi/bootcamps
// @access Public
exports.getBootcamps = asyncHandler( async (req, res, next) => {
        res.status(200).json(res.advancedResults);
});

// @desc Get single bootcamps
// @route GET /api/vi/bootcamps/:id
// @access Public
 exports.getBootcamp = asyncHandler( async (req, res, next) => {
         const bootcamp = await Bootcamp.findById(req.params.id)
         if (!bootcamp) {
             return next(
               new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
             );
         }
         res.status(200).json({ 
             success: true, 
             data: bootcamp 
         });

     // res.status(200).json({ success: true, msg: `Show Single bootcamp ${req.params.id}` });
 });



// @desc Create new bootcamp
// @route POST /api/vi/bootcamps
// @access Public
exports.createBootcamp = asyncHandler( async (req, res, next) => {
        // Add user to req body
        req.body.user = req.user.id;

        // one time add 
        // const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

        // if(publishedBootcamp && req.user.role !== 'admin') {
        //     return next(
        //         new ErrorResponse(`The user with ID ${req.user.id} has aleady published a bootcamp`, 400)
        //       );  
        // }

        const bootcamp = await Bootcamp.create(req.body);
        
        res.status(201).json({ 
            success: true, 
            data: bootcamp 
        });

});

// @desc Update bootcamp
// @route PUT /api/vi/bootcamps
// @access Public
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
       let bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.params.id} is not authoridze to update this bootcamp`, 401)); 
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

         res.status(200).json({ 
             success: true, 
             data: bootcamp 
         });

});

// @desc Delete bootcamp
// @route DELETE /api/vi/bootcamps
// @access Public
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)
        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.params.id} is not authoridze to update this bootcamp`, 401)); 
        }

        bootcamp.remove();

        res.status(200).json({ 
            success: true, 
            data: {} 
        });
});


// @desc Get bootcamp Radius
// @route GET /api/vi/bootcamps/radius/:zipcode/:distance
// @access Public
exports.getBootcampsInRadius = asyncHandler( async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocode
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
    
    // Calc radius using radians 
    // Divide dist by radius of Earth
    // Earth Radius = 3,963
    const radius = distance / 3963;
    
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [lng, lat ], radius ]}}
    });
    res.status(200).json({ 
        success: true, 
        count: bootcamps.length,
        data: bootcamps 
    });
});



// @desc Delete Upload phbootcamp
// @route DELETE /api/vi/bootcamps/:id/photo
// @access Public
exports.bootcampPhotoUpload = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authoridze to update this bootcamp`, 401)); 
    }

    if(!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 404));
    }

    const file = req.files.file;

    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 404)); 
    }

    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 404)); 
    }


    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    console.log(file.name);

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));  
        }

        await Bootcamp.findById(req.params.id, { photo: file.name });

        res.status(200).json({ 
            success: true, 
            data: file.name 
        });

    })

});