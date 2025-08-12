import { Workflow, Step } from '@mastra/core';
import { 
  translateWithVocabTool, 
  pureTranslateTool, 
  storeTranslationHistoryTool,
  analyzeScenariosTool,
  generateLearningSentencesTool,
  toggleModeTool
} from '../tools/translation-tools';

// Workflow 1: 翻译 + 词汇联想（学习模式）
export const learningModeWorkflow = new Workflow({
  name: 'learning_mode_workflow',
  triggerSchema: {
    sentence: 'string'
  }
})
.addStep(
  new Step({
    id: 'translate_and_vocab',
    tool: translateWithVocabTool,
    inputMapper: (triggerData) => ({
      sentence: triggerData.sentence
    })
  })
)
.addStep(
  new Step({
    id: 'store_history',
    tool: storeTranslationHistoryTool,
    inputMapper: (triggerData, stepResults) => {
      const translateResult = stepResults.translate_and_vocab;
      const keywords = translateResult.related_vocab.map((v: any) => v.word);
      
      return {
        sentence: triggerData.sentence,
        translation: translateResult.translation,
        keywords
      };
    }
  })
)
.addStep(
  new Step({
    id: 'format_output',
    tool: null, // 这是一个纯数据处理步骤
    execute: (triggerData, stepResults) => {
      const translateResult = stepResults.translate_and_vocab;
      return {
        type: 'learning_result',
        original: triggerData.sentence,
        translation: translateResult.translation,
        vocabulary: translateResult.related_vocab,
        mode: 'learning'
      };
    }
  })
);

// Workflow 2: 纯翻译模式
export const translateModeWorkflow = new Workflow({
  name: 'translate_mode_workflow',
  triggerSchema: {
    sentence: 'string'
  }
})
.addStep(
  new Step({
    id: 'pure_translate',
    tool: pureTranslateTool,
    inputMapper: (triggerData) => ({
      sentence: triggerData.sentence
    })
  })
)
.addStep(
  new Step({
    id: 'store_history',
    tool: storeTranslationHistoryTool,
    inputMapper: (triggerData, stepResults) => ({
      sentence: triggerData.sentence,
      translation: stepResults.pure_translate.translation,
      keywords: [] // 纯翻译模式不提取关键词
    })
  })
)
.addStep(
  new Step({
    id: 'format_output',
    tool: null,
    execute: (triggerData, stepResults) => {
      return {
        type: 'translate_result',
        original: triggerData.sentence,
        translation: stepResults.pure_translate.translation,
        mode: 'translate'
      };
    }
  })
);

// Workflow 3: 总结学习场景
export const summarizeWorkflow = new Workflow({
  name: 'summarize_workflow',
  triggerSchema: {
    command: 'string' // 用户输入 "总结"
  }
})
.addStep(
  new Step({
    id: 'analyze_scenarios',
    tool: analyzeScenariosTool,
    inputMapper: () => ({
      history_limit: 200
    })
  })
)
.addStep(
  new Step({
    id: 'generate_sentences',
    tool: generateLearningSentencesTool,
    inputMapper: (triggerData, stepResults) => {
      // 取第一个最常用的场景
      const primaryScenario = stepResults.analyze_scenarios.scenarios[0];
      return {
        scenario: primaryScenario,
        count: 10,
        word_count: 100
      };
    }
  })
)
.addStep(
  new Step({
    id: 'format_summary',
    tool: null,
    execute: (triggerData, stepResults) => {
      const scenarios = stepResults.analyze_scenarios.scenarios;
      const sentences = stepResults.generate_sentences.sentences;
      
      return {
        type: 'summary_result',
        detected_scenarios: scenarios,
        primary_scenario: scenarios[0],
        learning_sentences: sentences,
        total_sentences: sentences.length
      };
    }
  })
);

// Workflow 4: 模式切换
export const toggleModeWorkflow = new Workflow({
  name: 'toggle_mode_workflow',
  triggerSchema: {
    mode: 'string' // 'learn' 或 'translate'
  }
})
.addStep(
  new Step({
    id: 'toggle_mode',
    tool: toggleModeTool,
    inputMapper: (triggerData) => ({
      mode: triggerData.mode as 'learn' | 'translate'
    })
  })
)
.addStep(
  new Step({
    id: 'confirm_mode',
    tool: null,
    execute: (triggerData, stepResults) => {
      return {
        type: 'mode_change_result',
        previous_mode: 'unknown', // 可以从会话状态获取
        current_mode: stepResults.toggle_mode.current_mode,
        message: `已切换到${stepResults.toggle_mode.current_mode === 'learn' ? '学习' : '翻译'}模式`
      };
    }
  })
);

// 主工作流 - 根据输入类型路由到不同的子工作流
export const mainTranslationWorkflow = new Workflow({
  name: 'main_translation_workflow',
  triggerSchema: {
    input: 'string',
    currentMode: 'string' // 'learn' 或 'translate'
  }
})
.addStep(
  new Step({
    id: 'route_workflow',
    tool: null,
    execute: async (triggerData) => {
      const { input, currentMode } = triggerData;
      
      // 检查是否是总结命令
      if (input.trim() === '总结') {
        return await summarizeWorkflow.execute({ command: input });
      }
      
      // 检查是否是模式切换命令
      if (input.includes('模式')) {
        const mode = input.includes('学习') ? 'learn' : 'translate';
        return await toggleModeWorkflow.execute({ mode });
      }
      
      // 根据当前模式执行对应的翻译工作流
      if (currentMode === 'learn') {
        return await learningModeWorkflow.execute({ sentence: input });
      } else {
        return await translateModeWorkflow.execute({ sentence: input });
      }
    }
  })
);

export {
  learningModeWorkflow,
  translateModeWorkflow,
  summarizeWorkflow,
  toggleModeWorkflow,
  mainTranslationWorkflow
};