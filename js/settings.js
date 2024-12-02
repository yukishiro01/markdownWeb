document.addEventListener('DOMContentLoaded', () => {
    if (!Nav.requireAuth()) {
        return;
    }
    Nav.updateNavState();
    setTimeout(initSettings, 100);
});

function initSettings() {
    const currentUser = DB.users.getCurrentUser();
    if (!currentUser) return;

    try {
        // 获取当前主题设置，确保有完整的默认值
        const defaultTheme = {
            mode: 'dark',
            color: '#6b46c1',
            fontSize: '16',
            background: {
                type: 'gradient',
                gradient: '#ee7752,#e73c7e,#23a6d5,#23d5ab',
                solid: '#1a1a1a',
                animationSpeed: '15'
            }
        };

        // 合并用户主题设置和默认设置
        const theme = {
            ...defaultTheme,
            ...(currentUser.theme || {}),
            background: {
                ...defaultTheme.background,
                ...(currentUser.theme?.background || {})
            }
        };

        // 初始化背景类型按钮
        document.querySelectorAll('.bg-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === theme.background.type);
        });

        // 初始化渐变按钮
        document.querySelectorAll('.gradient-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.colors === theme.background.gradient);
        });

        // 初始化纯色按钮
        document.querySelectorAll('.solid-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === theme.background.solid);
        });

        // 更新颜色选择器和显示值
        if (theme.background.type === 'solid') {
            const colorPicker = document.getElementById('colorPicker');
            colorPicker.value = theme.background.solid;
            const rgb = hexToRgb(theme.background.solid);
            document.getElementById('rgbValue').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            document.getElementById('hexValue').textContent = theme.background.solid.toUpperCase();
        }

        // 初始化动画速度
        const speedSlider = document.getElementById('animationSpeed');
        speedSlider.value = theme.background.animationSpeed;
        document.getElementById('speedValue').textContent = `${theme.background.animationSpeed}s`;

        // 显示/隐藏相关选项
        document.getElementById('gradientOptions').classList.toggle('hidden', theme.background.type !== 'gradient');
        document.getElementById('solidOptions').classList.toggle('hidden', theme.background.type !== 'solid');
        document.getElementById('animationOptions').classList.toggle('hidden', theme.background.type !== 'gradient');

        // 初始化其他按钮状态
        initThemeButtons(theme);
        
        // 应用当前主题
        applyTheme(theme);

        // 绑定事件处理
        bindEvents();
    } catch (error) {
        console.error('初始化设置时出错:', error);
    }
}

function initThemeButtons(theme) {
    // 主题模式
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
        if (btn.dataset.mode === theme.mode) {
            btn.classList.add('active');
        }
    });

    // 主色调
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.dataset.color === theme.color) {
            btn.classList.add('active');
        }
    });

    // 字体大小
    const fontSizeSlider = document.getElementById('fontSize');
    fontSizeSlider.value = theme.fontSize;
    updateFontSizeValue(theme.fontSize);
}

