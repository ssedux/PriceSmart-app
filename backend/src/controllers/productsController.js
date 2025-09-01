//Array de metodos (C R U D)
const productsController = {};
import productsModel from "../models/Products.js";

// SELECT
productsController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find();
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
};

// INSERT
productsController.createProducts = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    
    // Validate required fields
    if (!name || !price || stock === undefined || stock === null) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        required: { name, price, stock },
        received: req.body 
      });
    }
    
    const newProduct = new productsModel({ name, description, price, stock});
    await newProduct.save();
    res.json({ message: "product saved" });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

//DELETE
productsController.deleteProducts = async (req, res) => {
  try {
    const deletedProduct = await productsModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// UPDATE
productsController.updateProducts = async (req, res) => {
  try {
    // Solicito todos los valores
    const { name, description, price, stock } = req.body;
    
    // Validate required fields for update
    if (!name || !price || stock === undefined || stock === null) {
      return res.status(400).json({ 
        message: "Missing required fields for update", 
        required: { name, price, stock },
        received: req.body 
      });
    }
    
    // Actualizo
    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        stock,
      },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    // muestro un mensaje que todo se actualizo
    res.json({ message: "product updated", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

productsController.getSingleProduct = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error getting single product:", error);
    res.status(500).json({ message: "Error getting product", error: error.message });
  }
};

export default productsController;
