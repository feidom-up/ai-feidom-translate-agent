# AI English Learning Agent

基于 Mastra 框架构建的智能英语学习助手，专为中文用户设计。

## 🚀 功能特色

### 1. 智能翻译 + 词汇联想
- 输入英文句子，获得准确的中文翻译
- 自动提取相关词汇并提供中文释义
- 帮助用户扩展词汇量，提升学习效果

### 2. 双模式切换
- **学习模式**（默认）：翻译 + 词汇联想
- **翻译模式**：纯翻译，简洁高效

### 3. 场景化学习
- 分析用户翻译历史，智能推断常用场景
- 输入"总结"获得针对性的学习建议
- 生成 10 条相关场景的英文句子供练习

## 📁 项目结构

```
src/
├── mastra/
│   ├── agents/
│   │   └── translation-agent.ts    # 主 Agent 逻辑
│   ├── tools/
│   │   └── translation-tools.ts    # 工具集合
│   ├── workflows/
│   │   └── translation-workflows.ts # 工作流定义
│   └── index.ts                     # 入口文件
├── examples/
│   └── usage-example.ts            # 使用示例
└── package.json
```

## 🛠️ 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建 `.env` 文件：
```env
OPENAI_API_KEY=your_openai_api_key
# 或其他翻译 API 的配置
```

### 3. 运行示例
```bash
# 运行演示
npm run demo

# 交互模式
npm run interactive
```

## 💡 使用方法

### 基础翻译（学习模式）
```typescript
import { translationAgent } from './src/mastra/agents/translation-agent';

// 学习模式翻译
const result = await translationAgent.translate(
  "I would like to book a table for two people."
);

console.log(result);
// 输出：
// **翻译：** 我想预订一张两人桌。
// 
// **相关词汇：**
// - book: 预订
// - table: 桌子
// - people: 人们
```

### 模式切换
```typescript
// 切换到纯翻译模式
await translationAgent.switchMode('translate');

// 切换到学习模式
await translationAgent.switchMode('learn');
```

### 场景总结
```typescript
// 获取学习建议
const summary = await translationAgent.summarize();

console.log(summary);
// 输出：
// **检测到的常用场景：** 旅游, 商务邮件, 日常寒暄
// 
// **推荐学习句子（旅游场景）：**
// 1. Could you recommend a good restaurant nearby? - 你能推荐附近的好餐厅吗？
// 2. How much does it cost to get to the airport? - 去机场要多少钱？
// ...
```

## 🔧 自定义配置

### 修改工具行为
编辑 `src/mastra/tools/translation-tools.ts` 中的函数：

```typescript
// 自定义翻译 API
async function translateText(text: string): Promise<string> {
  // 接入你喜欢的翻译服务
  // 如: Google Translate, DeepL, 百度翻译等
}

// 自定义词汇提取逻辑
async function extractVocabulary(text: string): Promise<Array<{word: string, meaning: string}>> {
  // 使用 NLP 库或 LLM 提取关键词
}
```

### 数据存储配置
```typescript
// 配置数据库连接
async function saveToDatabase(data: any): Promise<void> {
  // 支持 SQLite, PostgreSQL, MongoDB 等
}
```

## 📋 待办事项

- [ ] 接入真实翻译 API（OpenAI/Google Translate/DeepL）
- [ ] 实现数据持久化（SQLite/PostgreSQL）
- [ ] 添加词汇难度分级
- [ ] 支持语音输入/输出
- [ ] 添加学习进度追踪
- [ ] 实现个性化推荐算法

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🔗 相关链接

- [Mastra Framework 文档](https://mastra.ai/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Google Translate API](https://cloud.google.com/translate)

## 📧 联系方式

如有问题或建议，请提交 Issue 或联系：
- Email: qiaoxiansen@hotmail.com
- GitHub: [@feidom-up](https://github.com/feidom-up)
