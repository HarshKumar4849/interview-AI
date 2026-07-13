const pdfParse = require('pdf-parse');
const { generateInterviewReport, generateAtsResumeData } = require('../services/ai.service');
const { buildResumePdf } = require('../services/pdf.service');
const interviewReportModel = require('../models/interviewReport.model');

async function generateInterviewReportController(req, res) {
    try {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        const { selfDescription, jobDescription } = req.body;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            title: interviewReportByAi.title || "Interview Report",
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            initialMatchScore: interviewReportByAi.matchScore,
            ...interviewReportByAi   
        });
        res.status(200).json({ interviewReport });
    } catch (error) {
    console.error("========== FULL ERROR ==========");
    console.error(error);

    res.status(500).json({
        message: error.message,
        stack: error.stack
    });
}
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const report = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });
        if (!report) {
            return res.status(404).json({ message: "Interview report not found" });
        }
        res.status(200).json({ interviewReport: report });
    } catch (error) {
        console.error("Error in getInterviewReportByIdController:", error);
        res.status(500).json({ message: "Failed to get interview report" });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const reports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ interviewReports: reports });
    } catch (error) {
        console.error("Error in getAllInterviewReportsController:", error);
        res.status(500).json({ message: "Failed to get interview reports" });
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id });
        if (!report) {
            return res.status(404).json({ message: "Interview report not found" });
        }

        // Call Gemini to generate the ATS-optimized resume details based on original resume, self description and target job description
        const resumeData = await generateAtsResumeData({
            resume: report.resume,
            selfDescription: report.selfDescription,
            jobDescription: report.jobDescription
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resume-${interviewReportId}.pdf`);

        // Build PDF from resumeData and pipe to res
        buildResumePdf(resumeData, res);
    } catch (error) {
        console.error("Error in generateResumePdfController:", error);
        res.status(500).json({ message: "Failed to generate resume PDF" });
    }
}

async function toggleTaskController(req, res) {
    try {
        const { interviewId } = req.params;
        const { taskId } = req.body;

        const report = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });
        if (!report) {
            return res.status(404).json({ message: "Interview report not found" });
        }

        if (report.initialMatchScore === undefined || report.initialMatchScore === null) {
            report.initialMatchScore = report.matchScore || 0;
        }

        if (!report.completedTasks) {
            report.completedTasks = [];
        }

        const taskIndex = report.completedTasks.indexOf(taskId);
        if (taskIndex > -1) {
            report.completedTasks.splice(taskIndex, 1);
        } else {
            report.completedTasks.push(taskId);
        }

        let totalTasks = 0;
        if (report.preparationPlan) {
            report.preparationPlan.forEach(day => {
                if (day.tasks) {
                    totalTasks += day.tasks.length;
                }
            });
        }

        const completedCount = report.completedTasks.length;

        if (totalTasks > 0) {
            const initial = report.initialMatchScore;
            report.matchScore = Math.min(100, Math.round(initial + (completedCount / totalTasks) * (100 - initial)));
        }

        await report.save();
        res.status(200).json({ interviewReport: report });
    } catch (error) {
        console.error("Error in toggleTaskController:", error);
        res.status(500).json({ message: "Failed to toggle task" });
    }
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    toggleTaskController
};
