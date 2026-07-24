# Portfolio AI/ML Backend

A small Flask API serving real, trained scikit-learn models behind the
four "Live Demo" widgets on the portfolio site:

| Project | Endpoint | Model type |
|---|---|---|
| Car Price Prediction | `POST /api/car-price` | Linear Regression |
| Vehicle Performance Analysis | `POST /api/vehicle-performance` | SGD Regression (matches the project write-up) |
| TriSenseMind (text mode) | `POST /api/text-emotion` | TF-IDF + Logistic Regression |
| Fake Product Detector | `POST /api/fake-product` | EAN-13/UPC checksum (deterministic) + Logistic Regression |

## About the training data

The original projects were trained on real datasets (Quikr car
listings, Auto-MPG-style specs, your own labeled text/product data)
that aren't included in this zip. Each `models/train_*.py` script
instead generates a synthetic-but-realistic dataset using the same
relationships described in your project write-ups, and trains a real
model on it — so the API returns genuine model predictions, not
hardcoded values. Once you have your real cleaned datasets, drop them
in and point the relevant training script at the CSV instead — the
Flask API doesn't need any changes.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# train all four models (creates the .pkl files in models/)
python models/train_car_price.py
python models/train_vehicle_perf.py
python models/train_trisense_text.py
python models/train_fake_product.py

# start the API
python app.py
```

The API listens on `http://localhost:5000`.

## Connecting the frontend

`js/ai-demo.js` already tries `http://localhost:5000` first for every
demo, and silently falls back to an in-browser simulation if the API
isn't reachable — so the site works fine even with the backend off.

Once your backend is running (locally or deployed), just open
`index.html` normally: each demo panel will automatically show
**"Live model (backend)"** in its result instead of **"Simulated
(backend offline)"**.

To point at a deployed backend instead of localhost, change this line
near the top of `js/ai-demo.js`:

```js
const API_BASE = "http://localhost:5000";
```

to your deployed URL, e.g. `"https://your-api.onrender.com"`.

## Deploying

Any Python host works (Render, Railway, PythonAnywhere, Fly.io,
a VPS with gunicorn, etc.). Free-tier options:

- **Render** — new Web Service, build command
  `pip install -r requirements.txt && python models/train_car_price.py && python models/train_vehicle_perf.py && python models/train_trisense_text.py && python models/train_fake_product.py`,
  start command `gunicorn app:app`. Add `gunicorn` to
  `requirements.txt` for production.
- **Railway** — similar, auto-detects Flask.

Remember to update `API_BASE` in `js/ai-demo.js` (and CORS origin in
`app.py` if you want to lock it down from `*` to your actual site
domain) once deployed.

## Testing endpoints directly

```bash
curl -X POST http://localhost:5000/api/car-price \
  -H "Content-Type: application/json" \
  -d '{"company":"Honda","fuel_type":"Petrol","year":2018,"kms_driven":45000}'
```
