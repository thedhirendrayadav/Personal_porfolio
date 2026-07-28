import json
import logging
import re
import struct
from pathlib import Path

import pytest

import project_content
from project_content import (
    ProjectContentError,
    get_curated_neighbors,
    get_curated_project,
    load_curated_projects,
)


EXPECTED_SLUGS = [
    "multi-channel-ai-messaging",
    "nepse-market-intelligence",
    "secure-portfolio-platform",
    "runpod-media-orchestrator",
    "hotmail-automation",
    "erp-system",
    "school-management",
    "restaurant-management",
    "attendance-management",
    "accounting-software",
    "billing-software",
    "staff-management-system",
]
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
ALLOWED_EVIDENCE_TYPES = {"source", "schema", "test", "capture", "report", "terminal"}
ALLOWED_STATUSES = {"Prototype", "Research System", "In Development"}
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
SOURCE_COLLECTIONS = (
    "architecture",
    "trust_boundaries",
    "security_decisions",
    "outcomes",
    "hardening",
)
SOURCE_COLLECTION_SCHEMAS = {
    "architecture": ("label", "category", "relationship", "source"),
    "trust_boundaries": ("name", "crossing", "source"),
    "security_decisions": ("risk", "control", "source"),
    "outcomes": ("claim", "source"),
    "hardening": ("item", "source"),
}


def _write_registry(tmp_path, projects):
    registry_path = tmp_path / "projects.json"
    registry_path.write_text(json.dumps(projects), encoding="utf-8")
    return registry_path


def _load_from(tmp_path, monkeypatch, projects):
    monkeypatch.setattr(project_content, "REGISTRY_PATH", _write_registry(tmp_path, projects))
    project_content._load_registry.cache_clear()
    return load_curated_projects()


@pytest.fixture(autouse=True)
def clear_registry_cache():
    project_content._load_registry.cache_clear()
    yield
    project_content._load_registry.cache_clear()


def test_curated_projects_have_exact_unique_valid_slugs_and_required_fields():
    projects = load_curated_projects()
    slugs = [project["slug"] for project in projects]

    assert slugs == EXPECTED_SLUGS
    assert len(slugs) == len(set(slugs))
    assert all(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) for slug in slugs)
    assert all(REQUIRED_FIELDS <= project.keys() for project in projects)
    assert all(project["status"] in ALLOWED_STATUSES for project in projects)


def test_curated_projects_reference_field_journal_artwork():
    expected = {
        "multi-channel-ai-messaging": "static/images/projects/multi-channel-ai-messaging-field-journal.webp",
        "nepse-market-intelligence": "static/images/projects/nepse-market-intelligence-field-journal.webp",
        "secure-portfolio-platform": "static/images/projects/secure-portfolio-platform-field-journal.webp",
        "runpod-media-orchestrator": "static/images/projects/runpod-media-orchestrator-field-journal.webp",
        "hotmail-automation": "static/images/projects/hotmail-automation-field-journal.webp",
        "erp-system": "static/images/projects/erp-system-field-journal.webp",
        "school-management": "static/images/projects/school-management-field-journal.webp",
        "restaurant-management": "static/images/projects/restaurant-management-field-journal.webp",
        "attendance-management": "static/images/projects/attendance-management-field-journal.webp",
        "accounting-software": "static/images/projects/accounting-software-field-journal.webp",
        "billing-software": "static/images/projects/billing-software-field-journal.webp",
        "staff-management-system": "static/images/projects/staff-management-system-field-journal.webp",
    }

    projects = load_curated_projects()
    assert {project["slug"]: project["image_url"] for project in projects} == expected
    for project in projects:
        path = Path(project["image_url"])
        assert path.is_file()
        assert path.stat().st_size > 50_000
        assert project["image_width"] == 1536
        assert project["image_height"] == 1024


def test_curated_projects_use_supported_evidence_types_and_relative_labels():
    for project in load_curated_projects():
        assert project["evidence"]
        for item in project["evidence"]:
            assert item["type"] in ALLOWED_EVIDENCE_TYPES
            assert item["label"]
            assert not item["label"].startswith(("/", "\\"))
            assert "\\" not in item["label"]
            assert ".." not in item["label"].split("/")


