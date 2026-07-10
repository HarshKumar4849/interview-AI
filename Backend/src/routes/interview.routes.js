const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require('../middleware/file.middleware');

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @desc Generate an interview report based on the provided resume, self-description, and job description.
 * @access private
 */
interviewRouter.post('/', authMiddleware.authUser, upload.single('resume'), interviewController.generateInterviewReportController);

/**
 * @route GET /api/interview/
 * @desc Get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get('/', authMiddleware.authUser, interviewController.getAllInterviewReportsController);

/**
 * @route GET /api/interview/report/:interviewId
 * @desc Get interview report by interviewId.
 * @access private
 */
interviewRouter.get('/report/:interviewId', authMiddleware.authUser, interviewController.getInterviewReportByIdController);

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @desc Generate resume pdf by interviewReportId.
 * @access private
 */
interviewRouter.post('/resume/pdf/:interviewReportId', authMiddleware.authUser, interviewController.generateResumePdfController);

module.exports = interviewRouter;