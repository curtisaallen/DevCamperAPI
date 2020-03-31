const express = require('express');
const { 
    registerUser,
    login,
    logout,
    getUserInfo,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateDetails
} = require('../controllers/auth')

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login',login);
router.post('/logout',logout);
router.get('/me', protect, getUserInfo);
router.put('/updatedetails', protect, updateDetails);
router.get('/forgotpassword', forgotPassword);
router.put('/updatepassword', protect, updatePassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;