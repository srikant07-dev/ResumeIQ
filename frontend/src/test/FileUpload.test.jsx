import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from '../components/upload/FileUpload';

describe('FileUpload Component Testing', () => {
  it('renders upload zone with drag and drop prompt and format tags', () => {
    const handleFileSelected = vi.fn();
    render(<FileUpload onFileSelected={handleFileSelected} selectedFile={null} />);

    expect(screen.getByText(/Upload your resume PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF only/i)).toBeInTheDocument();
    expect(screen.getByText(/Max 5 MB/i)).toBeInTheDocument();
  });

  it('renders selected file preview when a file is provided', () => {
    const mockFile = new File(['dummy content'], 'srikant_resume.pdf', { type: 'application/pdf' });
    render(<FileUpload onFileSelected={() => {}} selectedFile={mockFile} />);

    expect(screen.getByText(/srikant_resume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready/i)).toBeInTheDocument();
  });

  it('triggers onClear callback when trash button is clicked', () => {
    const handleClear = vi.fn();
    const mockFile = new File(['dummy content'], 'srikant_resume.pdf', { type: 'application/pdf' });
    render(<FileUpload onFileSelected={() => {}} selectedFile={mockFile} onClear={handleClear} />);

    const removeBtn = screen.getByTitle(/Remove File/i);
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('displays error message banner when error prop is provided', () => {
    render(<FileUpload onFileSelected={() => {}} selectedFile={null} error="File exceeds the 5 MB maximum size limit." />);
    expect(screen.getByText(/File exceeds the 5 MB maximum size limit/i)).toBeInTheDocument();
  });
});
