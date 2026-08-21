import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

describe('LearnPort web deployment readiness', () => {
  it('uses hash routing for static hosts without server-side rewrites', () => {
    expect(read('src/App.tsx')).toContain('HashRouter as Router');
  });

  it('emits the repository subpath only in GitHub Actions builds', () => {
    expect(read('vite.config.ts')).toContain("GITHUB_ACTIONS === 'true' ? '/learnport-web/' : '/'");
  });

  it('packages deployment-safe branded metadata', () => {
    expect(read('index.html')).toContain('./learnport-mark.svg');
    expect(fs.existsSync(path.join(projectRoot, 'public/learnport-mark.svg'))).toBe(true);
  });

  it('runs tests before building and deploys the Pages artifact', () => {
    const workflow = read('.github/workflows/github-pages.yml');
    expect(workflow).toContain('run: pnpm test');
    expect(workflow).toContain('run: pnpm build');
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v3');
    expect(workflow).toContain('uses: actions/deploy-pages@v4');
  });
});
