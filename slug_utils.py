import re
import unicodedata


SLUG_MAX_LENGTH = 100


def slugify_text(value: str) -> str:
    """Return a stable ASCII kebab-case slug for a user-facing title."""
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value).strip("-")
    slug = slug[:SLUG_MAX_LENGTH].rstrip("-")
    return slug or "untitled"
