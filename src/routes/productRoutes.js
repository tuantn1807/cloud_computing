import express from "express";
import { productController } from "../controllers/productController.js"; 

const router = express.Router();


router.get("/", productController.getAll);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

export default router;
