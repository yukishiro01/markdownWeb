document.addEventListener('DOMContentLoaded', () => {
    if (!Nav.requireAuth()) {
        return;
    }
    Nav.updateNavState();
    initProfile();
});

function initProfile() {
    const currentUser = DB.users.getCurrentUser();
    if (!currentUser) return;

    // 更新用户信息
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('joinDate').textContent = `加入时间：${new Date(currentUser.createdAt).toLocaleDateString()}`;

    // 更新统计信息
    const documents = DB.documents.getUserDocuments();
    document.getElementById('docCount').textContent = documents.length;
    
    const lastDoc = documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    document.getElementById('lastUpdate').textContent = lastDoc ? 
        new Date(lastDoc.updatedAt).toLocaleDateString() : '暂无';

    const daysJoined = Math.floor((new Date() - new Date(currentUser.createdAt)) / (1000 * 60 * 60 * 24));
    document.getElementById('daysJoined').textContent = daysJoined;

    // 加载用户头像
    if (currentUser.avatar) {
        document.getElementById('userAvatar').src = currentUser.avatar;
    }

    // 处理头像上传
    document.getElementById('avatarUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            Toast.error('请选择图片文件');
            return;
        }

        // 验证文件大小（最大 2MB）
        if (file.size > 2 * 1024 * 1024) {
            Toast.error('图片大小不能超过2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            // 更新显示
            document.getElementById('userAvatar').src = event.target.result;
            
            // 保存到用户数据
            updateUserAvatar(event.target.result);
            
            Toast.success('头像已更新');
        };
        reader.onerror = function() {
            Toast.error('图片上传失败，请重试');
        };
        reader.readAsDataURL(file);
    });

    // 修改密码表单处理
    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 验证当前密码
        if (!validateCurrentPassword(currentPassword)) {
            Toast.error('当前密码错误');
            return;
        }

        // 验证新密码
        if (newPassword.length < 6) {
            Toast.error('新密码至少6个字符');
            return;
        }

        // 验证确认密码
        if (newPassword !== confirmPassword) {
            Toast.error('两次输入的密码不一致');
            return;
        }

        // 更新密码
        const result = updatePassword(newPassword);
        if (result.success) {
            Toast.success('密码已更新');
            this.reset();
        } else {
            Toast.error(result.message);
        }
    });

    // 退出所有设备
    document.getElementById('logoutAllBtn').addEventListener('click', () => {
        if (confirm('确定要退出所有设备吗？')) {
            DB.users.logout();
            Toast.success('已退出所有设备');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    });

    // 删除账号
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        if (confirm('确定要删除账号吗？此操作不可恢复！')) {
            if (confirm('再次确认：删除账号将清除所有数据，确定继续吗？')) {
                const result = deleteAccount();
                if (result.success) {
                    Toast.success('账号已删除');
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                } else {
                    Toast.error(result.message);
                }
            }
        }
    });
}

// 验证当前密码
function validateCurrentPassword(password) {
    const currentUser = DB.users.getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.id === currentUser.id);
    return user.password === password;
}

// 更新密码
function updatePassword(newPassword) {
    const currentUser = DB.users.getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true };
}

// 添加更新头像的函数
function updateUserAvatar(avatarData) {
    const currentUser = DB.users.getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
    }

    // 更新用户数据
    users[userIndex].avatar = avatarData;
    localStorage.setItem('users', JSON.stringify(users));
    
    // 更新当前用户信息
    currentUser.avatar = avatarData;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return { success: true };
}

// 删除账号
function deleteAccount() {
    const currentUser = DB.users.getCurrentUser();
    
    // 删除用户数据
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(u => u.id !== currentUser.id);
    localStorage.setItem('users', JSON.stringify(users));

    // 删除用户的所有文档
    let documents = JSON.parse(localStorage.getItem('documents'));
    documents = documents.filter(doc => doc.userId !== currentUser.id);
    localStorage.setItem('documents', JSON.stringify(documents));

    // 清除当前用户信息和头像
    localStorage.setItem('currentUser', '');

    return { success: true };
} 