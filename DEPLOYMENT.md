# Deployment Guide

## Quick Deployment to GitHub Pages

Your portfolio is already set up to deploy automatically to GitHub Pages! The workflow is configured in `.github/workflows/static.yml`.

### Automatic Deployment

Every time you push to the `main` branch, GitHub Actions will automatically:
1. Build your site
2. Deploy it to GitHub Pages
3. Make it available at your custom domain (if configured)

### Manual Deployment Steps

If you need to deploy manually or make changes:

#### 1. Verify Repository Settings

```bash
# Navigate to your repository
cd /path/to/ManualQATester

# Check current branch
git branch

# Ensure you're on main branch
git checkout main
```

#### 2. GitHub Pages Settings

Go to GitHub repository settings:
1. Navigate to **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Custom domain (if applicable): `dpengineering.site`
4. Enforce HTTPS: ✅ Enabled

#### 3. Push Changes

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Your descriptive commit message"

# Push to main branch
git push origin main
```

#### 4. Monitor Deployment

1. Go to **Actions** tab in your repository
2. Watch the "Deploy static content to Pages" workflow
3. Wait for green checkmark ✅
4. Your site is live!

### Custom Domain Setup

If using a custom domain (like `dpengeneering.site`):

#### DNS Configuration

Add these DNS records at your domain registrar:

**For Apex Domain (dpengeneering.site):**
```
Type: A
Host: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: 3600
```

**For WWW Subdomain:**
```
Type: CNAME
Host: www
Value: papica777-eng.github.io
TTL: 3600
```

#### GitHub Pages Custom Domain

1. Add `CNAME` file to repository root (already included)
2. Content of CNAME file: `dpengeneering.site`
3. GitHub will automatically configure HTTPS

### Deployment Checklist

Before each deployment:

- [ ] Run all tests locally (see TESTING_CHECKLIST.md)
- [ ] Verify all links work
- [ ] Check responsive design on multiple devices
- [ ] Validate HTML/CSS
- [ ] Test in multiple browsers
- [ ] Review console for errors
- [ ] Update version/date if applicable
- [ ] Commit with clear message
- [ ] Push to main branch
- [ ] Verify deployment in Actions tab
- [ ] Test live site after deployment
- [ ] Verify custom domain works
- [ ] Check SSL certificate is valid

## Alternative Deployment Options

### 1. Netlify

Quick deployment to Netlify:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Advantages:
- Automatic HTTPS
- Form handling
- Redirects and rewrites
- Faster global CDN
- Preview deployments

### 2. Vercel

Deploy to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Advantages:
- Fast deployment
- Automatic HTTPS
- Edge network
- Analytics included
- Preview URLs

### 3. Cloudflare Pages

1. Connect GitHub repository
2. Configure build settings:
   - Build command: (none needed - static site)
   - Build output directory: `/`
3. Deploy

Advantages:
- Global CDN
- DDoS protection
- Fast performance
- Free SSL
- Analytics

### 4. Traditional Web Hosting

For traditional hosting (cPanel, etc.):

```bash
# Connect via FTP/SFTP
# Upload these files to public_html or www directory:

- index.html
- frontEND.html
- test-cases/
- bug-reports/
- test-plans/
- artifacts/
- WEBPorti/
- CNAME (if using custom domain)
- README.md
- NAVIGATION_GUIDE.md
```

Do NOT upload:
- .git/
- .github/
- node_modules/ (if present)
- .gitignore
- Development documentation

## Performance Optimization for Production

### Before Deploying

1. **Minify HTML** (optional for smaller file size)
   ```bash
   # Install html-minifier
   npm install -g html-minifier
   
   # Minify
   html-minifier --collapse-whitespace --remove-comments --minify-css --minify-js index.html -o index.min.html
   ```

2. **Compress Assets**
   - Most CDNs handle this automatically
   - GitHub Pages serves gzip-compressed files

3. **Verify External Resources**
   - Google Fonts CDN working
   - Font Awesome CDN working
   - All external links valid

### Post-Deployment Verification

Run these checks after deployment:

```bash
# Check site is accessible
curl -I https://dpengeneering.site

# Should return HTTP 200 OK
# Should show HTTPS (not HTTP)
# Should have proper headers
```

### Testing Production Site

1. **Lighthouse Audit**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run audit on live site
   - Target scores:
     - Performance: 90+
     - Accessibility: 95+
     - Best Practices: 95+
     - SEO: 95+

2. **PageSpeed Insights**
   - Visit https://pagespeed.web.dev/
   - Enter your URL
   - Test both mobile and desktop
   - Review suggestions

3. **Cross-Browser Testing**
   - Chrome/Edge (latest)
   - Firefox (latest)
   - Safari (latest)
   - Mobile browsers

## Continuous Improvement

### Monitoring

After deployment, monitor:

1. **GitHub Actions**
   - Check for failed deployments
   - Review build logs
   - Monitor build times

2. **Site Performance**
   - Use PageSpeed Insights weekly
   - Monitor load times
   - Check Core Web Vitals

3. **Error Tracking**
   - Check browser console
   - Monitor 404 errors
   - Review user feedback

### Regular Updates

Schedule regular updates:

- **Weekly**: Check for broken links
- **Monthly**: Review and update content
- **Quarterly**: Update dependencies (if any)
- **Annually**: Refresh design and content

## Rollback Procedure

If deployment causes issues:

### Quick Rollback

```bash
# View commit history
git log --oneline

# Identify last working commit
# Rollback to that commit
git revert HEAD

# Or rollback multiple commits
git reset --hard <commit-hash>

# Force push (use with caution)
git push origin main --force
```

### GitHub Pages Rollback

1. Go to **Actions** tab
2. Find last successful deployment
3. Click "Re-run jobs"
4. Previous version will be deployed

## Troubleshooting

### Common Issues

**Site not updating after push:**
- Clear browser cache (Ctrl+Shift+R)
- Wait 5-10 minutes for CDN propagation
- Check Actions tab for deployment status

**Custom domain not working:**
- Verify DNS records are correct
- Wait up to 48 hours for DNS propagation
- Check CNAME file exists in repository
- Verify GitHub Pages settings

**HTTPS not working:**
- Wait for SSL certificate provisioning (up to 24 hours)
- Verify DNS is configured correctly
- Check "Enforce HTTPS" is enabled in settings

**404 errors on some pages:**
- Verify file names and paths are correct
- Check case sensitivity (Linux is case-sensitive)
- Ensure all linked files exist

**Styles not loading:**
- Check browser console for errors
- Verify CDN links are correct
- Check for mixed content (HTTP vs HTTPS)

## Support Resources

### GitHub Pages
- [Documentation](https://docs.github.com/en/pages)
- [Community Forum](https://github.community/c/github-pages/)
- [Status Page](https://www.githubstatus.com/)

### Testing Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [HTML Validator](https://validator.w3.org/)
- [CSS Validator](https://jigsaw.w3.org/css-validator/)

### Performance
- [Web.dev](https://web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

---

**Last Updated**: December 2024
**Next Review**: After each major update

## Questions?

Contact: papica777@gmail.com
GitHub: [@papica777-eng](https://github.com/papica777-eng)
