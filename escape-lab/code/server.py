from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import csv
import os
from datetime import datetime
import atexit

app = Flask(__name__)
CORS(app)

# Create data directory if it doesn't exist
DATA_DIR = 'data'
CSV_FILE = os.path.join(DATA_DIR, 'leaderboard.csv')
PID_FILE = 'server.pid'

# Save process ID when server starts
with open(PID_FILE, 'w') as f:
    f.write(str(os.getpid()))

# Clean up PID file when server stops
def cleanup_pid():
    if os.path.exists(PID_FILE):
        os.remove(PID_FILE)

atexit.register(cleanup_pid)

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# CSV Headers
CSV_HEADERS = ['ID', 'Name', 'Time Spent (sec)', 'Time Remaining (sec)', 
               'Money Lost', 'Hints Used', 'Grade', 'Status', 'Completed At']

def initialize_csv():
    """Create CSV file with headers if it doesn't exist"""
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(CSV_HEADERS)

def read_leaderboard():
    """Read all entries from CSV"""
    initialize_csv()
    entries = []
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                entries.append({
                    'id': int(row['ID']),
                    'name': row['Name'],
                    'timeSpent': int(row['Time Spent (sec)']),
                    'timeRemaining': int(row['Time Remaining (sec)']),
                    'moneyLost': float(row['Money Lost']),
                    'hintsUsed': int(row['Hints Used']),
                    'grade': row['Grade'],
                    'status': row['Status'],
                    'completedAt': row['Completed At']
                })
    except Exception as e:
        print(f"Error reading CSV: {e}")
    
    return entries

def write_entry(entry):
    """Append a new entry to CSV"""
    initialize_csv()
    
    try:
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                entry['id'],
                entry['name'],
                entry['timeSpent'],
                entry['timeRemaining'],
                entry['moneyLost'],
                entry['hintsUsed'],
                entry['grade'],
                entry['status'],
                entry['completedAt']
            ])
        return True
    except Exception as e:
        print(f"Error writing to CSV: {e}")
        return False

# Serve static files (HTML, CSS, JS, images)
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# API endpoint to get all leaderboard entries
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    entries = read_leaderboard()
    
    # Filter only completed entries for leaderboard
    completed = [e for e in entries if e['status'] == 'completed']
    
    # Sort by time spent (fastest first)
    completed.sort(key=lambda x: x['timeSpent'])
    
    return jsonify(completed)

# API endpoint to add a new entry
@app.route('/api/entry', methods=['POST'])
def add_entry():
    data = request.json
    
    entry = {
        'id': int(datetime.now().timestamp() * 1000),  # Millisecond timestamp as ID
        'name': data['fullName'],
        'timeSpent': data['timeSpent'],
        'timeRemaining': data['timeRemaining'],
        'moneyLost': data['moneyLost'],
        'hintsUsed': data['hintsUsed'],
        'grade': data['grade'],
        'status': data['status'],
        'completedAt': data['completedAt']
    }
    
    success = write_entry(entry)
    
    if success:
        return jsonify({'success': True, 'entry': entry})
    else:
        return jsonify({'success': False, 'error': 'Failed to write to CSV'}), 500

# API endpoint to get all entries (including failed attempts)
@app.route('/api/all-entries', methods=['GET'])
def get_all_entries():
    entries = read_leaderboard()
    return jsonify(entries)

# API endpoint to download CSV
@app.route('/api/download-csv', methods=['GET'])
def download_csv():
    initialize_csv()
    return send_from_directory(DATA_DIR, 'leaderboard.csv', as_attachment=True)

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Escape Room Server Starting...")
    print("=" * 50)
    print(f"📂 CSV file location: {os.path.abspath(CSV_FILE)}")
    print(f"🆔 PID: {os.getpid()}")
    print("🌐 Open your browser to: http://localhost:5000")
    print("⏹️  Run stop_server.bat to stop the server")
    print("=" * 50)
    
    initialize_csv()
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=False)
    finally:
        cleanup_pid()