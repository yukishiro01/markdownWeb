document.addEventListener('DOMContentLoaded', () => {
    Nav.updateNavState();
    initHelp();
});

function initHelp() {
    const helpContent = getHelpContent();
    const converter = new showdown.Converter({
        tables: true,
        tasklists: true,
        strikethrough: true,
        emoji: true,
        underline: true,
        ghCodeBlocks: true
    });
    
    // 渲染内容
    document.getElementById('content').innerHTML = converter.makeHtml(helpContent);
    
    // 生成目录
    const headers = document.querySelectorAll('.preview-content h2, .preview-content h3');
    const toc = document.getElementById('toc');
    
    headers.forEach(header => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.textContent = header.textContent;
        a.className = header.tagName === 'H3' ? 'pl-4 opacity-80' : 'font-bold';
        a.classList.add('hover:text-gray-200');
        
        li.appendChild(a);
        toc.appendChild(li);
        
        // 添加点击事件，平滑滚动
        a.addEventListener('click', (e) => {
            e.preventDefault();
            header.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function getHelpContent() {
    return `# Markdown 语法指南

## 基本语法

### 标题

使用 \`#\` 符号表示标题，一个到六个 \`#\` 表示不同级别的标题：

\`\`\`markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
\`\`\`

### 文本格式化

- **粗体**：使用 \`**文本**\` 或 \`__文本__\`
- *斜体*：使用 \`*文本*\` 或 \`_文本_\`
- ~~删除线~~：使用 \`~~文本~~\`
- ==高亮==：使用 \`==文本==\`

### 列表

无序列表使用 \`-\`、\`*\` 或 \`+\`：

\`\`\`markdown
- 项目1
- 项目2
  - 子项目2.1
  - 子项目2.2
\`\`\`

有序列表使用数字加点：

\`\`\`markdown
1. 第一项
2. 第二项
3. 第三项
\`\`\`

任务列表：

\`\`\`markdown
- [x] 已完成任务
- [ ] 未完成任务
\`\`\`

## 高级语法

### 链接和图片

链接：\`[链接文本](URL)\`
图片：\`![图片描述](图片URL)\`

示例：
[面包🐱](https://github.com)
![示例图片](../img/Cat.jpg)

### 表格

\`\`\`markdown
| 表头1 | 表头2 | 表头3 |
|-------|:-----:|------:|
| 左对齐 | 居中 | 右对齐 |
| 内容 | 内容 | 内容 |
\`\`\`

### 代码

行内代码使用反引号：\`code\`

代码块使用三个反引号：

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### 引用

使用 \`>\` 符号：

> 这是一段引用文本
>> 这是嵌套引用

### 分隔线

使用三个或更多的 \`-\` 或 \`*\`：

---

## 编辑器快捷键

- Ctrl + B：粗体
- Ctrl + I：斜体
- Ctrl + K：插入链接
- Tab：缩进
- Shift + Tab：减少缩进

## 最佳实践

1. 标题层级不要跳级使用
2. 代码块指定语言以获得语法高亮
3. 表格对齐标记放在表头下方
4. 图片建议添加 alt 文本
5. 使用相对路径引用本地图片

## 常见问题

### 为什么预览效果与预期不符？

- 检查 Markdown 语法是否正确
- 确保空行和缩进使用正确
- 特殊字符可能需要转义

### 如何在文本中使用特殊字符？

使用反斜杠 \\ 转义特殊字符：

\`\`\`markdown
\\* 这不是斜体 \\*
\\\`这不是代码\\\`
\\# 这不是标题
\`\`\`

## 更多资源

- [Markdown 官方文档](https://daringfireball.net/projects/markdown/)
- [GitHub Markdown 指南](https://docs.github.com/cn/github/writing-on-github)
- [CommonMark 规范](https://commonmark.org/)`;
} 