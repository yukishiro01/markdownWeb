document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // 实时验证
    username.addEventListener('input', validateUsername);
    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validateConfirmPassword);

    function validateUsername() {
        const error = document.getElementById('usernameError');
        if (username.value.length < 3) {
            error.textContent = '用户名至少3个字符';
            error.style.display = 'block';
            return false;
        }
        error.style.display = 'none';
        return true;
    }

    function validatePassword() {
        const error = document.getElementById('passwordError');
        if (password.value.length < 6) {
            error.style.display = 'block';
            return false;
        }
        error.style.display = 'none';
        return true;
    }

    function validateConfirmPassword() {
        const error = document.getElementById('confirmPasswordError');
        if (password.value !== confirmPassword.value) {
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
        
        const result = DB.users.register(username.value, password.value);
        
        if (result.success) {
            Toast.success('注册成功！');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            Toast.error(result.message);
        }
    });

    Nav.updateNavState();
}); 