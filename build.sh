#!/bin/bash

# Vercel Build Script
echo "Starting build process..."

# Create static directory if it doesn't exist
mkdir -p ./static

# Ensure static files are properly copied
echo "Copying static files..."
cp -r ./static/* ./public/ 2>/dev/null || :

# Print environment for debugging
echo "Environment: $FLASK_ENV"
echo "Vercel: $VERCEL"

echo "Build completed successfully!"