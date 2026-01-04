import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import time
import random

# --- CONFIGURATION & SETUP ---
st.set_page_config(
    page_title="War Room 2026",
    page_icon="🗳️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Mock Data Generation (Simulating Google Sheets)
def get_mock_ground_data():
    if 'ground_data' not in st.session_state:
        # Generate some dummy data
        zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
        data = []
        for _ in range(50):
            data.append({
                'Date': datetime.now().strftime('%Y-%m-%d'),
                'Zone': random.choice(zones),
                'Sub-District': f'Sub-{random.randint(1, 5)}',
                'Status': random.choice(['Green', 'Yellow', 'Red']),
                'Swing_Votes': random.randint(100, 1000),
                'Team_Checkin': True
            })
        st.session_state['ground_data'] = pd.DataFrame(data)
    return st.session_state['ground_data']

def get_mock_social_data():
    if 'social_data' not in st.session_state:
        platforms = ['Facebook', 'Twitter', 'TikTok']
        data = []
        for _ in range(30):
            data.append({
                'Date': datetime.now().strftime('%Y-%m-%d'),
                'Platform': random.choice(platforms),
                'Sentiment': random.choice(['Positive', 'Neutral', 'Negative']),
                'Competitor_Mentions': random.randint(0, 500),
                'Our_Mentions': random.randint(0, 500)
            })
        st.session_state['social_data'] = pd.DataFrame(data)
    return st.session_state['social_data']

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
        st.text_input(
            "Password (use 'admin123')", type="password", on_change=password_entered, key="password"
        )
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
    # token = 'YOUR_LINE_NOTIFY_TOKEN'
    # headers = {'content-type': 'application/x-www-form-urlencoded', 'Authorization': 'Bearer ' + token}
    # r = requests.post('https://notify-api.line.me/api/notify', headers=headers, data={'message': message})
    st.toast(f"🔔 LINE Notification Sent: {message}", icon="✅")
    # print(f"Sent Line Notify: {message}")

# --- APP NAVIGATION & LOGIC ---
if check_password():
    # Sidebar
    st.sidebar.title("🗳️ Campaign 2026")
    st.sidebar.markdown(f"**User:** Admin | **Date:** {datetime.now().strftime('%Y-%m-%d')}")
    
    menu = st.sidebar.radio(
        "Menu",
        ["🏠 War Room (Dashboard)", "📍 Ground War (Data Entry)", "📱 Air War (Social)", "🚨 Crisis Alert", "⚙️ Admin"]
    )

    # --- 1. WAR ROOM (Dashboard) ---
    if menu == "🏠 War Room (Dashboard)":
        st.title("🏠 Strategy War Room")
        st.markdown("### Real-time Campaign Overview")

        ground_df = get_mock_ground_data()
        
        # Top Metrics
        col1, col2, col3, col4 = st.columns(4)
        total_swing = ground_df['Swing_Votes'].sum()
        red_zones = ground_df[ground_df['Status'] == 'Red'].shape[0]
        
        col1.metric("Total Swing Votes", f"{total_swing:,}", "12%")
        col2.metric("Red Zones (Crictical)", f"{red_zones}", "-2")
        col3.metric("Days Remaining", "28", "-1")
        col4.metric("Budget Utilized", "45%", "5%")

        # Maps / Charts
        c1, c2 = st.columns((2, 1))
        
        with c1:
            st.subheader("Swing Votes by Zone")
            fig_bar = px.bar(ground_df, x='Zone', y='Swing_Votes', color='Status', 
                             color_discrete_map={'Green': 'green', 'Yellow': 'gold', 'Red': 'red'},
                             title="Vote Distribution by Risk Level")
            st.plotly_chart(fig_bar, use_container_width=True)

        with c2:
            st.subheader("Zone Status Ratio")
            fig_pie = px.pie(ground_df, names='Status', title="Zone Status Areas",
                             color='Status',
                             color_discrete_map={'Green': 'green', 'Yellow': 'gold', 'Red': 'red'})
            st.plotly_chart(fig_pie, use_container_width=True)

    # --- 2. GROUND WAR (Data Entry) ---
    elif menu == "📍 Ground War (Data Entry)":
        st.title("📍 Field Operation Center")
        
        with st.form("field_report"):
            st.subheader("📝 Daily Field Report")
            c1, c2 = st.columns(2)
            with c1:
                zone = st.selectbox("Zone", ['Zone A', 'Zone B', 'Zone C', 'Zone D'])
                sub_area = st.text_input("Sub-District / Village")
            with c2:
                status = st.selectbox("Area Status", ['Green (Safe)', 'Yellow (Swing)', 'Red (Critical)'])
                est_votes = st.number_input("Estimated Votes", min_value=0)
            
            notes = st.text_area("Observations / Issues")
            submitted = st.form_submit_button("Submit Report")
            
            if submitted:
                # Add to session state mock data
                new_row = {
                    'Date': datetime.now().strftime('%Y-%m-%d'),
                    'Zone': zone,
                    'Sub-District': sub_area if sub_area else 'Unknown',
                    'Status': status.split(' ')[0], 
                    'Swing_Votes': est_votes,
                    'Team_Checkin': True
                }
                st.session_state['ground_data'] = pd.concat([st.session_state['ground_data'], pd.DataFrame([new_row])], ignore_index=True)
                st.success("Report Submitted Successfully!")
                if status.startswith('Red'):
                    send_line_notify(f"CRITICAL: Red Zone reported at {zone} - {sub_area}")

        st.divider()
        st.subheader("Recent Reports")
        st.dataframe(st.session_state['ground_data'].tail(10))

    # --- 3. AIR WAR (Social) ---
    elif menu == "📱 Air War (Social)":
        st.title("📱 Social Media Warfare")
        
        social_df = get_mock_social_data()
        
        # Social Metrics
        m1, m2, m3 = st.columns(3)
        m1.metric("Our Sentiment", "65% Positive", "5%")
        m2.metric("Competitor Mentions", "1,240", "12%")
        m3.metric("Top Platform", "TikTok", "Trend")

        st.subheader("Competitor Tracking")
        fig_line = px.line(social_df, x=social_df.index, y=['Competitor_Mentions', 'Our_Mentions'],
                           title="Daily Mention Volume Comparison")
        st.plotly_chart(fig_line, use_container_width=True)
        
        st.subheader("Competitor Update Log")
        with st.expander("Update Competitor Movement"):
            with st.form("social_form"):
                platform = st.selectbox("Platform", ["Facebook", "TikTok", "Twitter/X"])
                link = st.text_input("Link to Post")
                details = st.text_area("Analysis")
                s_submit = st.form_submit_button("Log Competitor Move")
                if s_submit:
                    st.success("Logged successfully")

    # --- 4. CRISIS ALERT ---
    elif menu == "🚨 Crisis Alert":
        st.title("🚨 Crisis Management Center")
        st.warning("⚠️ Access restricted to War Room Commanders")
        
        st.subheader("Report Urgent Incident")
        c_type = st.selectbox("Issue Type", ["Vote Buying", "Fake News", "Physical Conflict", "Other"])
        evidence = st.file_uploader("Upload Evidence (Photo/Video)")
        c_desc = st.text_area("Incident Details")
        
        col1, col2 = st.columns([1, 4])
        with col1:
             if st.button("🚨 TRIGGER RED ALERT", type="primary"):
                 send_line_notify(f"RED ALERT: {c_type} detected! Info: {c_desc}")
                 st.error("RED ALERT BROADCASTED TO EXECUTIVES")
        
        st.divider()
        st.info("Direct Hotline: 081-XXX-XXXX (Head of Security)")

    # --- 5. ADMIN ---
    elif menu == "⚙️ Admin":
        st.title("⚙️ System Settings")
        
        st.subheader("Data Management")
        if st.button("Export All Data to CSV"):
            # csv = st.session_state['ground_data'].to_csv(index=False).encode('utf-8')
            st.download_button(
                "Download CSV",
                st.session_state['ground_data'].to_csv(index=False).encode('utf-8'),
                "campaign_data.csv",
                "text/csv",
                key='download-csv'
            )
            
        st.subheader("User Roles")
        st.table(pd.DataFrame({
            'User': ['Admin', 'Zone_Head_A', 'Social_Team'],
            'Role': ['Full Access', 'Ground War Only', 'Air War Only'],
            'Status': ['Active', 'Active', 'Active']
        }))
