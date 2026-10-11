# Auto-Deploy Rule

Whenever any code change, feature, bug fix, or style edit is completed for the user:
1. Verify the changes locally (e.g., `npm run build`).
2. Automatically commit the changes with a concise semantic message:
   ```powershell
   git add .
   git commit -m "feat/fix: <description>"
   git push origin main
   ```
3. Pushing to `origin main` automatically triggers live deployment on the user's hosting platform (Vercel / Render / Netlify).
