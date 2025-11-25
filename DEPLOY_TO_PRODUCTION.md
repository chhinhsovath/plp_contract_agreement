# Deploy to Production - Education Partner Performance Tracking System

## ✅ Pre-Deployment Checklist

All items completed:
- [x] Database schema synced (7 new tables)
- [x] 5 performance indicators seeded
- [x] DOCX templates in place (template_4 & template_5)
- [x] All 8 system tests passing
- [x] Development server running successfully
- [x] Documentation complete

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

**Step 1: Install Vercel CLI (if not already installed)**
```bash
npm install -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```

**Step 3: Link Project**
```bash
# From project root
vercel
```

**Step 4: Set Environment Variables**
```bash
# Add database URL
vercel env add DATABASE_URL production

# When prompted, enter:
postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement

# Add NextAuth secret
vercel env add NEXTAUTH_SECRET production

# When prompted, enter a strong random secret (generate one if needed):
# You can generate with: openssl rand -base64 32

# Add NextAuth URL
vercel env add NEXTAUTH_URL production

# When prompted, enter:
https://agreements.openplp.com
```

**Step 5: Deploy to Production**
```bash
vercel --prod
```

**Step 6: Run Database Migrations on Production**
After deployment, you need to ensure the database is set up:
```bash
# Option A: If you have direct database access
npx prisma migrate deploy

# Option B: If migrations already applied, just seed indicators
npx prisma db seed
```

**Step 7: Verify Deployment**
- Visit production URL: https://agreements.openplp.com
- Test login with existing user
- Create a test contract
- Verify dashboard loads
- Test document generation

---

### Option 2: Manual Server Deployment

**Step 1: Prepare Server**
```bash
# SSH into your server
ssh user@your-server.com

# Navigate to deployment directory
cd /var/www/plp-contract-agreement

# Clone or pull latest code
git clone https://github.com/your-repo/plp-contract-agreement.git
# or
git pull origin main
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Configure Environment Variables**
Create `.env.production` file:
```env
DATABASE_URL="postgresql://admin:P@ssw0rd@157.10.73.82:5432/plp_contract_agreement"
NEXTAUTH_URL="https://agreements.openplp.com"
NEXTAUTH_SECRET="your-production-secret-here"
NODE_ENV="production"
```

**Step 4: Build Application**
```bash
npm run build
```

**Step 5: Run Database Setup**
```bash
# Apply migrations
npx prisma migrate deploy

# Seed performance indicators
npx prisma db seed
```

**Step 6: Start Production Server**

**Using PM2 (Recommended):**
```bash
# Install PM2 globally if not installed
npm install -g pm2

# Start application
pm2 start npm --name "plp-contracts" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

