# LearnPort Automatic Web Publishing

LearnPort publishes the standalone browser build automatically from the `main` branch through GitHub Actions. Every push to `main` runs the test suite, TypeScript check, production build, artifact upload, and Pages deployment. A manual `workflow_dispatch` trigger is also available for rerunning a release without creating a code change.

## One-time repository setup

GitHub Pages must be enabled once for the repository because the connected automation token cannot create the Pages site automatically. In [Repository Settings](https://github.com/coolnmc45/learnport-web/settings/pages), set **Source** to **GitHub Actions** and save. After that, the existing `.github/workflows/github-pages.yml` workflow owns subsequent deployments.

The workflow includes `actions/configure-pages@v5` with enablement enabled, but GitHub may still require the repository administrator to perform the first Pages setting change. The most recent attempt confirmed that the workflow reached the setup step but GitHub rejected site creation with `Resource not accessible by integration`.

## Release flow

| Event | Result |
| :--- | :--- |
| Push to `main` | Automatic test, type-check, build, and deploy sequence |
| Pull request to `main` | Validation build runs without deployment |
| Manual workflow dispatch | Re-run the validation and deployment sequence on demand |

The workflow deliberately deploys only after the build job succeeds. This prevents a failed test, type error, or production compilation error from reaching the published site.

## Verify a release

Use the repository’s **Actions** tab to inspect the latest `Deploy to GitHub Pages` run. A successful run will show green `Test`, `Type check`, `Build`, `Setup Pages`, `Upload artifact`, and `Deploy to GitHub Pages` steps. The deployment URL is shown in the workflow’s `deploy` job environment output.

The managed LearnPort web version remains available at [learnport-h3kw3ebv.manus.space](https://learnport-h3kw3ebv.manus.space). The standalone repository is [coolnmc45/learnport-web](https://github.com/coolnmc45/learnport-web).
