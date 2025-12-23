const API_URL = "/api/products"; //may be error here
const socket = io();

// 🔹 DOM elements
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// ======================================================
// 🔹 Lấy danh sách sản phẩm
// ======================================================
async function fetchProducts() {
  const res = await fetch(API_URL);
  const products = await res.json();

  productList.innerHTML = products
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${parseInt(p.price, 10).toLocaleString('vi-VN')}₫</td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning me-2" onclick="editProduct(${p.id}, '${p.name}', ${p.price})">Sửa</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Xóa</button>
        </td>
      </tr>`
    )
    .join("");
}

// ======================================================
// 🔹 Xử lý thêm / cập nhật sản phẩm khi submit form
// ======================================================
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);

  if (!name || !price) return alert("Vui lòng nhập đủ thông tin!");

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    console.log(`Gửi yêu cầu ${method} tới:`, url, { name, price });

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      console.error("Lỗi khi gửi dữ liệu:", data);
      const message =
        typeof data === "object"
          ? data.error || data.message || JSON.stringify(data)
          : data;
      alert(`Lỗi ${res.status}: ${message}`);
      return;
    }

    console.log("Phản hồi thành công:", data);
    alert("Lưu sản phẩm thành công!");

    // Reset form về trạng thái thêm mới
    productForm.reset();
    formTitle.textContent = "Thêm sản phẩm";
    submitBtn.textContent = "Lưu";
    document.getElementById("productId").value = "";

    // Làm mới danh sách
    fetchProducts();
  } catch (err) {
    console.error("🚨 Lỗi kết nối:", err);
    alert(`🚨 Lỗi kết nối: ${err.message}`);
  }
});

// ======================================================
// 🔹 Hàm SỬA sản phẩm — hiển thị dữ liệu lên form
// ======================================================
window.editProduct = (id, name, price) => {
  document.getElementById("productId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("price").value = price;

  formTitle.textContent = "Chỉnh sửa sản phẩm";
  submitBtn.textContent = "Cập nhật";
};

// ======================================================
// 🔹 Xóa sản phẩm
// ======================================================
window.deleteProduct = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) return alert(" Không thể xóa sản phẩm!");
  alert("🗑️ Đã xóa sản phẩm!");
  fetchProducts();
};

// ======================================================
// 🔹 Nút hủy
// ======================================================
cancelBtn.addEventListener("click", () => {
  productForm.reset();
  document.getElementById("productId").value = "";
  formTitle.textContent = "Thêm sản phẩm";
  submitBtn.textContent = " Lưu";
});

// ======================================================
// 🔹 Khi backend thông báo có thay đổi (qua Socket.IO)
// ======================================================
socket.on("product_updated", () => {
  fetchProducts();
});

// ======================================================
// 🔹 Tải danh sách sản phẩm lần đầu
// ======================================================
fetchProducts();
