// 创建 Markdown 转换器实例并配置表格选项
const converter = new showdown.Converter({
    tables: true,
    tasklists: true,
    strikethrough: true,
    tablesHeaderId: false,
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    literalMidWordUnderscores: true,
    smoothLivePreview: true
});

// 添加一个全局变量来跟踪当前文件类型
let currentFileType = 'markdown'; // 可能的值: 'markdown', 'word'

// 处理文件上传
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'md') {
        currentFileType = 'markdown';
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            document.getElementById('markdown-input').value = content;
            convertToHtml();
        };
        reader.readAsText(file);
    } else {
        alert('只支持上传 .md 格式的文件');
        // 清空文件输入框
        event.target.value = '';
    }
}

// 转换为 HTML 并显示在预览区
function convertToHtml() {
    const text = document.getElementById('markdown-input').value;
    if (currentFileType === 'markdown') {
        // 如果是 Markdown 输入，转换为 HTML 显示在预览区
        const htmlContent = converter.makeHtml(text);
        document.getElementById('preview').innerHTML = htmlContent;
    }
    // 如果是 Word 输入，保持原样（因为在 convertWordToMarkdown 中已经处理）
}

// Word 转 Markdown 的函数
async function convertWordToMarkdown(file) {
    try {
        document.getElementById('markdown-input').value = '正在转换文件，请稍候...';
        
        const arrayBuffer = await file.arrayBuffer();
        
        const options = {
            styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='标题 1'] => h1:fresh",
                "p[style-name='heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='标题 2'] => h2:fresh",
                "p[style-name='heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='标题 3'] => h3:fresh",
                "p[style-name='heading 3'] => h3:fresh",
                "p[font-size='28pt'] => h1:fresh",
                "p[font-size='24pt'] => h1:fresh",
                "p[font-size='20pt'] => h2:fresh",
                "p[font-size='18pt'] => h2:fresh",
                "p[font-size='16pt'] => h3:fresh",
                "p[font-size='14pt'] => h3:fresh",
                "p[font-weight='bold'] => p.bold:fresh",
                "r[font-weight='bold'] => strong:fresh",
                "p[style-name='Quote'] => blockquote:fresh",
                "p[style-name='引用'] => blockquote:fresh",
                "r[style-name='Strong'] => strong",
                "r[style-name='Emphasis'] => em"
            ]
        };
        
        const result = await mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options);
        
        if (result.messages.length > 0) {
            console.log('转换提示:', result.messages);
        }
        
        const html = result.value;
        
        if (!html) {
            throw new Error('文件内容为空');
        }
        
        // 将 HTML 转换为 Markdown
        const markdown = htmlToMarkdown(html);
        
        // 在编辑区显示 Markdown 内容
        document.getElementById('markdown-input').value = markdown;
        
        // 使用 showdown 将 Markdown 转换为 HTML 并显示在预览区
        const htmlContent = converter.makeHtml(markdown);
        document.getElementById('preview').innerHTML = htmlContent;
        
    } catch (error) {
        console.error('转换出错:', error);
        document.getElementById('markdown-input').value = '';
        alert('文件转换失败。错误信息：' + error.message);
    }
}

