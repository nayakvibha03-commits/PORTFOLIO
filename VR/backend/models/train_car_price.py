"""
Trains the Car Price Prediction model.

NOTE ON DATA: The original project was trained on real Quikr car-listing
data (see the portfolio project description). That raw CSV isn't bundled
in this repo, so this script generates a synthetic-but-realistic dataset
using the same underlying pricing logic (brand base price, age
depreciation, mileage depreciation, fuel-type adjustment) plus random
noise, and trains a real scikit-learn model on it. Swap in your own
cleaned Quikr CSV (columns: company, year, kms_driven, fuel_type, price)
and re-run this script to use the real data instead.
"""

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

RNG = np.random.default_rng(42)

COMPANIES = ["Maruti", "Hyundai", "Honda", "Toyota", "Mahindra", "Ford", "Tata"]
FUELS = ["Petrol", "Diesel", "CNG", "LPG"]

BASE_PRICE = {  # in INR lakhs, new-car ballpark
    "Maruti": 4.5, "Hyundai": 5.5, "Honda": 6.0,
    "Toyota": 7.5, "Mahindra": 8.0, "Ford": 5.0, "Tata": 4.8
}

FUEL_ADJ = {"Petrol": 0.0, "Diesel": 0.05, "CNG": -0.03, "LPG": -0.04}

N = 4000
rows = []
for _ in range(N):
    company = RNG.choice(COMPANIES)
    fuel = RNG.choice(FUELS)
    year = int(RNG.integers(2005, 2026))
    kms = float(RNG.integers(500, 180000))

    base = BASE_PRICE[company]
    age = 2026 - year
    price = base - (base * 0.06 * age) - ((kms / 100000) * base * 0.15) + FUEL_ADJ[fuel]
    price += RNG.normal(0, 0.25)  # noise
    price = max(price, base * 0.10)

    rows.append([company, year, kms, fuel, round(price, 2)])

df = pd.DataFrame(rows, columns=["company", "year", "kms_driven", "fuel_type", "price"])

X = df[["company", "year", "kms_driven", "fuel_type"]]
y = df["price"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["company", "fuel_type"]),
], remainder="passthrough")

model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", LinearRegression())
])

model.fit(X_train, y_train)

preds = model.predict(X_test)
print("Car Price Model — MAE (lakh):", round(mean_absolute_error(y_test, preds), 3))
print("Car Price Model — R2:", round(r2_score(y_test, preds), 3))

out_path = os.path.join(os.path.dirname(__file__), "car_price_model.pkl")
joblib.dump(model, out_path)
print("Saved model to", out_path)
