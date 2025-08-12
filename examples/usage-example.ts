import { translationAgent } from '../src/mastra/agents/translation-agent';
import * as readline from 'readline';

// 使用示例
async function runExample() {
  console.log('=== AI 英语学习助手 Demo ===\n');

  try {
    // 1. 学习模式翻译（默认模式）
    console.log('1. 学习模式翻译：');
    const result1 = await translationAgent.translate(
      "I would like to book a table for two people at 7 PM tonight."
    );
    console.log(result1);
    console.log('\n');

    // 2. 切换到纯翻译模式
    console.log('2. 切换到纯翻译模式：');
    const modeSwitch = await translationAgent.switchMode('translate');
    console.log(modeSwitch);
    console.log('\n');

    // 3. 纯翻译模式
    console.log('3. 纯翻译模式翻译：');
    const result2 = await translationAgent.translate(
      "The weather is really nice today, perfect for a walk in the park."
    );
    console.log(result2);
    console.log('\n');

    // 4. 切换回学习模式
    console.log('4. 切换回学习模式：');
    const modeSwitch2 = await translationAgent.switchMode('learn');
    console.log(modeSwitch2);
    console.log('\n');

    // 5. 总结学习场景
    console.log('5. 总结学习场景：');
    const summary = await translationAgent.summarize();
    console.log(summary);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// 交互式命令行界面
async function startInteractiveMode() {
  console.log('=== AI 英语学习助手 ===');
  console.log('输入英文句子进行翻译学习');
  console.log('输入 "总结" 查看学习建议');
  console.log('输入 "学习模式" 或 "翻译模式" 切换模式');
  console.log('输入 "退出" 结束程序\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = () => {
    const currentMode = translationAgent.getCurrentMode();
    const modeText = currentMode === 'learn' ? '学习' : '翻译';
    
    rl.question(`[${modeText}模式] 请输入: `, async (input) => {
      if (input.trim() === '退出') {
        console.log('再见！');
        rl.close();
        return;
      }

      try {
        const result = await translationAgent.translate(input);
        console.log('\n' + result + '\n');
      } catch (error) {
        console.error('处理出错:', error);
      }

      askQuestion(); // 继续询问
    });
  };

  askQuestion();
}

// 导出函数供外部使用
export { runExample, startInteractiveMode };

// 如果直接运行此文件
if (require.main === module) {
  console.log('选择运行模式:');
  console.log('1. 运行示例 (runExample)');
  console.log('2. 交互模式 (startInteractiveMode)');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('请输入 1 或 2: ', (choice) => {
    rl.close();
    
    if (choice === '1') {
      runExample();
    } else if (choice === '2') {
      startInteractiveMode();
    } else {
      console.log('无效选择');
    }
  });
}
