document.addEventListener("DOMContentLoaded", () => {
  const pasteBtn = document.getElementById("paste-code");
  const generateBtn = document.getElementById("generate");
  const copyBtn = document.getElementById("copy");
  const previewBtn = document.getElementById("preview");
  const codeArea = document.getElementById("code");
  const outputArea = document.getElementById("output");
  const problemName = document.getElementById("problem-name");
  const previewArea = document.getElementById("previewArea");

  // Try to extract problem title from current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const match = tab.title.match(/(.*?) - LeetCode/);
    if (match) {
      problemName.textContent = match[1];
    }
  });

  pasteBtn.addEventListener("click", async () => {
    const text = await navigator.clipboard.readText();
    codeArea.value = text;
  });

generateBtn.addEventListener("click", async () => {
  const code = codeArea.value;
  const title = problemName.textContent;

  try {
    const response = await chrome.runtime.sendMessage({
      action: "generateMarkdown",
      code,
      title
    });

    if (response && response.markdown) {
      outputArea.value = response.markdown;
    } else {
      outputArea.value = "❌ Failed to get response from Gemini.";
    }
  } catch (err) {
    console.error("Error talking to background script:", err);
    outputArea.value = "❌ Cannot connect to background script.";
  }
});


  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(outputArea.value);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📎 Copy Markdown"), 1500);
  });

  previewBtn.addEventListener("click", () => {
    const raw = outputArea.value;
    previewArea.innerHTML = marked.parse(raw);
    previewArea.style.display = previewArea.style.display === "none" ? "block" : "none";
  });


});

