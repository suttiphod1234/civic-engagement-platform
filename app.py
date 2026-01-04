import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import time
import random
import os
import base64

# --- CONFIGURATION & SETUP ---
st.set_page_config(
    page_title="War Room 2026",
    page_icon="🗳️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CUSTOM CSS (PREMIUM UI) ---
st.markdown("""
<style>
    /* Main Background & Text */
    .stApp {
        background-color: #0E1117;
        color: #FAFAFA;
    }
    
    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #161B22;
        border-right: 1px solid #30363D;
    }
    
    /* Headings */
    h1, h2, h3 {
        color: #58A6FF !important;
        font-family: 'Segoe UI', sans-serif;
    }
    
    /* Metrics Cards */
    [data-testid="stMetricValue"] {
        font-size: 2.5rem !important;
        color: #FAFAFA;
    }
    [data-testid="stMetricLabel"] {
        color: #8B949E;
    }
    
    /* Custom Card Container */
    .metric-card {
        background-color: #161B22;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #30363D;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        text-align: center;
    }
    
    /* Buttons */
    .stButton>button {
        background-color: #238636;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s;
    }
    .stButton>button:hover {
        background-color: #2EA043;
        box-shadow: 0 0 10px rgba(46, 160, 67, 0.5);
    }
    
    /* Alerts */
    .stAlert {
        background-color: #161B22;
        border: 1px solid #30363D;
        color: #FAFAFA;
    }
    
    /* Tables */
    .dataframe {
        font-size: 0.9rem;
    }
    
    /* Form styling */
    .stTextInput>div>div>input, .stTextArea>div>div>textarea, .stSelectbox>div>div>select {
        background-color: #161B22;
        color: #FAFAFA;
        border: 1px solid #30363D;
    }
</style>
""", unsafe_allow_html=True)

# --- DATA PERSISTENCE FUNCTIONS ---
DATA_DIR = "campaign_data"
os.makedirs(DATA_DIR, exist_ok=True)

def load_csv_data(filename):
    """Load data from CSV file"""
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        return pd.read_csv(filepath)
    return pd.DataFrame()

def save_csv_data(df, filename):
    """Save data to CSV file"""
    filepath = os.path.join(DATA_DIR, filename)
    df.to_csv(filepath, index=False)

def get_ground_data():
    """Get ground war data with persistence"""
    df = load_csv_data("ground_war.csv")
    if df.empty:
        # Initialize with sample data
        zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
        data = []
        for _ in range(10):
            data.append({
                'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'Zone': random.choice(zones),
                'Sub_District': f'Sub-{random.randint(1, 5)}',
                'Status': random.choice(['Green', 'Yellow', 'Red']),
                'Swing_Votes': random.randint(100, 1000),
                'Notes': 'Sample data',
                'Reporter': 'System'
            })
        df = pd.DataFrame(data)
        save_csv_data(df, "ground_war.csv")
    return df

def add_ground_entry(zone, sub_district, status, votes, notes, reporter):
    """Add new ground war entry"""
    df = get_ground_data()
    new_entry = pd.DataFrame([{
        'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'Zone': zone,
        'Sub_District': sub_district,
        'Status': status,
        'Swing_Votes': votes,
        'Notes': notes,
        'Reporter': reporter
    }])
    df = pd.concat([df, new_entry], ignore_index=True)
    save_csv_data(df, "ground_war.csv")
    return True

def get_social_data():
    """Get social media data"""
    df = load_csv_data("social_war.csv")
    if df.empty:
        platforms = ['Facebook', 'Twitter', 'TikTok', 'Instagram']
        data = []
        for _ in range(20):
            data.append({
                'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'Platform': random.choice(platforms),
                'Sentiment': random.choice(['Positive', 'Neutral', 'Negative']),
                'Our_Mentions': random.randint(50, 500),
                'Competitor_Mentions': random.randint(50, 500),
                'Post_Link': 'https://example.com',
                'Analysis': 'Sample analysis'
            })
        df = pd.DataFrame(data)
        save_csv_data(df, "social_war.csv")
    return df

def add_social_entry(platform, sentiment, our_mentions, comp_mentions, link, analysis):
    """Add new social media entry"""
    df = get_social_data()
    new_entry = pd.DataFrame([{
        'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'Platform': platform,
        'Sentiment': sentiment,
        'Our_Mentions': our_mentions,
        'Competitor_Mentions': comp_mentions,
        'Post_Link': link,
        'Analysis': analysis
    }])
    df = pd.concat([df, new_entry], ignore_index=True)
    save_csv_data(df, "social_war.csv")
    return True

def get_crisis_data():
    """Get crisis alerts data"""
    df = load_csv_data("crisis_alerts.csv")
    if df.empty:
        df = pd.DataFrame(columns=['Timestamp', 'Type', 'Severity', 'Location', 'Description', 'Reporter', 'Status'])
    return df

def add_crisis_entry(crisis_type, severity, location, description, reporter):
    """Add new crisis alert"""
    df = get_crisis_data()
    new_entry = pd.DataFrame([{
        'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'Type': crisis_type,
        'Severity': severity,
        'Location': location,
        'Description': description,
        'Reporter': reporter,
        'Status': 'Active'
    }])
    df = pd.concat([df, new_entry], ignore_index=True)
    save_csv_data(df, "crisis_alerts.csv")
    return True

# --- AUTHENTICATION ---
def check_password():
    """Returns `True` if the user had a correct password."""

    def password_entered():
        """Checks whether a password entered by the user is correct."""
        if st.session_state["password"] == "admin123":
            st.session_state["password_correct"] = True
            del st.session_state["password"]  # don't store password
        else:
            st.session_state["password_correct"] = False

    if "password_correct" not in st.session_state:
        # First run, show input for password.
        st.markdown("### 🔐 War Room Access")
        st.text_input(
            "Password (use 'admin123')", type="password", on_change=password_entered, key="password"
        )
        st.info("💡 Default password: admin123")
        return False
    elif not st.session_state["password_correct"]:
        # Password not correct, show input + error.
        st.text_input(
            "Password (use 'admin123')", type="password", on_change=password_entered, key="password"
        )
        st.error("😕 Password incorrect")
        return False
    else:
        # Password correct.
        return True

# --- LINE NOTIFY (MOCK) ---
def send_line_notify(message):
    # In a real app, you would use requests.post here with a token
    st.toast(f"🔔 LINE Notification: {message}", icon="✅")

# --- APP NAVIGATION & LOGIC ---
if check_password():
    # Sidebar
    st.sidebar.title("🗳️ Campaign 2026")
    st.sidebar.markdown(f"**User:** Admin | **Date:** {datetime.now().strftime('%Y-%m-%d')}")
    st.sidebar.divider()
    
    menu = st.sidebar.radio(
        "📍 Navigation",
        ["🏠 War Room (Dashboard)", "📍 Ground War (Data Entry)", "📱 Air War (Social)", "🚨 Crisis Alert", "⚙️ Admin"],
        label_visibility="collapsed"
    )

    # --- 1. WAR ROOM (Dashboard) ---
    if menu == "🏠 War Room (Dashboard)":
        st.title("🏠 Strategy War Room")
        st.markdown("<h3 style='color: #8B949E; margin-top: -20px;'>Real-time Campaign Overview</h3>", unsafe_allow_html=True)
        st.divider()

        ground_df = get_ground_data()
        
        # Top Metrics (Custom Styling)
        col1, col2, col3, col4 = st.columns(4)
        total_swing = ground_df['Swing_Votes'].sum()
        red_zones = ground_df[ground_df['Status'] == 'Red'].shape[0]
        total_entries = len(ground_df)
        
        col1.metric("🗳️ Total Swing Votes", f"{total_swing:,}", f"+{len(ground_df)} entries")
        col2.metric("🔥 Red Zones (Critical)", f"{red_zones}", "-2" if red_zones > 0 else "0", delta_color="inverse")
        col3.metric("⏳ Days Remaining", "28", "Final Stretch")
        col4.metric("📊 Total Reports", f"{total_entries}", "Updated")

        # Maps / Charts
        st.markdown("### 📊 Tactical Analysis")
        c1, c2 = st.columns((2, 1))
        
        with c1:
            # Styled Bar Chart
            fig_bar = px.bar(ground_df, x='Zone', y='Swing_Votes', color='Status', 
                             color_discrete_map={'Green': '#2EA043', 'Yellow': '#D29922', 'Red': '#F85149'},
                             title="Vote Swing by Zone", template="plotly_dark")
            fig_bar.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
            st.plotly_chart(fig_bar, use_container_width=True)

        with c2:
            # Styled Pie Chart
            fig_pie = px.pie(ground_df, names='Status', title="Risk Distribution",
                             color='Status',
                             color_discrete_map={'Green': '#2EA043', 'Yellow': '#D29922', 'Red': '#F85149'},
                             template="plotly_dark")
            fig_pie.update_layout(paper_bgcolor="rgba(0,0,0,0)")
            st.plotly_chart(fig_pie, use_container_width=True)
        
        # Recent Activity
        st.markdown("### 📋 Recent Field Reports")
        st.dataframe(ground_df.tail(10).sort_values('Timestamp', ascending=False), use_container_width=True, hide_index=True)

    # --- 2. GROUND WAR (Data Entry) ---
    elif menu == "📍 Ground War (Data Entry)":
        st.title("📍 Field Operation Center")
        st.markdown("<h3 style='color: #8B949E; margin-top: -20px;'>Ground Team Reporting</h3>", unsafe_allow_html=True)
        st.divider()
        
        col_form, col_preview = st.columns([1, 1])
        
        with col_form:
            with st.form("field_report", clear_on_submit=True):
                st.subheader("📝 Daily Field Report")
                
                c1, c2 = st.columns(2)
                with c1:
                    zone = st.selectbox("🗺️ Zone", ['Zone A', 'Zone B', 'Zone C', 'Zone D'])
                    sub_area = st.text_input("📍 Sub-District / Village", placeholder="Enter location...")
                    reporter = st.text_input("👤 Reporter Name", placeholder="Your name...")
                
                with c2:
                    status = st.selectbox("📊 Area Status", ['Green', 'Yellow', 'Red'])
                    est_votes = st.number_input("🗳️ Estimated Swing Votes", min_value=0, value=100, step=10)
                
                notes = st.text_area("📝 Observations / Issues", placeholder="Describe the situation, voter sentiment, issues encountered...")
                
                submitted = st.form_submit_button("✅ Submit Report", use_container_width=True)
                
                if submitted:
                    if sub_area and reporter:
                        add_ground_entry(zone, sub_area, status, est_votes, notes, reporter)
                        st.success("✅ Report Submitted Successfully!")
                        if status == 'Red':
                            send_line_notify(f"🚨 CRITICAL: Red Zone reported at {zone} - {sub_area}")
                        st.rerun()
                    else:
                        st.error("⚠️ Please fill in all required fields (Sub-District and Reporter Name)")
        
        with col_preview:
            st.subheader("📊 Today's Summary")
            ground_df = get_ground_data()
            today = datetime.now().strftime('%Y-%m-%d')
            today_data = ground_df[ground_df['Timestamp'].str.contains(today)]
            
            if not today_data.empty:
                st.metric("Reports Today", len(today_data))
                st.metric("Votes Counted", f"{today_data['Swing_Votes'].sum():,}")
                
                status_counts = today_data['Status'].value_counts()
                fig_mini = px.pie(values=status_counts.values, names=status_counts.index,
                                 color=status_counts.index,
                                 color_discrete_map={'Green': '#2EA043', 'Yellow': '#D29922', 'Red': '#F85149'},
                                 template="plotly_dark")
                fig_mini.update_layout(paper_bgcolor="rgba(0,0,0,0)", height=250)
                st.plotly_chart(fig_mini, use_container_width=True)
            else:
                st.info("No reports submitted today yet.")

        st.divider()
        st.subheader("📋 Recent Reports")
        ground_df = get_ground_data()
        st.dataframe(ground_df.tail(15).sort_values('Timestamp', ascending=False), use_container_width=True, hide_index=True)

    # --- 3. AIR WAR (Social) ---
    elif menu == "📱 Air War (Social)":
        st.title("📱 Social Media Warfare")
        st.markdown("<h3 style='color: #8B949E; margin-top: -20px;'>Digital Campaign Monitoring</h3>", unsafe_allow_html=True)
        st.divider()
        
        social_df = get_social_data()
        
        # Social Metrics
        m1, m2, m3, m4 = st.columns(4)
        total_our = social_df['Our_Mentions'].sum()
        total_comp = social_df['Competitor_Mentions'].sum()
        positive_pct = len(social_df[social_df['Sentiment'] == 'Positive']) / len(social_df) * 100 if len(social_df) > 0 else 0
        
        m1.metric("📈 Our Mentions", f"{total_our:,}", "Growing")
        m2.metric("👥 Competitor Mentions", f"{total_comp:,}", f"{total_comp - total_our:+,}")
        m3.metric("😊 Positive Sentiment", f"{positive_pct:.1f}%", "Good")
        m4.metric("📊 Total Posts Tracked", len(social_df), "Updated")

        # Charts
        c1, c2 = st.columns(2)
        with c1:
            st.subheader("📊 Mention Comparison")
            comparison_data = pd.DataFrame({
                'Category': ['Our Campaign', 'Competitors'],
                'Mentions': [total_our, total_comp]
            })
            fig_comp = px.bar(comparison_data, x='Category', y='Mentions',
                             color='Category',
                             color_discrete_map={'Our Campaign': '#2EA043', 'Competitors': '#F85149'},
                             template="plotly_dark")
            fig_comp.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
            st.plotly_chart(fig_comp, use_container_width=True)
        
        with c2:
            st.subheader("😊 Sentiment Analysis")
            sentiment_counts = social_df['Sentiment'].value_counts()
            fig_sent = px.pie(values=sentiment_counts.values, names=sentiment_counts.index,
                             color=sentiment_counts.index,
                             color_discrete_map={'Positive': '#2EA043', 'Neutral': '#D29922', 'Negative': '#F85149'},
                             template="plotly_dark")
            fig_sent.update_layout(paper_bgcolor="rgba(0,0,0,0)")
            st.plotly_chart(fig_sent, use_container_width=True)
        
        st.divider()
        st.subheader("➕ Add Social Media Entry")
        
        with st.form("social_form", clear_on_submit=True):
            sc1, sc2, sc3 = st.columns(3)
            with sc1:
                platform = st.selectbox("Platform", ["Facebook", "TikTok", "Twitter/X", "Instagram"])
                sentiment = st.selectbox("Sentiment", ["Positive", "Neutral", "Negative"])
            with sc2:
                our_mentions = st.number_input("Our Mentions", min_value=0, value=0)
                comp_mentions = st.number_input("Competitor Mentions", min_value=0, value=0)
            with sc3:
                link = st.text_input("Post Link", placeholder="https://...")
            
            analysis = st.text_area("Analysis / Notes", placeholder="Describe the post content, engagement, and strategic implications...")
            
            s_submit = st.form_submit_button("✅ Log Entry", use_container_width=True)
            if s_submit:
                if analysis:
                    add_social_entry(platform, sentiment, our_mentions, comp_mentions, link, analysis)
                    st.success("✅ Social media entry logged successfully!")
                    st.rerun()
                else:
                    st.error("⚠️ Please provide analysis notes")

        st.divider()
        st.subheader("📋 Recent Social Media Tracking")
        st.dataframe(social_df.tail(10).sort_values('Timestamp', ascending=False), use_container_width=True, hide_index=True)

    # --- 4. CRISIS ALERT ---
    elif menu == "🚨 Crisis Alert":
        st.title("🚨 Crisis Management Center")
        st.markdown("<h3 style='color: #8B949E; margin-top: -20px;'>Emergency Response System</h3>", unsafe_allow_html=True)
        st.divider()
        
        crisis_df = get_crisis_data()
        
        # Crisis Stats
        active_alerts = len(crisis_df[crisis_df['Status'] == 'Active'])
        
        col1, col2, col3 = st.columns(3)
        col1.metric("🚨 Active Alerts", active_alerts, "Monitoring")
        col2.metric("📊 Total Incidents", len(crisis_df), "Logged")
        col3.metric("⚡ Response Time", "< 2 hrs", "Target")
        
        st.divider()
        st.subheader("🆕 Report New Incident")
        
        with st.form("crisis_form", clear_on_submit=True):
            cc1, cc2 = st.columns(2)
            with cc1:
                c_type = st.selectbox("🔍 Issue Type", ["Vote Buying", "Fake News", "Physical Conflict", "Intimidation", "Other"])
                severity = st.selectbox("⚠️ Severity", ["Low", "Medium", "High", "Critical"])
            with cc2:
                location = st.text_input("📍 Location", placeholder="Specific location...")
                reporter = st.text_input("👤 Reporter", placeholder="Your name...")
            
            c_desc = st.text_area("📝 Incident Details", placeholder="Describe what happened, when, who was involved, and any evidence...")
            evidence = st.file_uploader("📎 Upload Evidence (Photo/Video)", type=['jpg', 'png', 'mp4', 'mov'])
            
            c_submit = st.form_submit_button("🚨 SUBMIT ALERT", use_container_width=True, type="primary")
            
            if c_submit:
                if c_desc and location and reporter:
                    add_crisis_entry(c_type, severity, location, c_desc, reporter)
                    st.error(f"🚨 ALERT SUBMITTED: {severity} severity {c_type} at {location}")
                    send_line_notify(f"🚨 RED ALERT: {c_type} ({severity}) at {location}. Reporter: {reporter}")
                    st.rerun()
                else:
                    st.error("⚠️ Please fill in all required fields")
        
        st.divider()
        st.subheader("📋 Alert History")
        if not crisis_df.empty:
            st.dataframe(crisis_df.sort_values('Timestamp', ascending=False), use_container_width=True, hide_index=True)
        else:
            st.info("No crisis alerts logged yet.")
        
        st.divider()
        st.info("📞 **Emergency Hotline:** 081-XXX-XXXX (24/7 Security Team)")

    # --- 5. ADMIN ---
    elif menu == "⚙️ Admin":
        st.title("⚙️ System Administration")
        st.markdown("<h3 style='color: #8B949E; margin-top: -20px;'>Data Management & Settings</h3>", unsafe_allow_html=True)
        st.divider()
        
        tab1, tab2, tab3 = st.tabs(["📊 Data Export", "👥 User Management", "⚙️ Settings"])
        
        with tab1:
            st.subheader("📥 Export Campaign Data")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown("**Ground War Data**")
                ground_df = get_ground_data()
                st.metric("Total Records", len(ground_df))
                csv_ground = ground_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    "⬇️ Download CSV",
                    csv_ground,
                    "ground_war_export.csv",
                    "text/csv",
                    key='download-ground',
                    use_container_width=True
                )
            
            with col2:
                st.markdown("**Social Media Data**")
                social_df = get_social_data()
                st.metric("Total Records", len(social_df))
                csv_social = social_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    "⬇️ Download CSV",
                    csv_social,
                    "social_war_export.csv",
                    "text/csv",
                    key='download-social',
                    use_container_width=True
                )
            
            with col3:
                st.markdown("**Crisis Alerts**")
                crisis_df = get_crisis_data()
                st.metric("Total Records", len(crisis_df))
                csv_crisis = crisis_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    "⬇️ Download CSV",
                    csv_crisis,
                    "crisis_alerts_export.csv",
                    "text/csv",
                    key='download-crisis',
                    use_container_width=True
                )
            
            st.divider()
            st.info("💡 **Tip:** Export data regularly for backup and analysis in Excel or Google Sheets")
        
        with tab2:
            st.subheader("👥 User Access Control")
            st.table(pd.DataFrame({
                'User': ['Admin', 'Zone_Head_A', 'Zone_Head_B', 'Social_Team', 'Crisis_Manager'],
                'Role': ['Full Access', 'Ground War Only', 'Ground War Only', 'Air War Only', 'Crisis Only'],
                'Status': ['Active', 'Active', 'Active', 'Active', 'Active'],
                'Last Login': ['2026-01-05', '2026-01-05', '2026-01-04', '2026-01-05', '2026-01-05']
            }))
            
            st.info("🔐 Contact IT Admin to add/remove users or change permissions")
        
        with tab3:
            st.subheader("⚙️ Application Settings")
            
            st.markdown("**Current Configuration**")
            st.code(f"""
Data Storage: CSV Files (campaign_data/)
Password: admin123 (Change in production!)
LINE Notify: Mock Mode (Configure token for real alerts)
Auto-backup: Disabled
            """)
            
            st.warning("⚠️ **Security Reminder:** Change default password before deployment!")
            
            if st.button("🔄 Clear All Data (Danger Zone)", type="secondary"):
                st.error("⚠️ This action is disabled in the demo. Contact admin to reset data.")
