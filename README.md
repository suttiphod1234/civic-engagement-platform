# Civic Engagement Platform (Streamlit Version)

This is a comprehensive Streamlit application designed for the "War Room 2026" campaign with full data persistence and professional UI/UX.

## Features

### 🏠 War Room Dashboard
- Real-time campaign metrics (swing votes, critical zones, reports)
- Interactive charts (bar charts, pie charts)
- Recent activity feed

### 📍 Ground War (Field Operations)
- Field team reporting with data validation
- Zone and sub-district tracking
- Status indicators (Green/Yellow/Red)
- Swing vote estimation
- Persistent data storage in CSV
- Today's summary statistics

### 📱 Air War (Social Media)
- Social media monitoring across platforms
- Sentiment analysis tracking
- Competitor mention comparison
- Post logging with links and analysis

### 🚨 Crisis Alert
- Emergency incident reporting
- Severity levels (Low/Medium/High/Critical)
- Evidence upload capability
- Alert history log
- LINE Notify integration (mock)

### ⚙️ Admin Panel
- **Data Export**: Download all data as CSV files
- **User Management**: View user roles and access
- **Settings**: Configuration overview

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

## Data Storage

- Data is automatically saved to `campaign_data/` directory
- Files created:
  - `ground_war.csv` - Field reports
  - `social_war.csv` - Social media tracking
  - `crisis_alerts.csv` - Emergency incidents

## Features

- ✅ **Dark Mode UI**: Premium GitHub-style dark theme
- ✅ **Data Persistence**: CSV-based storage (upgradeable to Google Sheets)
- ✅ **Real-time Updates**: Instant data refresh
- ✅ **Export Functionality**: Download all data as CSV
- ✅ **Responsive Design**: Works on desktop and tablets
- ✅ **Form Validation**: Required field checks
- ✅ **Visual Analytics**: Interactive Plotly charts

## Project Structure

```
civic-engagement-platform/
├── app.py                 # Main application
├── requirements.txt       # Dependencies
├── campaign_data/         # Data storage (auto-created)
│   ├── ground_war.csv
│   ├── social_war.csv
│   └── crisis_alerts.csv
└── README.md             # This file
```

## Security Notes

⚠️ **Important**: Change the default password (`admin123`) before deploying to production!

## Deployment

This app can be deployed to:
- **Streamlit Cloud** (recommended)
- **Heroku**
- **AWS/GCP/Azure**
- **Local server**

For Streamlit Cloud deployment:
1. Push code to GitHub
2. Connect your GitHub repo to Streamlit Cloud
3. Deploy with one click

## Support

For issues or questions, contact the development team.
