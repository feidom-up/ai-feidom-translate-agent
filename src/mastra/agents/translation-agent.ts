import { Agent } from '@mastra/core';
import { 
  translateWithVocabTool, 
  pureTranslateTool, 
  storeTranslationHistoryTool,
  analyzeScenariosTool,
  generateLearningSentencesTool,
  toggleModeTool
} from '../tools/translation-tools';
import { mainTranslationWorkflow } from '../workflows/translation-workflows';

export class TranslationAgent extends Agent {
  constructor() {
    super({
      name: 'translation-agent',
      instructions: `
你是一个专门帮助中国用户学习英语的 AI Agent。你的主要功能包括：

1. **翻译模式**：用户输入英文，你提供中文翻译
2. **学习模式**：用户输入英文，你提供中文翻译 + 相关词汇联想
3. **场景总结**：当用户输入"总结"时，分析用户的翻译历史，生成相关场景的学习句子

## 工作规则：
- 默认使用学习模式（翻译 + 词汇联想）
- 只做翻译工作，不要对用户输入进行回应或评论
- 保持输出简洁，专注于翻译和学习辅助
- 当用户输入"总结"时，提供 10 条相关场景的英文学习句子

## 模式切换：
- 用户说"切换到翻译模式"或"纯翻译模式" → 切换到纯翻译
- 用户说"切换到学习模式" → 切换到学习模式（默认）
      `,
      model: {
        provider: 'openai',
        name: 'gpt-4',
        toolChoice: 'auto'
      },
      tools: [
        translateWithVocabTool,
        pureTranslateTool,
        storeTranslationHistoryTool,
        analyzeScenariosTool,
        generateLearningSentencesTool,
        toggleModeTool
      ]
    });

    // 添加会话状态管理
    this.currentMode = 'learn'; // 默认学习模式
  }

  private currentMode: 'learn' | 'translate' = 'learn';

  async processInput(input: string): Promise<string> {
    try {
      // 执行主工作流
      const result = await mainTranslationWorkflow.execute({
        input: input.trim(),
        currentMode: this.currentMode
      });

      // 根据结果类型格式化输出
      return this.formatOutput(result);
    } catch (error) {
      console.error('Translation Agent Error:', error);
      return '抱歉，处理您的请求时出现了错误。';
    }
  }

  private formatOutput(result: any): string {
    const step_results = result.step_results?.route_workflow;
    
    if (!step_results) {
      return '处理结果异常，请重试。';
    }

    switch (step_results.type) {
      case 'learning_result':
        return this.formatLearningResult(step_results);
      
      case 'translate_result':
        return this.formatTranslateResult(step_results);
      
      case 'summary_result':
        return this.formatSummaryResult(step_results);
      
      case 'mode_change_result':
        this.currentMode = step_results.current_mode;
        return step_results.message;
      
      default:
        return '未知的结果类型。';
    }
  }

  private formatLearningResult(result: any): string {
    const { translation, vocabulary } = result;
    
    let output = `**翻译：** ${translation}\n\n`;
    
    if (vocabulary && vocabulary.length > 0) {
      output += '**相关词汇：**\n';
      vocabulary.forEach((vocab: any) => {
        output += `- ${vocab.word}: ${vocab.meaning}\n`;
      });
    }
    
    return output;
  }

  private formatTranslateResult(result: any): string {
    return `**翻译：** ${result.translation}`;
  }

  private formatSummaryResult(result: any): string {
    const { detected_scenarios, primary_scenario, learning_sentences } = result;
    
    let output = `**检测到的常用场景：** ${detected_scenarios.join(', ')}\n\n`;
    output += `**推荐学习句子（${primary_scenario}场景）：**\n`;
    
    learning_sentences.forEach((sentence: any, index: number) => {
      output += `${index + 1}. ${sentence.en} - ${sentence.zh}\n`;
    });
    
    return output;
  }

  // 公共方法供外部调用
  async translate(sentence: string): Promise<string> {
    return this.processInput(sentence);
  }

  async summarize(): Promise<string> {
    return this.processInput('总结');
  }

  async switchMode(mode: 'learn' | 'translate'): Promise<string> {
    const modeText = mode === 'learn' ? '学习模式' : '翻译模式';
    return this.processInput(`切换到${modeText}`);
  }

  getCurrentMode(): string {
    return this.currentMode;
  }
}

// 创建单例实例
export const translationAgent = new TranslationAgent();