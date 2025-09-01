import mongoose from "mongoose";
import { config } from "./src/config.js";
import productsModel from "./src/models/Products.js";

// Connect to the database
mongoose.connect(config.db.URI);

const connection = mongoose.connection;

connection.once("open", async () => {
  console.log("Connected to database for cleanup");
  
  try {
    // Find all products with missing or invalid stock values
    const invalidProducts = await productsModel.find({
      $or: [
        { stock: { $exists: false } },
        { stock: null },
        { stock: { $lt: 0 } }
      ]
    });
    
    console.log(`Found ${invalidProducts.length} invalid products`);
    
    if (invalidProducts.length > 0) {
      console.log("Invalid products:");
      invalidProducts.forEach((product, index) => {
        console.log(`${index + 1}. ID: ${product._id}, Name: ${product.name}, Stock: ${product.stock}`);
      });
      
      // Option 1: Delete invalid products
      console.log("\nDeleting invalid products...");
      const deleteResult = await productsModel.deleteMany({
        $or: [
          { stock: { $exists: false } },
          { stock: null },
          { stock: { $lt: 0 } }
        ]
      });
      console.log(`Deleted ${deleteResult.deletedCount} invalid products`);
      
      // Option 2: Alternative - Update invalid products with default stock value
      // const updateResult = await productsModel.updateMany(
      //   {
      //     $or: [
      //       { stock: { $exists: false } },
      //       { stock: null },
      //       { stock: { $lt: 0 } }
      //     ]
      //   },
      //   { $set: { stock: 0 } }
      // );
      // console.log(`Updated ${updateResult.modifiedCount} products with default stock value`);
    }
    
    // Verify all products are now valid
    const allProducts = await productsModel.find({});
    console.log(`\nTotal products in database: ${allProducts.length}`);
    
    const validProducts = await productsModel.find({
      name: { $exists: true },
      price: { $exists: true, $gte: 0 },
      stock: { $exists: true, $gte: 0 }
    });
    
    console.log(`Valid products: ${validProducts.length}`);
    
    if (allProducts.length === validProducts.length) {
      console.log("✅ All products are now valid!");
    } else {
      console.log("❌ There are still some invalid products");
    }
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
});

connection.on("error", (error) => {
  console.error("Database connection error:", error);
});
