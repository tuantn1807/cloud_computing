// API Base URL
const API_URL = 'http://localhost:3000'; // Khi deploy lên Render/Cloud, thay bằng URL công khai

// DOM Elements
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const productList = document.getElementById('productList');

// Get all products
async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        renderProducts(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Không thể tải dữ liệu sản phẩm.');
    }
}

// Render products to table
function renderProducts(products) {
    productList.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>
                <button class="btn btn-success edit-btn" data-id="${product.id}">Sửa</button>
                <button class="btn btn-danger delete-btn" data-id="${product.id}">Xóa</button>
            </td>
        `;
        productList.appendChild(row);
    });
}

// Format currency (VND)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Add product
async function addProduct(product) {
    try {
        const response = await fetch(`${API_URL}/products/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const data = await response.json();
        if (response.ok) {
            alert('Sản phẩm đã được thêm thành công!');
            resetForm();
            getProducts();
        } else {
            alert(`Lỗi: ${data.message || 'Không xác định'}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Không thể thêm sản phẩm.');
    }
}

// Get product by ID
async function getProductById(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Không tìm thấy sản phẩm.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        alert('Không thể tải thông tin sản phẩm.');
        return null;
    }
}

// Update product
async function updateProduct(id, product) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const data = await response.json();
        if (response.ok) {
            alert('Sản phẩm đã được cập nhật thành công!');
            resetForm();
            getProducts();
        } else {
            alert(`Lỗi: ${data.message || 'Không xác định'}`);
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Không thể cập nhật sản phẩm.');
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
        const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok) {
            alert('Sản phẩm đã bị xóa thành công!');
            getProducts();
        } else {
            alert(`Lỗi: ${data.message || 'Không xác định'}`);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Không thể xóa sản phẩm.');
    }
}

// Reset form
function resetForm() {
    productForm.reset();
    productIdInput.value = '';
    submitBtn.textContent = 'Thêm Sản phẩm';
    cancelBtn.style.display = 'none';
}

// Event listeners
productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const product = {
        name: nameInput.value.trim(),
        price: parseFloat(priceInput.value)
    };
    if (!product.name || isNaN(product.price)) {
        alert('Vui lòng nhập đầy đủ thông tin sản phẩm.');
        return;
    }
    if (productIdInput.value) {
        updateProduct(productIdInput.value, product);
    } else {
        addProduct(product);
    }
});

cancelBtn.addEventListener('click', resetForm);

// Event delegation for edit/delete buttons
productList.addEventListener('click', async function(e) {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('edit-btn')) {
        const product = await getProductById(id);
        if (product) {
            productIdInput.value = product.id;
            nameInput.value = product.name;
            priceInput.value = product.price;
            submitBtn.textContent = 'Cập nhật Sản phẩm';
            cancelBtn.style.display = 'inline-block';
        }
    } else if (e.target.classList.contains('delete-btn')) {
        deleteProduct(id);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', getProducts);
