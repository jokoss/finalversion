#!/bin/bash

echo "🚂 RAILWAY RATE LIMITER FIX DEPLOYMENT"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed or not in PATH"
    exit 1
fi

print_status "Starting Railway Rate Limiter Fix deployment..."

# Check current git status
print_status "Checking git status..."
git status

# Add the modified files
print_status "Adding modified rate limiter files..."
git add server/middleware/rateLimiter.js
git add RAILWAY-RATE-LIMITER-FINAL-FIX.md

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit. Files may already be up to date."
    exit 0
fi

# Commit the changes
print_status "Committing rate limiter fix..."
git commit -m "🔧 Fix Railway rate limiter: eliminate resetTime.getTime errors

- Replace complex custom store with standard express-rate-limit configuration
- Remove problematic resetTime handling that caused crashes
- Maintain all security logging and IP tracking features
- Fix ERR_ERL_PERMISSIVE_TRUST_PROXY warnings
- Ensure compatibility with Railway's proxy setup

Fixes:
- resetTime.getTime is not a function errors
- Rate limiter server crashes
- Trust proxy configuration warnings
- 500 errors from rate limiting middleware

Rate limiters configured:
- API: 100 req/15min
- Auth: 5 req/15min  
- Upload: 20 req/hour
- Admin: 50 req/5min
- Password Reset: 3 req/hour"

if [ $? -eq 0 ]; then
    print_success "Changes committed successfully"
else
    print_error "Failed to commit changes"
    exit 1
fi

# Push to origin
print_status "Pushing to GitHub repository..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Successfully pushed to GitHub"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

# Railway deployment info
print_status "Railway deployment information:"
echo ""
echo "🚂 Railway will automatically deploy this fix when it detects the push"
echo ""
echo "📋 What was fixed:"
echo "   ✅ Eliminated resetTime.getTime errors"
echo "   ✅ Fixed trust proxy warnings"
echo "   ✅ Simplified rate limiter configuration"
echo "   ✅ Maintained all security features"
echo ""
echo "🔍 Monitor deployment at:"
echo "   - Railway Dashboard: https://railway.app/dashboard"
echo "   - Check logs for: 'Rate limiter initialized successfully'"
echo ""
echo "🧪 Test the fix:"
echo "   curl -I https://your-app.railway.app/api/health"
echo "   (Should show RateLimit-* headers without errors)"
echo ""

print_success "Rate limiter fix deployment initiated!"
print_status "Railway will automatically build and deploy the changes."
print_status "Monitor the Railway dashboard for deployment status."

echo ""
echo "🎯 Expected results after deployment:"
echo "   - No more resetTime.getTime errors in logs"
echo "   - No ERR_ERL_PERMISSIVE_TRUST_PROXY warnings"
echo "   - Clean server startup"
echo "   - Proper 429 responses with RateLimit headers"
echo "   - All security logging maintained"
echo ""
print_success "Deployment script completed successfully!"
