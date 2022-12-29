from flask import *
import os

app = Flask(__name__)


@app.route("/<path:path>")
def file(path):
    print("/"+path)
    if os.path.isfile(path):
        return send_file(path)
    else:
        return abort(404)


if __name__ == "__main__":
    app.run(port=14514, debug=True)
