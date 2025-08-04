#!/bin/bash

echo "Starting CurateMD development server..."
echo "Server will be available at:"
echo "  Local: http://localhost:7891"
echo "  Network: http://bardsbrain11.merck.com:7891"
echo ""
echo "Running in background. Check logs with: tail -f curate-md.log"
echo "To stop: kill \$(cat curate-md.pid)"
echo ""

# Start npm in background in a new process group and capture PID
setsid nohup npm run dev > curate-md.log 2>&1 &
echo $! > curate-md.pid

echo "Server started with PID: $(cat curate-md.pid)"