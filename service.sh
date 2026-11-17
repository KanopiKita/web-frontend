#!/usr/bin/env bash
# Kanopi Kita Frontend Service Manager
# Manages Next.js Web Dashboard on Port 3001

FRONTEND_DIR="/home/kanopi/kanopi-apps/frontend"
PID_FILE="$FRONTEND_DIR/service.pid"
LOG_FILE="$FRONTEND_DIR/service.log"
PORT=3001

cd "$FRONTEND_DIR" || exit 1

case "$1" in
  start)
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      echo "Frontend service is already running on port $PORT (PID: $(cat "$PID_FILE"))"
      exit 0
    fi
    echo "Starting Kanopi Kita Frontend service on port $PORT..."
    nohup npx next dev -p $PORT -H 0.0.0.0 > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 3
    if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      echo "Frontend service started successfully on http://0.0.0.0:$PORT (PID: $(cat "$PID_FILE"))"
    else
      echo "Failed to start frontend service. Check logs at $LOG_FILE"
      exit 1
    fi
    ;;

  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      echo "Stopping Frontend service (PID: $PID)..."
      kill "$PID" 2>/dev/null
      # Also kill any node next processes on port 3001
      pkill -f "next.*$PORT" 2>/dev/null
      rm -f "$PID_FILE"
      echo "Frontend service stopped."
    else
      pkill -f "next.*$PORT" 2>/dev/null
      echo "No PID file found. Terminated any running processes on port $PORT."
    fi
    ;;

  status)
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      echo "Frontend service is RUNNING on port $PORT (PID: $(cat "$PID_FILE"))"
    else
      echo "Frontend service is STOPPED."
    fi
    ;;

  restart)
    $0 stop
    sleep 2
    $0 start
    ;;

  logs)
    tail -n 50 -f "$LOG_FILE"
    ;;

  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    exit 1
    ;;
esac
