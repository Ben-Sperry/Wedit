// Initialize markdown-it after pasting the markdown-it code at the top of this file
const md = markdownit();

// Toggle edit mode
document.getElementById("toggleEdit").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleEditMode
  });
});

function toggleEditMode() {
  document.body.contentEditable = document.body.contentEditable === "true" ? "false" : "true";
}

// Apply Markdown to selected text
document.getElementById("applyMarkdown").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Get selected text and render it as Markdown
  const selectedText = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getSelectedText
  });
  
  const mdHTML = md.render(selectedText[0].result);

  // Pass the rendered HTML to be inserted in place of the selected Markdown text
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: insertRenderedMarkdown,
    args: [mdHTML]
  });
});

// Function to get selected text within the page
function getSelectedText() {
  return window.getSelection().toString();
}

// Function to insert rendered HTML directly in place of selected Markdown text
function insertRenderedMarkdown(mdHTML) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();

  // Create a temporary element to hold the HTML
  const tempElement = document.createElement("div");
  tempElement.innerHTML = mdHTML;

  // Insert each node in the range
  Array.from(tempElement.childNodes).forEach(node => {
    range.insertNode(node);
  });

  // Collapse the selection to the end after inserting
  selection.collapseToEnd();
}


  
  