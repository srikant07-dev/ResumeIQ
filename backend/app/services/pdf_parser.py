import io
from PyPDF2 import PdfReader
from typing import Tuple

def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, bool]:
    """
    Extracts text from PDF binary content.
    Returns:
        (extracted_text, is_extractable)
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_pages = []
        
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text.strip())
        
        full_text = "\n\n".join(extracted_pages).strip()
        
        # Check if meaningful text was found (not image-only scan)
        if len(full_text) < 30:
            return full_text, False
            
        return full_text, True
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}", False
