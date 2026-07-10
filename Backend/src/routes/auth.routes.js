const { Router }=require('express')
const authController=require('../../src/controllers/auth.controller')
const authRouter=Router()
const authMiddleware=require('../../src/middleware/auth.middleware')

// register api creation
/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post('/register',authController.registerUserController);


//login api creation
/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
authRouter.post('/login',authController.loginUserController);

/**
 * @route POST /api/auth/google
 * @description Login/Register using Google
 * @access Public
 */
authRouter.post("/google", authController.googleLoginController);

//logout api creation
/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */
authRouter.get('/logout',authController.logoutUserController);

//get me api creation ye kya kare ga ki jo user login hai uska data return karega
/**
 * @route GET /api/auth/get-me
 * @description Get the logged in user details
 * @access Private
 */
authRouter.get('/get-me',authMiddleware.authUser,authController.getMeController);

module.exports=authRouter