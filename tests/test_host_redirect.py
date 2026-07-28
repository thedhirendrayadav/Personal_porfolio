import app as portfolio_app


def test_generated_railway_hostname_redirects_to_canonical_host():
    client = portfolio_app.app.test_client()

    response = client.get(
        "/portfolio?source=railway",
        base_url="https://web-production-5da7d.up.railway.app",
    )

    assert response.status_code == 308
    assert response.headers["Location"] == (
        "https://www.dhirendrayadav.site/portfolio?source=railway"
    )
