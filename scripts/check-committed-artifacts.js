const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
  cwd: repositoryRoot,
  encoding: 'utf8'
}).split('\0').filter(Boolean);

const failures = [];

for (const file of trackedFiles) {
  if (/(?:^|\/)__pycache__(?:\/|$)|\.py[cod]$/i.test(file)) {
    failures.push(`${file}: generated Python bytecode must not be committed`);
  }

  if (/^data\/(?:history|favorites|logs)\.json$/i.test(file)) {
    failures.push(`${file}: runtime user data must not be committed`);
  }
}

const readmePath = path.join(repositoryRoot, 'README.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  if (/yourusername|your-username|your_org/i.test(readme)) {
    failures.push('README.md: replace repository-owner placeholders with the real project URL');
  }
}

if (failures.length > 0) {
  console.error('Repository hygiene check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('Repository hygiene check passed.');
}
