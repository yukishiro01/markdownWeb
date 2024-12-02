// 导航栏状态管理
const Nav = {
    // 更新导航栏状态
    updateNavState() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        // 获取当前页面的路径
        const isInPagesDir = window.location.pathname.includes('/pages/');
        const prefix = isInPagesDir ? '.' : 'pages';  // 根据当前位置决定路径前缀

        if (DB.users.isLoggedIn()) {
            const currentUser = DB.users.getCurrentUser();
            const defaultAvatar = isInPagesDir ? '../img/avatar.jpg' : 'img/avatar.jpg';
            const avatarSrc = currentUser.avatar || defaultAvatar;
            
            navRight.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div class="relative group">
                        <a href="#" class="block">
                            <img src="${avatarSrc}" 
                                 alt="用户头像" 
                                 class="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-white transition-all">
                        </a>
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                             style="transform: translateY(10px);">
                            <a href="${prefix}/profile.html" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                个人中心
                            </a>
                            <hr class="my-2">
                            <button id="logoutBtn" class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 添加退出登录事件监听
            document.getElementById('logoutBtn').addEventListener('click', () => {
                DB.users.logout();
                Toast.success('已退出登录');
                setTimeout(() => {
                    window.location.href = isInPagesDir ? '../index.html' : 'index.html';
                }, 1000);
            });
        } else {
            navRight.innerHTML = `
                <div class="flex space-x-4">
                    <a href="${prefix}/login.html" 
                       class="border-2 border-white text-white px-4 py-2 rounded-lg font-bold hover:bg-white hover:text-purple-600 hover-scale">
                        登录
                    </a>
                    <a href="${prefix}/register.html" 
                       class="border-2 border-white text-white px-4 py-2 rounded-lg font-bold hover:bg-white hover:text-purple-600 hover-scale">
                        注册
                    </a>
                </div>
            `;
        }

        // 初始化主题
        this.initTheme();
    },

    // 检查登录状态并重定向
    requireAuth() {
        if (!DB.users.isLoggedIn()) {
            const isInPagesDir = window.location.pathname.includes('/pages/');
            window.location.href = isInPagesDir ? 'login.html' : 'pages/login.html';
            return false;
        }
        return true;
    },

    // 初始化主题
    initTheme() {
        if (DB.users.isLoggedIn()) {
            const theme = DB.users.getThemeSettings();
            
            // 确保 theme 对象包含所有必要的属性
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

            // 合并默认主题和用户主题
            const finalTheme = {
                ...defaultTheme,
                ...theme,
                background: {
                    ...defaultTheme.background,
                    ...(theme.background || {})
                }
            };

            // 应用主题模式
            document.body.classList.toggle('light-mode', finalTheme.mode === 'light');
            
            // 应用主色调
            document.documentElement.style.setProperty('--primary-color', finalTheme.color);
            
            // 应用字体大小
            document.documentElement.style.setProperty('--base-font-size', `${finalTheme.fontSize}px`);

            // 应用背景设置
            const body = document.body;
            if (finalTheme.background.type === 'gradient') {
                const colors = finalTheme.background.gradient.split(',');
                body.style.background = `linear-gradient(-45deg, ${colors.join(', ')})`;
                body.style.backgroundSize = '400% 400%';
                body.style.animation = `gradient ${finalTheme.background.animationSpeed}s ease infinite`;
            } else {
                body.style.background = finalTheme.background.solid;
                body.style.backgroundSize = 'initial';
                body.style.animation = 'none';
            }
        }
    }
}; 