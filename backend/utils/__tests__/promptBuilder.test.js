/**
 * PromptBuilder 单元测试
 * 
 * @module promptBuilder.test
 */

const { builder, PromptBuilder, fromPrompt } = require('../promptBuilder');

describe('PromptBuilder', () => {

  // ============================================================
  // 基础构建
  // ============================================================
  describe('builder() 工厂函数', () => {
    test('应该返回 PromptBuilder 实例', () => {
      const b = builder();
      expect(b).toBeInstanceOf(PromptBuilder);
    });

    test('链式调用应该返回自身', () => {
      const b = builder();
      expect(b.role('test')).toBe(b);
      expect(b.task('test')).toBe(b);
      expect(b.context('test')).toBe(b);
    });
  });

  // ============================================================
  // role / persona
  // ============================================================
  describe('role()', () => {
    test('设置角色后应该包含在输出中', () => {
      const result = builder().role('资深设计师').task('设计Logo').build();
      expect(result.content).toContain('资深设计师');
    });

    test('空字符串不应该设置角色', () => {
      const result = builder().role('').task('测试').build();
      expect(result.content).not.toContain('角色');
    });
  });

  describe('persona()', () => {
    test('设置人设对象应该包含在输出中', () => {
      const result = builder()
        .persona({ name: '小明', expertise: 'UI设计' })
        .task('设计界面')
        .build();
      expect(result.content).toContain('小明');
    });
  });

  // ============================================================
  // task / context
  // ============================================================
  describe('task()', () => {
    test('任务描述应该包含在输出中', () => {
      const result = builder().task('生成一段营销文案').build();
      expect(result.content).toContain('生成一段营销文案');
    });
  });

  describe('context()', () => {
    test('上下文应该包含在输出中', () => {
      const result = builder()
        .context('用户是电商行业')
        .task('写文案')
        .build();
      expect(result.content).toContain('电商');
    });
  });

  // ============================================================
  // constraints
  // ============================================================
  describe('constraints()', () => {
    test('约束条件应该包含在输出中', () => {
      const result = builder()
        .task('写文章')
        .constraints(['不超过500字', '使用专业术语'])
        .build();
      expect(result.content).toContain('500');
      expect(result.content).toContain('专业术语');
    });

    test('空数组不应该影响输出', () => {
      const result = builder().task('测试').constraints([]).build();
      expect(result.content).toBeTruthy();
    });
  });

  // ============================================================
  // output format
  // ============================================================
  describe('output()', () => {
    test('输出格式应该包含在结果中', () => {
      const result = builder()
        .task('分析数据')
        .output('JSON格式')
        .build();
      expect(result.content).toContain('JSON');
    });
  });

  // ============================================================
  // variables
  // ============================================================
  describe('variable()', () => {
    test('添加变量应该记录在元数据中', () => {
      const result = builder()
        .task('测试')
        .variable('name', { required: true, description: '用户名' })
        .build();
      expect(result.variables).toBeDefined();
      expect(result.variables.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================
  // fewShot examples
  // ============================================================
  describe('fewShot()', () => {
    test('示例应该包含在输出中', () => {
      const result = builder()
        .task('分类')
        .fewShot([
          { input: '苹果', output: '水果' },
          { input: '汽车', output: '交通工具' }
        ])
        .build();
      expect(result.content).toContain('苹果');
      expect(result.content).toContain('水果');
    });
  });

  // ============================================================
  // sections
  // ============================================================
  describe('section()', () => {
    test('自定义段落应该包含在输出中', () => {
      const result = builder()
        .task('测试')
        .section('注意事项', '请仔细检查')
        .build();
      expect(result.content).toContain('注意事项');
      expect(result.content).toContain('仔细检查');
    });
  });

  // ============================================================
  // build() 输出格式
  // ============================================================
  describe('build()', () => {
    test('build() 结果应该有 content 属性', () => {
      const result = builder().task('测试').build();
      expect(result).toHaveProperty('content');
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);
    });

    test('build() 结果应该有 toJSON 方法', () => {
      const result = builder().task('测试').build();
      expect(typeof result.toJSON).toBe('function');
    });

    test('build() 结果应该有 toYAML 方法', () => {
      const result = builder().task('测试').build();
      expect(typeof result.toYAML).toBe('function');
    });

    test('build() 结果应该有 toMarkdown 方法', () => {
      const result = builder().task('测试').build();
      expect(typeof result.toMarkdown).toBe('function');
    });

    test('toJSON() 应该返回有效 JSON 字符串', () => {
      const result = builder().role('助手').task('测试').build();
      const json = result.toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    test('toMarkdown() 应该返回 Markdown 格式', () => {
      const result = builder().role('助手').task('测试').build();
      const md = result.toMarkdown();
      expect(md).toContain('#');
    });
  });

  // ============================================================
  // language
  // ============================================================
  describe('language()', () => {
    test('设置英文语言应该影响输出', () => {
      const result = builder().language('en').task('test task').build();
      expect(result.content).toBeTruthy();
    });

    test('设置中文语言应该影响输出', () => {
      const result = builder().language('zh-CN').task('测试任务').build();
      expect(result.content).toBeTruthy();
    });
  });

  // ============================================================
  // fromPrompt() 解析
  // ============================================================
  describe('fromPrompt()', () => {
    test('应该能解析包含角色的提示词并返回 PromptBuilder', () => {
      const b = fromPrompt('你是一位资深的UI设计师，请帮我设计一个登录页面');
      expect(b).toBeInstanceOf(PromptBuilder);
      const result = b.task('设计登录页面').build();
      expect(result.content).toBeTruthy();
    });

    test('空字符串应该返回 PromptBuilder 实例', () => {
      const b = fromPrompt('');
      expect(b).toBeInstanceOf(PromptBuilder);
    });
  });

  // ============================================================
  // 综合场景
  // ============================================================
  describe('综合场景', () => {
    test('完整的构建器链应该正常工作', () => {
      const result = builder()
        .role('资深UI设计师')
        .persona({ expertise: '10年经验', style: '极简主义' })
        .context('为一家科技创业公司设计品牌')
        .task('设计一套完整的品牌视觉系统')
        .constraints([
          '使用不超过3种主色调',
          '适合科技行业',
          '要有现代感'
        ])
        .output('详细的设计方案文档')
        .variable('brandName', { required: true, description: '品牌名称' })
        .fewShot([
          { input: 'Apple', output: '极简、高端、创新' }
        ])
        .section('特殊要求', '需要适配深色模式')
        .language('zh-CN')
        .build();

      expect(result.content).toBeTruthy();
      expect(result.content.length).toBeGreaterThan(50);
      expect(result.variables).toBeDefined();
    });
  });
});
