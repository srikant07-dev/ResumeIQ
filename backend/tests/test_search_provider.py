"""
Unit Tests for Search Provider Service
======================================
Tests the 3-tier cascade:
1. Tier 1: Tavily Search (success, error, timeout)
2. Tier 2: DuckDuckGo Fallback (success, query retry, failure)
3. Tier 3: Graceful Empty Fallback (when all search providers fail)
"""

import pytest
import asyncio
from unittest.mock import MagicMock, patch

from app.services.search_provider import search_web, SearchResult, _search_tavily_sync, _search_ddg_sync


@pytest.mark.asyncio
async def test_search_web_tavily_success():
    """Verify Tier 1 (Tavily) succeeds and returns structured results with citations."""
    mock_response = {
        "results": [
            {
                "title": "Google Careers & Engineering",
                "url": "https://careers.google.com",
                "content": "Google operates in cloud computing, advertising, and AI technologies.",
            },
            {
                "title": "Google Tech Stack",
                "url": "https://stackshare.io/google",
                "content": "Google uses C++, Java, Python, Go, and Spanner database.",
            },
        ]
    }

    with patch("app.services.search_provider.get_settings") as mock_settings:
        mock_settings.return_value.TAVILY_API_KEY = "test-tavily-key"
        with patch("app.services.search_provider._TAVILY_AVAILABLE", True):
            with patch("app.services.search_provider.TavilyClient") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.search.return_value = mock_response
                mock_client_cls.return_value = mock_client

                result = await search_web("Google software engineer tech stack")

                assert result.provider == "tavily"
                assert len(result.sources) == 2
                assert "Google Careers" in result.sources[0]["title"]
                assert result.sources[0]["uri"] == "https://careers.google.com"
                assert "Google uses C++" in result.text


@pytest.mark.asyncio
async def test_search_web_tavily_fails_falls_back_to_ddg():
    """Verify that when Tavily throws an error, search_web gracefully falls back to Tier 2 (DuckDuckGo)."""
    mock_ddg_results = [
        {
            "title": "Netflix Tech Blog",
            "href": "https://netflixtechblog.com",
            "body": "Netflix uses Java, Spring Boot, Node.js, and AWS microservices architecture.",
        }
    ]

    with patch("app.services.search_provider.get_settings") as mock_settings:
        mock_settings.return_value.TAVILY_API_KEY = "test-tavily-key"
        with patch("app.services.search_provider._TAVILY_AVAILABLE", True):
            with patch("app.services.search_provider.TavilyClient") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.search.side_effect = RuntimeError("Tavily rate limit or network error")
                mock_client_cls.return_value = mock_client

                with patch("app.services.search_provider._DDGS_AVAILABLE", True):
                    with patch("app.services.search_provider.DDGS") as mock_ddg_cls:
                        mock_ddg = MagicMock()
                        mock_ddg.text.return_value = iter(mock_ddg_results)
                        mock_ddg_cls.return_value = mock_ddg

                        result = await search_web("Netflix backend tech stack")

                        assert result.provider == "duckduckgo"
                        assert len(result.sources) == 1
                        assert result.sources[0]["uri"] == "https://netflixtechblog.com"
                        assert "Netflix uses Java" in result.text


@pytest.mark.asyncio
async def test_search_web_all_fail_returns_tier3_empty():
    """Verify that when both Tavily and DuckDuckGo fail, Tier 3 empty result is returned without raising."""
    with patch("app.services.search_provider.get_settings") as mock_settings:
        mock_settings.return_value.TAVILY_API_KEY = "test-tavily-key"
        with patch("app.services.search_provider._TAVILY_AVAILABLE", True):
            with patch("app.services.search_provider.TavilyClient") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.search.side_effect = RuntimeError("Tavily down")
                mock_client_cls.return_value = mock_client

                with patch("app.services.search_provider._DDGS_AVAILABLE", True):
                    with patch("app.services.search_provider.DDGS") as mock_ddg_cls:
                        mock_ddg = MagicMock()
                        mock_ddg.text.side_effect = RuntimeError("DDG blocked")
                        mock_ddg_cls.return_value = mock_ddg

                        result = await search_web("Stripe engineer")

                        assert result.provider == "none"
                        assert result.sources == []
                        assert result.text == ""


def test_tavily_sync_returns_none_when_unavailable():
    """Verify _search_tavily_sync returns None when package or results are missing."""
    with patch("app.services.search_provider._TAVILY_AVAILABLE", False):
        assert _search_tavily_sync("fake-key", "query") is None


def test_ddg_sync_returns_none_when_unavailable():
    """Verify _search_ddg_sync returns None when package or results are missing."""
    with patch("app.services.search_provider._DDGS_AVAILABLE", False):
        assert _search_ddg_sync("query") is None
