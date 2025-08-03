# Deployment Guide for curateMD

## Table of Contents

- [1. How to Create the /dist Folder](#1-how-to-create-the-dist-folder)
- [2. General Hosting Options](#2-general-hosting-options)
  - [2.1 Local Static Server (for testing)](#21-local-static-server-for-testing)
  - [2.2 Deploy to a Hosting Provider](#22-deploy-to-a-hosting-provider)
  - [2.3 Deploy on Your Own Server](#23-deploy-on-your-own-server)
    - [2.3.1 Nginx Configuration](#231-nginx-configuration)
    - [2.3.2 Apache Configuration](#232-apache-configuration)
- [3. Deploying to GitHub Pages (Recommended for Open Source Projects)](#3-deploying-to-github-pages-recommended-for-open-source-projects)
  - [3.1 Project Preparation](#31-project-preparation)
  - [3.2 Configure for GitHub Pages](#32-configure-for-github-pages)
  - [3.3 Deploy to GitHub Pages](#33-deploy-to-github-pages)
  - [3.4 Enable GitHub Pages](#34-enable-github-pages)
  - [3.5 Updating Your Deployment](#35-updating-your-deployment)
  - [3.6 Troubleshooting](#36-troubleshooting)
- [4. Local Testing (Optional)](#4-local-testing-optional)
- [5. Additional Resources](#5-additional-resources)

---

# Deployment Guide for curateMD

This guide explains how to deploy and host your Vite-based web app, including both general hosting options and a detailed guide for GitHub Pages.

---

## 1. How to Create the /dist Folder

Before you can deploy or serve your app, you need to build it for production. This will generate a `/dist` folder containing the static files to be hosted.

Run the following command in your project root:
```bash
npm run build
```
- This command uses Vite to bundle your app for production.
- The output will be placed in the `/dist` directory.
- All deployment and hosting steps below assume you have already run this command and have a `/dist` folder ready.

---

## 2. General Hosting Options

After building your app, you can host it in several ways:

### 2.1 Local Static Server (for testing)
- Install a simple static server:
  ```bash
  npm install -g serve
  serve -s dist
  ```
- Your app will be available at `http://localhost:3000` (or another port if specified).

### 2.2 Deploy to a Hosting Provider
- **Netlify, Vercel, or GitHub Pages** are popular for static sites.
- Push your code to a GitHub repository, then connect it to one of these services and follow their deployment instructions.
- For Netlify/Vercel, set the build command to `npm run build` and the publish directory to `dist`.

### 2.3 Deploy on Your Own Server

After building your app, upload the contents of the `dist/` folder to your server's web root directory (e.g., `/var/www/html`).

You must then configure your web server to serve these static files. Below are detailed instructions for the two most common web servers:

#### 2.3.1 Nginx Configuration

1. **Install Nginx** (if not already installed):
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Copy Files to Web Root:**
   ```bash
   scp -r dist/* username@your_server_ip:/var/www/html/
   ```
   Replace `username` and `your_server_ip` with your actual server credentials.

3. **Configure Nginx to Serve Static Files:**
   - Edit the default site configuration (usually at `/etc/nginx/sites-available/default`):
     ```bash
     sudo nano /etc/nginx/sites-available/default
     ```
   - Replace the `server` block with:
     ```nginx
     server {
         listen 80;
         server_name your_domain_or_ip;

         root /var/www/html;
         index index.html;

         location / {
             try_files $uri $uri/ /index.html;
         }
     }
     ```
     - `root` should point to the directory where you uploaded your `dist` files.
     - The `try_files` directive ensures client-side routing works for single-page apps.

4. **Restart Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

5. **Visit** `http://your_domain_or_ip` in your browser to see your app.

---

#### 2.3.2 Apache Configuration

1. **Install Apache** (if not already installed):
   ```bash
   sudo apt update
   sudo apt install apache2
   ```

2. **Copy Files to Web Root:**
   - Place your `dist` files in `/var/www/html/` (default web root).

3. **Enable .htaccess for SPA Routing (Optional but recommended for Vite/React):**
   - Create or edit `/var/www/html/.htaccess`:
     ```apache
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
     ```
   - This ensures that all routes are handled by `index.html` (important for client-side routing).

4. **Enable mod_rewrite:**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

5. **Ensure AllowOverride is enabled:**
   - Edit `/etc/apache2/sites-available/000-default.conf` and set:
     ```apache
     <Directory /var/www/html>
         AllowOverride All
     </Directory>
     ```
   - Restart Apache again:
     ```bash
     sudo systemctl restart apache2
     ```

6. **Visit** `http://your_domain_or_ip` in your browser to see your app.

---

## 3. Deploying to GitHub Pages (Recommended for Open Source Projects)

> **Note:** Before deploying, make sure you have created the `/dist` folder by running `npm run build` as described in the [1. How to Create the /dist Folder](#1-how-to-create-the-dist-folder) section.

### 3.1 Project Preparation

#### a. Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

#### b. Create a GitHub Repository
- Go to [GitHub](https://github.com/) and create a new repository (e.g., `curateMD`).
- **Do not** initialize with a README, .gitignore, or license (since your project already has these).

#### c. Add Remote and Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/curateMD.git
git branch -M main
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

---

### 3.2 Configure for GitHub Pages

#### a. Install `gh-pages` Package
This package helps deploy the `dist` folder to GitHub Pages.
```bash
npm install --save-dev gh-pages
```

#### b. Update `vite.config.ts` or `vite.config.js`
Add the `base` property to ensure assets are loaded correctly:
```js
// vite.config.ts or vite.config.js
export default defineConfig({
  // ...existing config...
  base: '/curateMD/', // Use your repo name here, with leading/trailing slashes
});
```

#### c. Add Deployment Scripts to `package.json`
Add these scripts:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

---

### 3.3 Deploy to GitHub Pages

#### a. Build and Deploy
```bash
npm run deploy
```
This will build your app and push the `dist` folder to the `gh-pages` branch.

---

### 3.4 Enable GitHub Pages

1. Go to your repository on GitHub.
2. Click **Settings** > **Pages**.
3. Under **Source**, select the `gh-pages` branch and `/ (root)` folder.
4. Save.

After a few minutes, your site will be live at:
```
https://YOUR_USERNAME.github.io/curateMD/
```

---

### 3.5 Updating Your Deployment

Whenever you make changes:
```bash
git add .
git commit -m "Describe your changes"
git push
npm run deploy
```

---

### 3.6 Troubleshooting

- If you see a blank page, double-check the `base` setting in `vite.config.ts` or `vite.config.js`.
- Make sure your repo is public (or you have GitHub Pages enabled for private repos).
- Ensure all dependencies are installed with `npm install` before building.

---

## 4. Local Testing (Optional)

To preview your production build locally:
```bash
npm install -g serve
serve -s dist
```
Then visit [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

---

## 5. Additional Resources
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

Feel free to reach out if you encounter any issues or need further assistance!