class CSVDatabase {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.data = [];
    }

    async loadData() {
        try {
            const response = await fetch(`${this.apiBase}/all-entries`);
            if (response.ok) {
                this.data = await response.json();
                console.log(`Loaded ${this.data.length} entries from server`);
            } else {
                console.error('Failed to load data from server');
                this.data = [];
            }
        } catch (e) {
            console.error('Error loading data:', e);
            this.data = [];
        }
        return this.data;
    }

    async addEntry(entry) {
        const newEntry = {
            fullName: entry.fullName,
            timeSpent: entry.timeSpent,
            timeRemaining: entry.timeRemaining,
            moneyLost: entry.moneyLost,
            hintsUsed: entry.hintsUsed,
            grade: entry.grade,
            status: entry.status,
            completedAt: entry.completedAt
        };

        try {
            const response = await fetch(`${this.apiBase}/entry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEntry)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Entry saved successfully:', result);
                
                // Add to local cache
                this.data.push(result.entry);
                
                return result.entry;
            } else {
                console.error('Failed to save entry');
                return null;
            }
        } catch (e) {
            console.error('Error saving entry:', e);
            return null;
        }
    }

    async getLeaderboard(sortBy = 'timeSpent') {
        try {
            const response = await fetch(`${this.apiBase}/leaderboard`);
            if (response.ok) {
                let leaderboard = await response.json();
                
                // Additional sorting if needed
                if (sortBy === 'moneyLost') {
                    leaderboard.sort((a, b) => a.moneyLost - b.moneyLost);
                } else if (sortBy === 'grade') {
                    const gradeOrder = { 'A+': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'F': 6 };
                    leaderboard.sort((a, b) => (gradeOrder[a.grade] || 99) - (gradeOrder[b.grade] || 99));
                }
                
                return leaderboard;
            } else {
                console.error('Failed to load leaderboard');
                return [];
            }
        } catch (e) {
            console.error('Error loading leaderboard:', e);
            return [];
        }
    }

    getAllEntries() {
        return [...this.data];
    }

    downloadCSV() {
        // Open download link in new tab
        window.open(`${this.apiBase}/download-csv`, '_blank');
    }

    // Note: Import functionality removed since CSV auto-loads from server
    // The server automatically reads from the CSV file
}