import os

from flask import Flask, jsonify, redirect, request


CANONICAL_ORIGIN = os.environ.get(
    "CANONICAL_ORIGIN",
    "https://www.dhirendrayadav.site",
).rstrip("/")


def create_app():
    app = Flask(__name__)

    @app.get("/healthz")
    def healthz():
        response = jsonify(status="ok")
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
        return response

    @app.route("/", defaults={"path": ""}, methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    @app.route("/<path:path>", methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    def redirect_to_canonical(path):
        destination = f"{CANONICAL_ORIGIN}/{path}"
        if request.query_string:
            destination = f"{destination}?{request.query_string.decode('ascii')}"

        response = redirect(destination, code=308)
        response.headers["Cache-Control"] = "public, max-age=3600"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    return app


app = create_app()
