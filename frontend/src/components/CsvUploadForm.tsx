import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const CsvUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage(''); // Clear messages on new file selection
      setError('');
    } else {
      setFile(null); // Handle case where selection is cancelled
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('csvfile', file);

    try {
      const response = await axios.post('/api/stores/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message || 'File uploaded successfully!');
      setFile(null);
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ''; // Clear the file input visually
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || err.response.data?.error || 'Error uploading file. Check console for details.');
      } else {
        setError('An unexpected error occurred during upload.');
      }
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h4>Upload Store Data</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}> {/* Add some space below input */}
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit" disabled={!file || isLoading} style={{width: '100%'}}>
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>
      {message && <p className="message-success">{message}</p>}
      {error && <p className="message-error">{error}</p>}
    </div>
  );
};

export default CsvUploadForm;
