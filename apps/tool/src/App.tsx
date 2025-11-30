import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import './index.css';

// Mock data for the teaser
const mockAnalysis = {
    title: "Project: Cloud-Native RFP",
    budget: "$2,500,000 USD",
    matchScore: 92,
    summary: "This project requires a comprehensive cloud migration strategy and a full-stack development team to build a new SaaS platform...",
    sections: [
        { title: "Executive Summary", content: "A high-level overview of the project goals, scope, and expected outcomes." },
        { title: "Technical Requirements", content: "Detailed specifications for the required technology stack, including infrastructure, security, and scalability." },
        { title: "Vendor Qualifications", content: "The criteria by which potential vendors will be evaluated, including experience and certifications." },
    ]
};

function App() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = useCallback(async () => {
        if (!selectedFile || !executeRecaptcha) return;

        setIsLoading(true);
        setAnalysis(null);

        const token = await executeRecaptcha('upload');

        const formData = new FormData();
        formData.append('pdf', selectedFile);
        formData.append('recaptchaToken', token);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            setAnalysis(mockAnalysis);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [executeRecaptcha, selectedFile]);

    return (
        <div className="container">
            <header>
                <h1>Unlock RFP Insights</h1>
                <p>Our AI-powered tool instantly analyzes your RFP documents to reveal key requirements and opportunities.</p>
            </header>

            <div className="upload-section">
                <input type="file" accept=".pdf" onChange={handleFileChange} />
                <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
                    {isLoading ? 'Analyzing Document...' : 'Analyze RFP'}
                </button>
            </div>

            {analysis && (
                <div className="results-section">
                    <div className="teaser">
                        <h3>{analysis.title}</h3>
                        <p><strong>Budget:</strong> {analysis.budget}</p>
                        <p><strong>Match Score:</strong> {analysis.matchScore}%</p>
                        <p>{analysis.summary}</p>
                    </div>
                    <div className="details-blur">
                        {analysis.sections.map((section, index) => (
                            <div key={index}>
                                <h4>{section.title}</h4>
                                <p>{section.content}</p>
                            </div>
                        ))}
                    </div>
                    <div className="cta-overlay">
                        <h3>See the Full Picture</h3>
                        <p>Your free account unlocks a detailed analysis, including deadlines, stakeholder contacts, and a complete technical requirements breakdown.</p>
                        <a href="https://<YOUR_WEB_APP_URL>/signup" className="signup-button">Unlock Full Analysis</a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
