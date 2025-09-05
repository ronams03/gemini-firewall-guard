
import { GoogleGenAI, Type } from "@google/genai";
import type { ThreatAnalysis } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        isThreat: {
            type: Type.BOOLEAN,
            description: 'Is the file a potential threat?',
        },
        threatType: {
            type: Type.STRING,
            description: "Type of threat, e.g., 'Malware', 'Adware', 'Spyware', 'Phishing', 'Keylogger', 'Potentially Unwanted Program', or 'Clean' if not a threat.",
        },
        recommendation: {
            type: Type.STRING,
            description: "A brief recommendation, e.g., 'Quarantine Recommended', 'Delete Immediately', or 'No Action Needed'.",
        },
    },
    required: ['isThreat', 'threatType', 'recommendation'],
};

export interface FileAnalysisInfo {
    name: string;
    content: string;
    type: string;
    size: number;
}

export const analyzeFile = async (fileInfo: FileAnalysisInfo): Promise<ThreatAnalysis> => {
    if (!process.env.API_KEY) {
        // Fallback for when API key is not available
        const isSuspicious = ['exe', 'dll', 'zip', 'js', 'dat', 'vbs'].some(ext => fileInfo.name.toLowerCase().endsWith(ext));
        if (isSuspicious) {
            return {
                isThreat: true,
                threatType: 'Suspicious File Type',
                recommendation: 'Manual review recommended.'
            };
        }
        return {
            isThreat: false,
            threatType: 'Clean',
            recommendation: 'No Action Needed'
        };
    }

    try {
        const prompt = `You are a cybersecurity threat analysis engine. Analyze the following file metadata and content snippet to determine if it represents a security threat.
- Filename: "${fileInfo.name}"
- File Type: "${fileInfo.type}"
- File Size: ${fileInfo.size} bytes
- Content Snippet (first 2000 chars):
\`\`\`
${fileInfo.content.substring(0, 2000)}
\`\`\`
Based on this information, especially suspicious function calls, obfuscated code, or patterns common in malware, determine if the file is a threat. If the content is empty or not applicable (e.g., for a binary file), base your analysis primarily on the filename, type, and common threat vectors associated with them.
Respond ONLY with a JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonString = response.text.trim();
        const analysisResult = JSON.parse(jsonString) as ThreatAnalysis;
        return analysisResult;

    } catch (error) {
        console.error("Error analyzing file with Gemini API:", error);
        return {
            isThreat: false,
            threatType: 'Analysis Failed',
            recommendation: 'Could not determine status. Manual review suggested.',
        };
    }
};
