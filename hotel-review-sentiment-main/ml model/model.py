import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
import pickle
import os
from sklearn.utils import resample
from sklearn.metrics import f1_score, classification_report, confusion_matrix, precision_score, recall_score
import json

nltk.download('stopwords')
nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()
nltk_stopwords = set(stopwords.words("english"))
negations = {"no", "not", "never", "nor", "none", "nothing", "nowhere", "cannot", "n't", "cannot", "couldn't", "wouldn't", "shouldn't", "haven't", "hasn't", "hadn't", "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "won't", "wouldn't"}
stopwords_filtered = nltk_stopwords - negations

contractions = {
    "n't": " not", "don't": "do not", "didn't": "did not", "isn't": "is not",
    "can't": "can not", "won't": "will not", "it's": "it is", "i'm": "i am",
    "they're": "they are", "we're": "we are", "you're": "you are", "i've": "i have",
    "i'd": "i would", "i'll": "i will", "that's": "that is", "there's": "there is",
    "wasn't": "was not", "weren't": "were not", "haven't": "have not",
    "hasn't": "has not", "hadn't": "had not", "doesn't": "does not",
    "couldn't": "could not", "wouldn't": "would not", "shouldn't": "should not"
}

emoji_map = {
    "😞": " sad ", "😢": " sad ", "😭": " sad ", "😔": " sad ",
    "😡": " angry ", "😠": " angry ", "🤬": " angry ",
    "🙂": " happy ", "😊": " happy ", "😄": " happy ", "😃": " happy ", "😁": " happy ",
    "😍": " love ", "❤️": " love ", "💕": " love ",
    "🤢": " disgust ", "🤮": " disgust ", "😷": " sick ",
    "😴": " tired ", "😫": " tired ", "😩": " tired "
}

def expand_contractions_and_emojis(text):
    if not isinstance(text, str):
        text = str(text)
    text = text.lower()
    for emo, rep in emoji_map.items():
        text = text.replace(emo, rep)
    for k, v in contractions.items():
        text = text.replace(k, v)
    return text

def improved_process_text(text):
    text = expand_contractions_and_emojis(text)
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'\d+', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    words = text.split()
    processed_words = []
    for word in words:
        if word not in stopwords_filtered:
            lemma = lemmatizer.lemmatize(word)
            processed_words.append(lemma)
    return ' '.join(processed_words)

data = pd.read_csv("tripadvisor_hotel_reviews.csv")
data['label'] = data['Rating'].apply(lambda x: 1 if x >= 4 else (0 if x <= 2 else -1))
data = data[data['label'] != -1]

pos = data[data['label'] == 1]
neg = data[data['label'] == 0]
min_size = min(len(pos), len(neg))
pos_balanced = resample(pos, replace=False, n_samples=min_size, random_state=42)
neg_balanced = resample(neg, replace=False, n_samples=min_size, random_state=42)
df_bal = pd.concat([pos_balanced, neg_balanced]).sample(frac=1, random_state=42).reset_index(drop=True)

df_bal['Review'] = df_bal['Review'].fillna('').astype(str).apply(improved_process_text)

num_words = 20000
tokenizer = Tokenizer(num_words=num_words, oov_token="<OOV>")
tokenizer.fit_on_texts(df_bal['Review'])
sequences = tokenizer.texts_to_sequences(df_bal['Review'])

seq_lengths = [len(seq) for seq in sequences]
max_seq_length = min(300, int(np.percentile(seq_lengths, 95)))
inputs = pad_sequences(sequences, maxlen=max_seq_length, padding='post', truncating='post')
labels = df_bal['label'].values

train_temp_inputs, test_inputs, train_temp_labels, test_labels = train_test_split(
    inputs, labels, train_size=0.70, random_state=100, stratify=labels
)

train_inputs, val_inputs, train_labels, val_labels = train_test_split(
    train_temp_inputs, train_temp_labels, train_size=0.80, random_state=100, stratify=train_temp_labels
)

def create_improved_model():
    inp = tf.keras.Input(shape=(max_seq_length,))
    x = tf.keras.layers.Embedding(
        input_dim=num_words, 
        output_dim=256,
        input_length=max_seq_length
    )(inp)
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True, dropout=0.2))(x)
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64, return_sequences=True, dropout=0.2))(x)
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(32, dropout=0.2))(x)
    x = tf.keras.layers.Dense(128, activation='relu')(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.5)(x)
    x = tf.keras.layers.Dense(64, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    x = tf.keras.layers.Dense(32, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    out = tf.keras.layers.Dense(1, activation='sigmoid')(x)
    model = tf.keras.Model(inp, out)
    return model

model = create_improved_model()

initial_learning_rate = 0.001
lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
    initial_learning_rate,
    decay_steps=1000,
    decay_rate=0.9,
    staircase=True
)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=lr_schedule),
    loss='binary_crossentropy',
    metrics=['accuracy', tf.keras.metrics.AUC(name='auc'), 
             tf.keras.metrics.Precision(name='precision'),
             tf.keras.metrics.Recall(name='recall')]
)

