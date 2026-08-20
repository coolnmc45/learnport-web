# Deploy LearnPort to GitHub Pages

This guide walks you through deploying the LearnPort web version to GitHub Pages for free hosting.

## Prerequisites

- GitHub account (free at https://github.com/signup)
- Git installed on your machine
- The production build ready (already created in `dist/` folder)

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `learnport-web`
3. Choose "Public" (required for GitHub Pages free tier)
4. Click "Create repository"

## Step 2: Initialize Git and Push Code

```bash
cd /home/ubuntu/learnport-web

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: LearnPort web version"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/learnport-web.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Configure GitHub Pages

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/learnport-web`
2. Click "Settings" (top right)
3. Scroll down to "Pages" section (left sidebar)
4. Under "Build and deployment":
   - Source: Select "Deploy from a branch"
   - Branch: Select "main" and "/root" folder
   - Click "Save"

## Step 4: Set Up Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:
- Builds the app on every push to main
- Deploys to GitHub Pages

The workflow will run automatically after you push the code.

## Step 5: Access Your Deployed App

After GitHub Actions completes (usually 1-2 minutes):

- **URL**: `https://YOUR_USERNAME.github.io/learnport-web`
- **Check status**: Go to "Actions" tab in your repository

## Alternative: Deploy from dist/ Folder

If you want to deploy only the built files:

### Option A: Using gh-pages Package

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Update package.json scripts:
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

### Option B: Manual GitHub Pages Setup

1. Create a new branch called `gh-pages`:
```bash
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push -u origin gh-pages
```

2. In GitHub repository settings:
   - Go to Pages
   - Source: "Deploy from a branch"
   - Branch: "gh-pages"
   - Folder: "/ (root)"
   - Save

## Troubleshooting

### Build Fails in GitHub Actions

Check the "Actions" tab for error logs:
1. Go to your repository
2. Click "Actions" tab
3. Click the failed workflow
4. Check the logs for error messages

Common issues:
- **Node version mismatch**: Update `.github/workflows/deploy.yml` with your Node version
- **Dependencies not installed**: Ensure `pnpm-lock.yaml` is committed
- **Build command fails**: Run `pnpm build` locally to debug

### Site Not Accessible

1. Verify repository is public (Settings → Visibility)
2. Wait 1-2 minutes after first deployment
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check GitHub Pages settings are correct

### Custom Domain

To use a custom domain (e.g., `learnport.example.com`):

1. Create `CNAME` file in `dist/` folder with your domain:
```
learnport.example.com
```

2. In GitHub repository settings:
   - Go to Pages
   - Custom domain: Enter your domain
   - Check "Enforce HTTPS"
   - Save

3. Update your domain's DNS settings to point to GitHub Pages:
   - Add A records pointing to GitHub's IP addresses
   - Or add CNAME record pointing to `YOUR_USERNAME.github.io`

See: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Continuous Deployment

Every time you push to main:
1. GitHub Actions automatically builds the app
2. Deploys to `https://YOUR_USERNAME.github.io/learnport-web`
3. Changes go live in 1-2 minutes

## Rollback to Previous Version

If something goes wrong:

```bash
# View commit history
git log --oneline

# Revert to previous commit
git revert <commit-hash>

# Push to trigger redeploy
git push origin main
```

## Performance Tips

### Enable Caching

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Setup pnpm cache
  uses: actions/cache@v3
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### Reduce Build Time

- Commit `pnpm-lock.yaml` to avoid reinstalling dependencies
- Use `--frozen-lockfile` flag in CI/CD
- Cache node_modules between builds

## Security

- ✅ HTTPS automatically enabled by GitHub Pages
- ✅ Repository can be private (but Pages requires public for free tier)
- ✅ No sensitive data in repository (use environment variables)

## Monitoring

### Check Deployment Status

```bash
# View recent deployments
git log --oneline -10

# Check GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/learnport-web/actions
```

### View Build Logs

1. Go to "Actions" tab
2. Click the latest workflow run
3. Click "build" job
4. Expand steps to see logs

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code to main branch
3. ✅ Enable GitHub Pages in settings
4. ✅ Wait for GitHub Actions to complete
5. ✅ Access your app at `https://YOUR_USERNAME.github.io/learnport-web`
6. Share the URL with your team!

## Support

- GitHub Pages Docs: https://docs.github.com/en/pages
- GitHub Actions Docs: https://docs.github.com/en/actions
- Troubleshooting: https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-common-issues-with-github-pages

## Example

If your GitHub username is `john-doe`:

```
Repository: https://github.com/john-doe/learnport-web
Live App: https://john-doe.github.io/learnport-web
```
