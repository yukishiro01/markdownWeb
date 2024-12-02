const Toast = {
    toasts: [], // 存储所有活动的 toast
    margin: 20, // toast 之间的间距
    baseTop: 20, // 第一个 toast 距离顶部的距离

    show(message, type = 'success') {
        // 创建新的消息提示
        const toast = document.createElement('div');
        toast.className = `message-toast ${type}`;
        toast.textContent = message;

        // 计算新 toast 的位置
        const toastHeight = 60; // 预估的 toast 高度
        const top = this.baseTop + (toastHeight + this.margin) * this.toasts.length;
        toast.style.top = `${top}px`;

        // 添加到页面和管理数组
        document.body.appendChild(toast);
        this.toasts.push(toast);

        // 触发动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 自动移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                // 从 DOM 和管理数组中移除
                toast.remove();
                const index = this.toasts.indexOf(toast);
                if (index > -1) {
                    this.toasts.splice(index, 1);
                }
                // 重新调整其他 toast 的位置
                this.updatePositions();
            }, 300);
        }, 3000);
    },

    // 更新所有 toast 的位置
    updatePositions() {
        this.toasts.forEach((toast, index) => {
            const toastHeight = 60;
            const top = this.baseTop + (toastHeight + this.margin) * index;
            toast.style.top = `${top}px`;
        });
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    }
}; 