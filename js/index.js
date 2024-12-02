document.addEventListener('DOMContentLoaded', () => {
    Nav.updateNavState();
    initTypewriter();
});

function initTypewriter() {
    const text = "# 重新定义 Markdown 写作体验";
    const typewriter = document.getElementById('typewriter');
    const actionButtons = document.getElementById('actionButtons');
    let index = 0;
    typewriter.classList.add('mb-12');
    typewriter.classList.add('text-4xl');

    function type() {
        if (index < text.length) {
            typewriter.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(type, 100);
        } else {
            // 打字完成后的效果
            setTimeout(() => {
                typewriter.classList.remove('mb-12', 'text-4xl');
                typewriter.classList.add('mb-6', 'text-6xl');
                typewriter.textContent = text.substring(1);
                actionButtons.classList.remove('opacity-0');
            }, 500);
        }
    }

    type();
} 