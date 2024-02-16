import { BrowserContext, Page } from "playwright";
import browser from "../../../root/utils/browser-playwright";
import clipboard from "node-clipboardy";
import tools from "../../../root/utils/tools";

let chatGptTab: Page;

const templates = {
  cakeRecipe: (args: Record<string, any>) => {
    return `Cake recipe of type ${args.type}`;
  },
};

export interface TemplateRequest {
  name: string;
  args: Record<string, any>;
}

//* the response is a markdown string
const runPrompt = async (prompt: string) => {
  // textarea[id="prompt-textarea"]
  await browser.writeToActiveInput(chatGptTab, prompt);

  const sendPromptButtonQuery = 'button[data-testid="send-button"]';
  await browser.elementAction(chatGptTab, {
    query: sendPromptButtonQuery,
    action: "click",
  });
  await tools.sleep(1000);

  // wait for the output to finish
  const button = await browser.findElement(chatGptTab, {
    query: sendPromptButtonQuery,
    timeout: 60000,
  });

  // save old data in clipboard
  const oldClipboardData = clipboard.readSync();

  await browser.keyboard(chatGptTab, {
    action: "press",
    keys: "Control+Shift+c",
  });
  await tools.sleep(2000);

  const promptOutput = clipboard.readSync();
  clipboard.writeSync(oldClipboardData);
  // console.log(`prompt output: ${promptOutput}`);

  await browser.keyboard(chatGptTab, {
    action: "press",
    keys: "Control+Shift+Backspace",
  });
  await tools.sleep(1000);
  await browser.keyboard(chatGptTab, {
    action: "press",
    keys: "Enter",
  });

  return promptOutput;
};

const prompt = async (driver: BrowserContext, prompt: string) => {
  if (!chatGptTab) {
    chatGptTab = await browser.newTab(driver, {
      url: "https://chat.openai.com",
    });
  }

  const response = await runPrompt(prompt);
  return response;
};

const promptTemplate = async (
  driver: BrowserContext,
  template: TemplateRequest,
) => {
  if (!chatGptTab) {
    chatGptTab = await browser.newTab(driver, {
      url: "https://chat.openai.com",
    });
  }

  const templatePropmpt = await templates[template.name](template.args);
  const response = await runPrompt(templatePropmpt);
  return response;
};

export default { prompt, promptTemplate };
