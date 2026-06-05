import mongoose from "mongoose";

const jobMatchSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        resumeText: {
            type: String,
            required: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        result: {
            score: Number,
            missing_keywords: [String],
            matched_keywords: [String],
            strengths: [String],
            weaknesses: [String],
            suggestions: [String],
            verdict_summary: String,
        }

    },
    { timestamps: true }
);

const JobMatchSchema = mongoose.model("JobMatch", jobMatchSchema);
export default JobMatchSchema;