**Using systemd:**
Create `/etc/systemd/system/plp-contracts.service`:
```ini
[Unit]
Description=PLP Contract Agreement System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/plp-contract-agreement
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then enable and start:
```bash
sudo systemctl enable plp-contracts
sudo systemctl start plp-contracts
sudo systemctl status plp-contracts
```

**Step 7: Configure Nginx Reverse Proxy**
Create `/etc/nginx/sites-available/agreements.openplp.com`:
```nginx
server {
    listen 80;
    server_name agreements.openplp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/agreements.openplp.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 8: Setup SSL with Let's Encrypt**
```bash
sudo certbot --nginx -d agreements.openplp.com
```

---

## 📊 Post-Deployment Verification

### 1. System Health Checks

**Test Database Connection:**
```bash
# Run system test
npx tsx scripts/test-complete-system.ts
```

Expected output:
```
✅ ALL TESTS PASSED - SYSTEM IS PRODUCTION READY!
Total Tests: 8
✅ Passed: 8
❌ Failed: 0
```

**Test Web Application:**
1. Visit https://agreements.openplp.com
2. Login with demo user or existing account
3. Navigate to `/partner-agreement/new`
4. Navigate to `/performance-dashboard`
5. Verify Khmer fonts display correctly

### 2. Feature Verification

**Multi-Step Contract Form:**
- [ ] Step 1: Partner Information - saves correctly
- [ ] Step 2: Indicator Selection - auto-target calculation works
- [ ] Step 3: Activities Planning - can add/remove activities
- [ ] Step 4: Deliverables - can add deliverables
- [ ] Step 5: Terms & Conditions - displays correctly
- [ ] Step 6: Signatures & Review - can submit contract

**Dashboard:**
- [ ] Overview metrics display correctly
- [ ] Indicator performance chart loads
- [ ] Partner ranking table populates
- [ ] No console errors

**Document Generation:**
- [ ] Create contract with type 4 or 5
- [ ] Click generate document
- [ ] DOCX file downloads
- [ ] Open file - placeholders replaced correctly
- [ ] Khmer text displays properly

### 3. Performance Checks

**Response Times (should be < 500ms):**
```bash
# Test API endpoints
curl -w "@curl-format.txt" -o /dev/null -s https://agreements.openplp.com/api/indicators
curl -w "@curl-format.txt" -o /dev/null -s https://agreements.openplp.com/api/contracts
curl -w "@curl-format.txt" -o /dev/null -s https://agreements.openplp.com/api/dashboard/overview
```

Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_total:  %{time_total}\n
```

**Database Query Performance:**
- Check slow query log
- Ensure indexes are active
- Monitor connection pool

### 4. Security Verification

**SSL/HTTPS:**
- [ ] https://agreements.openplp.com loads with valid certificate
- [ ] http:// redirects to https://
- [ ] No mixed content warnings

**Authentication:**
- [ ] Protected routes redirect to login
- [ ] Unauthorized access blocked
- [ ] JWT tokens expire correctly

**Database:**
- [ ] Connection uses password
- [ ] User has minimum required privileges
- [ ] Backup strategy in place

---

## 🔄 Database Maintenance

### Backup Strategy

**Daily Automatic Backups:**
```bash
# Create backup script: /usr/local/bin/backup-plp-db.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/plp-contracts"
PGPASSWORD='P@ssw0rd' pg_dump -h 157.10.73.82 -U admin plp_contract_agreement > "$BACKUP_DIR/plp_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "plp_*.sql" -mtime +30 -delete
```

**Add to crontab:**
```bash
0 2 * * * /usr/local/bin/backup-plp-db.sh
```

### Restore from Backup
```bash
PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin plp_contract_agreement < backup_file.sql
```

---

## 📈 Monitoring

### Application Logs

**PM2 Logs:**
```bash
# View logs
pm2 logs plp-contracts

# Save logs to file
pm2 logs plp-contracts --out /var/log/plp-contracts.log
```

**System Logs:**
```bash
# View systemd logs
journalctl -u plp-contracts -f
```

### Error Monitoring

**Setup Error Tracking (Optional):**
- Consider integrating Sentry for error tracking
- Setup alerts for critical errors
- Monitor API response times

### Database Monitoring
```bash
# Check active connections
PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin plp_contract_agreement -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin plp_contract_agreement -c "SELECT pg_size_pretty(pg_database_size('plp_contract_agreement'));"
```

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"
**Solution:**
1. Check DATABASE_URL environment variable
2. Verify database server is running
3. Test connection: `PGPASSWORD='P@ssw0rd' psql -h 157.10.73.82 -U admin plp_contract_agreement -c "SELECT 1;"`

### Issue: "Template not found" when generating documents
**Solution:**
1. Verify templates exist: `ls -la public/templates/`
2. Check file permissions: `chmod 644 public/templates/*.docx`
3. Restart application

### Issue: Khmer fonts not displaying
**Solution:**
1. Check if Google Hanuman font is loaded in layout
2. Verify font files in `public/fonts/`
3. Clear browser cache

### Issue: High memory usage
**Solution:**
1. Check for memory leaks: `pm2 monit`
2. Restart application: `pm2 restart plp-contracts`
3. Consider increasing server resources

### Issue: Slow API responses
**Solution:**
1. Check database query performance
2. Add database indexes if needed
3. Enable query logging: `prisma:query` debug mode
4. Consider caching frequently accessed data

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- [ ] Review error logs
- [ ] Check disk space
- [ ] Verify backups completed successfully

**Monthly:**
- [ ] Update dependencies (security patches)
- [ ] Review database performance
- [ ] Clean old test data

**Quarterly:**
- [ ] Full system security audit
- [ ] Performance optimization review
- [ ] User feedback collection

### Contact Information

**Technical Support:**
- Developer: [Your contact info]
- Database Admin: [DB admin contact]
- System Admin: [Sys admin contact]

**Emergency Contacts:**
- Critical bugs: [Emergency contact]
- Server issues: [Server admin]

---

## 🎯 Success Criteria

System is considered successfully deployed when:
- [x] All 8 tests passing
- [ ] Production URL accessible (https://agreements.openplp.com)
- [ ] Users can create contracts end-to-end
- [ ] Dashboard displays real-time data
- [ ] Document generation works correctly
- [ ] No critical errors in logs
- [ ] Response times < 500ms
- [ ] Database backups running daily
- [ ] SSL certificate valid

---

## 📚 Documentation Links

- Full Implementation: `IMPLEMENTATION_COMPLETE.md`
- Production Readiness: `PRODUCTION_READY.md`
- System Tests: `scripts/test-complete-system.ts`
- Template Guide: `public/templates/README.md`
- API Documentation: See IMPLEMENTATION_COMPLETE.md

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Production URL:** https://agreements.openplp.com
**Status:** ✅ READY FOR DEPLOYMENT
