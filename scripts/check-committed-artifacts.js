const { spawnSync } = require('child_process');

const forbiddenPaths = [
  {
    pattern: /^(?:docs|rules)\//i,
    reason: 'private developer documentation'
  },
  {
    pattern: /(^|\/)progress(?:[-_. ].*)?\.md$/i,
    reason: 'private progress document'
  },
  {
    pattern: /(^|\/)\.claude(?:\/|$)|(^|\/)(?:agents|claude)\.md$/i,
    reason: 'private agent configuration'
  },
  {
    pattern: /(^|\/)(?:__pycache__|\.cache|\.graphify|graphify-out|\.gitnexus)(\/|$)/i,
    reason: 'generated cache or repository-analysis output'
  },
  {
    pattern: /\.py[co]$/i,
    reason: 'generated Python bytecode'
  },
  {
    pattern: /^data\/(?:favorites|history)\.json$/i,
    reason: 'runtime user data'
  },
  {
    pattern: /^models\/.*\.(?:gguf|onnx|bin|safetensors)$/i,
    reason: 'downloaded model data'
  },
  {
    pattern: /^logs\/(?!\.gitkeep$)/i,
    reason: 'runtime log file'
  },
  {
    pattern: /^skills\/(?:brand-strategy-advisor|color-theory-master|logo-critique-expert)(?:\/|$)/i,
    reason: 'experimental Skill excluded from the public snapshot'
  },
  {
    pattern: /^(?:\.releaserc\.json|\.github\/workflows\/release\.yml|CHANGELOG\.md)$/i,
    reason: 'removed release automation or generated changelog'
  }
];

function findForbiddenPaths(paths) {
  return paths.flatMap(filePath => {
    const rule = forbiddenPaths.find(candidate => candidate.pattern.test(filePath));
    return rule ? [{ filePath, reason: rule.reason }] : [];
  });
}

function getTrackedPaths() {
  const result = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || 'git ls-files failed');
  }
  return result.stdout.split('\0').filter(Boolean);
}

if (require.main === module) {
  try {
    const violations = findForbiddenPaths(getTrackedPaths());
    if (violations.length > 0) {
      console.error('The following private or generated files must not be committed:');
      for (const { filePath, reason } of violations) {
        console.error(`- ${filePath}: ${reason}`);
      }
      process.exitCode = 1;
    } else {
      console.log('Tracked files comply with the public repository boundary.');
    }
  } catch (error) {
    console.error(`Unable to check tracked files: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { findForbiddenPaths };
