# RFP Parser (apps/tool)

This application is a lightweight tool for parsing and analyzing Request for Proposal (RFP) documents.

## Features

- **PDF Upload:** Users can upload RFP documents in PDF format.
- **AI-Powered Analysis:** The tool uses a shared AI parser to extract key information from the RFP.
- **Teaser Results:** Only a "teaser" of the analysis is shown (Title, Budget, Match Score).
- **Account Creation CTA:** The full analysis is blurred, and users are prompted to create an account on the main web application to view the complete details.
- **Security:** The file upload endpoint is protected with reCAPTCHA Enterprise to prevent abuse.

## Running the Application

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

This will start the Vite development server, and you can access the application at `http://localhost:5174`.
