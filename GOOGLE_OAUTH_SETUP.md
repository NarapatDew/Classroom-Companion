# Google OAuth Setup Guide for Vercel Deployment

## Problem: redirect_uri_mismatch Error

This error occurs when the redirect URI used by your application doesn't match the ones configured in Google Cloud Console.

## Solution

### Step 1: Get Your Vercel Deployment URL

1. Go to your Vercel project dashboard
2. Copy your production deployment URL (e.g., `https://your-app.vercel.app`)
3. If you have preview deployments, note those URLs too (e.g., `https://your-app-git-branch.vercel.app`)

### Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one if you don't have it)
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development with Vite)
   - `http://localhost:3000` (if using a different port)
   - `https://your-app.vercel.app` (your Vercel production URL)
   - `https://*.vercel.app` (for all Vercel preview deployments - wildcard support)

6. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173` (for local development)
   - `http://localhost:3000` (if using a different port)
   - `https://your-app.vercel.app` (your Vercel production URL)
   - `https://*.vercel.app` (for all Vercel preview deployments)

   **Note:** For `@react-oauth/google` with `useGoogleLogin`, the redirect URI is automatically set to `window.location.origin`, so you need to add the full origin URLs.

### Step 3: Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add `VITE_GOOGLE_CLIENT_ID` with your Google OAuth Client ID
4. Make sure it's available for **Production**, **Preview**, and **Development** environments

### Step 4: Verify Configuration

After updating the Google Cloud Console:
- Wait a few minutes for changes to propagate
- Clear your browser cache
- Try logging in again

## Common Issues

### Issue: Still getting redirect_uri_mismatch after adding URLs

**Solutions:**
- Make sure you're using the exact URL (including `https://` and no trailing slash)
- Wait 5-10 minutes for Google's changes to propagate
- Check that you added the URL to both "Authorized JavaScript origins" AND "Authorized redirect URIs"
- Verify your Vercel deployment URL matches exactly what's in Google Cloud Console

### Issue: Works locally but not on Vercel

**Solutions:**
- Make sure `VITE_GOOGLE_CLIENT_ID` is set in Vercel environment variables
- Verify the Vercel URL is added to Google Cloud Console
- Check that the environment variable is available for the correct environment (Production/Preview)

### Issue: Preview deployments don't work

**Solutions:**
- Add the specific preview URL to Google Cloud Console, OR
- Use a wildcard pattern `https://*.vercel.app` (if supported by Google)
- Alternatively, add each preview URL manually as you create them

## Testing

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   Make sure `http://localhost:5173` is in your Google Cloud Console

2. **Vercel Testing:**
   - Deploy to Vercel
   - Check the deployment URL
   - Verify it's in Google Cloud Console
   - Test the login flow

## Additional Notes

- The `useGoogleLogin` hook from `@react-oauth/google` uses a popup-based OAuth flow
- The redirect URI is automatically set to `window.location.origin`
- You cannot override the redirect URI in `useGoogleLogin`, so make sure all your deployment URLs are whitelisted in Google Cloud Console

