from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import tensorflow as tf
import pickle
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from database import SessionLocal, User, Review, hash_password

try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('stopwords')
    nltk.download('wordnet')

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class ReviewRequest(BaseModel):
    email: EmailStr
    text: str

class ReviewResponse(BaseModel):
    sentiment: str
    confidence: float
    message: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    email: str = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ReviewPredictor:
    def __init__(self, model_path='saved_model'):
        self.model = tf.keras.models.load_model(f'{model_path}/hotel_review_model_improved.h5')
        with open(f'{model_path}/tokenizer.pkl', 'rb') as handle:
            self.tokenizer = pickle.load(handle)
        with open(f'{model_path}/max_seq_length.pkl', 'rb') as handle:
            self.max_seq_length = pickle.load(handle)
        with open(f'{model_path}/best_thresh.pkl', 'rb') as handle:
            self.best_thresh = pickle.load(handle)
        
        self.lemmatizer = WordNetLemmatizer()
        nltk_stopwords = set(stopwords.words("english"))
        negations = {"no", "not", "never", "nor", "none", "nothing", "nowhere", "cannot", "n't", "cannot", "couldn't", "wouldn't", "shouldn't", "haven't", "hasn't", "hadn't", "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "won't", "wouldn't"}
        self.stopwords_filtered = nltk_stopwords - negations

        self.contractions = {
            "n't": " not", "don't": "do not", "didn't": "did not", "isn't": "is not",
            "can't": "can not", "won't": "will not", "it's": "it is", "i'm": "i am",
            "they're": "they are", "we're": "we are", "you're": "you are", "i've": "i have",
            "i'd": "i would", "i'll": "i will", "that's": "that is", "there's": "there is",
            "wasn't": "was not", "weren't": "were not", "haven't": "have not",
            "hasn't": "has not", "hadn't": "had not", "doesn't": "does not",
            "couldn't": "could not", "wouldn't": "would not", "shouldn't": "should not"
        }

        self.emoji_map = {
            "😞": " sad ", "😢": " sad ", "😭": " sad ", "😔": " sad ",
            "😡": " angry ", "😠": " angry ", "🤬": " angry ",
            "🙂": " happy ", "😊": " happy ", "😄": " happy ", "😃": " happy ", "😁": " happy ",
            "😍": " love ", "❤️": " love ", "💕": " love ",
            "🤢": " disgust ", "🤮": " disgust ", "😷": " sick ",
            "😴": " tired ", "😫": " tired ", "😩": " tired "
        }

    def expand_contractions_and_emojis(self, text):
        if not isinstance(text, str):
            text = str(text)
        text = text.lower()
        for emo, rep in self.emoji_map.items():
            text = text.replace(emo, rep)
        for k, v in self.contractions.items():
            text = text.replace(k, v)
        return text

    def process_text(self, text):
        text = self.expand_contractions_and_emojis(text)
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'\d+', ' ', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        words = text.split()
        processed_words = []
        for word in words:
            if word not in self.stopwords_filtered:
                lemma = self.lemmatizer.lemmatize(word)
                processed_words.append(lemma)
        return ' '.join(processed_words)

    def predict_sentiment(self, text):
        processed = self.process_text(text)
        seq = self.tokenizer.texts_to_sequences([processed])
        padded = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=self.max_seq_length, padding='post')
        prob = float(self.model.predict(padded, verbose=0)[0][0])
        
        if prob > self.best_thresh:
            sentiment = "POSITIVE"
            confidence = prob
        else:
            sentiment = "NEGATIVE"
            confidence = 1.0 - prob
            
        return sentiment, confidence

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","https://fuzzy-lamp-r4r9xqv6p66q3pgqq-5173.app.github.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = ReviewPredictor()

@app.get("/")
async def root():
    return {"status": "ready"}

@app.post("/signup", response_model=AuthResponse)
@app.post("/signup/")
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = hash_password(request.password)
    new_user = User(email=request.email, password=hashed_pw)
    db.add(new_user)
    db.commit()
    return AuthResponse(success=True, message="Account created successfully!", email=request.email)

@app.post("/login", response_model=AuthResponse)
@app.post("/login/")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please sign up.")
    hashed_pw = hash_password(request.password)
    if user.password != hashed_pw:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return AuthResponse(success=True, message="Login successful!", email=user.email)

@app.post("/analyze", response_model=ReviewResponse)
@app.post("/analyze/")
async def analyze_review(request: ReviewRequest, db: Session = Depends(get_db)):
    sentiment, confidence = predictor.predict_sentiment(request.text)
    new_review = Review(
        user_email=request.email,
        review_text=request.text,
        sentiment=sentiment,
        confidence=confidence
    )
    db.add(new_review)
    db.commit()
    return ReviewResponse(
        sentiment=sentiment,
        confidence=confidence,
        message=f"Review analyzed! Sentiment: {sentiment} (Confidence: {(confidence*100):.2f}%)"
    )