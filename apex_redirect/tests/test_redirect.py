from urllib.parse import urlsplit


def _load_app_factory():
    try:
        from apex_redirect.app import create_app
    except ModuleNotFoundError:
        return None
    return create_app


def test_redirect_service_exists():
    assert _load_app_factory() is not None, "apex redirect service is not implemented"


def test_apex_root_redirects_permanently_to_www():
    app = _load_app_factory()()
    response = app.test_client().get("/", base_url="https://dhirendrayadav.site")

    assert response.status_code == 308
    assert response.headers["Location"] == "https://www.dhirendrayadav.site/"


def test_redirect_preserves_path_and_query_string():
    app = _load_app_factory()()
    response = app.test_client().get(
        "/about?source=apex",
        base_url="https://dhirendrayadav.site",
    )

    location = urlsplit(response.headers["Location"])
    assert response.status_code == 308
    assert location.scheme == "https"
    assert location.netloc == "www.dhirendrayadav.site"
    assert location.path == "/about"
    assert location.query == "source=apex"


def test_health_check_does_not_redirect():
    app = _load_app_factory()()
    response = app.test_client().get("/healthz")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}
