#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---

# Log a message to the console
log() {
  echo "[FIX_DEPS] $1"
}

# --- Main Script ---

log "Starting dependency fix script..."

# 1. Clean Slate: Remove node_modules and package-lock.json
log "Removing root node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# 2. Install Root Dependencies
log "Installing root dependencies..."
npm install

# 3. Install App-Specific Dependencies
log "Installing dependencies for @bounty-board/link..."
npm install react-dropzone lucide-react clsx tailwind-merge --workspace=@bounty-board/link

log "Installing dependencies for @bounty-board/admin..."
npm install lucide-react recharts clsx tailwind-merge --workspace=@bounty-board/admin

# 4. Final Re-Sync
log "Running final npm install to link workspaces..."
npm install

log "Dependency fix script completed successfully!"

