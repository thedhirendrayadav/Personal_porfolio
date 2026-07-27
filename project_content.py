import ipaddress
import json
import logging
import re
from copy import deepcopy
from functools import lru_cache
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse


logger = logging.getLogger(__name__)

REGISTRY_PATH = Path(__file__).with_name("content") / "projects.json"
REQUIRED_FIELDS = {
    "slug",
    "title",
    "short_title",
    "description",
    "project_type",
    "status",
    "featured",
    "technologies",
    "thesis",
    "problem",
    "role",
    "scope",
    "constraints",
    "claim_sources",
    "architecture",
    "trust_boundaries",
    "security_decisions",
    "evidence",
    "outcomes",
    "hardening",
}
REQUIRED_TEXT_FIELDS = {
    "title",
    "short_title",
    "description",
    "project_type",
    "thesis",
    "problem",
    "role",
    "scope",
    "constraints",
}
CLAIM_SOURCE_FIELDS = {
    "title",
    "short_title",
    "description",
    "project_type",
    "status",
    "technologies",
    "thesis",
    "problem",
    "role",
    "scope",
    "constraints",
}
ALLOWED_STATUSES = {"Prototype", "Research System", "In Development"}
ALLOWED_EVIDENCE_TYPES = {"source", "schema", "test", "capture", "report", "terminal"}
REQUIRED_EVIDENCE_FIELDS = {"type", "label", "title", "claim"}
EXTERNAL_URL_FIELDS = {"repository_url", "github_url", "demo_url", "url"}
MEDIA_PATH_FIELDS = {"image_url", "path"}
REPOSITORY_PATH_FIELDS = {"source_path"}
SLUG_PATTERN = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
CONTROL_CHARACTER_PATTERN = re.compile(r"[\x00-\x1f\x7f]")
HOST_LABEL_PATTERN = re.compile(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?")
PRIVATE_HOSTNAME_SUFFIXES = {"corp", "internal", "local", "lan"}
SENSITIVE_VALUE_PATTERNS = (
    re.compile(
        r"\b[A-Za-z0-9_]*(?:API_?KEY|SECRET|TOKEN|PASSWORD|PASS|"
        r"AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY)[A-Za-z0-9_]*\s*(?:=|:)\s*"
        r"(?:['\"])?(?!redacted\b|masked\b|example\b|placeholder\b)[^\s,'\";]+",
        re.IGNORECASE,
    ),
    re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"),
    re.compile(r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----", re.IGNORECASE),
    re.compile(r"\bBearer\s+[A-Za-z0-9._~+/=-]+", re.IGNORECASE),
    re.compile(r"(?<!\w)[A-Za-z]:[\\/]"),
    re.compile(r"(?<!\w)(?:~|/root|/(?:home|Users)/[^/\s]+)/(?:[^\s'\"<>]+)"),
    re.compile(r"(?<![\w.-])/(?:etc|var|opt|srv|root|tmp|usr)(?:/|(?=\s|$))"),
    re.compile(
        r"(?<![\w.-])(?:localhost|[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?"
        r"\.(?:corp|internal|local|lan))(?![\w.-])",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?<!\w)(?:connected\s+to\s+|(?:host|hostname|server|endpoint|database)"
        r"\s*[=:]\s*)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
        r"(?=:\d+\b|[,;!?\s]|$|\.(?![A-Za-z0-9]))",
        re.IGNORECASE,
    ),
)
IPV4_PATTERN = re.compile(r"(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?!\w)(?!\.\d)")
IPV6_CANDIDATE_PATTERN = re.compile(
    r"(?<![\w:])\[?([0-9A-Fa-f]*:[0-9A-Fa-f:.]+)\]?(?![\w:])"
)
TERMINAL_URL_PATTERN = re.compile(r"\b[A-Za-z][A-Za-z0-9+.-]*://\S+")
TERMINAL_ABSOLUTE_POSIX_PATH_PATTERN = re.compile(r"(?<![\w/])/(?!/)")
TERMINAL_MACHINE_HOST_PATTERN = re.compile(
    r"(?<![\w.-])(?:"
    r"(?=[A-Za-z0-9-]*\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+(?:\:\d{1,5})?"
    r"|[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+:\d{1,5}"
    r")(?![\w.-])"
)
SOURCE_COLLECTION_SCHEMAS = {
    "architecture": {"label", "category", "relationship", "source"},
    "trust_boundaries": {"name", "crossing", "source"},
    "security_decisions": {"risk", "control", "source"},
    "outcomes": {"claim", "source"},
    "hardening": {"item", "source"},
}
SAFE_TOP_LEVEL_ERROR_FIELDS = (
    REQUIRED_FIELDS | EXTERNAL_URL_FIELDS | MEDIA_PATH_FIELDS | REPOSITORY_PATH_FIELDS
)


class ProjectContentError(ValueError):
    """Raised when curated project content violates the registry contract."""


def _sanitize_slug_context(slug):
    if isinstance(slug, str) and (
        (len(slug) <= 100 and SLUG_PATTERN.fullmatch(slug))
        or re.fullmatch(r"at index \d+", slug)
    ):
        return slug
    return "at unknown index"


def _sanitize_error_field(field):
    if field in SAFE_TOP_LEVEL_ERROR_FIELDS:
        return field

    evidence_match = re.fullmatch(
        r"evidence\[\d+\](?:\.(type|label|title|claim|excerpt))?", field
    )
    if evidence_match:
        return field

    claim_source_match = re.fullmatch(
        r"claim_sources(?:\.([a-z_]+)(?:\[\d+\])?)?", field
    )
    if claim_source_match and (
        claim_source_match.group(1) is None
        or claim_source_match.group(1) in CLAIM_SOURCE_FIELDS
    ):
        return field

    for collection, item_fields in SOURCE_COLLECTION_SCHEMAS.items():
        collection_match = re.fullmatch(
            rf"{collection}\[\d+\](?:\.([a-z_]+))?", field
        )
        if collection_match and (
            collection_match.group(1) is None
            or collection_match.group(1) in item_fields
        ):
            return field
    return "project"


def _project_error(slug, field, detail):
    safe_slug = _sanitize_slug_context(slug)
    safe_field = _sanitize_error_field(field)
    return ProjectContentError(f"project {safe_slug} field {safe_field} {detail}")


def _validate_relative_path(value, slug, field, *, media=False):
    if not isinstance(value, str) or not value.strip():
        raise _project_error(slug, field, "must be a non-empty relative path")
    if CONTROL_CHARACTER_PATTERN.search(value):
        raise _project_error(slug, field, "must not contain control characters")

    normalized = value.strip()
    if "\\" in normalized or re.match(r"^[A-Za-z]:", normalized):
        raise _project_error(slug, field, "must use a repository-relative POSIX path")

    raw_parts = normalized.split("/")
    path = PurePosixPath(normalized)
    if path.is_absolute() or any(part in {".", ".."} for part in raw_parts):
        raise _project_error(slug, field, "must be repository-relative without traversal")
    if media and (not path.parts or path.parts[0] != "static"):
        raise _project_error(slug, field, "must be under static/")
    return normalized


def _validate_hostname(hostname, slug, field):
    if not hostname or any(character.isspace() for character in hostname):
        raise _project_error(slug, field, "must contain a valid hostname")

    try:
        address = ipaddress.ip_address(hostname)
        if address.is_private or address.is_loopback or address.is_link_local:
            raise _project_error(slug, field, "must use a public host")
        return
    except ValueError:
        pass

    if re.fullmatch(r"[0-9.]+", hostname):
        raise _project_error(slug, field, "contains a malformed IP address")

    try:
        ascii_hostname = hostname.rstrip(".").encode("idna").decode("ascii")
    except UnicodeError as error:
        raise _project_error(slug, field, "contains a malformed hostname") from error

    labels = ascii_hostname.split(".")
    if (
        not ascii_hostname
        or len(ascii_hostname) > 253
        or any(not HOST_LABEL_PATTERN.fullmatch(label) for label in labels)
    ):
        raise _project_error(slug, field, "contains a malformed hostname")
    if len(labels) == 1 or labels[-1].lower() in PRIVATE_HOSTNAME_SUFFIXES:
        raise _project_error(slug, field, "must use a public hostname")


def _validate_url(value, slug, field):
    if not isinstance(value, str) or not value.strip():
        raise _project_error(slug, field, "must be a non-empty URL")
    if CONTROL_CHARACTER_PATTERN.search(value):
        raise _project_error(slug, field, "must not contain control characters")

    normalized = value.strip()
    if "\\" in normalized or any(character.isspace() for character in normalized):
        raise _project_error(slug, field, "must not contain whitespace or backslashes")

    try:
        parsed = urlparse(normalized)
        hostname = parsed.hostname
        parsed.port
    except ValueError as error:
        raise _project_error(slug, field, "contains a malformed host or port") from error

    if parsed.scheme not in {"http", "https"} or not hostname:
        raise _project_error(slug, field, "must use HTTP(S) with a hostname")
    if parsed.username or parsed.password:
        raise _project_error(slug, field, "must not contain credentials")
    _validate_hostname(hostname, slug, field)
    return normalized


def _validate_nested_fields(value, slug, field=""):
    if isinstance(value, dict):
        for key, nested_value in value.items():
            nested_field = f"{field}.{key}" if field else key
            if nested_value is not None and key in EXTERNAL_URL_FIELDS:
                value[key] = _validate_url(nested_value, slug, nested_field)
            if nested_value is not None and key in MEDIA_PATH_FIELDS:
                value[key] = _validate_relative_path(
                    nested_value, slug, nested_field, media=True
                )
            if nested_value is not None and key in REPOSITORY_PATH_FIELDS:
                value[key] = _validate_relative_path(nested_value, slug, nested_field)
            _validate_nested_fields(value[key], slug, nested_field)
    elif isinstance(value, list):
        for index, nested_value in enumerate(value):
            _validate_nested_fields(nested_value, slug, f"{field}[{index}]")


def _iter_text_fields(value, field=""):
    if isinstance(value, dict):
        for key, nested_value in value.items():
            nested_field = f"{field}.{key}" if field else key
            yield from _iter_text_fields(nested_value, nested_field)
    elif isinstance(value, list):
        for index, nested_value in enumerate(value):
            yield from _iter_text_fields(nested_value, f"{field}[{index}]")
    elif isinstance(value, str):
        yield field, value


def _validate_sensitive_text(value, slug, field, *, terminal=False):
    if any(pattern.search(value) for pattern in SENSITIVE_VALUE_PATTERNS):
        raise _project_error(slug, field, "contains secret-like or private data")

    field_name = field.rsplit(".", 1)[-1]
    if terminal and field_name not in {"type", "label"}:
        if TERMINAL_URL_PATTERN.search(value):
            raise _project_error(slug, field, "contains a URL")
        if TERMINAL_ABSOLUTE_POSIX_PATH_PATTERN.search(value):
            raise _project_error(slug, field, "contains an absolute filesystem path")
        if TERMINAL_MACHINE_HOST_PATTERN.search(value):
            raise _project_error(slug, field, "contains a private hostname")

    if (
        terminal
        and field_name not in {"type", "label", "title"}
        and HOST_LABEL_PATTERN.fullmatch(value.strip())
    ):
        raise _project_error(slug, field, "contains a private hostname")

    for match in IPV4_PATTERN.finditer(value):
        try:
            address = ipaddress.ip_address(match.group())
        except ValueError:
            continue
        if address.is_private or address.is_loopback or address.is_link_local:
            raise _project_error(slug, field, "contains a private-network IP address")

    for match in IPV6_CANDIDATE_PATTERN.finditer(value):
        try:
            address = ipaddress.ip_address(match.group(1))
        except ValueError:
            continue
        if address.is_private or address.is_loopback or address.is_link_local:
            raise _project_error(slug, field, "contains a private-network IP address")


def _validate_sensitive_values(value, slug, field="", *, terminal=False):
    for nested_field, text in _iter_text_fields(value, field):
        _validate_sensitive_text(text, slug, nested_field, terminal=terminal)


def _validate_claim_sources(project, slug):
    claim_sources = project.get("claim_sources")
    if not isinstance(claim_sources, dict) or not claim_sources:
        raise _project_error(slug, "claim_sources", "must be a non-empty object")

    missing_claim_sources = CLAIM_SOURCE_FIELDS - claim_sources.keys()
    if missing_claim_sources:
        field = sorted(missing_claim_sources)[0]
        raise _project_error(slug, f"claim_sources.{field}", "is required")

    if claim_sources.keys() - CLAIM_SOURCE_FIELDS:
        raise _project_error(slug, "claim_sources", "contains an unsupported field")

    for claim_field, labels in claim_sources.items():
        if claim_field not in project:
            raise _project_error(slug, f"claim_sources.{claim_field}", "cites a missing field")
        if not isinstance(labels, list) or not labels:
            raise _project_error(
                slug, f"claim_sources.{claim_field}", "requires source labels"
            )
        for index, label in enumerate(labels):
            labels[index] = _validate_relative_path(
                label, slug, f"claim_sources.{claim_field}[{index}]"
            )

    for collection, required_fields in SOURCE_COLLECTION_SCHEMAS.items():
        items = project.get(collection)
        if not isinstance(items, list) or not items:
            raise _project_error(slug, collection, "must be a non-empty list")
        for index, item in enumerate(items):
            item_field = f"{collection}[{index}]"
            if not isinstance(item, dict):
                raise _project_error(slug, item_field, "must be an object")
            missing_fields = required_fields - item.keys()
            if missing_fields:
                field = sorted(missing_fields)[0]
                raise _project_error(slug, f"{item_field}.{field}", "is required")
            for field in required_fields:
                if not isinstance(item[field], str) or not item[field].strip():
                    raise _project_error(
                        slug, f"{item_field}.{field}", "must be non-empty text"
                    )
            item["source"] = _validate_relative_path(
                item["source"], slug, f"{item_field}.source"
            )


def _validate_registry(raw):
    if not isinstance(raw, list) or not raw:
        raise ProjectContentError("registry must be a non-empty list")

    seen_slugs = set()
    for index, project in enumerate(raw):
        if not isinstance(project, dict):
            raise ProjectContentError(f"project at index {index} must be an object")

        candidate_slug = project.get("slug")
        slug_context = (
            candidate_slug
            if isinstance(candidate_slug, str) and SLUG_PATTERN.fullmatch(candidate_slug)
            else f"at index {index}"
        )

        missing = REQUIRED_FIELDS - project.keys()
        if missing:
            field = sorted(missing)[0]
            raise _project_error(slug_context, field, "is required")

        slug = project["slug"]
        if not isinstance(slug, str) or not SLUG_PATTERN.fullmatch(slug):
            raise _project_error(f"at index {index}", "slug", "is invalid")
        if slug in seen_slugs:
            raise _project_error(slug, "slug", "is a duplicate slug")
        seen_slugs.add(slug)

        for field in REQUIRED_TEXT_FIELDS:
            if not isinstance(project[field], str) or not project[field].strip():
                raise _project_error(slug, field, "must be non-empty text")

        if not isinstance(project["featured"], bool):
            raise _project_error(slug, "featured", "must be a boolean")
        if (
            not isinstance(project["status"], str)
            or project["status"] not in ALLOWED_STATUSES
        ):
            raise _project_error(slug, "status", "is not an allowed status")

        if not isinstance(project["technologies"], list) or not project["technologies"]:
            raise _project_error(slug, "technologies", "must be a non-empty list")
        if not all(isinstance(item, str) and item.strip() for item in project["technologies"]):
            raise _project_error(slug, "technologies", "contains an invalid item")

        evidence = project["evidence"]
        if not isinstance(evidence, list) or not evidence:
            raise _project_error(slug, "evidence", "must be a non-empty list")
        for evidence_index, item in enumerate(evidence):
            evidence_field = f"evidence[{evidence_index}]"
            if not isinstance(item, dict):
                raise _project_error(slug, evidence_field, "must be an object")
            missing_evidence_fields = REQUIRED_EVIDENCE_FIELDS - item.keys()
            if missing_evidence_fields:
                field = sorted(missing_evidence_fields)[0]
                raise _project_error(slug, f"{evidence_field}.{field}", "is required")
            if (
                not isinstance(item["type"], str)
                or item["type"] not in ALLOWED_EVIDENCE_TYPES
            ):
                raise _project_error(slug, f"{evidence_field}.type", "is invalid")
            for field in ("title", "claim"):
                if not isinstance(item[field], str) or not item[field].strip():
                    raise _project_error(
                        slug, f"{evidence_field}.{field}", "must be non-empty text"
                    )
            item["label"] = _validate_relative_path(
                item["label"], slug, f"{evidence_field}.label"
            )
            if item["type"] == "terminal":
                _validate_sensitive_values(item, slug, evidence_field, terminal=True)

        _validate_claim_sources(project, slug)
        _validate_nested_fields(project, slug)
        _validate_sensitive_values(project, slug)


@lru_cache(maxsize=1)
def _load_registry() -> tuple[dict, ...]:
    try:
        serialized = REGISTRY_PATH.read_text(encoding="utf-8")
    except OSError as error:
        logger.error("project registry read failed: %s", type(error).__name__)
        raise ProjectContentError("unable to read curated project registry") from error

    try:
        raw = json.loads(serialized)
    except json.JSONDecodeError as error:
        logger.error(
            "project registry JSON parsing failed at line %s column %s",
            error.lineno,
            error.colno,
        )
        raise ProjectContentError("curated project registry contains invalid JSON") from error

    try:
        _validate_registry(raw)
    except ProjectContentError as error:
        logger.error("project registry validation failed: %s", error)
        raise
    return tuple(raw)


def load_curated_projects() -> list[dict]:
    return deepcopy(list(_load_registry()))


def get_curated_project(slug: str) -> dict | None:
    for project in _load_registry():
        if project["slug"] == slug:
            return deepcopy(project)
    return None


def get_curated_neighbors(slug: str) -> tuple[dict | None, dict | None]:
    projects = _load_registry()
    project_index = next(
        (index for index, project in enumerate(projects) if project["slug"] == slug),
        None,
    )
    if project_index is None:
        return None, None

    previous_project = deepcopy(projects[project_index - 1]) if project_index > 0 else None
    next_project = (
        deepcopy(projects[project_index + 1])
        if project_index + 1 < len(projects)
        else None
    )
    return previous_project, next_project