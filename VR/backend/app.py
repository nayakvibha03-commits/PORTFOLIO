"""
Portfolio backend API — serves real trained models for:
  1. Car Price Prediction        -> POST /api/car-price
  2. Vehicle Performance Analysis -> POST /api/vehicle-performance
  3. TriSenseMind (text emotion)  -> POST /api/text-emotion
  4. Fake Product Detector        -> POST /api/fake-product

Run locally:
    pip install -r requirements.txt
    python models/train_car_price.py
    python models/train_vehicle_perf.py
    python models/train_trisense_text.py
    python models/train_fake_product.py
    python app.py

Then it listens on http://localhost:5000
The frontend (js/ai-demo.js) will automatically call this API when it's
reachable, and silently falls back to its built-in in-browser
simulation if it isn't (e.g. when the site is opened as a static file
with no backend running).
"""

import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def load_model(filename):
    path = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(path):
        return None
    return joblib.load(path)


car_price_model = load_model("car_price_model.pkl")
vehicle_perf_model = load_model("vehicle_perf_model.pkl")
trisense_text_model = load_model("trisense_text_model.pkl")
fake_product_model = load_model("fake_product_model.pkl")


# ---------------------------------------------------------------
# Barcode checksum (EAN-13 / UPC-A) — deterministic, no ML needed
# ---------------------------------------------------------------
def is_valid_barcode(code: str) -> bool:
    if not code.isdigit():
        return False
    digits = code
    if len(digits) == 12:
        digits = "0" + digits  # UPC-A -> EAN-13
    if len(digits) != 13:
        return False
    nums = [int(d) for d in digits]
    check_digit = nums.pop()
    total = sum(d if i % 2 == 0 else d * 3 for i, d in enumerate(nums))
    calculated = (10 - (total % 10)) % 10
    return calculated == check_digit


RISK_WORDS = ["copy", "replica", "duplicate", "first copy", "fake", "mirror", "dupe", "unbranded clone"]


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "models_loaded": {
            "car_price": car_price_model is not None,
            "vehicle_performance": vehicle_perf_model is not None,
            "trisense_text": trisense_text_model is not None,
            "fake_product": fake_product_model is not None,
        }
    })


@app.route("/api/car-price", methods=["POST"])
def car_price():
    if car_price_model is None:
        return jsonify({"error": "Model not trained. Run models/train_car_price.py first."}), 503

    data = request.get_json(force=True)
    try:
        company = data["company"]
        fuel_type = data["fuel_type"]
        year = int(data["year"])
        kms_driven = float(data["kms_driven"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Missing or invalid fields. Expected company, fuel_type, year, kms_driven."}), 400

    X = pd.DataFrame([{
        "company": company, "year": year, "kms_driven": kms_driven, "fuel_type": fuel_type
    }])
    price_lakh = float(car_price_model.predict(X)[0])
    price_lakh = max(price_lakh, 0.2)

    return jsonify({
        "predicted_price_lakh": round(price_lakh, 2),
        "predicted_price_inr": round(price_lakh * 100000)
    })


@app.route("/api/vehicle-performance", methods=["POST"])
def vehicle_performance():
    if vehicle_perf_model is None:
        return jsonify({"error": "Model not trained. Run models/train_vehicle_perf.py first."}), 503

    data = request.get_json(force=True)
    try:
        cylinders = float(data["cylinders"])
        displacement = float(data["displacement"])
        horsepower = float(data["horsepower"])
        weight = float(data["weight"])
        acceleration = float(data["acceleration"])
        origin = data["origin"]
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Missing or invalid fields."}), 400

    X = pd.DataFrame([{
        "cylinders": cylinders, "displacement": displacement, "horsepower": horsepower,
        "weight": weight, "acceleration": acceleration, "origin": origin
    }])
    km_per_l = float(vehicle_perf_model.predict(X)[0])
    km_per_l = min(max(km_per_l, 3), 26)

    return jsonify({"predicted_km_per_l": round(km_per_l, 1)})


@app.route("/api/text-emotion", methods=["POST"])
def text_emotion():
    if trisense_text_model is None:
        return jsonify({"error": "Model not trained. Run models/train_trisense_text.py first."}), 503

    data = request.get_json(force=True)
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text field is required."}), 400

    probs = trisense_text_model.predict_proba([text])[0]
    classes = trisense_text_model.classes_
    best_idx = probs.argmax()

    return jsonify({
        "emotion": classes[best_idx],
        "confidence": round(float(probs[best_idx]) * 100, 1),
        "all_scores": {cls: round(float(p) * 100, 1) for cls, p in zip(classes, probs)}
    })


@app.route("/api/fake-product", methods=["POST"])
def fake_product():
    if fake_product_model is None:
        return jsonify({"error": "Model not trained. Run models/train_fake_product.py first."}), 503

    data = request.get_json(force=True)
    barcode = (data.get("barcode") or "").strip()
    name = (data.get("name") or "").strip()

    if not barcode:
        return jsonify({"error": "barcode field is required."}), 400

    barcode_valid = is_valid_barcode(barcode)
    has_risk_word = any(w in name.lower() for w in RISK_WORDS)
    name_length = len(name)

    X = pd.DataFrame([{
        "barcode_valid": int(barcode_valid),
        "name_length": name_length,
        "has_risk_word": int(has_risk_word)
    }])
    genuine_prob = float(fake_product_model.predict_proba(X)[0][1]) * 100

    if genuine_prob >= 65:
        verdict = "Likely Genuine"
    elif genuine_prob >= 40:
        verdict = "Suspicious — Verify Further"
    else:
        verdict = "Likely Fake"

    return jsonify({
        "verdict": verdict,
        "authenticity_score": round(genuine_prob),
        "barcode_valid": barcode_valid,
        "has_risk_word": has_risk_word
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
