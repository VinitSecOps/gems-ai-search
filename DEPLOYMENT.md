# Deployment Guide

This guide covers deploying GEMS AI Search to various environments.

## 🚀 Deployment Options

### Option 1: Traditional Server Deployment

#### Prerequisites
- Ubuntu 20.04+ or Windows Server
- Node.js 18+ installed
- SQL Server accessible
- Nginx (for production)
- PM2 (for process management)

#### Steps

1. **Clone and Setup**
```bash
git clone https://github.com/yourusername/gems-ai-search.git
cd gems-ai-search

# Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci && npm run build
```

2. **Configure Environment**
```bash
# Backend environment
cp .env.example backend/.env
# Edit backend/.env with your production values
```

3. **Install PM2**
```bash
npm install -g pm2
```

4. **Start Backend with PM2**
```bash
cd backend
pm2 start src/server.js --name "gems-backend" --env production
```

5. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve React frontend
    location / {
        root /path/to/gems-ai-search/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

#### Using Docker Compose

1. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your values
```

2. **Deploy**
```bash
docker-compose up -d
```

#### Custom Docker Build

1. **Build Images**
```bash
# Build backend
docker build -f docker/Dockerfile.backend -t gems-backend .

# Build frontend
docker build -f docker/Dockerfile.frontend -t gems-frontend .
```

2. **Run Containers**
```bash
# Run backend
docker run -d --name gems-backend -p 3001:3001 --env-file backend/.env gems-backend

# Run frontend
docker run -d --name gems-frontend -p 3000:80 gems-frontend
```

### Option 3: Cloud Deployment

#### Heroku Deployment

1. **Prepare for Heroku**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create apps
heroku create your-app-backend
heroku create your-app-frontend
```

2. **Backend Deployment**
```bash
cd backend
git init
git add .
git commit -m "Initial backend deployment"
git remote add heroku https://git.heroku.com/your-app-backend.git

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set DB_NAME=your-db-name
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set OPENAI_API_KEY=your-openai-key

git push heroku main
```

3. **Frontend Deployment**
```bash
cd frontend
# Update package.json scripts for Heroku
npm run build

# Deploy to Heroku or use static hosting like Netlify/Vercel
```

#### AWS Deployment

1. **EC2 Instance Setup**
```bash
# Launch Ubuntu EC2 instance
# Install Node.js, nginx, pm2
# Follow traditional server deployment steps
```

2. **RDS Database Setup**
```bash
# Create RDS SQL Server instance
# Configure security groups for database access
# Update backend/.env with RDS connection details
```

3. **S3 + CloudFront (for frontend)**
```bash
# Build frontend
cd frontend && npm run build

# Upload build/ folder to S3
aws s3 sync build/ s3://your-bucket-name/

# Configure CloudFront distribution
# Point to S3 bucket and configure for SPA
```

## 🔧 Production Configuration

### Environment Variables

```env
# Backend Production
NODE_ENV=production
PORT=3001
DB_HOST=production-db-host
DB_NAME=GEMS_Production
OPENAI_API_KEY=sk-production-key
RATE_LIMIT_MAX=30
CORS_ORIGIN=https://your-domain.com

# Frontend Production
REACT_APP_API_BASE_URL=https://api.your-domain.com
```

### SSL/HTTPS Setup

#### Using Certbot (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Database Optimization

1. **Indexes**
```sql
-- Add indexes for common search columns
CREATE INDEX IX_Candidates_Name ON dbo.Candidates (FirstName, Surname);
CREATE INDEX IX_Clients_Status ON dbo.Clients (ClientStatusId);
CREATE INDEX IX_Timesheets_Status ON dbo.Timesheets (StatusId);
```

2. **Connection Pooling**
```javascript
// Already configured in database.js
pool: {
  max: 20,
  min: 4,
  idleTimeoutMillis: 30000
}
```

## 📊 Monitoring & Maintenance

### Logging
```bash
# PM2 logs
pm2 logs gems-backend

# Application logs
tail -f backend/logs/search.log
tail -f backend/logs/database.log
```

### Health Checks
```bash
# API health check
curl https://your-api-domain.com/api/health

# Database connection check
# Monitor database logs for connection issues
```

### Updates
```bash
# Update application
git pull origin main
cd backend && npm ci --production
cd frontend && npm ci && npm run build

# Restart services
pm2 restart gems-backend
```

## 🔒 Security Checklist

- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Regular security updates
- [ ] Monitoring and alerting setup
- [ ] Backup strategy in place

## 🚨 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend is running: `pm2 status`
   - Check backend logs: `pm2 logs gems-backend`
   - Verify nginx configuration

2. **Database Connection Failed**
   - Check database server status
   - Verify firewall rules
   - Test connection string

3. **OpenAI API Errors**
   - Check API key validity
   - Monitor usage limits
   - Review rate limiting settings

### Performance Optimization

1. **Enable gzip compression in nginx**
2. **Use CDN for static assets**
3. **Optimize database queries**
4. **Monitor memory usage**
5. **Set up caching where appropriate**

For more detailed troubleshooting, check the main README.md file.
