#!/bin/bash

# Quick setup script for AI-Powered Secret Scanner

echo "🔧 Setting up AI-Powered Secret Scanner..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install @anthropic-ai/sdk

# Check if API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo ""
  echo "⚠️  ANTHROPIC_API_KEY not found in environment"
  echo ""
  echo "To enable AI-powered scanning:"
  echo "1. Get your API key from https://console.anthropic.com/"
  echo "2. Run: export ANTHROPIC_API_KEY='your-key-here'"
  echo ""
  echo "Scanner will still work in regex-fallback mode without the key."
  echo ""
else
  echo "✅ ANTHROPIC_API_KEY found"
fi

# Test the scanner
echo ""
echo "🧪 Testing scanner..."
node .github/scripts/secret-scanner.js changed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Usage:"
echo "  - Scan changed files: node .github/scripts/secret-scanner.js changed"
echo "  - Scan all files: node .github/scripts/secret-scanner.js all"
echo ""
