"""
Tests for the Gemini multimodal OCR fallback in pdf_parser.py.
Verifies that scanned/empty PDFs trigger the fallback path,
and that normal PDFs use the fast PyPDF2 path.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.pdf_parser import extract_text_from_pdf, _OCR_FALLBACK_THRESHOLD


@pytest.mark.asyncio
async def test_pypdf2_extraction_for_normal_pdf():
    """Normal PDF with sufficient text should use PyPDF2 path and return 'pypdf2' method."""
    # Create a mock PDF that returns enough text
    fake_text = "A" * (_OCR_FALLBACK_THRESHOLD + 10)
    
    mock_page = MagicMock()
    mock_page.extract_text.return_value = fake_text
    
    mock_reader = MagicMock()
    mock_reader.pages = [mock_page]
    
    with patch("app.services.pdf_parser.PdfReader", return_value=mock_reader):
        text, is_extractable, method = await extract_text_from_pdf(b"fake-pdf-bytes")
    
    assert is_extractable is True
    assert method == "pypdf2"
    assert len(text) >= _OCR_FALLBACK_THRESHOLD


@pytest.mark.asyncio
async def test_ocr_fallback_triggered_for_scanned_pdf():
    """When PyPDF2 yields < 50 chars, Gemini OCR fallback should be invoked."""
    # PyPDF2 returns minimal text (simulating a scanned PDF)
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "A" * 10  # Below threshold
    
    mock_reader = MagicMock()
    mock_reader.pages = [mock_page]
    
    # Gemini OCR returns good text
    gemini_ocr_text = "John Doe\nSoftware Engineer\nPython, React, FastAPI\n" * 5
    
    with patch("app.services.pdf_parser.PdfReader", return_value=mock_reader), \
         patch("app.services.pdf_parser._extract_text_with_gemini_multimodal",
               new_callable=AsyncMock, return_value=gemini_ocr_text):
        text, is_extractable, method = await extract_text_from_pdf(b"scanned-pdf-bytes")
    
    assert is_extractable is True
    assert method == "gemini_ocr"
    assert "John Doe" in text


@pytest.mark.asyncio
async def test_ocr_fallback_fails_gracefully():
    """When both PyPDF2 and Gemini OCR yield insufficient text, is_extractable should be False."""
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "AB"  # 2 chars
    
    mock_reader = MagicMock()
    mock_reader.pages = [mock_page]
    
    with patch("app.services.pdf_parser.PdfReader", return_value=mock_reader), \
         patch("app.services.pdf_parser._extract_text_with_gemini_multimodal",
               new_callable=AsyncMock, return_value=""):
        text, is_extractable, method = await extract_text_from_pdf(b"bad-pdf-bytes")
    
    assert is_extractable is False
    assert method == "gemini_ocr"


@pytest.mark.asyncio
async def test_extraction_error_handling():
    """When PdfReader raises an exception, the function should return an error message gracefully."""
    with patch("app.services.pdf_parser.PdfReader", side_effect=Exception("Corrupt PDF")):
        text, is_extractable, method = await extract_text_from_pdf(b"corrupt-bytes")
    
    assert is_extractable is False
    assert method == "error"
    assert "Error extracting PDF text" in text


@pytest.mark.asyncio
async def test_return_tuple_has_three_elements():
    """Verify the new 3-tuple return signature."""
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Enough text for threshold " * 5
    
    mock_reader = MagicMock()
    mock_reader.pages = [mock_page]
    
    with patch("app.services.pdf_parser.PdfReader", return_value=mock_reader):
        result = await extract_text_from_pdf(b"normal-pdf")
    
    assert isinstance(result, tuple)
    assert len(result) == 3
    text, extractable, method = result
    assert isinstance(text, str)
    assert isinstance(extractable, bool)
    assert method in ("pypdf2", "gemini_ocr", "error")
