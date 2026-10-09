# Optional GitHub publishing

Nothing in this package uploads or publishes itself. Review the files, licenses and source limitations before making them public. GitHub Pages content is normally publicly accessible.

1. Extract the ZIP. Open `index.html` locally to test it.
2. Create an empty repository under your own GitHub account, choosing its visibility. Upload the **extracted contents**, including `fonts/`, `audit/`, the notices, `.gitignore` and `.nojekyll`. Put `index.html` at the repository root, not inside an extra nested folder. Do not upload only the ZIP. If your file picker hides dotfiles, add `.gitignore` and the empty `.nojekyll` file separately.
3. Use **Add file → Upload files**, review the changed files and commit. The package fits GitHub's documented browser limit of 25 MiB per file and 100 files per upload. GitHub Desktop or Git can also upload it.
4. For a public website, open **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, choose your branch (usually `main`), choose **/(root)**, then **Save**.
5. Wait for GitHub's deployment to succeed. Open the address GitHub displays, and check a question, atlas and About/source links. No build command, API token or paid map service is required.

Keep the data and font notices alongside the code. Keep `LICENSE.txt`, which explains that this package adds no application-code license. Do not select a GitHub-generated license unless the appropriate rights holder separately authorizes that grant; third-party data/font terms remain separate. Publishing under a new web address starts a separate browser-storage origin: existing local-file or previously hosted progress does not automatically transfer.

Official instructions, checked 2026-10-08:
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