def test_curated_projects_use_safe_urls_and_repository_relative_media_paths():
    for project in load_curated_projects():
        for field in ("repository_url", "demo_url"):
            if project.get(field):
                assert project[field].startswith(("https://", "http://"))

        media_paths = [project.get("image_url")]
        media_paths.extend(item.get("path") for item in project.get("gallery", []))
        for media_path in filter(None, media_paths):
            assert media_path.startswith("static/")
            assert not media_path.startswith(("/", "\\"))
            assert "\\" not in media_path
            assert ".." not in media_path.split("/")


def test_featured_project_captures_exist_with_declared_dimensions():
    project_root = Path(__file__).parents[1]
    projects = {project["slug"]: project for project in load_curated_projects()}

    for slug in (
        "multi-channel-ai-messaging",
        "nepse-market-intelligence",
        "secure-portfolio-platform",
    ):
        project = projects[slug]
        media_path = project_root / project["image_url"]

        assert media_path.suffix.lower() in {".webp", ".png", ".jpg"}
        assert media_path.is_file()
        assert media_path.stat().st_size > 0
        assert project["image_width"] > 0
        assert project["image_height"] > 0
        if media_path.suffix.lower() == ".png":
            image_bytes = media_path.read_bytes()
            assert image_bytes[:8] == b"\x89PNG\r\n\x1a\n"
            actual_dimensions = struct.unpack(">II", image_bytes[16:24])
            assert actual_dimensions == (
                project["image_width"],
                project["image_height"],
            )


def test_every_technical_claim_has_a_project_relative_source_label():
    for project in load_curated_projects():
        assert CLAIM_SOURCE_FIELDS == project["claim_sources"].keys()
        for labels in project["claim_sources"].values():
            assert labels
            assert all(not re.match(r"^(?:[A-Za-z]:|[/\\])", label) for label in labels)
            assert all("\\" not in label and ".." not in label.split("/") for label in labels)

        for collection in SOURCE_COLLECTIONS:
            assert project[collection]
            assert all(item.get("source") for item in project[collection])


def test_lookup_and_neighbors_return_defensive_copies():
    projects = load_curated_projects()
    projects[0]["title"] = "mutated"
    selected = get_curated_project(EXPECTED_SLUGS[0])

    assert selected["title"] != "mutated"
    previous_project, next_project = get_curated_neighbors(EXPECTED_SLUGS[0])
    assert previous_project is None
    assert next_project["slug"] == EXPECTED_SLUGS[1]

    previous_project, next_project = get_curated_neighbors(EXPECTED_SLUGS[-1])
    assert previous_project["slug"] == EXPECTED_SLUGS[-2]
    assert next_project is None
    assert get_curated_project("not-real") is None
    assert get_curated_neighbors("not-real") == (None, None)


def test_all_public_accessors_return_nested_defensive_copies():
    loaded = load_curated_projects()
    loaded[0]["architecture"][0]["label"] = "mutated load"
    assert load_curated_projects()[0]["architecture"][0]["label"] != "mutated load"

    selected = get_curated_project(EXPECTED_SLUGS[0])
    selected["evidence"][0]["claim"] = "mutated lookup"
    assert get_curated_project(EXPECTED_SLUGS[0])["evidence"][0]["claim"] != "mutated lookup"

    _, next_project = get_curated_neighbors(EXPECTED_SLUGS[0])
    next_project["trust_boundaries"][0]["crossing"] = "mutated neighbor"
    _, fresh_next_project = get_curated_neighbors(EXPECTED_SLUGS[0])
    assert fresh_next_project["trust_boundaries"][0]["crossing"] != "mutated neighbor"


def test_source_registry_is_read_once_across_all_public_accessors(tmp_path, monkeypatch):
    registry_path = _write_registry(tmp_path, load_curated_projects())
    original_read_text = Path.read_text
    read_count = 0

    def counted_read_text(path, *args, **kwargs):
        nonlocal read_count
        if path == registry_path:
            read_count += 1
        return original_read_text(path, *args, **kwargs)

    monkeypatch.setattr(Path, "read_text", counted_read_text)
    monkeypatch.setattr(project_content, "REGISTRY_PATH", registry_path)
    project_content._load_registry.cache_clear()

    load_curated_projects()
    get_curated_project(EXPECTED_SLUGS[0])
    get_curated_neighbors(EXPECTED_SLUGS[0])

    assert read_count == 1


