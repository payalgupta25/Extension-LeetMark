// chrome.action.onClicked.addListener(() => {
//   chrome.tabs.create({ url: chrome.runtime.getURL("page.html") });
// });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateMarkdown") {
    const { title, code } = message;

    const prompt = `
You are a helpful coding assistant,leetcode solution generator with provided code. Given the LeetCode problem titled **${title}** and this code, generate a markdown document with the following format:
Use strictly this template and try to give points , content shouldn't be bulky looking but understandable , explain approach in easy points acc to points provided , understand intuition and provide easy interesting way to make others understand
explain in small 1 line why this complexity, dont start response with backtick
# Intuition
Explain the idea behind the solution in 2-3 lines.

# Approach
Describe how the problem is solved step by step.

# Complexity
- Time complexity: (mention exact)
- Space complexity: (mention exact)

# Code
\`\`\`java
${code}
\`\`\`
    `.trim();
    const apiKey = CONFIG.API_KEY;

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })
      .then((res) => res.json())
      .then((data) => {
        const markdown = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error generating markdown.";
        sendResponse({ markdown });
      })
      .catch((err) => {
        console.error("Gemini API Error:", err);
        sendResponse({ markdown: "Error fetching from Gemini API." });
      });
// sendResponse({ markdown: "### Dummy response for now" });
    return true; // Required to use sendResponse asynchronously
  }
});

