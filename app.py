from flask import Flask, render_template, send_file, request, session, send_from_directory
from werkzeug.utils import secure_filename
from ai_engine import init_ai_engine, create_pixel_art
import uuid
import os

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html", session=session)


@app.route("/image/<image_id>")
def get_image(image_id):
    images_folder = "./generated"
    image_path = images_folder + "/" + image_id

    if os.path.isfile(image_path):
        return send_file(image_path)
    else:
        return "No image found", 404


@app.route("/generate_image", methods=["POST"])
def generate_image():
    original_image_save_path = "./static/original_images"
    generated_image_save_path = "./static/generated_images"

    if not os.path.exists(original_image_save_path):
        os.mkdir(original_image_save_path)

    if not os.path.exists(generated_image_save_path):
        os.mkdir(generated_image_save_path)

    if 'file' not in request.files:
        return "No file uploaded", 400

    file = request.files["file"]
    if not file:
        return "Invalid file", 400

    filename = secure_filename(file.filename.replace(".png", "") + "_" + str(uuid.uuid4()) + ".png")
    image_path = original_image_save_path + "/" + filename
    save_path = generated_image_save_path + "/" + filename

    file.save(original_image_save_path + "/" + filename)

    if "pixelart" in request.form and request.form["pixelart"]:
        init_ai_engine("ai_engine/models/latest_net_G_A.pth")
    else:
        init_ai_engine("ai_engine/models/latest_net_G_B.pth")

    create_pixel_art(image_path, save_path)

    return filename, 200


@app.route("/generated_image/<image_id>")
def generated_image(image_id):
    image_path = "generated_images/" + image_id
    if not os.path.isfile("./static/" + image_path):
        return "No image found", 404

    return render_template("generated_image.html", session=session, image_path=image_path)


@app.route("/colors", methods=["POST"])
def set_colors():
    if request.json:
        json = request.get_json()

        for key in json.keys():
            session[key] = json[key]

        return "Colors set succesfully", 200

    return "Invalid request", 400


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static/logo'), 'logo.png')


if __name__ == "__main__":
    app.config["SECRET_KEY"] = "3rewidsn21ndsap[2e[o[sakkc dalkn3qr3qr"
    app.run(debug=True)
