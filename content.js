console.log('Content script loaded');

// 首先检查 html2canvas 是否已加载
if (typeof html2canvas === 'undefined') {
  console.error('html2canvas is not loaded');
} else {
  console.log('html2canvas is loaded');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script', request);
  if (request.action === "generateImage") {
    console.log('Generating image');
    const selectedText = window.getSelection().toString();
    generateImage(selectedText);
  }
});

function generateImage(selectedText) {
  const context = getContext(selectedText);
  const pageInfo = getPageInfo();
  
  // 计算图片尺寸
  const fullText = (context.before + ' ' + selectedText.trim() + ' ' + context.after).trim();
  let { width, height } = calculateImageSize(fullText);

  // 创建 HTML 结构
  const container = document.createElement('div');
  container.className = 'text-image-container';
  container.style.width = `${width}px`;
  container.style.height = 'auto';
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
  container.style.color = '#333';
  container.style.lineHeight = '1.6';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'flex-start';
  container.style.position = 'relative';

  // 添加水印
  // const watermark = document.createElement('div');
  // watermark.textContent = 'Text to Image Sharer';
  // watermark.style.position = 'absolute';
  // watermark.style.top = '20px';
  // watermark.style.right = '20px';
  // watermark.style.color = '#e0e0e0';
  // watermark.style.fontSize = '14px';
  // watermark.style.transform = 'rotate(-45deg)';
  // container.appendChild(watermark);

  const contentContainer = document.createElement('div');
  contentContainer.style.marginBottom = '30px'; // 增加底部间距

  // 修改引号图标样式
  const quoteIcon = document.createElement('div');
  quoteIcon.textContent = '"';
  quoteIcon.style.fontSize = '64px'; // 增大引号大小
  quoteIcon.style.color = '#3498db';
  quoteIcon.style.lineHeight = '1';
  quoteIcon.style.marginBottom = '20px'; // 增加底部间距
  contentContainer.appendChild(quoteIcon);

  const textContainer = document.createElement('div');
  textContainer.style.fontSize = `${Math.max(16, Math.min(22, Math.floor(width / 22)))}px`; // 稍微减小字体大小
  textContainer.style.marginBottom = '30px';
  textContainer.style.whiteSpace = 'pre-wrap';
  textContainer.style.wordBreak = 'break-word';
  textContainer.style.lineHeight = '1.8'; // 增加行高，使文本看起来更轻松
  textContainer.style.color = '#333'; // 使用稍微浅一点的颜色

  // 添加前文上下文
  if (context.before) {
    const beforeContext = document.createElement('span');
    beforeContext.textContent = context.before;
    beforeContext.style.color = '#888'; // 灰色
    textContainer.appendChild(beforeContext);
  }

  // 添加高亮的选中文本，保留原始格式
  const highlightedText = document.createElement('span');
  highlightedText.style.color = '#000'; // 黑色
  highlightedText.style.fontWeight = '600'; // 使用 semi-bold 而不是 bold，看起来更轻盈
  
  // 将选中文本按行分割，并添加到 highlightedText 中
  selectedText.split('\n').forEach((line, index, array) => {
    highlightedText.appendChild(document.createTextNode(line));
    if (index < array.length - 1) {
      highlightedText.appendChild(document.createElement('br'));
    }
  });
  
  textContainer.appendChild(highlightedText);
  
  // 添加后文上下文
  if (context.after) {
    const afterContext = document.createElement('span');
    afterContext.textContent = context.after;
    afterContext.style.color = '#888'; // 灰色
    textContainer.appendChild(afterContext);
  }

  contentContainer.appendChild(textContainer);

  // 修改省略号样式
  if (fullText.length > 300) {
    const ellipsis = document.createElement('div');
    ellipsis.textContent = '...';
    ellipsis.style.fontSize = `${Math.max(16, Math.min(24, Math.floor(width / 20)))}px`;
    ellipsis.style.textAlign = 'center';
    ellipsis.style.marginTop = '10px';
    ellipsis.style.marginBottom = '10px';
    contentContainer.appendChild(ellipsis);
  }

  // 修改元信息容器样式
  const metaContainer = document.createElement('div');
  metaContainer.style.borderTop = '1px solid #e0e0e0';
  metaContainer.style.paddingTop = '10px';
  metaContainer.style.marginTop = '10px';
  metaContainer.style.fontSize = `${Math.max(12, Math.min(16, Math.floor(width / 30)))}px`;
  metaContainer.style.color = '#7f8c8d';

  const titleElement = document.createElement('div');
  titleElement.textContent = `标题：${pageInfo.title}`;
  titleElement.style.marginBottom = '5px';

  const dateElement = document.createElement('div');
  dateElement.textContent = `发布时间：${pageInfo.date}`;

  metaContainer.appendChild(titleElement);
  metaContainer.appendChild(dateElement);

  // 修改页脚容器样式
  const footerContainer = document.createElement('div');
  footerContainer.style.backgroundColor = '#3498db';
  footerContainer.style.color = 'white';
  footerContainer.style.padding = '10px 20px'; // 增加左右内边距
  footerContainer.style.marginTop = '10px';
  footerContainer.style.display = 'flex';
  footerContainer.style.justifyContent = 'space-between';
  footerContainer.style.alignItems = 'center';

  const brandContainer = document.createElement('div');
  brandContainer.style.display = 'flex';
  brandContainer.style.flexDirection = 'column';
  brandContainer.style.alignItems = 'flex-start';
  brandContainer.style.fontFamily = '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", sans-serif';

  const brandElement = document.createElement('div');
  brandElement.textContent = 'SnapShare';
  brandElement.style.fontSize = `${Math.max(14, Math.min(18, Math.floor(width / 28)))}px`;
  brandElement.style.fontWeight = 'bold';
  brandElement.style.letterSpacing = '0.5px'; // 添加字母间距，增加灵动感

  const sloganElement = document.createElement('div');
  sloganElement.textContent = '随选随分享，智慧在指尖';
  sloganElement.style.fontSize = `${Math.max(10, Math.min(14, Math.floor(width / 36)))}px`;
  sloganElement.style.marginTop = '2px';
  sloganElement.style.fontStyle = 'italic'; // 使用斜体增加灵动感

  brandContainer.appendChild(brandElement);
  brandContainer.appendChild(sloganElement);

  const qrCodeContainer = document.createElement('div');
  qrCodeContainer.style.display = 'flex';
  qrCodeContainer.style.flexDirection = 'row'; // 改为水平排列
  qrCodeContainer.style.alignItems = 'center';
  qrCodeContainer.style.justifyContent = 'flex-end'; // 靠右对齐

  const qrCodeElement = document.createElement('div');
  qrCodeElement.id = 'qrcode';
  qrCodeElement.style.backgroundColor = 'white';
  qrCodeElement.style.padding = '5px';

  const qrCodeText = document.createElement('div');
  qrCodeText.textContent = '长按识别二维码阅读全文';
  qrCodeText.style.fontSize = `${Math.max(8, Math.min(12, Math.floor(width / 40)))}px`; // 减小字体大小
  qrCodeText.style.marginRight = '10px'; // 添加右边距，与二维码保持一定距离
  qrCodeText.style.color = 'white'; // 确保文字颜色为白色，与背景对比
  qrCodeText.style.maxWidth = '80px'; // 限制文字宽度，防止过长
  qrCodeText.style.textAlign = 'right'; // 文字右对齐

  qrCodeContainer.appendChild(qrCodeText);
  qrCodeContainer.appendChild(qrCodeElement);

  footerContainer.appendChild(brandContainer);
  footerContainer.appendChild(qrCodeContainer);

  container.appendChild(contentContainer);
  container.appendChild(metaContainer);
  container.appendChild(footerContainer);

  // 将容器添加到文档中
  document.body.appendChild(container);

  // 生成二维码
  const qr = new QRCode(document.getElementById("qrcode"), {
    text: window.location.href,
    width: Math.floor(width / 8),
    height: Math.floor(width / 8),
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L,  // 改为 L 级别的纠错
    version: 10  // 指定更高的版本号
  });

  // 如果上面的代码仍然报错，可以尝试使用以下代码：
  /*
  const qr = new QRCode(document.getElementById("qrcode"), {
    text: window.location.href,
    width: Math.floor(width / 6),  // 增加二维码尺寸
    height: Math.floor(width / 6),
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L,
    version: 15  // 使用更高的版本号
  });
  */

  // 使用 html2canvas 将 HTML 转换为图片
  if (typeof html2canvas !== 'undefined') {
    // 等待一小段时间确保二维码已经渲染完成
    setTimeout(() => {
      const containerWidth = container.offsetWidth;
      html2canvas(container, {
        backgroundColor: 'white',
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 2,
        width: containerWidth,
        height: container.offsetHeight
      }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        showImage(image);
        // 移除容器
        document.body.removeChild(container);
      }).catch(error => {
        console.error('Error generating image:', error);
        // 确保在出错时也移除容器
        document.body.removeChild(container);
      });
    }, 100);
  } else {
    console.error('html2canvas is not available');
    document.body.removeChild(container);
  }
}