def test_loader_strips_safe_path_and_url_values(tmp_path, monkeypatch):
    projects = load_curated_projects()
    projects[0]["repository_url"] = "  https://example.com/source  "
    projects[0]["evidence"][0]["label"] = "  backend/src/app.ts  "

    loaded = _load_from(tmp_path, monkeypatch, projects)

    assert loaded[0]["repository_url"] == "https://example.com/source"
    assert loaded[0]["evidence"][0]["label"] == "backend/src/app.ts"


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("repository_url", "https://bad host.example/source"),
        ("repository_url", "https://example.com:not-a-port/source"),
        ("repository_url", "https://-bad.example/source"),
        ("repository_url", "https://user:representative@example.com/source"),
        ("repository_url", "https://example.com/source\x00tail"),
        ("repository_url", "https://example.com\\source"),
        ("repository_url", "https://db/source"),
        ("repository_url", "https://db.corp/source"),
        ("repository_url", "https://[fd00::1]/source"),
        ("evidence_label", " /etc/passwd"),
        ("evidence_label", "backend\\src\\app.ts"),
        ("evidence_label", "backend/src/../private.txt"),
        ("evidence_label", "backend/src/app.py\x1f"),
    ],
)
def test_loader_rejects_malformed_urls_and_paths(tmp_path, monkeypatch, field, value):
    projects = load_curated_projects()
    if field == "evidence_label":
        projects[0]["evidence"][0]["label"] = value
        expected_field = r"evidence\[0\]\.label"
    else:
        projects[0][field] = value
        expected_field = field

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*{expected_field}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize(
    "private_value",
    [
        "SECRET=correct-horse-battery-staple",
        "TOKEN=ghp_1234567890abcdefghijklmnop",
        "PASSWORD=representative-password-123",
        "PASS=representative-passphrase-456",
        "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE",
        "-----BEGIN RSA PRIVATE KEY-----",
        "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.representative.signature",
        "/home/alice/.ssh/id_ed25519",
        r"C:\Users\Alice\.ssh\id_rsa",
        "connected to localhost:6379",
        "connected to db.internal",
        "connected to 10.20.30.40",
        "connected to 172.20.1.10",
        "connected to 192.168.1.44",
        "connected to 127.0.0.1",
        "/etc/passwd",
        "/var/log/private.log",
        "/opt/internal/config.ini",
        "/srv/private/service.sock",
        "/root/private.txt",
        "/tmp/private.txt",
        "/usr/local/private-tool",
        "db",
        "connected to db",
        "connected to db.corp",
        "connected to db.internal",
        "connected to db.local",
        "connected to db.lan",
        "connected to fd00::1",
        "connected to ::1",
        "connected to fe80::1",
    ],
)
def test_terminal_evidence_rejects_representative_secrets_and_private_data(
    tmp_path, monkeypatch, private_value
):
    projects = load_curated_projects()
    projects[0]["evidence"][0].update(type="terminal", excerpt=private_value)

    with pytest.raises(
        ProjectContentError,
        match=r"multi-channel-ai-messaging.*evidence\[0\]\.excerpt",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize(
    "reviewer_probe",
    [
        "/run/secrets/service-token",
        "/mnt/c/Users/Alice/private.txt",
        "Build completed on ci-runner-01:8080 before artifact upload.",
    ],
)
def test_terminal_evidence_rejects_final_reviewer_probes(
    tmp_path, monkeypatch, reviewer_probe
):
    projects = load_curated_projects()
    projects[0]["evidence"][0].update(type="terminal", excerpt=reviewer_probe)

    with pytest.raises(
        ProjectContentError,
        match=r"multi-channel-ai-messaging.*evidence\[0\]\.excerpt",
    ):
        _load_from(tmp_path, monkeypatch, projects)


def test_terminal_evidence_allows_ordinary_hyphenated_prose(tmp_path, monkeypatch):
    projects = load_curated_projects()
    projects[0]["evidence"][0].update(
        type="terminal",
        excerpt="The retry-safe check completed with a well-formed result.",
    )

    loaded = _load_from(tmp_path, monkeypatch, projects)

    assert loaded[0]["evidence"][0]["excerpt"].startswith("The retry-safe check")


@pytest.mark.parametrize(
    "private_value",
    [
        "Deployment used SECRET=correct-horse-battery-staple.",
        "Credential was AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE.",
        "Key path was /home/alice/.ssh/id_ed25519.",
        "Operator path was C:\\Users\\Alice\\private.txt.",
        "Service endpoint was 192.168.50.12.",
    ],
)
def test_registry_rejects_representative_secrets_and_private_data(
    tmp_path, monkeypatch, private_value
):
    projects = load_curated_projects()
    projects[0]["constraints"] = private_value

    with pytest.raises(
        ProjectContentError,
        match=r"multi-channel-ai-messaging.*constraints",
    ):
        _load_from(tmp_path, monkeypatch, projects)


def test_registry_allows_safe_conceptual_secret_words(tmp_path, monkeypatch):
    projects = load_curated_projects()
    projects[0]["constraints"] = (
        "The design discusses token budgets and password controls without publishing values."
    )

    loaded = _load_from(tmp_path, monkeypatch, projects)

    assert "token budgets" in loaded[0]["constraints"]


@pytest.mark.parametrize("field", sorted(REQUIRED_FIELDS))
def test_loader_rejects_every_omitted_required_project_field(
    tmp_path, monkeypatch, field
):
    projects = load_curated_projects()
    projects[0].pop(field)
    projects[0].get("claim_sources", {}).pop(field, None)
    project_context = "at index 0" if field == "slug" else "multi-channel-ai-messaging"

    with pytest.raises(
        ProjectContentError,
        match=rf"{project_context}.*{field}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize("field", sorted(CLAIM_SOURCE_FIELDS))
def test_loader_rejects_missing_claim_source_for_every_display_field(
    tmp_path, monkeypatch, field
):
    projects = load_curated_projects()
    projects[0]["claim_sources"].pop(field, None)

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*claim_sources\.{field}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


def test_loader_rejects_unsupported_status(tmp_path, monkeypatch):
    projects = load_curated_projects()
    projects[0]["status"] = "Production"

    with pytest.raises(
        ProjectContentError,
        match=r"multi-channel-ai-messaging.*status",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize("field", ["type", "label", "title", "claim"])
def test_loader_rejects_omitted_evidence_fields(tmp_path, monkeypatch, field):
    projects = load_curated_projects()
    projects[0]["evidence"][0].pop(field)

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*evidence\[0\]\.{field}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize("collection", SOURCE_COLLECTIONS)
def test_loader_rejects_omitted_source_collections(tmp_path, monkeypatch, collection):
    projects = load_curated_projects()
    projects[0].pop(collection)

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*{collection}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize("collection", SOURCE_COLLECTIONS)
def test_loader_rejects_collection_items_without_sources(
    tmp_path, monkeypatch, collection
):
    projects = load_curated_projects()
    projects[0][collection][0].pop("source")

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*{collection}\[0\]\.source",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize(
    ("collection", "field"),
    [
        (collection, field)
        for collection, fields in SOURCE_COLLECTION_SCHEMAS.items()
        for field in fields
    ],
)
def test_loader_rejects_every_omitted_nested_collection_field(
    tmp_path, monkeypatch, collection, field
):
    projects = load_curated_projects()
    projects[0][collection][0].pop(field)

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*{collection}\[0\]\.{field}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize(
    ("collection", "field"),
    [
        (collection, field)
        for collection, fields in SOURCE_COLLECTION_SCHEMAS.items()
        for field in fields
    ],
)
def test_loader_rejects_blank_nested_collection_text(
    tmp_path, monkeypatch, collection, field
):
    projects = load_curated_projects()
    projects[0][collection][0][field] = "   "

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*{collection}\[0\]\.{field}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


@pytest.mark.parametrize(
    ("field", "malformed_value"),
    [
        ("status", []),
        ("status", {}),
        ("evidence[0].type", []),
        ("evidence[0].type", {}),
    ],
)
def test_loader_wraps_malformed_status_and_evidence_types(
    tmp_path, monkeypatch, field, malformed_value
):
    projects = load_curated_projects()
    if field == "status":
        projects[0]["status"] = malformed_value
    else:
        projects[0]["evidence"][0]["type"] = malformed_value

    with pytest.raises(
        ProjectContentError,
        match=rf"multi-channel-ai-messaging.*{re.escape(field)}",
    ):
        _load_from(tmp_path, monkeypatch, projects)


def test_registry_read_failures_are_logged_without_raw_content(tmp_path, monkeypatch, caplog):
    monkeypatch.setattr(project_content, "REGISTRY_PATH", tmp_path / "missing.json")
    project_content._load_registry.cache_clear()

    with caplog.at_level(logging.ERROR, logger=project_content.__name__):
        with pytest.raises(ProjectContentError, match="unable to read"):
            load_curated_projects()

    assert "registry read failed" in caplog.text
    assert "missing.json" not in caplog.text


def test_registry_json_failures_are_logged_without_raw_content(tmp_path, monkeypatch, caplog):
    registry_path = tmp_path / "projects.json"
    registry_path.write_text('{"private": "RAW_REGISTRY_SENTINEL",}', encoding="utf-8")
    monkeypatch.setattr(project_content, "REGISTRY_PATH", registry_path)
    project_content._load_registry.cache_clear()

    with caplog.at_level(logging.ERROR, logger=project_content.__name__):
        with pytest.raises(ProjectContentError, match="invalid JSON"):
            load_curated_projects()

    assert "registry JSON parsing failed" in caplog.text
    assert "RAW_REGISTRY_SENTINEL" not in caplog.text


def test_registry_validation_failures_log_safe_slug_and_field(
    tmp_path, monkeypatch, caplog
):
    projects = load_curated_projects()
    projects[0]["description"] = "RAW_REGISTRY_SENTINEL"
    projects[0].pop("title")
    projects[0]["claim_sources"].pop("title", None)

    with caplog.at_level(logging.ERROR, logger=project_content.__name__):
        with pytest.raises(ProjectContentError, match="multi-channel-ai-messaging.*title"):
            _load_from(tmp_path, monkeypatch, projects)

    assert "registry validation failed" in caplog.text
    assert "multi-channel-ai-messaging" in caplog.text
    assert "title" in caplog.text
    assert "RAW_REGISTRY_SENTINEL" not in caplog.text


def test_registry_validation_hides_registry_controlled_keys(
    tmp_path, monkeypatch, caplog
):
    private_field = "PRIVATE_FIELD_SENTINEL"
    projects = load_curated_projects()
    projects[0]["claim_sources"][private_field] = ["private/source.txt"]

    with caplog.at_level(logging.ERROR, logger=project_content.__name__):
        with pytest.raises(ProjectContentError, match="claim_sources") as error_info:
            _load_from(tmp_path, monkeypatch, projects)

    assert private_field not in str(error_info.value)
    assert private_field not in caplog.text


def test_disputed_project_claims_have_precise_wording_and_sources():
    projects = {project["slug"]: project for project in load_curated_projects()}

    messaging = projects["multi-channel-ai-messaging"]
    queue_node = next(item for item in messaging["architecture"] if "BullMQ" in item["label"])
    assert queue_node["label"] == "BullMQ queues"
    assert "workers" not in queue_node["relationship"].lower()
    rate_controls = [
        item for item in messaging["security_decisions"] if "traffic" in item["risk"].lower()
    ]
    assert {item["source"] for item in rate_controls} == {
        "backend/src/app.ts",
        "backend/src/middleware/rateLimiter.ts",
    }

    nepse = projects["nepse-market-intelligence"]
    price_node = next(item for item in nepse["architecture"] if item["label"] == "Price ingestion")
    sentiment_node = next(
        item for item in nepse["architecture"] if item["label"] == "News sentiment"
    )
    assert price_node["source"] == "src/data_ingest.py"
    assert sentiment_node["source"] == "src/news_sentiment.py"
    assert {"generated", "rule-based"} <= set(sentiment_node["relationship"].lower().split())

    runpod = projects["runpod-media-orchestrator"]
    channel_node = next(
        item for item in runpod["architecture"] if item["label"] == "Channel selection"
    )
    prompt_node = next(
        item for item in runpod["architecture"] if item["label"] == "Prompt assembly"
    )
    assert channel_node["source"] == "channel_manager.py"
    assert prompt_node["source"] == "prompt_generator.py"


@pytest.mark.parametrize(
    "mutation",
    [
        lambda project: project.pop("title"),
        lambda project: project.update(slug="Not Kebab Case"),
        lambda project: project["evidence"][0].update(type="binary"),
        lambda project: project.update(repository_url="javascript:alert(1)"),
        lambda project: project.update(image_url="../private/capture.png"),
        lambda project: project["evidence"][0].update(label="C:/private/source.py"),
        lambda project: project["evidence"][0].update(excerpt="API_KEY=unsafe"),
    ],
)
def test_loader_rejects_invalid_registry_entries(tmp_path, monkeypatch, mutation):
    projects = load_curated_projects()
    mutation(projects[0])

    with pytest.raises(ProjectContentError):
        _load_from(tmp_path, monkeypatch, projects)


def test_loader_rejects_duplicate_slugs(tmp_path, monkeypatch):
    projects = load_curated_projects()
    projects[1]["slug"] = projects[0]["slug"]

    with pytest.raises(ProjectContentError, match="duplicate slug"):
        _load_from(tmp_path, monkeypatch, projects)
