import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context.jsx";
import { generateInterviewReport, getInterviewReportById, getAllInterviewReports, generateResumePdf } from "../services/interview.api.js";
import { AuthContext } from "../../auth/auth.context.jsx";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }
    const { loading, setLoading, loadingMessage, setLoadingMessage, report, setReport, reports, setReports } = context;

    const auth = useContext(AuthContext);
    const user = auth?.user;

    const fetchReports = async () => {
        if (!user) return;
        setLoadingMessage("Loading your interview plans...");
        setLoading(true);
        try {
            const data = await getAllInterviewReports();
            const reportsList = data.interviewReports || data.reports || (Array.isArray(data) ? data : []);
            setReports(reportsList);
        } catch (error) {
            console.error("Failed to fetch interview reports:", error);
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    useEffect(() => {
        if (user) {
            fetchReports();
        } else {
            setReports([]);
        }
    }, [user]);

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoadingMessage("Loading your interview plan...");
        setLoading(true);
        try {
            const data = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            const newReport = data.interviewReport || data;
            setReports(prev => [newReport, ...prev]);
            return newReport;
        } catch (error) {
            console.error("Failed to generate report:", error);
            throw error;
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    const getReportById = async (interviewId) => {
        setLoadingMessage("Loading your interview plan...");
        setLoading(true);
        try {
            const data = await getInterviewReportById(interviewId);
            const reportData = data.interviewReport || data;
            setReport(reportData);
            return reportData;
        } catch (error) {
            console.error("Failed to fetch report:", error);
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    const getResumePdf = async (interviewReportId) => {
        setLoadingMessage("Generating your ATS-friendly resume...");
        setLoading(true);
        try {
            const blob = await generateResumePdf({ interviewReportId });
            const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `resume-${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download resume PDF:", error);
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    return {
        loading,
        loadingMessage,
        report,
        reports,
        generateReport,
        getReportById,
        getResumePdf,
        fetchReports
    };
};
