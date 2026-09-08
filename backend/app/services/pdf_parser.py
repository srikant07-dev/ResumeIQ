import io
import logging
import warnings
from typing import Tuple

with warnings.catch_warnings():
    warnings.simplefilter("ignore", category=DeprecationWarning)
    from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)

# Minimum character threshold below which we consider the PDF as scanned/image-only
_OCR_FALLBACK_THRESHOLD = 50


async def _extract_text_with_gemini_multimodal(pdf_bytes: bytes) -> str:
    """
    Fallback OCR extraction using Gemini 2.0 Flash multimodal PDF ingestion.
    Sends raw PDF bytes to Gemini and requests verbatim text transcription.
    Only invoked when PyPDF2 yields fewer than _OCR_FALLBACK_THRESHOLD characters.
    """
    from google import genai
    from google.genai import types
    from app.config import get_settings

    settings = get_settings()
    if not settings.GEMINI_API_KEY:
        logger.warning("Gemini API key not configured; cannot perform OCR fallback.")
        return ""

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = (
        "Transcribe all text from this resume document verbatim, preserving all headers, "
        "bullet points, skills, dates, job titles, company names, and education details. "
        "Do not summarize, paraphrase, or extrapolate. Return only the raw text content."
    )

    models_to_try = [settings.GEMINI_MODEL, "gemini-3.6-flash"]
    seen = set()
    unique_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
    for model_name in unique_models:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=[prompt, pdf_part],
                config=types.GenerateContentConfig(temperature=0.1)
            )
            extracted = (response.text or "").strip()
            if extracted:
                logger.info(
                    "Gemini OCR fallback extracted %d characters from scanned PDF using '%s'.",
                    len(extracted), model_name
                )
                return extracted
        except Exception as e:
            logger.warning("Gemini multimodal OCR with model '%s' failed: %s", model_name, e)
            continue
    return ""


async def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, bool, str]:
    """
    Extracts text from PDF binary content using a two-tier strategy:
      1. Fast local extraction via PyPDF2 (0 API cost).
      2. Gemini 2.0 Flash multimodal OCR fallback for scanned/image-only documents.

    Returns:
        (extracted_text, is_extractable, extraction_method)
        extraction_method is either "pypdf2" or "gemini_ocr".
    """
    extraction_method = "pypdf2"

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_pages = []

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text.strip())

        full_text = "\n\n".join(extracted_pages).strip()

        # If PyPDF2 extracted meaningful text, return immediately
        if len(full_text) >= _OCR_FALLBACK_THRESHOLD:
            return full_text, True, extraction_method

        # Attempt Gemini multimodal OCR for scanned documents
        logger.info(
            "PyPDF2 extracted only %d chars (threshold=%d). Attempting Gemini OCR fallback.",
            len(full_text), _OCR_FALLBACK_THRESHOLD
        )
        extraction_method = "gemini_ocr"
        ocr_text = await _extract_text_with_gemini_multimodal(pdf_bytes)

        if ocr_text and len(ocr_text) >= _OCR_FALLBACK_THRESHOLD:
            return ocr_text, True, extraction_method

        # Neither method yielded sufficient text
        final_text = ocr_text if len(ocr_text) > len(full_text) else full_text
        return final_text, False, extraction_method

    except Exception as e:
        logger.error("PDF text extraction failed: %s", e, exc_info=True)
        return f"Error extracting PDF text: {str(e)}", False, "error"
