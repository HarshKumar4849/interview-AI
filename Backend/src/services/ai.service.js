const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");

function convertToGeminiSchema(jsonSchema) {
    if (!jsonSchema || typeof jsonSchema !== 'object') {
        return jsonSchema;
    }
    const geminiSchema = {};

    if (jsonSchema.type) {
        const typeStr = Array.isArray(jsonSchema.type) ? jsonSchema.type[0] : jsonSchema.type;
        if (typeStr === 'number') {
            geminiSchema.type = 'NUMBER';
        } else if (typeStr === 'integer') {
            geminiSchema.type = 'INTEGER';
        } else if (typeStr === 'string') {
            geminiSchema.type = 'STRING';
        } else if (typeStr === 'boolean') {
            geminiSchema.type = 'BOOLEAN';
        } else if (typeStr === 'object') {
            geminiSchema.type = 'OBJECT';
        } else if (typeStr === 'array') {
            geminiSchema.type = 'ARRAY';
        } else {
            geminiSchema.type = typeStr.toUpperCase();
        }
    }

    if (jsonSchema.description) {
        geminiSchema.description = jsonSchema.description;
    }

    if (jsonSchema.enum) {
        geminiSchema.enum = jsonSchema.enum;
    }

    if (jsonSchema.properties) {
        geminiSchema.properties = {};
        for (const [key, prop] of Object.entries(jsonSchema.properties)) {
            geminiSchema.properties[key] = convertToGeminiSchema(prop);
        }
    }

    if (jsonSchema.required) {
        geminiSchema.required = jsonSchema.required;
    }

    if (jsonSchema.items) {
        geminiSchema.items = convertToGeminiSchema(jsonSchema.items);
    }

    return geminiSchema;
}

