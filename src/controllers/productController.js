import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../models/productModel.js";


const SERVICE_NAME = process.env.SERVICE_NAME;
const TARGET_SERVICE = SERVICE_NAME === "web1" ? "web2" : "web1";

export const productController = {
  async getAll(req, res) {
    try {
      const products = await getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      // 1. CRUD DB chính
      const newProduct = await createProduct(req.body);
      // 3. Realtime UI
      req.io.emit("product_updated");

      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      await updateProduct(req.params.id, req.body);
      req.io.emit("product_updated");
      res.json({ message: "Updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await deleteProduct(req.params.id);
      req.io.emit("product_updated");
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};