early_stopping = tf.keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True,
    min_delta=0.001
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.2,
    patience=3,
    min_lr=0.0001
)

batch_size = 150

history = model.fit(
    train_inputs,
    train_labels,
    validation_data=(val_inputs, val_labels),
    batch_size=batch_size,
    epochs=7,
    callbacks=[early_stopping, reduce_lr],
    verbose=1
)

test_loss, test_accuracy, test_auc, test_precision, test_recall = model.evaluate(test_inputs, test_labels)

val_preds = model.predict(val_inputs, verbose=0).ravel()
test_preds = model.predict(test_inputs, verbose=0).ravel()

def find_optimal_threshold(labels, preds):
    best_thresh = 0.5
    best_f1 = -1.0
    metrics_dict = {}
    for t in np.linspace(0.1, 0.9, 81):
        pred_labels = (preds > t).astype(int)
        f1 = f1_score(labels, pred_labels)
        precision = precision_score(labels, pred_labels)
        recall = recall_score(labels, pred_labels)
        metrics_dict[t] = {
            'f1': f1,
            'precision': precision,
            'recall': recall
        }
        if f1 > best_f1:
            best_f1 = f1
            best_thresh = t
    return best_thresh, best_f1, metrics_dict

best_thresh, best_f1, metrics_dict = find_optimal_threshold(val_labels, val_preds)

test_pred_labels = (test_preds > best_thresh).astype(int)

print("Classification Report on Test Set:")
print(classification_report(test_labels, test_pred_labels))
print("Confusion Matrix:")
print(confusion_matrix(test_labels, test_pred_labels))

os.makedirs('saved_model', exist_ok=True)
model.save('saved_model/hotel_review_model_improved.h5')

with open('saved_model/tokenizer.pkl', 'wb') as handle:
    pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)
    
with open('saved_model/max_seq_length.pkl', 'wb') as handle:
    pickle.dump(max_seq_length, handle, protocol=pickle.HIGHEST_PROTOCOL)
    
with open('saved_model/best_thresh.pkl', 'wb') as handle:
    pickle.dump(best_thresh, handle, protocol=pickle.HIGHEST_PROTOCOL)

metrics = {
    "test_accuracy": float(test_accuracy),
    "test_auc": float(test_auc),
    "test_precision": float(test_precision),
    "test_recall": float(test_recall),
    "best_threshold": float(best_thresh),
    "best_f1_score": float(best_f1)
}

with open("saved_model/metrics.json", "w") as f:
    json.dump(metrics, f, indent=4)

def predict_review_sentiment(text, threshold=None):
    if threshold is None:
        with open('saved_model/best_thresh.pkl','rb') as f:
            threshold = pickle.load(f)
    processed_text = improved_process_text(text)
    sequence = tokenizer.texts_to_sequences([processed_text])
    padded_sequence = pad_sequences(sequence, maxlen=max_seq_length, padding='post')
    prob = float(model.predict(padded_sequence, verbose=0)[0][0])
    label = "POSITIVE" if prob > threshold else "NEGATIVE"
    confidence = "high" if abs(prob - 0.5) > 0.3 else "medium" if abs(prob - 0.5) > 0.15 else "low"
    return {
        "sentiment": label,
        "probability": prob,
        "threshold": threshold,
        "confidence": confidence,
        "processed_text": processed_text
    }

test_reviews = [
    "This hotel was terrible! The room was dirty and the staff was rude.",
    "Amazing experience! Beautiful room and excellent service.",
    "The hotel was okay, nothing special but not bad either.",
    "I hated everything about this place. Worst hotel ever!",
    "Perfect location, friendly staff, would definitely stay again!"
]

print("\nTesting improved prediction:")
for review in test_reviews:
    result = predict_review_sentiment(review)
    print(f"Review: {review[:60]}...")
    print(f"Sentiment: {result['sentiment']} (prob: {result['probability']:.4f}, confidence: {result['confidence']})")
    print("---")