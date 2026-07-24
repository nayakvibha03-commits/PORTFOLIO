"""
Trains the Fake Product Detector's authenticity classifier.

The barcode check itself (EAN-13/UPC-A checksum) is a deterministic,
verifiable algorithm and is implemented directly in app.py -- it
doesn't need "training". This script trains the secondary ML signal
that combines the barcode-validity flag with listing-text features
(title length, presence of risk keywords like "replica"/"first copy")
to produce an overall authenticity probability, on a synthetic labeled
dataset with the same structure your real product-history data would
have. Swap in your real logged detections (barcode_valid, name_length,
has_risk_word -> is_genuine) and re-run to use real data instead.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

RNG = np.random.default_rng(3)

N = 3000
rows = []
for _ in range(N):
    barcode_valid = RNG.random() < 0.6
    name_length = int(RNG.integers(5, 60))
    has_risk_word = RNG.random() < 0.25

    # ground truth generation process (what we're trying to learn)
    genuine_prob = 0.85 if barcode_valid else 0.25
    if has_risk_word:
        genuine_prob -= 0.45
    if name_length < 10:
        genuine_prob -= 0.05
    genuine_prob = np.clip(genuine_prob, 0.02, 0.98)

    is_genuine = int(RNG.random() < genuine_prob)
    rows.append([int(barcode_valid), name_length, int(has_risk_word), is_genuine])

df = pd.DataFrame(rows, columns=["barcode_valid", "name_length", "has_risk_word", "is_genuine"])

X = df[["barcode_valid", "name_length", "has_risk_word"]]
y = df["is_genuine"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=3)

model = LogisticRegression()
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(classification_report(y_test, preds))

out_path = os.path.join(os.path.dirname(__file__), "fake_product_model.pkl")
joblib.dump(model, out_path)
print("Saved model to", out_path)
