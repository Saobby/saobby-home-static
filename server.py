from flask import *
import os

app = Flask(__name__)


@app.route("/")
def index():
    return send_file("index.html")


@app.route("/<path:path>")
def file(path):
    if os.path.isfile(path):
        return send_file(path)
    if path[-1] == "/":
        path_ = path + "index.html"
    else:
        path_ = path + "/index.html"
    if os.path.isfile(path_):
        return send_file(path_)
    return abort(404)


if __name__ == "__main__":
    app.run(port=14514, debug=True)
