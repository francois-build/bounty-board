import React, { useState } from 'react';
import Papa from 'papaparse';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const importLeads = httpsCallable(functions, 'importLeads');

const BulkLeadImporter = () => {
    const [feedback, setFeedback] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFeedback('Parsing CSV...');
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    setFeedback(`CSV parsed. Found ${results.data.length} records. Importing...`);
                    try {
                        const result = await importLeads({ leads: results.data });
                        setFeedback(result.data.message);
                    } catch (error) {
                        console.error(error);
                        setFeedback(`Error: ${error.message}`);
                    }
                },
                error: (error) => {
                    setFeedback(`CSV parsing error: ${error.message}`);
                }
            });
        }
    };

    return (
        <div>
            <h2>Bulk Lead Importer (Shadow Directory)</h2>
            <p>Upload a CSV file with 'companyName', 'contactEmail', and other relevant lead data.</p>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            {feedback && <p>{feedback}</p>}
        </div>
    );
};

export default BulkLeadImporter;