console.log("API key starts with:", process.env.GOOGLE_GENAI_API_KEY?.substring(0, 8));
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    title: z.string().describe("The job title."),

    matchScore: z.number().describe("The match score between 0 and 100."),

    overallFeedback: z.string().describe("Overall evaluation of the candidate."),

    strengths: z.array(
        z.string()
    ).describe("Candidate strengths."),

    weaknesses: z.array(
        z.string()
    ).describe("Candidate weaknesses."),

    technicalQuestions: z.array(
        z.object({
            question: z.string().describe("Technical interview question."),
            answer: z.string().describe("Detailed answer."),
            intention: z.string().describe("Why interviewer asks this question.")
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe("Behavioral interview question."),
            answer: z.string().describe("STAR based answer."),
            intention: z.string().describe("Why interviewer asks this question.")
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ),

    recommendedResources: z.array(
        z.string()
    ),

    finalAdvice: z.string()
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
You are an experienced Senior Software Engineer, Technical Interviewer, Hiring Manager, and Career Coach.

Your task is to analyze the candidate's Resume, Self Description, and Job Description, then generate a professional interview report.

===========================================================
RESUME
===========================================================

${resume}

===========================================================
SELF DESCRIPTION
===========================================================

${selfDescription}

===========================================================
JOB DESCRIPTION
===========================================================

${jobDescription}

===========================================================
INSTRUCTIONS
===========================================================

Carefully compare the resume with the job description.

Evaluate:

- Technical Skills
- Programming Languages
- Frameworks
- Projects
- Internship Experience
- Problem Solving Ability
- Communication Skills
- Overall Job Fit

Return ONLY valid JSON.

Do NOT return Markdown.

Do NOT return explanations.

Do NOT return any extra fields.

Do NOT rename any field.

Follow the JSON structure EXACTLY.

===========================================================
JSON STRUCTURE
===========================================================

Return exactly these fields.

1.

"title"

Example

"title":"Software Engineer Intern"

-----------------------------------------------------------

2.

"matchScore"

A number between 0 and 100.

Example

"matchScore":89

-----------------------------------------------------------

3.

"overallFeedback"

One detailed paragraph explaining why the candidate is or isn't a good fit.

-----------------------------------------------------------

4.

"strengths"

An array of strings.

Example

"strengths":[
"Strong Java knowledge",
"Excellent React skills",
"Good communication"
]

Generate at least 6 strengths.

-----------------------------------------------------------

5.

"weaknesses"

An array of strings.

Generate at least 4 weaknesses.

-----------------------------------------------------------

6.

"technicalQuestions"

This MUST be an array of EXACTLY 10 OBJECTS.

Every object MUST look like this.

{
    "question":"...",
    "answer":"...",
    "intention":"..."
}

Example

"technicalQuestions":[
{
"question":"Explain Java HashMap.",
"answer":"HashMap stores key-value pairs...",
"intention":"To check Java Collection knowledge."
}
]

DO NOT return strings.

DO NOT return null.

Return OBJECTS ONLY.

-----------------------------------------------------------

7.

"behavioralQuestions"

Generate EXACTLY 5 OBJECTS.

Every object MUST look like

{
"question":"...",
"answer":"...",
"intention":"..."
}

The answer should follow the STAR method.

-----------------------------------------------------------

8.

"skillGaps"

Generate an array of OBJECTS.

Every object MUST look like

{
"skill":"Docker",
"severity":"medium"
}

Severity MUST be one of

low

medium

high

-----------------------------------------------------------

9.

"preparationPlan"

Generate EXACTLY 7 OBJECTS.

Each object MUST be

{
"day":1,
"focus":"React",
"tasks":[
"...",
"...",
"...",
"..."
]
}

Every day must contain at least FOUR tasks.

-----------------------------------------------------------

10.

"recommendedResources"

Return an array of strings.

Recommend

Books

Courses

YouTube Channels

Official Documentation

Websites

-----------------------------------------------------------

11.

"finalAdvice"

One detailed paragraph.

===========================================================
VERY IMPORTANT
===========================================================

Use ONLY these JSON keys.

title

matchScore

overallFeedback

strengths

weaknesses

technicalQuestions

behavioralQuestions

skillGaps

preparationPlan

recommendedResources

finalAdvice

DO NOT USE

jobTitle

candidateStrengths

candidateWeaknesses

technicalInterviewQuestions

behavioralInterviewQuestions

recommendations

finalInterviewAdvice

Those names are INVALID.

Return ONLY valid JSON.

No markdown.

No code blocks.

No explanations.

Every array MUST contain complete objects.

Never return null.

Never return empty arrays.
`;

    const nativeJsonSchema = interviewReportSchema.toJSONSchema();
    const geminiSchema = convertToGeminiSchema(nativeJsonSchema);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiSchema
        }
    });

    console.log(response.text);
    return JSON.parse(response.text);
}

const atsResumeSchema = z.object({
    name: z.string().describe("Candidate's full name"),
    email: z.string().describe("Candidate's email address"),
    phone: z.string().describe("Candidate's phone number"),
    location: z.string().describe("Candidate's city and state/country"),
    links: z.array(z.string()).describe("List of links, e.g. LinkedIn, GitHub, Portfolio"),
    summary: z.string().describe("A professional summary tailored to the target job description, highlighting matching experience and key skills."),
    skills: z.array(z.string()).describe("A list of key technical and professional skills matching the target job description."),
    experience: z.array(
        z.object({
            company: z.string(),
            role: z.string(),
            duration: z.string().describe("E.g., June 2023 - Present"),
            responsibilities: z.array(z.string()).describe("High-impact bullet points describing responsibilities and achievements, starting with strong action verbs and including relevant keywords from the job description.")
        })
    ),
    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            duration: z.string().describe("E.g., 2022 - 2026"),
            gpa: z.string().optional()
        })
    ),
    projects: z.array(
        z.object({
            name: z.string(),
            technologies: z.array(z.string()),
            description: z.string().describe("1-2 sentences explaining what was built, technologies used, and the impact.")
        })
    )
});

async function generateAtsResumeData({ resume, selfDescription, jobDescription }) {
    const prompt = `
You are an expert ATS Resume Writer, Recruiter, and Career Coach.

Your task is to take the candidate's Resume text, Self Description, and Target Job Description, and rewrite/optimize the resume to be highly ATS-friendly and tailored specifically to the job description.

===========================================================
ORIGINAL RESUME TEXT
===========================================================
${resume}

===========================================================
SELF DESCRIPTION
===========================================================
${selfDescription}

===========================================================
TARGET JOB DESCRIPTION
===========================================================
${jobDescription}

===========================================================
INSTRUCTIONS
===========================================================
CRITICAL REQUIREMENT: The generated resume MUST be custom-tailored dedicatedly and exclusively to match the TARGET JOB DESCRIPTION. Every section (especially the Summary, Skills list, and Experience bullet points) should highlight matching technical skills, methodologies, keywords, and responsibilities that directly map to the requirements of the targeted description. Do not make a general resume.

1. Extract candidate's contact info (Name, Email, Phone, Location). If missing, make reasonable inferences or use placeholders based on standard templates.
2. Draft a powerful, 3-4 sentence Professional Summary highlighting the candidate's alignment with the targeted job description.
3. List 10-15 key skills matching the job description requirements.
4. Rewrite the Professional Experience bullet points to start with action verbs and include metrics/impact and target keywords from the job description. DO NOT invent fake companies or fake roles, only restructure and optimize the wording of what is provided.
5. Format the Education and Projects sections cleanly.
6. Return ONLY valid JSON matching the schema. Do NOT return Markdown blocks.
`;

    const nativeJsonSchema = atsResumeSchema.toJSONSchema();
    const geminiSchema = convertToGeminiSchema(nativeJsonSchema);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiSchema
        }
    });

    console.log("Generated ATS Resume JSON:", response.text);
    return JSON.parse(response.text);
}

module.exports = {
    generateInterviewReport,
    generateAtsResumeData
};
