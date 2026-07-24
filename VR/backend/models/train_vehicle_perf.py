"""
Trains the Vehicle Performance / fuel-efficiency model.

NOTE ON DATA: The original project used the classic Auto-MPG-style
dataset (origin, cylinders, displacement, horsepower, weight,
acceleration -> fuel economy). That raw CSV isn't bundled here, so this
script generates a synthetic-but-realistic dataset with the same
relationships and trains a real scikit-learn SGDRegressor on it
(matching the "SGD Regression model" described in the project), with
StandardScaler feature scaling as described. Swap in your own cleaned
CSV and re-run this script to use the real data instead.
"""

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import SGDRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
import joblib
import os

RNG = np.random.default_rng(7)

ORIGINS = ["Asia", "Europe", "USA"]
ORIGIN_BONUS = {"Asia": 2.0, "Europe": 1.0, "USA": 0.0}

N = 4000
rows = []
for _ in range(N):
    cylinders = int(RNG.choice([3, 4, 5, 6, 8]))
    displacement = float(RNG.integers(700, 6000))
    horsepower = float(RNG.integers(45, 400))
    weight = float(RNG.integers(750, 2600))
    acceleration = round(float(RNG.uniform(5, 22)), 1)
    origin = RNG.choice(ORIGINS)

    efficiency = (
        30
        - (displacement / 1000) * 2.2
        - (weight / 1000) * 3.4
        - (horsepower / 60)
        - (cylinders * 0.4)
        + (acceleration * 0.25)
        + ORIGIN_BONUS[origin]
    )
    efficiency += RNG.normal(0, 1.2)
    efficiency = float(np.clip(efficiency, 3, 26))

    rows.append([cylinders, displacement, horsepower, weight, acceleration, origin, round(efficiency, 2)])

df = pd.DataFrame(rows, columns=[
    "cylinders", "displacement", "horsepower", "weight", "acceleration", "origin", "km_per_l"
])

X = df[["cylinders", "displacement", "horsepower", "weight", "acceleration", "origin"]]
y = df["km_per_l"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=7)

numeric_features = ["cylinders", "displacement", "horsepower", "weight", "acceleration"]
categorical_features = ["origin"]

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), numeric_features),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
])

model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", SGDRegressor(max_iter=2000, tol=1e-3, random_state=7))
])

model.fit(X_train, y_train)

preds = model.predict(X_test)
print("Vehicle Perf Model — MAE:", round(mean_absolute_error(y_test, preds), 3))
print("Vehicle Perf Model — RMSE:", round(root_mean_squared_error(y_test, preds), 3))
print("Vehicle Perf Model — R2:", round(r2_score(y_test, preds), 3))

out_path = os.path.join(os.path.dirname(__file__), "vehicle_perf_model.pkl")
joblib.dump(model, out_path)
print("Saved model to", out_path)
