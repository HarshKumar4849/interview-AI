const PDFDocument = require('pdfkit');

function buildResumePdf(resumeData, outputStream) {
    const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
            top: 54, // 0.75 in
            bottom: 54,
            left: 54,
            right: 54
        }
    });

    doc.pipe(outputStream);

    // Styling constants
    const primaryColor = '#1A365D'; // Dark Blue for Name and Section Headers
    const textColor = '#2D3748'; // Charcoal for body text
    const lightTextColor = '#718096'; // Muted grey for subheaders/dates
    const fontRegular = 'Helvetica';
    const fontBold = 'Helvetica-Bold';

    // ── Header Section ───────────────────────────────────────────────────────
    doc.fillColor(primaryColor)
       .font(fontBold)
       .fontSize(22)
       .text(resumeData.name || 'Anonymous Candidate', { align: 'center' });

    doc.moveDown(0.2);

    // Contact info line
    doc.font(fontRegular)
       .fontSize(9)
       .fillColor(textColor);

    const contactParts = [];
    if (resumeData.email) contactParts.push(resumeData.email);
    if (resumeData.phone) contactParts.push(resumeData.phone);
    if (resumeData.location) contactParts.push(resumeData.location);
    
    // Add links if available
    if (resumeData.links && Array.isArray(resumeData.links)) {
        resumeData.links.forEach(link => {
            const cleanLink = link.replace(/https?:\/\/(www\.)?/, '');
            contactParts.push(cleanLink);
        });
    }

    doc.text(contactParts.join('  |  '), { align: 'center' });
    doc.moveDown(0.8);

    // Helper to draw section header
    function addSectionHeader(title) {
        doc.fillColor(primaryColor)
           .font(fontBold)
           .fontSize(11)
           .text(title.toUpperCase());
        
        // Underline section title for clean look
        const currentY = doc.y;
        doc.moveTo(54, currentY + 2)
           .lineTo(558, currentY + 2)
           .strokeColor(primaryColor)
           .lineWidth(0.75)
           .stroke();
        
        doc.moveDown(0.5);
    }

    // ── Professional Summary ───────────────────────────────────────────────
    if (resumeData.summary) {
        addSectionHeader('Professional Summary');
        doc.font(fontRegular)
           .fontSize(9.5)
           .fillColor(textColor)
           .text(resumeData.summary, { align: 'justify', lineGap: 2 });
        doc.moveDown(0.8);
    }

    // ── Skills ───────────────────────────────────────────────────────────────
    if (resumeData.skills && resumeData.skills.length > 0) {
        addSectionHeader('Skills & Expertise');
        doc.font(fontRegular)
           .fontSize(9.5)
           .fillColor(textColor)
           .text(resumeData.skills.join(', '), { lineGap: 2 });
        doc.moveDown(0.8);
    }

    // ── Experience ───────────────────────────────────────────────────────────
    if (resumeData.experience && resumeData.experience.length > 0) {
        addSectionHeader('Professional Experience');
        resumeData.experience.forEach(exp => {
            // Role & Company line
            doc.font(fontBold)
               .fontSize(10)
               .fillColor(textColor)
               .text(exp.role, { continued: true })
               .font(fontRegular)
               .text(` at ${exp.company}`, { continued: false });

            // Duration on the right
            const durationY = doc.y - doc.currentLineHeight();
            doc.font(fontRegular)
               .fontSize(9)
               .fillColor(lightTextColor)
               .text(exp.duration, { align: 'right' });
            
            doc.moveDown(0.2);

            // Bullet points
            if (exp.responsibilities && exp.responsibilities.length > 0) {
                exp.responsibilities.forEach(bullet => {
                    doc.font(fontRegular)
                       .fontSize(9)
                       .fillColor(textColor)
                       // Indented bullet
                       .text(`\u2022   ${bullet}`, 64, doc.y, { width: 494, lineGap: 2 });
                    doc.y += 2; // small space between bullets
                });
            }
            // Reset left margin for next items
            doc.x = 54;
            doc.moveDown(0.6);
        });
    }

    // ── Projects ─────────────────────────────────────────────────────────────
    if (resumeData.projects && resumeData.projects.length > 0) {
        addSectionHeader('Key Projects');
        resumeData.projects.forEach(proj => {
            // Project Name & Tech Stack
            doc.font(fontBold)
               .fontSize(10)
               .fillColor(textColor)
               .text(proj.name, { continued: true });
            
            if (proj.technologies && proj.technologies.length > 0) {
                doc.font(fontRegular)
                   .fontSize(9)
                   .fillColor(lightTextColor)
                   .text(`  [${proj.technologies.join(', ')}]`, { continued: false });
            } else {
                doc.text('', { continued: false });
            }

            doc.moveDown(0.2);

            // Description
            doc.font(fontRegular)
               .fontSize(9)
               .fillColor(textColor)
               .text(proj.description, 64, doc.y, { width: 494, lineGap: 2 });
            
            doc.x = 54;
            doc.moveDown(0.6);
        });
    }

    // ── Education ────────────────────────────────────────────────────────────
    if (resumeData.education && resumeData.education.length > 0) {
        addSectionHeader('Education');
        resumeData.education.forEach(edu => {
            doc.font(fontBold)
               .fontSize(10)
               .fillColor(textColor)
               .text(edu.degree, { continued: true })
               .font(fontRegular)
               .text(` | ${edu.institution}`);
            
            const eduY = doc.y - doc.currentLineHeight();
            doc.font(fontRegular)
               .fontSize(9)
               .fillColor(lightTextColor)
               .text(edu.duration, { align: 'right' });

            if (edu.gpa) {
                doc.moveDown(0.1);
                doc.font(fontRegular)
                   .fontSize(9)
                   .fillColor(textColor)
                   .text(`GPA: ${edu.gpa}`);
            }

            doc.x = 54;
            doc.moveDown(0.5);
        });
    }

    doc.end();
}

module.exports = {
    buildResumePdf
};
