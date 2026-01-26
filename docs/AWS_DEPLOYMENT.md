# AWS Deployment Guide

Complete guide for deploying the Intelligent Book Management System on AWS.

## Architecture Overview

```
Users
  ↓
CloudFront (CDN) → S3 (Frontend)
  ↓
ALB (Load Balancer)
  ↓
EC2 / ECS (Backend API)
  ↓
RDS (PostgreSQL Database)
  ↓
S3 (Document Storage)
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Docker (for containerization)
- SSH key pair for EC2
- Domain name (optional)

## Database Setup (RDS)

### Create RDS Instance

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier book-management-prod \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 100 \
  --storage-type gp2 \
  --multi-az \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxx

# Wait for instance to be available
aws rds describe-db-instances \
  --db-instance-identifier book-management-prod \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Configure Security Group

```bash
# Create security group for RDS
aws ec2 create-security-group \
  --group-name book-management-db-sg \
  --description "Security group for Book Management RDS"

# Allow inbound traffic on port 5432 from application tier
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-security-group-id sg-app
```

## Backend Deployment (ECS)

### Create ECR Repository

```bash
# Create repository for backend image
aws ecr create-repository \
  --repository-name book-management-backend \
  --region us-east-1

# Build and push Docker image
cd backend
docker build -t book-management-backend:latest .

# Tag for ECR
docker tag book-management-backend:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/book-management-backend:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/book-management-backend:latest
```

### Create ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name book-management

# Register task definition
# Create task-definition.json
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

### Deploy Service

```bash
# Create service
aws ecs create-service \
  --cluster book-management \
  --service-name backend-api \
  --task-definition book-management-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8000 \
  --network-configuration \
    "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

## Frontend Deployment (S3 + CloudFront)

### Build Frontend

```bash
cd frontend
npm run build
```

### Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://book-management-frontend-prod --region us-east-1

# Block public access
aws s3api put-public-access-block \
  --bucket book-management-frontend-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Upload files
aws s3 sync dist/ s3://book-management-frontend-prod/
```

### Create CloudFront Distribution

```bash
# Create OAI (Origin Access Identity)
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
    CallerReference=book-management

# Create distribution (use AWS Console for easier setup)
# Configure:
# - Origin: S3 bucket with OAI
# - Default root object: index.html
# - Error responses: 404 → /index.html
# - Cache behavior: TTL settings
# - SSL/TLS certificate
```

### Configure S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity XXXXX"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::book-management-frontend-prod/*"
    }
  ]
}
```

## Load Balancer Setup

### Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name book-management-alb \
  --subnets subnet-xxxxx subnet-xxxxx \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4

# Create target group
aws elbv2 create-target-group \
  --name backend-targets \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxxxx

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: book-management-backend
  ECS_SERVICE: backend-api
  ECS_CLUSTER: book-management
  ECS_TASK_DEFINITION: task-definition.json
  S3_BUCKET: book-management-frontend-prod
  CLOUDFRONT_DISTRIBUTION_ID: XXXXX

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install backend dependencies
        run: |
          cd backend
          pip install -e ".[dev]"
      
      - name: Run backend tests
        run: |
          cd backend
          pytest
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm run test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: latest
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update ECS service
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: latest
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment
      
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy frontend to S3
        run: |
          aws s3 sync frontend/dist/ s3://$S3_BUCKET/ \
            --cache-control "max-age=3600" \
            --exclude "index.html" \
            --exclude ".env*"
          
          aws s3 cp frontend/dist/index.html \
            s3://$S3_BUCKET/index.html \
            --cache-control "max-age=0"
      
      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
            --paths "/*"
```

## Environment Configuration

### Backend Environment Variables (EC2/ECS)

Store in AWS Systems Manager Parameter Store or Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name book-management/backend-env \
  --secret-string '{
    "DATABASE_URL": "postgresql+asyncpg://admin:password@rds-endpoint:5432/book_management",
    "SECRET_KEY": "your-secret-key-here",
    "OPENROUTER_API_KEY": "your-api-key",
    "LLAMA_MODEL": "meta-llama/llama-3-8b-instruct",
    "REDIS_URL": "redis://your-redis-endpoint:6379",
    "ENVIRONMENT": "production",
    "DEBUG": "false",
    "CORS_ORIGINS": "[\"https://yourdomain.com\"]"
  }'
```

## Monitoring and Logging

### CloudWatch Setup

```bash
# Create log group
aws logs create-log-group --log-group-name /aws/ecs/book-management

# Create metric alarms
aws cloudwatch put-metric-alarm \
  --alarm-name ecs-cpu-high \
  --alarm-description "Alert when ECS CPU is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Application Insights

```bash
# Enable X-Ray
aws xray put-trace-summaries --trace-summaries ...

# Setup CloudWatch Logs Insights queries
aws logs put-query-definition \
  --name book-management-errors \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/'
```

## Backup and Disaster Recovery

### RDS Automated Backups

```bash
# Modify backup retention
aws rds modify-db-instance \
  --db-instance-identifier book-management-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately
```

### Manual Snapshot

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier book-management-prod \
  --db-snapshot-identifier book-management-snapshot-$(date +%Y%m%d)
```

## Security Best Practices

1. **Network Security**
   - Use VPC with private subnets for database
   - Enable VPC Flow Logs
   - Use security groups with least privilege

2. **Data Security**
   - Enable RDS encryption at rest
   - Enable S3 encryption
   - Use AWS Secrets Manager for sensitive data

3. **Access Control**
   - Use IAM roles for EC2/ECS
   - Enable MFA for console access
   - Rotate credentials regularly

4. **Monitoring**
   - Enable CloudTrail for audit logs
   - Setup CloudWatch alarms
   - Monitor costs

## Cost Optimization

- Use Reserved Instances for predictable workloads
- Configure auto-scaling
- Use S3 Intelligent-Tiering for backups
- Monitor unused resources

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check security group rules
   - Verify RDS instance is running
   - Test connection from EC2

2. **Container Fails to Start**
   - Check CloudWatch logs
   - Verify environment variables
   - Check resource limits

3. **Frontend Not Loading**
   - Check S3 bucket permissions
   - Verify CloudFront cache invalidation
   - Check CORS headers

## Additional Resources

- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
