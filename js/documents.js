document.addEventListener('DOMContentLoaded', () => {
    if (!Nav.requireAuth()) {
        return;
    }
    Nav.updateNavState();
    loadDocuments();
});

function loadDocuments() {
    const documentList = document.getElementById('documentList');
    const emptyState = document.getElementById('emptyState');
    const documents = DB.documents.getUserDocuments();

    if (documents.length === 0) {
        documentList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    documentList.innerHTML = documents
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map(doc => `
            <div class="glass-effect p-6 rounded-lg text-white hover-scale">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold mb-2">${doc.title}</h3>
                        <p class="text-sm opacity-80">
                            最后更新：${new Date(doc.updatedAt).toLocaleString()}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editDocument(${doc.id})" 
                                class="px-3 py-1 rounded hover:bg-white hover:text-purple-600 border border-white">
                            编辑
                        </button>
                        <button onclick="deleteDocument(${doc.id})" 
                                class="px-3 py-1 rounded hover:bg-red-500 hover:text-white border border-white">
                            删除
                        </button>
                    </div>
                </div>
                <div class="mt-4 opacity-80 line-clamp-3">
                    ${doc.content.substring(0, 200)}...
                </div>
            </div>
        `)
        .join('');
}

function editDocument(docId) {
    // 将文档 ID 存储在 localStorage 中，以便编辑器页面加载时使用
    localStorage.setItem('editingDocId', docId);
    window.location.href = 'editor.html';
}

function deleteDocument(docId) {
    if (confirm('确定要删除这篇文档吗？此操作不可恢复。')) {
        const result = DB.documents.delete(docId);
        if (result.success) {
            Toast.success('文档已删除');
            loadDocuments();  // 重新加载文档列表
        } else {
            Toast.error(result.message);
        }
    }
} 