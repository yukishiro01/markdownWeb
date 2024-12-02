// 编辑器核心类
class MarkdownEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.titleInput = document.getElementById('docTitle');
        this.saveBtn = document.getElementById('saveBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.lastContent = '';
        this.lastTitle = '';
        this.autoSaveTimeout = null;
        
        // 检查是否是编辑模式
        this.editingDocId = localStorage.getItem('editingDocId');
        if (this.editingDocId) {
            // 获取要编辑的文档
            const documents = JSON.parse(localStorage.getItem('documents'));
            const doc = documents.find(d => d.id === parseInt(this.editingDocId));
            if (doc) {
                // 填充文档内容
                this.titleInput.value = doc.title;
                this.editor.value = doc.content;
                this.lastContent = doc.content;
                this.lastTitle = doc.title;
            }
            // 清除编辑标记
            localStorage.removeItem('editingDocId');
        } else {
            // 新文档，加载初始内容
            this.editor.value = this.getInitialContent();
        }
        
        this.initConverter();
        this.bindEvents();
        this.updatePreview();
    }

    initConverter() {
        this.converter = new showdown.Converter({
            tables: true,
            tasklists: true,
            strikethrough: true,
            emoji: true,
            underline: true,
            ghCodeBlocks: true,
            simpleLineBreaks: true,
            ghMentions: true,
            parseImgDimensions: true,
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            openLinksInNewWindow: true,
            omitExtraWLInCodeBlocks: true,
            backslashEscapesHTMLTags: true,
            completeHTMLDocument: false,
            metadata: true,
            splitAdjacentBlockquotes: true,
            disableForced4SpacesIndentedSublists: true,
            ghCompatibleHeaderId: true,
            rawHeaderId: true,
            ghMentionsLink: 'https://github.com/{u}',
            requireSpaceBeforeHeadingText: true,
            smartIndentationFix: true,
            smoothLivePreview: true,
            literalMidWordUnderscores: true,
            literalMidWordAsterisks: true,
            customizedHeaderId: true,
            moreStyling: true,
            extensions: [
                {
                    type: 'lang',
                    regex: /={2}([^=]+)={2}/g,
                    replace: '<mark>$1</mark>'
                }
            ]
        });
        this.converter.setFlavor('github');
    }

    updatePreview() {
        const markdown = this.editor.value;
        const html = this.converter.makeHtml(markdown);
        this.preview.innerHTML = html;
        this.preview.querySelectorAll('table').forEach(table => {
            table.classList.add('layui-table');
        });
    }

    saveDocument() {
        const title = this.titleInput.value.trim();
        const content = this.editor.value;

        if (!title) {
            Toast.error('请输入文档标题');
            this.titleInput.focus();
            return;
        }

        if (!content) {
            Toast.error('文档内容不能为空');
            this.editor.focus();
            return;
        }

        let result;
        if (this.editingDocId) {
            // 更新已有文档
            result = DB.documents.update(parseInt(this.editingDocId), title, content);
        } else {
            // 创建新文档
            result = DB.documents.create(title, content);
        }

        if (result.success) {
            Toast.success(this.editingDocId ? '文档已更新' : '文档已保存');
            this.lastContent = content;
            this.lastTitle = title;
        } else {
            Toast.error(result.message);
        }
    }

    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        if (this.titleInput.value.trim()) {
            this.autoSaveTimeout = setTimeout(() => this.saveDocument(), 2000);
        }
    }

    async exportDocument() {
        const title = this.titleInput.value.trim();
        if (!title) {
            Toast.error('请先输入文档标题');
            this.titleInput.focus();
            return;
        }

        const markdown = this.editor.value;
        if (!markdown) {
            Toast.error('文档内容不能为空');
            this.editor.focus();
            return;
        }

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.converter.makeHtml(markdown);
            
            const html = this.generateExportHTML(title, tempDiv.innerHTML);
            this.downloadHTML(title, html);
            
            Toast.success('文档导出成功');
            Toast.success('如有图片请手动移至output下否则无法正常显示,由于浏览器对Js限制无法指定目录输出');
        } catch (error) {
            console.error('导出失败:', error);
            Toast.error('导出失败，请重试');
        }
    }

    generateExportHTML(title, content) {
        return `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .preview-content h1 { font-size: 2.5em; font-weight: bold; margin: 24px 0 16px; }
        .preview-content h2 { font-size: 2em; font-weight: bold; margin: 24px 0 16px; }
        .preview-content h3 { font-size: 1.5em; font-weight: bold; margin: 24px 0 16px; }
        .preview-content h4 { font-size: 1.25em; font-weight: bold; margin: 24px 0 16px; }
        .preview-content h5 { font-size: 1.1em; font-weight: bold; margin: 24px 0 16px; }
        .preview-content h6 { font-size: 1em; font-weight: bold; margin: 24px 0 16px; }
        
        .preview-content p { margin: 0 0 16px; line-height: 1.6; }
        
        .preview-content ul, 
        .preview-content ol { margin: 0 0 16px; padding-left: 2em; }
        
        .preview-content li { margin: 0.25em 0; }
        .preview-content li > p { margin-top: 16px; }
        
        .preview-content pre {
            background-color: #f6f8fa;
            padding: 16px;
            border-radius: 6px;
            overflow: auto;
            margin: 16px 0;
        }
        
        .preview-content code {
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 85%;
            padding: 0.2em 0.4em;
            background-color: #f6f8fa;
            border-radius: 3px;
        }
        
        .preview-content pre code {
            padding: 0;
            background-color: transparent;
        }
        
        .preview-content blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: 0.25em solid #dfe2e5;
            margin: 16px 0;
        }
        
        .preview-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        
        .preview-content table th,
        .preview-content table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
        
        .preview-content img {
            max-width: 100%;
            height: auto;
            margin: 16px 0;
        }
        
        .preview-content mark {
            background-color: #ffeb3b;
            color: #000;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="preview-content">
        ${content}
    </div>
</body>
</html>`;
    }

    downloadHTML(title, html) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    insertMarkdown(type) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const text = this.editor.value;
        const selection = text.substring(start, end);
        let insertion = '';

        const insertions = {
            bold: `**${selection || '粗体文本'}**`,
            italic: `*${selection || '斜体文本'}*`,
            strikethrough: `~~${selection || '删除线文本'}~~`,
            h1: `\n# ${selection || '一级标题'}\n`,
            h2: `\n## ${selection || '二级标题'}\n`,
            h3: `\n### ${selection || '三级标题'}\n`,
            ul: `\n- ${selection || '列表项'}\n`,
            ol: `\n1. ${selection || '列表项'}\n`,
            task: `\n- [ ] ${selection || '任务项'}\n`,
            quote: `\n> ${selection || '引用文本'}\n`,
            code: selection ? `\n\`\`\`\n${selection}\n\`\`\`\n` : '\n```\n代码块\n```\n',
            link: `[${selection || '链接文本'}](url)`,
            image: `![${selection || '图片描述'}](../img/Cat.jpg)`,
            table: `\n| 表头1 | 表头2 | 表头3 |\n|--------|:--------:|--------:|\n| 左对齐 | 居中 | 右对齐 |\n| 内容 | 内容 | 内容 |\n`
        };

        insertion = insertions[type] || '';

        this.editor.value = text.substring(0, start) + insertion + text.substring(end);
        this.editor.focus();
        
        const newCursorPos = start + insertion.length;
        this.editor.setSelectionRange(newCursorPos, newCursorPos);
        
        this.editor.dispatchEvent(new Event('input'));
    }

    getInitialContent() {
        return `# 欢迎使用 MarkdownWeb 编辑器

## 快速开始

1. 在左侧输入 Markdown 文本
2. 右侧实时预览渲染效果
3. 文档会自动保存

### 支持的功能

- 实时预览
- 自动保存
- GitHub 风格 Markdown
- ==文本高亮== 支持
- 数学公式
- 代码高亮
- 表格
- 任务列表
- 等等...

### 图片示例

![编辑器示例](../img/Cat.jpg)

### 表格示例

| 功能 | 支持 | 备注 |
|------|:----:|------|
| 表格 | ✓ | 支持对齐 |
| 代码 | ✓ | 支持高亮 |
| 图片 | ✓ | 支持大小 |

### 代码示例

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### 任务列表示例

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 待办事项

### 引用示例

> 这是一段引用文本
> 可以有多行
>> 也可以嵌套引用

开始写作吧！`;
    }

    bindEvents() {
        this.editor.addEventListener('input', () => {
            this.updatePreview();
            this.scheduleAutoSave();
        });

        this.titleInput.addEventListener('input', () => {
            if (!this.titleInput.value.trim()) {
                this.titleInput.classList.add('border-red-500');
            } else {
                this.titleInput.classList.remove('border-red-500');
            }
        });

        this.saveBtn.addEventListener('click', () => this.saveDocument());
        this.exportBtn.addEventListener('click', () => this.exportDocument());
        this.helpBtn.addEventListener('click', () => {
            window.open('help.html', '_blank');
        });

        // 添加快捷键支持
        this.editor.addEventListener('keydown', (e) => {
            // Ctrl + B：粗体
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.insertMarkdown('bold');
            }
            // Ctrl + I：斜体
            else if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                this.insertMarkdown('italic');
            }
            // Ctrl + K：插入链接
            else if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.insertMarkdown('link');
            }
            // Tab：缩进
            else if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.editor.selectionStart;
                const end = this.editor.selectionEnd;
                const text = this.editor.value;
                
                if (e.shiftKey) {
                    // Shift + Tab：减少缩进
                    const lines = text.substring(0, end).split('\n');
                    const currentLine = lines[lines.length - 1];
                    if (currentLine.startsWith('    ')) {
                        // 移除四个空格
                        lines[lines.length - 1] = currentLine.substring(4);
                        const newText = lines.join('\n');
                        this.editor.value = newText + text.substring(end);
                        this.editor.setSelectionRange(start - 4, end - 4);
                    }
                } else {
                    // Tab：增加缩进
                    this.editor.value = text.substring(0, start) + '    ' + text.substring(end);
                    this.editor.setSelectionRange(start + 4, start + 4);
                }
                this.editor.dispatchEvent(new Event('input'));
            }
        });
    }
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (!Nav.requireAuth()) {
        return;
    }
    Nav.updateNavState();
    window.editor = new MarkdownEditor();
});

// 暴露insertMarkdown方法供全局调用
window.insertMarkdown = function(type) {
    window.editor.insertMarkdown(type);
};