document.addEventListener('DOMContentLoaded', () => {
    Nav.updateNavState();
    initScrollAnimation();
    initTypewriter();
});

function initScrollAnimation() {
    const sections = document.querySelectorAll('.animate-section');
    
    // 初始状态：隐藏所有部分
    sections.forEach(section => {
        section.classList.add('section-hidden');
    });

    // 监听滚动事件
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-show');
            }
        });
    }, {
        root: null,
        threshold: 0.15, // 当元素15%进入视口时触发
        rootMargin: '0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

function initTypewriter() {
    const text = `为了完成这次作业，我一直在寻找能够将技术与实用性完美结合的项目。MarkdownWeb 就是这样一次尝试 —— 用现代化的 Web 技术，打造一个简单但实用的 Markdown 编辑器。

在开发过程中，我深刻体会到了 TailwindCSS 的灵活性和 Showdown.js 的强大。每一个细节的优化，每一个功能的实现，都让我对前端技术有了更深的理解。特别是在实现实时预览、自动保存这些功能时，既要考虑性能，又要保证用户体验，这个过程充满了挑战，但也带来了很多成就感。

这个项目不仅仅是一个编辑器，更是我对现代 Web 开发的一次探索。通过纯前端实现所有功能，不仅降低了使用门槛，也展示了 Web 技术的潜力。希望这个项目能有真正的实用价值,并且随着我技术的提升去逐渐完善它!`;

    const typewriter = document.getElementById('typewriter');
    let index = 0;
    typewriter.classList.add('cursor');

    function type() {
        if (index < text.length) {
            typewriter.textContent = text.substring(0, index + 1);
            index++;
            // 根据标点符号调整打字速度
            const delay = text[index] === '。' || text[index] === '，' ? 500 : 50;
            setTimeout(type, delay);
        } else {
            typewriter.classList.remove('cursor');
        }
    }

    // 当元素进入视口时开始打字
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                type();
                observer.disconnect();
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(typewriter);
} 