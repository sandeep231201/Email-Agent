# Production Deployment Guide

## 🚀 Deploying Email Agent to Production

This guide covers deploying the Email Agent to production environments.

## Pre-Deployment Checklist

### Security
- [ ] Change all default credentials
- [ ] Generate strong JWT_SECRET (use `openssl rand -base64 32`)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CORS for your domain
- [ ] Set secure MongoDB connection with authentication
- [ ] Enable firewall rules
- [ ] Review all environment variables
- [ ] Set up SSH keys for server access

### Infrastructure
- [ ] Provision MongoDB instance (Atlas or self-managed)
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure load balancer if needed
- [ ] Set up CDN for static files
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Plan for disaster recovery

### Application
- [ ] Test all features in staging
- [ ] Verify API rate limits
- [ ] Test database connections
- [ ] Verify Anthropic API quota
- [ ] Test email provider OAuth flows
- [ ] Performance testing under load
- [ ] Security penetration testing
- [ ] Load testing

## Deployment Options

### Option 1: Docker on Cloud (Recommended)

#### AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t email-agent:latest ./backend
docker tag email-agent:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/email-agent:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/email-agent:latest
```

#### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/email-agent ./backend
gcloud run deploy email-agent \
  --image gcr.io/PROJECT-ID/email-agent \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=... \
  --set-env-vars ANTHROPIC_API_KEY=...
```

#### DigitalOcean App Platform

```bash
# Push to DigitalOcean container registry
doctl registry login
docker build -t email-agent:latest ./backend
docker tag email-agent:latest registry.digitalocean.com/my-app/email-agent:latest
docker push registry.digitalocean.com/my-app/email-agent:latest
```

### Option 2: Traditional VPS (Nginx + PM2)

```bash
# SSH into server
ssh user@your-vps.com

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-org/email-agent.git
cd email-agent/backend

# Install and start
npm ci --production
pm2 start server.js --name "email-agent"
pm2 save
pm2 startup

# Configure Nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/email-agent
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Option 3: Kubernetes (Advanced)

```bash
# Build and push image
docker build -t email-agent:latest ./backend
docker tag email-agent:latest your-registry/email-agent:latest
docker push your-registry/email-agent:latest

# Deploy with kubectl
kubectl create namespace email-agent
kubectl create secret generic email-agent-secrets \
  --from-literal=ANTHROPIC_API_KEY=... \
  --from-literal=JWT_SECRET=... \
  -n email-agent

kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Add database user with strong password
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI in environment

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/email-agent?retryWrites=true&w=majority
```

### Self-Managed MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

# Configure authentication
mongo
> use admin
> db.createUser({user: "admin", pwd: "password", roles: ["root"]})
> use email-agent
> db.createUser({user: "app", pwd: "password", roles: ["readWrite"]})
```

## SSL/TLS Certificate

### Let's Encrypt with Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com
sudo certbot renew --dry-run  # Test auto-renewal
```

### Environment Variables

Create production `.env` file:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/email-agent
JWT_SECRET=$(openssl rand -base64 32)
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## Monitoring & Logging

### Setup Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 install pm2-auto-pull
pm2 monit

# Nginx access logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Setup Log Aggregation (ELK Stack)

```bash
# Install Filebeat on your VPS
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.0.0-linux-x86_64.tar.gz
tar xzvf filebeat-8.0.0-linux-x86_64.tar.gz

# Configure to send logs to Elasticsearch
sudo cp filebeat.yml /etc/filebeat/
sudo service filebeat start
```

### Sentry Error Tracking

```bash
npm install --save @sentry/node @sentry/tracing

# In server.js
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## Performance Optimization

### Database Optimization

```javascript
// Create indexes
db.emails.createIndex({ "userId": 1, "timestamp": -1 });
db.emails.createIndex({ "userId": 1, "read": 1 });
db.users.createIndex({ "email": 1 }, { unique: true });
```

### Caching Strategy

```bash
npm install redis

# Set up Redis for session caching
# Implement cache for frequently accessed data
```

### CDN for Static Assets

- Configure CloudFlare or similar CDN
- Upload frontend assets to S3/GCS
- Point static URLs through CDN

## Backup Strategy

### Automated MongoDB Backups

```bash
# Backup to S3
mongodump --out /tmp/backup
aws s3 sync /tmp/backup s3://your-bucket/backups/

# Schedule with cron
0 2 * * * mongodump --out /tmp/backup && aws s3 sync /tmp/backup s3://your-bucket/backups/
```

## Load Testing

```bash
npm install -g artillery

# Create load-test.yml
artillery run load-test.yml

# Or use Apache Bench
ab -n 1000 -c 10 https://api.yourdomain.com/health
```

## Rollback Procedure

```bash
# Keep multiple versions deployed
docker pull your-registry/email-agent:v1.0.0
docker stop email-agent
docker run -d --name email-agent your-registry/email-agent:v1.0.0

# Or with PM2
pm2 restart email-agent
pm2 rollback  # Reverts to previous version
```

## Post-Deployment

1. ✅ Verify all endpoints are working
2. ✅ Test authentication flows
3. ✅ Check email analysis functionality
4. ✅ Monitor error logs
5. ✅ Verify HTTPS is working
6. ✅ Test database connections
7. ✅ Verify backup procedures
8. ✅ Setup monitoring alerts
9. ✅ Document deployment configuration
10. ✅ Brief support team on new deployment

## Maintenance

### Regular Tasks

- Monitor disk space and cleanup old logs
- Review and update dependencies monthly
- Monitor API quota usage
- Review security logs
- Test backup restoration quarterly
- Update SSL certificates before expiration
- Monitor database performance

### Scaling Strategy

If experiencing high traffic:

1. Increase MongoDB connection pool
2. Add Redis cache layer
3. Implement request queuing
4. Scale horizontally with load balancer
5. Optimize database queries
6. Implement CDN for assets
7. Consider microservices architecture

---

For questions or issues, refer to the main README.md
