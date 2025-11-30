
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './index.css'; // Assuming you have some basic styling

function App() {
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'application/pdf') {
            setFileName(file.name);
            // Mock logic for reading file text
            const mockExtractedBounties = `
              Bounty: Create a new logo - $500
              Bounty: Develop a landing page - $1,500
              Bounty: Set up a CI/CD pipeline - $2,000
            `;
            setExtractedText(mockExtractedBounties);
        } else {
            alert("Please drop a PDF file.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: {
            'application/pdf': ['.pdf'],
        }
    });

    const handlePostToBountyBoard = () => {
        // Redirect to onboarding with URL params
        const coreAppUrl = 'https://<YOUR_WEB_APP_URL>/onboarding';
        const params = new URLSearchParams({
            source: 'rfp-parser',
            fileName: fileName || '',
            extractedBounties: extractedText || '',
        });
        window.location.href = `${coreAppUrl}?${params.toString()}`;
    };

    return (
        <div className="container">
            <div className="card">
                <h1>RFP Bounty Extractor</h1>
                <p>Drop an RFP PDF here to extract potential bounties.</p>
                
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    {isDragActive ?
                        <p>Drop the file here ...</p> :
                        <p>Drag 'n' drop a PDF here, or click to select a file</p>
                    }
                </div>

                {extractedText && (
                    <div className="preview">
                        <h3>Extracted Bounties (Preview)</h3>
                        <pre>{extractedText}</pre>
                        <button onClick={handlePostToBountyBoard} className="cta-button">
                            Post to Bounty Board
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
