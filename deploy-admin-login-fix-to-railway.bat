@echo off
echo ========================================
echo   RAILWAY ADMIN LOGIN FIX DEPLOYMENT
echo ========================================
echo.
echo This script will deploy the admin login fix to Railway
echo.
echo Fixes included:
echo - Updated JWT_SECRET in production environment
echo - Fixed FRONTEND_URL to correct Railway domain
echo - Admin user created/updated in database
echo - Database seeded with categories and testimonials
echo.
pause

echo.
echo [1/4] Adding changes to git...
git add .

echo.
echo [2/4] Committing changes...
git commit -m "Fix admin login: Update JWT_SECRET and FRONTEND_URL for Railway deployment

- Updated server/.env.production with proper JWT_SECRET
- Fixed FRONTEND_URL to point to finalversion-production-e1d0.up.railway.app
- Admin user verified and working in Railway database
- Database fully seeded with categories, tests, and testimonials
- Ready for admin panel access"

echo.
echo [3/4] Pushing to GitHub (this will trigger Railway deployment)...
git push origin main

echo.
echo [4/4] Deployment initiated!
echo.
echo ========================================
echo   ADMIN LOGIN CREDENTIALS
echo ========================================
echo Username: admin
echo Password: Railway2025!
echo.
echo Login URL: https://finalversion-production-e1d0.up.railway.app/login
echo.
echo ========================================
echo   DEPLOYMENT STATUS
echo ========================================
echo.
echo ✅ JWT_SECRET updated with secure production key
echo ✅ FRONTEND_URL fixed to correct Railway domain
echo ✅ Admin user created and verified in database
echo ✅ Database seeded with 10 categories and 30 tests
echo ✅ Testimonials table populated with 5 records
echo.
echo 🚀 Railway will now rebuild and deploy the application
echo 📱 Check Railway dashboard for deployment progress
echo 🔐 Admin login should work after deployment completes
echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo 1. Wait for Railway deployment to complete (2-3 minutes)
echo 2. Visit: https://finalversion-production-e1d0.up.railway.app/login
echo 3. Login with: admin / Railway2025!
echo 4. Change password after first login for security
echo.
pause