function bindEvents() {
    // 主题模式切换
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePreview();
        });
    });

    // 主色调选择
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePreview();
        });
    });

    // 字体大小滑块
    const fontSizeSlider = document.getElementById('fontSize');
    fontSizeSlider.addEventListener('input', () => {
        updateFontSizeValue(fontSizeSlider.value);
        updatePreview();
    });

    // 保存设置
    document.getElementById('saveBtn').addEventListener('click', saveSettings);

    // 背景类型切换
    document.querySelectorAll('.bg-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 显示/隐藏相关选项
            const type = btn.dataset.type;
            document.getElementById('gradientOptions').classList.toggle('hidden', type !== 'gradient');
            document.getElementById('solidOptions').classList.toggle('hidden', type !== 'solid');
            document.getElementById('animationOptions').classList.toggle('hidden', type !== 'gradient');
            
            // 立即应用背景
            if (type === 'solid') {
                // 如果切换到纯色背景，使用当前选中的纯色或第一个预设颜色
                let color;
                const activeBtn = document.querySelector('.solid-color-btn.active');
                if (activeBtn) {
                    color = activeBtn.dataset.color;
                } else {
                    const firstSolidBtn = document.querySelector('.solid-color-btn');
                    if (firstSolidBtn) {
                        firstSolidBtn.classList.add('active');
                        color = firstSolidBtn.dataset.color;
                    } else {
                        color = '#1a1a1a';
                    }
                }

                // 应用背景颜色
                document.body.style.background = color;
                document.body.style.backgroundSize = 'initial';
                document.body.style.animation = 'none';
                
                // 更新颜色选择器的值
                document.getElementById('colorPicker').value = color;
                const rgb = hexToRgb(color);
                document.getElementById('rgbValue').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                document.getElementById('hexValue').textContent = color.toUpperCase();
            } else {
                // 如果切换到渐变背景，使用当前选中的渐变
                const activeGradient = document.querySelector('.gradient-btn.active')?.dataset.colors;
                if (activeGradient) {
                    const colors = activeGradient.split(',');
                    document.body.style.background = `linear-gradient(-45deg, ${colors.join(', ')})`;
                    document.body.style.backgroundSize = '400% 400%';
                    const speed = document.getElementById('animationSpeed').value;
                    document.body.style.animation = `gradient ${speed}s ease infinite`;
                }
            }
        });
    });

    // 渐变配色选择
    document.querySelectorAll('.gradient-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gradient-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePreview();
        });
    });

    // 纯色背景选择
    document.querySelectorAll('.solid-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.solid-color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新颜色选择器的值
            const color = btn.dataset.color;
            document.getElementById('colorPicker').value = color;
            
            // 更新颜色显示
            const rgb = hexToRgb(color);
            document.getElementById('rgbValue').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            document.getElementById('hexValue').textContent = color.toUpperCase();
            
            // 更新背景
            if (document.querySelector('.bg-type-btn.active').dataset.type === 'solid') {
                document.body.style.background = color;
            }
            
            updatePreview();
        });
    });

    // 动画速度调整
    document.getElementById('animationSpeed').addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = `${e.target.value}s`;
        updatePreview();
    });

    // 颜色选择器相关的所有变量声明和事件处理
    const colorPicker = document.getElementById('colorPicker');
    const rgbValueDisplay = document.getElementById('rgbValue');
    const hexValueDisplay = document.getElementById('hexValue');

    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        const rgb = hexToRgb(color);
        
        // 更新显示
        rgbValueDisplay.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hexValueDisplay.textContent = color.toUpperCase();

        // 更新背景
        if (document.querySelector('.bg-type-btn.active').dataset.type === 'solid') {
            document.body.style.background = color;
        }
    });

    colorPicker.addEventListener('change', (e) => {
        // 当用户完成颜色选择时触发
        updatePreview();
    });
}

function updateFontSizeValue(size) {
    document.getElementById('fontSizeValue').textContent = `${size}px`;
}

function getCurrentTheme() {
    const bgType = document.querySelector('.bg-type-btn.active').dataset.type;
    let solidColor;
    
    if (bgType === 'solid') {
        solidColor = document.getElementById('colorPicker').value;
    } else {
        solidColor = document.querySelector('.solid-color-btn.active')?.dataset.color || '#1a1a1a';
    }

    return {
        mode: document.querySelector('.theme-mode-btn.active').dataset.mode,
        color: document.querySelector('.color-btn.active')?.dataset.color || '#6b46c1',
        fontSize: document.getElementById('fontSize').value,
        background: {
            type: bgType,
            gradient: document.querySelector('.gradient-btn.active')?.dataset.colors,
            solid: solidColor,
            animationSpeed: document.getElementById('animationSpeed').value
        }
    };
}

function updatePreview() {
    const theme = getCurrentTheme();
    applyTheme(theme);
}

function applyTheme(theme) {
    // 应用主题模式
    document.body.classList.toggle('light-mode', theme.mode === 'light');
    
    // 应用主色调
    document.documentElement.style.setProperty('--primary-color', theme.color);
    
    // 应用字体大小
    document.documentElement.style.setProperty('--base-font-size', `${theme.fontSize}px`);

    // 应用背景设置
    const body = document.body;
    if (theme.background.type === 'gradient') {
        const colors = theme.background.gradient.split(',');
        body.style.background = `linear-gradient(-45deg, ${colors.join(', ')})`;
        body.style.backgroundSize = '400% 400%';
        body.style.animation = `gradient ${theme.background.animationSpeed}s ease infinite`;
    } else {
        body.style.background = theme.background.solid;
        body.style.backgroundSize = 'initial';
        body.style.animation = 'none';
    }
}

function saveSettings() {
    const theme = getCurrentTheme();
    const result = DB.users.updateSettings({ theme });
    
    if (result.success) {
        // 立即应用新设置
        applyTheme(theme);
        Toast.success('设置已保存');
    } else {
        Toast.error(result.message);
    }
}

// 添加 hex 转 rgb 的辅助函数
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
} 