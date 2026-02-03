// chrome.action.onClicked.addListener(() => {
//   chrome.tabs.create({ url: chrome.runtime.getURL("page.html") });
// });
importScripts('config.js');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateMarkdown") {
    const { title, code } = message;

    const prompt = `
You are a helpful coding assistant,leetcode solution generator with provided code. Given the LeetCode problem titled **${title}** and this code, generate a markdown document with the following format:
Use strictly this template and try to give detailed points , content shouldn't be bulky looking but understandable , explain approach in easy points acc to points provided , understand intuition and provide easy interesting way to make others understand
explain in small 1 line why this complexity, dont start response with backtick
# Intuition
Explain the idea behind the solution in 2-3 points or however much you feel is sufficient to make people understand in good playful manner.

# Approach
Describe how the problem is solved step by step using the code pasted , dont explain your approach, explain steps according to code pasted only.

# Complexity
- Time complexity: (mention exact) according to code pasted 
- Space complexity: (mention exact) according to code pasted

# Code
\`\`\`java
${code}
\`\`\`
    `.trim();
    const apiKey = CONFIG.API_KEY;

    async function tryModels(models) {
      for (let i = 0; i < models.length; i++) {
        const model = "openai/gpt-oss-20b";
        try {
          console.log(`Trying model: ${model}`);
          const res = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 2048
            })
          });

          const data = await res.json();
          console.log(`Groq API Response for model ${model}:`, JSON.stringify(data, null, 2));

          if (data?.error) {
            const msg = (data.error.message || "").toLowerCase();
            // If model is decommissioned or access denied, continue to next model
            if (msg.includes("decommissioned") || msg.includes("no longer supported") || msg.includes("deprecated") || msg.includes("does not exist") || msg.includes("access")) {
              console.warn(`Model ${model} unavailable: ${data.error.message}. Trying next model.`);
              continue;
            }

            // Other API errors are fatal
            return { error: `API Error: ${data.error.message}` };
          }

          const markdown = data?.choices?.[0]?.message?.content;
          if (markdown) {
            return { markdown };
          }

          // If no markdown extracted, try next model
          console.warn(`No content from model ${model}, trying next model.`);
        } catch (err) {
          console.error(`Fetch error for model ${model}:`, err);
          // On network/other fetch errors, try next model
          continue;
        }
      }

      return { error: "No available models returned a valid response." };
    }

    tryModels(modelsToTry).then((result) => {
      if (result.error) {
        sendResponse({ markdown: `❌ ${result.error}` });
      } else {
        sendResponse({ markdown: result.markdown });
      }
    });
// sendResponse({ markdown: "### Dummy response for now" });
    return true; // Required to use sendResponse asynchronously
  }
});

