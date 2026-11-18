# AI Career Recommendation System 🚀

An intelligent web application that analyzes a user's skills, interests, and educational background to recommend personalized career paths. The system leverages Machine Learning to predict the best-fit careers and provides a detailed skill-gap analysis so users know exactly what they need to learn to achieve their goals.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Machine Learning**: Scikit-learn, Pandas, Joblib

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Vanilla CSS (Custom Dark Mode with Glassmorphism)
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## ⚙️ Setup Instructions

### 1. Backend Setup

1. **Navigate to the project root**:
   Ensure you are in the `AI-Career-Recommendation` folder.
   
2. **Configure the Database**:
   Create a `.env` file in the root directory (you can copy `.env.example`). Update it with your PostgreSQL credentials:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
   MODEL_DIR=models/
   APP_VERSION=1.0.0
   ```
   *(Note: If your password contains special characters like `@`, ensure it is URL-encoded, e.g., `%40`)*

3. **Install Dependencies**:
   It is recommended to use a virtual environment.
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Server**:
   ```bash
   uvicorn backend.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`. You can view the auto-generated API documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The frontend UI will be available at `http://localhost:5173`.

---

## 🌟 Key Features

- **Comprehensive Candidate Assessment Module**: Developed with React.js to gather candidate profiles across 5 essential dimensions: education level, previous course, specialization, technical skills, and personal interests.
- **Personalized ML & Hybrid Inference**: Generates Top 5 career recommendations in the Career Matcher using a 70% Random Forest classifier probability + 30% domain interest alignment score.
- **Skill Gap Analysis**: Compares the user's current skills against industry requirements to highlight **Matching Skills** and **Missing Skills** to learn.
- **Interactive UI**: A dynamic, responsive interface with real-time autocomplete suggestions, tag management, and expandable progress cards.

---

## 📁 Project Structure

- `/backend`: FastAPI application, routes, Pydantic schemas, and ML inference services.
- `/frontend`: React application, UI components, and global CSS design system.
- `/data`: Datasets and processed knowledge bases for skills and careers.
- `/models`: Saved `.pkl` files containing the trained Machine Learning models.
- `/tests`: Pytest configuration and test scripts.
- `/notebooks`: Jupyter Notebooks used for initial data exploration and model training.
