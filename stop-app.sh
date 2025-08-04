#!/bin/bash

# Function to kill processes by pattern
kill_by_pattern() {
    local pattern="$1"
    local name="$2"
    local pids=$(pgrep -f "$pattern" | grep -v $$)  # Exclude current script
    
    if [ -n "$pids" ]; then
        echo "Found $name processes: $pids"
        for pid in $pids; do
            echo "Killing PID $pid..."
            kill $pid
        done
        sleep 2
        # Force kill if still running
        local remaining=$(pgrep -f "$pattern" | grep -v $$)
        if [ -n "$remaining" ]; then
            echo "Force killing remaining processes: $remaining"
            kill -9 $remaining
        fi
        return 0
    else
        return 1
    fi
}

echo "Stopping CurateMD server..."

# First try using PID file if it exists
if [ -f curate-md.pid ]; then
    PID=$(cat curate-md.pid)
    echo "Using PID file: $PID"
    
    # Kill the process group to ensure child processes are also killed
    if kill -- -$PID 2>/dev/null; then
        echo "Server process group stopped successfully using PID file."
    elif kill $PID 2>/dev/null; then
        echo "Server process stopped successfully using PID file."
    else
        echo "Process $PID not found. Will search for remaining processes."
    fi
    rm curate-md.pid
fi

# If no PID file or PID file failed, search for processes
echo "Searching for CurateMD processes..."

# Look for vite processes in current directory
if kill_by_pattern "/home/maju/RASD/cc/curate-md.*vite" "vite"; then
    echo "Stopped vite processes."
fi

# Look for npm run dev in current directory  
if kill_by_pattern "/home/maju/RASD/cc/curate-md.*npm run dev" "npm"; then
    echo "Stopped npm processes."
fi

# Final check
remaining_vite=$(pgrep -f "/home/maju/RASD/cc/curate-md.*vite" | grep -v $$)
remaining_npm=$(pgrep -f "/home/maju/RASD/cc/curate-md.*npm run dev" | grep -v $$)

if [ -z "$remaining_vite" ] && [ -z "$remaining_npm" ]; then
    echo "All CurateMD processes stopped successfully."
else
    echo "Some processes may still be running. Check manually with 'ps aux | grep vite'"
fi