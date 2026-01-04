# Civic Engagement Platform (Streamlit Version)

This is a single-file Streamlit application designed for the "War Room 2026" campaign.

## Features
- **Dashboard (War Room)**: Real-time overview of vote swings and critical areas.
- **Data Entry (Ground War)**: Field team reporting tool.
- **Social Monitor (Air War)**: Competitor tracking and sentiment analysis.
- **Crisis Alert**: Emergency reporting system.

## Setup & Run

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the App**:
   ```bash
   streamlit run app.py
   ```

3. **Login**:
   - Password: `admin123`

## Structure
- `app.py`: The main application code.
- `requirements.txt`: Python package dependencies.

## Note
This version uses mock data (pandas DataFrames) to simulate a database connection for demonstration purposes.
