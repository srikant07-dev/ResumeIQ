"""
Unified multi-provider web search abstraction for Market Intelligence.

Cascade:
  Tier 1: Tavily Search API (rich content, pre-extracted markdown, citations)
  Tier 2: DuckDuckGo Search (instant fallback, no API key needed)
  Tier 3: Empty fallback (allows LLM synthesis using internal weights without failing)
"""

import asyncio
import logging
from dataclasses import dataclass, field
from functools import lru_cache
from typing import List, Dict, Any, Optional

from app.config import get_settings

logger = logging.getLogger("market_intelligence.search")

# Guarded imports
try:
    from tavily import TavilyClient
    _TAVILY_AVAILABLE = True
except ImportError:
    _TAVILY_AVAILABLE = False

try:
    from ddgs import DDGS
    _DDGS_AVAILABLE = True
except ImportError:
    try:
        from duckduckgo_search import DDGS
        _DDGS_AVAILABLE = True
    except ImportError:
        _DDGS_AVAILABLE = False


@dataclass
class SearchResult:
    text: str = ""
    sources: List[Dict[str, str]] = field(default_factory=list)  # [{"title": str, "uri": str}]
    provider: str = "none"  # "tavily" | "duckduckgo" | "none"


def _search_tavily_sync(api_key: str, query: str, max_results: int = 8) -> Optional[SearchResult]:
    """Synchronous worker for Tavily API search using 'basic' search depth (1 credit)."""
    if not _TAVILY_AVAILABLE:
        return None
    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=query,
            search_depth="basic",
            max_results=max_results,
            include_answer=False,
            include_raw_content=False,
        )
        raw_results = response.get("results", []) if isinstance(response, dict) else []
        if not raw_results:
            return None

        text_blocks: List[str] = []
        sources: List[Dict[str, str]] = []

        for item in raw_results:
            title = (item.get("title") or "").strip()
            url = (item.get("url") or "").strip()
            content = (item.get("content") or "").strip()

            if content:
                text_blocks.append(f"### {title}\nURL: {url}\n{content}")
            if url:
                sources.append({"title": title or url, "uri": url})

        if not text_blocks:
            return None

        return SearchResult(
            text="\n\n".join(text_blocks),
            sources=sources,
            provider="tavily",
        )
    except Exception as exc:
        logger.warning("[search_provider] Tavily search failed: %s", exc)
        return None


def _search_ddg_sync(query: str, max_results: int = 8) -> Optional[SearchResult]:
    """Synchronous worker for DuckDuckGo search with automatic query simplification retry."""
    if not _DDGS_AVAILABLE:
        return None

    queries_to_try = [query]
    # If query has many words, add a simplified fallback query
    words = query.split()
    if len(words) > 5:
        simplified = " ".join(words[:4]) + " hiring requirements"
        queries_to_try.append(simplified)

    try:
        ddgs = DDGS()
    except Exception as init_err:
        logger.warning("[search_provider] Failed to instantiate DDGS client: %s", init_err)
        return None

    for q in queries_to_try:
        try:
            raw_results = list(ddgs.text(q, max_results=max_results))
            if raw_results:
                text_blocks: List[str] = []
                sources: List[Dict[str, str]] = []

                for item in raw_results:
                    title = (item.get("title") or "").strip()
                    url = (item.get("href") or item.get("link") or item.get("url") or "").strip()
                    body = (item.get("body") or item.get("snippet") or "").strip()

                    if body:
                        text_blocks.append(f"### {title}\nURL: {url}\n{body}")
                    if url:
                        sources.append({"title": title or url, "uri": url})

                if text_blocks:
                    return SearchResult(
                        text="\n\n".join(text_blocks),
                        sources=sources,
                        provider="duckduckgo",
                    )
        except Exception as exc:
            logger.warning("[search_provider] DuckDuckGo search failed for query '%s': %s", q, exc)

    return None


async def search_web(query: str, max_results: int = 8, timeout_seconds: float = 15.0) -> SearchResult:
    """
    Execute web search across tier cascade: Tavily -> DuckDuckGo -> Empty fallback.
    Always returns a SearchResult instance, never raises an exception.
    """
    settings = get_settings()
    tavily_key = (settings.TAVILY_API_KEY or "").strip()

    # --- Tier 1: Tavily Search ---
    if tavily_key and _TAVILY_AVAILABLE:
        try:
            logger.info("[search_provider] Attempting Tier 1 (Tavily) search for query: '%s'", query)
            result = await asyncio.wait_for(
                asyncio.to_thread(_search_tavily_sync, tavily_key, query, max_results),
                timeout=timeout_seconds,
            )
            if result and result.text:
                logger.info(
                    "[search_provider] Tavily succeeded: %d characters, %d sources",
                    len(result.text),
                    len(result.sources),
                )
                return result
        except asyncio.TimeoutError:
            logger.warning("[search_provider] Tavily search timed out after %.1fs", timeout_seconds)
        except Exception as exc:
            logger.warning("[search_provider] Tavily search encountered unexpected error: %s", exc)

    # --- Tier 2: DuckDuckGo Search ---
    if _DDGS_AVAILABLE:
        try:
            logger.info("[search_provider] Falling back to Tier 2 (DuckDuckGo) search for query: '%s'", query)
            result = await asyncio.wait_for(
                asyncio.to_thread(_search_ddg_sync, query, max_results),
                timeout=timeout_seconds,
            )
            if result and result.text:
                logger.info(
                    "[search_provider] DuckDuckGo succeeded: %d characters, %d sources",
                    len(result.text),
                    len(result.sources),
                )
                return result
        except asyncio.TimeoutError:
            logger.warning("[search_provider] DuckDuckGo search timed out after %.1fs", timeout_seconds)
        except Exception as exc:
            logger.warning("[search_provider] DuckDuckGo search encountered unexpected error: %s", exc)

    # --- Tier 3: Empty Fallback ---
    logger.warning("[search_provider] All search providers failed or unavailable. Returning Tier 3 empty result.")
    return SearchResult(text="", sources=[], provider="none")
