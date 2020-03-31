const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title']
    },
    phone: {
        type: String,
        required: [true, 'The telephone number of the restaurant.']
    },
    street: {
      type: String,
      required: [true, 'The street address of the restaurant.']
    },
    postalCode: {
        type: String,
        required: [true, 'The postal code of restaurant.']
    },
    city: {
        type: String,
        required: [true, 'The city of restaurant.']
    },
    state: {
        type: String,
        required: [true, 'The state of restaurant.']
    },
    country: {
        type: String,
        required: [true, 'The country of restaurant.']
    },
    website: {
        type: String,
        optional: true,
    },
    open: {
        type: String,
        required: [true, 'The restaurant open']
    },
    closed: {
        type: String,
        required: [true, 'The restaurant closed']
    },
    logo: {
        type: String,
        default: 'on-photo.jpg'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });



  module.exports = mongoose.model('Course', CourseSchema);