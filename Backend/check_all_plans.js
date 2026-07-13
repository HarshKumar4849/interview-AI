require("dotenv").config();
const mongoose = require("mongoose");
const connectToDB = require("./src/config/database");
const interviewReportModel = require("./src/models/interviewReport.model");

async function checkAll() {
    await connectToDB();
    try {
        const reports = await interviewReportModel.find().sort({ createdAt: -1 });
        console.log(`Found ${reports.length} reports in the database:`);
        reports.forEach((rep, idx) => {
            console.log(`\nReport #${idx + 1}:`);
            console.log("ID:", rep._id);
            console.log("Title:", rep.title);
            console.log("Days:", rep.preparationPlan.map(d => `Day ${d.day}: ${d.focus}`));
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

checkAll();
