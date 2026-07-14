const pdfParse = require('pdf-parse');
const path = require('path');
const mammoth = require('mammoth');
const { generateInterviewReport, generateAtsResumeData } = require('../services/ai.service');
const { buildResumePdf } = require('../services/pdf.service');
const interviewReportModel = require('../models/interviewReport.model');

async function extractTextFromFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (ext === '.pdf' || mime === 'application/pdf') {
        const parsed = await (new pdfParse.PDFParse(new Uint8Array(file.buffer))).getText();
        return parsed.text || "";
    }

    if (ext === '.docx' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return result.value || "";
    }

    if (ext === '.txt' || mime.startsWith('text/')) {
        return file.buffer.toString('utf-8');
    }

    // Fallback for doc and other binary formats: extract printable text characters
    const rawText = file.buffer.toString('utf-8');
    const cleanText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanText.length > 50) {
        return cleanText;
    }

    throw new Error(`Unsupported or unreadable file format (${ext || mime})`);
}

async function generateInterviewReportController(req, res) {
    try {
        let resumeText = "";
        if (req.file) {
            try {
                resumeText = await extractTextFromFile(req.file);
            } catch (err) {
                console.error("Resume extraction failed:", err);
                return res.status(400).json({ message: `Failed to parse the uploaded resume: ${err.message}. Please upload a PDF, DOCX, DOC, or TXT file.` });
            }
        }
        const { selfDescription, jobDescription } = req.body;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            title: interviewReportByAi.title || "Interview Report",
            resume: resumeText,
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
