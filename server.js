const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
const cors = require('cors');


// Load env vars
dotenv.config({ path: './config/config.env'});

// Connect to Database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/user');
const reviews = require('./routes/reviews');
const app = express();



// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// File Upload
app.use(fileUpload());

// To remove data, use:
app.use(mongoSanitize());

// Helmet
app.use(helmet());

/* make sure this comes before any routes */
app.use(xss());

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

// HPP  
app.use(hpp());

// CORS
app.use(cors())
//  Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// errorHandler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

app.get('/', function(req, res) {
    res.send('Welcome to Devcamper API')
})

// UnhandledRejection
process.on('unhandledRejection', (err, promise) => {
    console.log(err, ' server.js');
    console.log(`Error: ${err.message}`.red);
    server.close(() => process.exit(1))
});