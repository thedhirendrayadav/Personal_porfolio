from slug_utils import slugify_text


def test_slugify_text_normalizes_titles_to_stable_kebab_case():
    assert slugify_text("  Multi-Channel AI Messaging Platform  ") == "multi-channel-ai-messaging-platform"
    assert slugify_text("Research & Operations: 2026") == "research-operations-2026"
    assert slugify_text("Café Security") == "cafe-security"


def test_slugify_text_uses_safe_fallback_for_empty_input():
    assert slugify_text("") == "untitled"
    assert slugify_text("---") == "untitled"
