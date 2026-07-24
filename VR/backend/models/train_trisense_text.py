"""
Trains the TriSenseMind TEXT-EMOTION classifier (the text-analysis
mode of the multimodal Voice + Text + Face project).

NOTE ON DATA: The original project's voice and facial-expression
models need audio/image datasets that can't be regenerated here. This
script instead builds a small labeled sentence dataset for the TEXT
channel and trains a real scikit-learn TF-IDF + Logistic Regression
classifier on it -- a genuine, retrainable model rather than a keyword
lookup. Add more labeled examples to SENTENCES below (or load your own
CSV of text,label rows) and re-run to improve it.
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

SENTENCES = [
    ("I am so excited about my new internship!", "Happy"),
    ("This is the best day of my life", "Happy"),
    ("I love spending time with my family", "Happy"),
    ("We won the hackathon, I'm thrilled", "Happy"),
    ("I'm so proud of what I built", "Happy"),
    ("Feeling great after finishing the project", "Happy"),
    ("What a wonderful surprise, thank you!", "Happy"),
    ("I got the job offer, I am overjoyed", "Happy"),
    ("This song makes me so happy", "Happy"),
    ("I'm grateful and glad things worked out", "Happy"),

    ("I feel so sad and lonely today", "Sad"),
    ("I miss my friends a lot", "Sad"),
    ("This news broke my heart", "Sad"),
    ("I am really disappointed in myself", "Sad"),
    ("Nothing feels right anymore, I'm down", "Sad"),
    ("I failed the exam and I feel terrible", "Sad"),
    ("I've been crying all night", "Sad"),
    ("Losing my pet was heartbreaking", "Sad"),
    ("I feel empty and unmotivated", "Sad"),
    ("It hurts to think about what happened", "Sad"),

    ("I am so angry right now", "Angry"),
    ("This is absolutely infuriating", "Angry"),
    ("Stop annoying me, I've had enough", "Angry"),
    ("I hate when people are late", "Angry"),
    ("He completely ruined my day, I'm furious", "Angry"),
    ("I'm so frustrated with this project", "Angry"),
    ("They lied to me and I'm mad about it", "Angry"),
    ("This traffic makes me irritated every day", "Angry"),
    ("I can't believe how rude that was", "Angry"),
    ("I'm boiling with rage after that call", "Angry"),

    ("I'm really scared about the interview tomorrow", "Fear"),
    ("I'm so nervous I can't sleep", "Fear"),
    ("This deadline is making me anxious", "Fear"),
    ("I'm worried about my exam results", "Fear"),
    ("The dark alley made me feel afraid", "Fear"),
    ("I panic whenever I have to speak in public", "Fear"),
    ("I'm stressed about the upcoming presentation", "Fear"),
    ("What if everything goes wrong, I'm terrified", "Fear"),
    ("I feel uneasy about this decision", "Fear"),
    ("My hands are shaking, I'm so nervous", "Fear"),

    ("The meeting is scheduled for 10 AM tomorrow", "Neutral"),
    ("I went to the store to buy groceries", "Neutral"),
    ("The report is due next Friday", "Neutral"),
    ("Please find the attached document", "Neutral"),
    ("The weather today is partly cloudy", "Neutral"),
    ("I need to update the spreadsheet", "Neutral"),
    ("The train arrives at platform two", "Neutral"),
    ("Let's review the agenda for the call", "Neutral"),
    ("The office is closed on public holidays", "Neutral"),
    ("I have a class at 3 PM today", "Neutral"),
]

df = pd.DataFrame(SENTENCES, columns=["text", "emotion"])

X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["emotion"], test_size=0.25, random_state=1, stratify=df["emotion"]
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
    ("clf", LogisticRegression(max_iter=1000))
])

model.fit(X_train, y_train)

preds = model.predict(X_test)
print(classification_report(y_test, preds))

out_path = os.path.join(os.path.dirname(__file__), "trisense_text_model.pkl")
joblib.dump(model, out_path)
print("Saved model to", out_path)
