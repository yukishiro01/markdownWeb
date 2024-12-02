document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        const result = DB.users.login(username, password);
        
        if (result.success) {
            Toast.success('登录成功');
            if (remember) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        } else {
            Toast.error(result.message);
        }
    });

    // 如果有记住的用户名，自动填充
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('remember').checked = true;
    }

    Nav.updateNavState();
}); 