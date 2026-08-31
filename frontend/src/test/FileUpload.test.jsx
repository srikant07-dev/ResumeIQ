import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileUpload from '../components/upload/FileUpload';

describe('FileUpload Component Testing', () => {
  it('renders upload zone with drag and drop prompt', () => {
    const handleFileSelected = vi.fn();
    render(<FileUpload onFileSelected={handleFileSelected} selectedFile={null} />);

    expect(screen.getByText(/Upload your resume PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/FORMAT: PDF ONLY/i)).toBeInTheDocument();
    expect(screen.getByText(/MAX SIZE: 5 MB/i)).toBeInTheDocument();
  });

  it('renders selected file preview when a file is provided', () => {
    const mockFile = new File(['dummy content'], 'jane_doe_resume.pdf', { type: 'application/pdf' });
    render(<FileUpload onFileSelected={() => {}} selectedFile={mockFile} />);

    expect(screen.getByText(/jane_doe_resume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/READY/i)).toBeInTheDocument();
  });
});
