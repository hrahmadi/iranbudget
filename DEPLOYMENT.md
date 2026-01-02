# Deployment Guide - Vercel + Vercel Postgres

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel

## Step 1: Deploy Frontend to Vercel

```bash
cd frontend
vercel
```

Follow prompts:
- Link to existing project or create new
- Set root directory to `frontend`
- Accept default build settings

## Step 2: Create Vercel Postgres Database

1. Go to your project in Vercel dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose region (closest to your users)
6. Click **Create**

## Step 3: Get Database Connection String

1. In Vercel dashboard → Storage → Your Postgres database
2. Go to **Settings** tab
3. Copy the connection string (starts with `postgres://...`)
4. Or use the `.env.local` tab to copy all variables

You'll see:
```
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NO_SSL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

## Step 4: Run Schema and Seed

### Option A: Using Vercel Dashboard (Recommended)

1. In your database → **Query** tab
2. Copy contents of `schema.sql` and run
3. Copy contents of `seed.sql` and run

### Option B: Using psql locally

```bash
# Using POSTGRES_URL from Vercel
psql "YOUR_POSTGRES_URL_FROM_VERCEL" < schema.sql
psql "YOUR_POSTGRES_URL_FROM_VERCEL" < seed.sql
```

### Option C: Using Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Connect to database
vercel env pull .env.local
psql $(grep POSTGRES_URL .env.local | cut -d '=' -f2 | tr -d '"') < schema.sql
psql $(grep POSTGRES_URL .env.local | cut -d '=' -f2 | tr -d '"') < seed.sql
```

## Step 5: Update Environment Variables (if needed)

Your Next.js API routes in `frontend/app/api/` already use `process.env.POSTGRES_URL` which Vercel provides automatically.

If using custom env vars:
```bash
vercel env add POSTGRES_URL production
# Paste your connection string
```

## Step 6: Redeploy

```bash
vercel --prod
```

Or push to GitHub - Vercel will auto-deploy.

## Verification

1. Visit your deployed site: `https://your-project.vercel.app`
2. Check that Sankey diagram loads with data
3. Test year switching and controls

## Troubleshooting

### Database connection fails
- Check POSTGRES_URL is set in Vercel environment variables
- Verify SSL mode in connection string
- Check region matches your deployment

### Data not showing
- Verify seed.sql ran successfully
- Check API route logs in Vercel dashboard
- Test API endpoint directly: `https://your-project.vercel.app/api/budget-data?year=1404`

### Build fails
- Check Node.js version in Vercel matches local (v20.x)
- Verify all dependencies in package.json
- Check build logs in Vercel dashboard

## Local Development with Vercel Postgres

```bash
cd frontend
vercel env pull .env.local  # Downloads env vars from Vercel
npm run dev
```

Your local dev will now use Vercel Postgres instead of local PostgreSQL.

## Rollback

If deployment fails:
1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