function calculateImageSize(text) {
  const minWidth = 360;
  const maxWidth = 720;
  const charPerLine = 20;
  const lineHeight = 1.6;
  const baseFontSize = 16;

  const lines = Math.ceil(text.length / charPerLine);
  const contentHeight = lines * lineHeight * baseFontSize;
  const extraHeight = 200;
  const totalHeight = contentHeight + extraHeight;

  let width = Math.max(minWidth, Math.min(maxWidth, text.length * 5));
  let height = Math.max(totalHeight, width * 4 / 3);

  return { width, height };
}

function getContext(selectedText) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { before: '', after: '' };
  }

  const range = selection.getRangeAt(0);
  const contextLength = 100;

  function cleanText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
  }

  function getTextContent(node) {
    return node && node.textContent ? node.textContent : '';
  }

  let beforeContext = '';
  let currentNode = range.startContainer;
  let currentOffset = range.startOffset;
  while (beforeContext.length < contextLength && currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const textContent = cleanText(getTextContent(currentNode));
      if (textContent) {
        const start = Math.max(0, currentOffset - (contextLength - beforeContext.length));
        beforeContext = textContent.substring(start, currentOffset) + ' ' + beforeContext;
        if (beforeContext.length >= contextLength) break;
      }
    }
    if (currentNode.previousSibling) {
      currentNode = currentNode.previousSibling;
      currentOffset = getTextContent(currentNode).length;
    } else {
      currentNode = currentNode.parentNode;
      currentOffset = 0;
    }
  }

  let afterContext = '';
  currentNode = range.endContainer;
  currentOffset = range.endOffset;
  while (afterContext.length < contextLength && currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const textContent = cleanText(getTextContent(currentNode));
      if (textContent) {
        const end = Math.min(textContent.length, currentOffset + (contextLength - afterContext.length));
        afterContext += ' ' + textContent.substring(currentOffset, end);
        if (afterContext.length >= contextLength) break;
      }
    }
    if (currentNode.nextSibling) {
      currentNode = currentNode.nextSibling;
      currentOffset = 0;
    } else {
      currentNode = currentNode.parentNode;
      currentOffset = getTextContent(currentNode).length;
    }
  }

  beforeContext = cleanText(beforeContext);
  afterContext = cleanText(afterContext);

  return {
    before: beforeContext.slice(-contextLength),
    after: afterContext.slice(0, contextLength)
  };
}

function getPageInfo() {
  const title = document.title || '无标题';
  let date = '';

  if (window.location.hostname === 'mp.weixin.qq.com') {
    const publishElement = document.querySelector('#publish_time');
    if (publishElement) {
      date = publishElement.textContent.trim();
    }
  } else {
    const metaDate = document.querySelector('meta[property="article:published_time"]');
    if (metaDate) {
      const publishDate = new Date(metaDate.content);
      date = publishDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      const possibleDateElements = document.evaluate(
        '//*[contains(text(), "发布") or contains(text(), "日期")]/following-sibling::*[1]',
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      if (possibleDateElements.snapshotLength > 0) {
        date = possibleDateElements.snapshotItem(0).textContent.trim();
      } else {
        date = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  }

  if (!date) {
    date = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return { title, date };
}

function showImage(imageData) {
  const imageWindow = window.open();
  imageWindow.document.write(`
    <html>
      <head>
        <title>生成的图片</title>
        <style>
          body { margin: 0; padding: 20px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          img { max-width: 100%; height: auto; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <img src="${imageData}" alt="Generated Image">
      </body>
    </html>
  `);
}
