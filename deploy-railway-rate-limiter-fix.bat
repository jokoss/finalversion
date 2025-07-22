@echo off
setlocal enabledelayedexpansion

echo 🚂 RAILWAY RATE LIMITER FIX DEPLOYMENT
echo ======================================

:: Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] Starting Railway Rate Limiter Fix deployment...

:: Check current git status
echo [INFO] Checking git status...
git status

:: Add the modified files
echo [INFO] Adding modified rate limiter files...
git add server/middleware/rateLimiter.js
git add RAILWAY-RATE-LIMITER-FINAL-FIX.md

:: Check if there are changes to commit
git diff --staged --quiet
if not errorlevel 1 (
    echo [WARNING] No changes to commit. Files may already be up to date.
    pause
    exit /b 0
)

:: Commit the changes
echo [INFO] Committing rate limiter fix...
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

if errorlevel 1 (
    echo [ERROR] Failed to commit changes
    pause
    exit /b 1
)

echo [SUCCESS] Changes committed successfully

:: Push to origin
echo [INFO] Pushing to GitHub repository...
git push origin main

if errorlevel 1 (
    echo [ERROR] Failed to push to GitHub
    pause
    exit /b 1
)

echo [SUCCESS] Successfully pushed to GitHub

:: Railway deployment info
echo [INFO] Railway deployment information:
echo.
echo 🚂 Railway will automatically deploy this fix when it detects the push
echo.
echo 📋 What was fixed:
echo    ✅ Eliminated resetTime.getTime errors
echo    ✅ Fixed trust proxy warnings
echo    ✅ Simplified rate limiter configuration
echo    ✅ Maintained all security features
echo.
echo 🔍 Monitor deployment at:
echo    - Railway Dashboard: https://railway.app/dashboard
echo    - Check logs for: 'Rate limiter initialized successfully'
echo.
echo 🧪 Test the fix:
echo    curl -I https://your-app.railway.app/api/health
echo    (Should show RateLimit-* headers without errors)
echo.

echo [SUCCESS] Rate limiter fix deployment initiated!
echo [INFO] Railway will automatically build and deploy the changes.
echo [INFO] Monitor the Railway dashboard for deployment status.

echo.
echo 🎯 Expected results after deployment:
echo    - No more resetTime.getTime errors in logs
echo    - No ERR_ERL_PERMISSIVE_TRUST_PROXY warnings
echo    - Clean server startup
echo    - Proper 429 responses with RateLimit headers
echo    - All security logging maintained
echo.
echo [SUCCESS] Deployment script completed successfully!

pause
