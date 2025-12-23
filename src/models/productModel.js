import { db1Pool, db2Pool } from "../config/db.js";

/* ================== GET ALL ================== */
export async function getAllProducts() {
  const [rows] = await db1Pool.query(
    "SELECT * FROM products ORDER BY id DESC"
  );
  return rows;
}

/* ================== CREATE ================== */
export async function createProduct({ name, price }) {
  const conn = await db1Pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.query(
      "INSERT INTO products (name, price) VALUES (?, ?)",
      [name, price]
    );

    await conn.commit();

    const created = {
      id: res.insertId,
      name,
      price,
    };

    // đồng bộ 1 chiều sang web2 (fire & forget)
    syncCreateToWeb2(created);

    return created;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ================== UPDATE ================== */
export async function updateProduct(id, { name, price }) {
  await db1Pool.query(
    "UPDATE products SET name = ?, price = ? WHERE id = ?",
    [name, price, id]
  );

  syncUpdateToWeb2({ id, name, price });
}

/* ================== DELETE ================== */
export async function deleteProduct(id) {
  await db1Pool.query(
    "DELETE FROM products WHERE id = ?",
    [id]
  );

  syncDeleteToWeb2(id);
}

/* ================== SYNC HELPERS ================== */

async function syncCreateToWeb2(product) {
  try {
    await db2Pool.query(
      "INSERT IGNORE INTO products (id, name, price) VALUES (?, ?, ?)",
      [product.id, product.name, product.price]
    );
  } catch (err) {
    console.error("sync CREATE to web2 failed:", err.message);
  }
}

async function syncUpdateToWeb2(product) {
  try {
    await db2Pool.query(
      "UPDATE products SET name = ?, price = ? WHERE id = ?",
      [product.name, product.price, product.id]
    );
  } catch (err) {
    console.error("sync UPDATE to web2 failed:", err.message);
  }
}

async function syncDeleteToWeb2(id) {
  try {
    await db2Pool.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );
  } catch (err) {
    console.error("sync DELETE to web2 failed:", err.message);
  }
}
