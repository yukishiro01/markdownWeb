document.addEventListener('DOMContentLoaded', () => {
    // 在 DB 对象中添加重置密码方法
    DB.users.resetPassword = function(username, newPassword) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            return { success: false, message: '用户名不存在' };
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true, message: '密码重置成功' };
    };

    const form = document.getElementById('resetForm');
    const username = document.getElementById('username');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    function validateUsername() {
        const error = document.getElementById('usernameError');
        const users = JSON.parse(localStorage.getItem('users'));
        if (!users.some(u => u.username === username.value)) {
            error.style.display = 'block';
            return false;
        }
        error.style.display = 'none';
        return true;
    }

    function validatePassword() {
        const error = document.getElementById('passwordError');
        if (newPassword.value.length < 6) {
            error.style.display = 'block';
            return false;
        }
        error.style.display = 'none';
        return true;
    }

    function validateConfirmPassword() {
        const error = document.getElementById('confirmPasswordError');
        if (newPassword.value !== confirmPassword.value) {
            error.style.display = 'block';
            return false;
        }
        error.style.display = 'none';
        return true;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateUsername() || !validatePassword() || !validateConfirmPassword()) {
            return;
        }
        
        const result = DB.users.resetPassword(username.value, newPassword.value);
        
        if (result.success) {
            Toast.success('密码重置成功！');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            Toast.error(result.message);
        }
    });

    // 实时验证
    username.addEventListener('input', validateUsername);
    newPassword.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validateConfirmPassword);

    Nav.updateNavState();
}); 