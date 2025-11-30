
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import { ArrowRight, UploadCloud } from 'lucide-react';

const deckSchema = z.object({
  // Define your schema here based on the expected presentation data
  title: z.string(),
  slides: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })),
});

const DeckToData = ({ onNext }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = async (acceptedFiles) => {
    setIsParsing(true);
    setError(null);

    try {
      const file = acceptedFiles[0];
      // Simulate parsing the presentation
      const parsedData = await new Promise((resolve) =>
        setTimeout(() => resolve({ title: 'My Presentation', slides: [{ title: 'Slide 1', content: '...' }] }), 2000)
      );

      const validationResult = deckSchema.safeParse(parsedData);
      if (validationResult.success) {
        onNext();
      } else {
        setError('Invalid presentation format');
      }
    } catch (err) {
      setError('Failed to parse presentation');
    } finally {
      setIsParsing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Upload your pitch deck</h1>
        <p className="text-lg text-gray-600 mb-8">We'll parse it to auto-generate your data model.</p>
        <div
          {...getRootProps()}
          className={`w-full max-w-md px-4 py-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            isDragActive ? 'border-blue-500 bg-blue-50' : ''
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-500">Drop the files here ...</p>
          ) : (
            <p className="text-lg text-gray-600">Drag & drop a presentation here, or click to select a file</p>
          )}
        </div>
        {isParsing && <p className="mt-4 text-lg text-gray-600">Parsing...</p>}
        {error && <p className="mt-4 text-lg text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default DeckToData;
