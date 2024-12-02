// 模拟数据库功能
const DB = {
    // 初始化本地存储
    init() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('documents')) {
            localStorage.setItem('documents', JSON.stringify([]));
        }
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', '');
        }
    },

    // 用户相关操作
    users: {
        // 注册新用户
        register(username, password) {
            const users = JSON.parse(localStorage.getItem('users'));
            if (users.find(u => u.username === username)) {
                return { success: false, message: '用户名已存在' };
            }
            users.push({
                id: Date.now(),
                username,
                password,
                createdAt: new Date().toISOString(),
                theme: {
                    mode: 'dark',
                    color: '#6b46c1',
                    fontSize: '16',
                    background: {
                        type: 'gradient',
                        gradient: '#ee7752,#e73c7e,#23a6d5,#23d5ab',
                        solid: '#1a1a1a',
                        animationSpeed: '15'
                    }
                }
            });
            localStorage.setItem('users', JSON.stringify(users));
            return { success: true, message: '注册成功' };
        },

        // 用户登录
        login(username, password) {
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                return { success: true, message: '登录成功' };
            }
            return { success: false, message: '用户名或密码错误' };
        },

        // 退出登录
        logout() {
            localStorage.setItem('currentUser', '');
            return { success: true, message: '已退出登录' };
        },

        // 获取当前用户
        getCurrentUser() {
            const userStr = localStorage.getItem('currentUser');
            return userStr ? JSON.parse(userStr) : null;
        },

        // 检查用户是否已登录
        isLoggedIn() {
            const userStr = localStorage.getItem('currentUser');
            return userStr && userStr !== '';
        },

        // 获取当前用户名
        getCurrentUsername() {
            const user = this.getCurrentUser();
            return user ? user.username : null;
        },

        // 更新用户设置
        updateSettings(settings) {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, message: '未登录' };
            }

            // 更新用户数据
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) {
                return { success: false, message: '用户不存在' };
            }

            // 合并设置
            users[userIndex].theme = settings.theme;
            currentUser.theme = settings.theme;

            // 保存更新
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            return { success: true };
        },

        // 获取用户主题设置
        getThemeSettings() {
            const currentUser = this.getCurrentUser();
            return currentUser?.theme || {
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
        }
    },

    // 文档相关操作
    documents: {
        // 创建新文档
        create(title, content) {
            const currentUser = DB.users.getCurrentUser();
            if (!currentUser) {
                return { success: false, message: '请先登录' };
            }

            const documents = JSON.parse(localStorage.getItem('documents'));
            const newDoc = {
                id: Date.now(),
                userId: currentUser.id,
                title,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            documents.push(newDoc);
            localStorage.setItem('documents', JSON.stringify(documents));
            return { success: true, message: '创建成功', data: newDoc };
        },

        // 获取用户的所有文档
        getUserDocuments() {
            const currentUser = DB.users.getCurrentUser();
            if (!currentUser) {
                return [];
            }
            const documents = JSON.parse(localStorage.getItem('documents'));
            return documents.filter(doc => doc.userId === currentUser.id);
        },

        // 更新文档
        update(docId, title, content) {
            const documents = JSON.parse(localStorage.getItem('documents'));
            const index = documents.findIndex(doc => doc.id === docId);
            if (index === -1) {
                return { success: false, message: '文档不存在' };
            }
            documents[index] = {
                ...documents[index],
                title,
                content,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('documents', JSON.stringify(documents));
            return { success: true, message: '更新成功' };
        },

        // 删除文档
        delete(docId) {
            let documents = JSON.parse(localStorage.getItem('documents'));
            documents = documents.filter(doc => doc.id !== docId);
            localStorage.setItem('documents', JSON.stringify(documents));
            return { success: true, message: '删除成功' };
        }
    }
};

// 初始化数据库
DB.init(); 