chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateImage",
    title: "生成分享图片",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateImage") {
    chrome.tabs.sendMessage(tab.id, { action: "generateImage", selectedText: info.selectionText });
  }
});