// 修改下载文件函数
async function downloadFile() {
    const text = document.getElementById('markdown-input').value;
    
    // 将Markdown转换为HTML
    const htmlContent = converter.makeHtml(text);
    
    // 创建完整的HTML文档
    const fullHtml = `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: "Microsoft YaHei", Arial, sans-serif;
                    line-height: 1.6;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    color: #333;
                    margin-top: 24px;
                    margin-bottom: 16px;
                }
                
                h1 { font-size: 28px; }
                h2 { font-size: 24px; }
                h3 { font-size: 20px; }
                
                p { margin-bottom: 16px; }
                
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 16px 0;
                }
                
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                
                th {
                    background-color: #f4f4f4;
                }
                
                code {
                    background-color: #f6f8fa;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: Consolas, monospace;
                }
                
                pre code {
                    display: block;
                    padding: 16px;
                    overflow-x: auto;
                }
                
                blockquote {
                    border-left: 4px solid #ddd;
                    padding-left: 16px;
                    margin: 16px 0;
                    color: #666;
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;
    
    // 创建Blob对象
    const blob = new Blob([fullHtml], { type: 'application/msword' });
    
    // 使用FileSaver保存文件
    saveAs(blob, 'converted-document.doc');
}

// HTML 转 Markdown 函数
function htmlToMarkdown(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    let markdown = '';
    
    // 添加处理表格的辅助函数
    function processTable(table) {
        let markdown = '\n';
        const rows = Array.from(table.rows);
        
        if (rows.length === 0) return '';
        
        // 处理表头
        const headerCells = Array.from(rows[0].cells);
        markdown += '| ' + headerCells.map(cell => cell.textContent.trim()).join(' | ') + ' |\n';
        markdown += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n';
        
        // 处理表格内容
        for (let i = 1; i < rows.length; i++) {
            const cells = Array.from(rows[i].cells);
            markdown += '| ' + cells.map(cell => cell.textContent.trim()).join(' | ') + ' |\n';
        }
        
        return markdown + '\n';
    }
    
    function processNode(node) {
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                const tagName = node.tagName.toLowerCase();
                const text = node.textContent.trim();
                
                // 标题识别逻辑
                if (text && text.length < 200) {  // 增加长度限制，避免误判
                    // 1. 处理标准标题标签
                    if (tagName.match(/^h[1-6]$/)) {
                        const level = tagName.charAt(1);
                        return `${'#'.repeat(parseInt(level))} ${text}\n\n`;
                    }
                    
                    // 2. 处理段落，检查是否应该被识别为标题
                    if (tagName === 'p') {
                        // 2.1 检查数字编号开头的标题
                        if (/^[1-9][.、]\s/.test(text)) {
                            return `# ${text}\n\n`;
                        }
                        
                        // 2.2 检查中文数字编号开头的标题
                        if (/^[一二三四五六七八九十][.、]\s/.test(text)) {
                            return `## ${text}\n\n`;
                        }
                        
                        // 2.3 检查带括号的编号
                        if (/^[(（][1-9][)）]\s/.test(text)) {
                            return `### ${text}\n\n`;
                        }
                        
                        // 2.4 检查特定文本模式
                        if (/^(论坛主题|各位学界同仁|会议形式|论坛主旨|主办方|时间地点)/i.test(text)) {
                            return `## ${text}\n\n`;
                        }
                        
                        // 2.5 检查年份开头的标题
                        if (/^20\d{2}年/.test(text) && text.length < 50) {
                            return `# ${text}\n\n`;
                        }
                        
                        // 2.6 检查特定格式的标题
                        if (/^".*"(征文|启事)$/.test(text)) {
                            return `# ${text}\n\n`;
                        }
                        
                        // 2.7 检查段落样式
                        const style = node.getAttribute('style') || '';
                        const className = node.getAttribute('class') || '';
                        if (style.includes('font-weight: bold') || 
                            style.includes('font-size') || 
                            className.includes('title') || 
                            className.includes('heading')) {
                            return `## ${text}\n\n`;
                        }
                        
                        // 普通段落
                        return `${text}\n\n`;
                    }
                    
                    // 其他元素的处理保持不变
                    switch (tagName) {
                        case 'strong':
                        case 'b':
                            return `**${text}**`;
                        case 'em':
                        case 'i':
                            return `*${text}*`;
                        case 'a':
                            const href = node.getAttribute('href');
                            return href ? `[${text}](${href})` : text;
                        case 'ul':
                            return Array.from(node.children)
                                .map(li => `- ${li.textContent.trim()}\n`)
                                .join('') + '\n';
                        case 'ol':
                            return Array.from(node.children)
                                .map((li, index) => `${index + 1}. ${li.textContent.trim()}\n`)
                                .join('') + '\n';
                        case 'blockquote':
                            return `> ${text}\n\n`;
                        case 'code':
                            return `\`${text}\``;
                        case 'pre':
                            return `\`\`\`\n${text}\n\`\`\`\n\n`;
                        case 'br':
                            return '\n';
                        case 'img':
                            const alt = node.getAttribute('alt') || '';
                            const src = node.getAttribute('src') || '';
                            return `![${alt}](${src})\n\n`;
                        case 'table':
                            return processTable(node);
                        default:
                            let result = '';
                            for (const child of node.childNodes) {
                                result += processNode(child);
                            }
                            return result;
                    }
                }
                return '';
            case Node.TEXT_NODE:
                return node.textContent.replace(/\s+/g, ' ');
            default:
                return '';
        }
    }
    
    // 处理整个文档
    for (const child of div.childNodes) {
        markdown += processNode(child);
    }
    
    // 清理和优化最终的 Markdown
    return markdown
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\*\*\s+\*\*/g, '')
        .replace(/\*\s+\*/g, '')
        .replace(/\[\s*\]\(\s*\)/g, '')
        .trim();
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('file-input').addEventListener('change', handleFileUpload);
    document.getElementById('markdown-input').addEventListener('input', convertToHtml);
}); 