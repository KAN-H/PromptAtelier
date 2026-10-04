const {
  findDisallowedSkillIds,
  findForbiddenPaths
} = require('../../../scripts/check-committed-artifacts');

describe('repository artifact boundary', () => {
  test('rejects private, generated, runtime, release, and experimental paths', () => {
    const violations = findForbiddenPaths([
      'docs/PROGRESS.md',
      'rules/deploy.md',
      'AGENTS.md',
      'skills/nippon-colors/__pycache__/generator.cpython-312.pyc',
      'data/history.json',
      'models/qwen3-0.6b.gguf',
      'skills/logo-critique-expert/SKILL.md',
      '.github/workflows/release.yml'
    ]);

    expect(violations.map(({ filePath }) => filePath)).toEqual([
      'docs/PROGRESS.md',
      'rules/deploy.md',
      'AGENTS.md',
      'skills/nippon-colors/__pycache__/generator.cpython-312.pyc',
      'data/history.json',
      'models/qwen3-0.6b.gguf',
      'skills/logo-critique-expert/SKILL.md',
      '.github/workflows/release.yml'
    ]);
  });

  test('allows public product content and supported Skills', () => {
    expect(findForbiddenPaths([
      'README.md',
      '.github/workflows/nodejs-tests.yml',
      'schemas/image_prompt_schema.json',
      'examples/image_prompt_example.json',
      'skills/index.json',
      'skills/nippon-colors/SKILL.md'
    ])).toEqual([]);
  });

  test('rejects non-approved Skill IDs in the tracked index', () => {
    expect(findDisallowedSkillIds({
      skills: [
        { id: 'nippon-colors' },
        { id: 'logo-critique-expert' },
        { id: 'color-theory-master' }
      ]
    })).toEqual(['logo-critique-expert', 'color-theory-master']);
  });
});
