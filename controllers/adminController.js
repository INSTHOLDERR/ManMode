import User from "../models/model.js";
import Brand from "../models/brandModer.js";
import Category from "../models/categoryModel.js";
import UserOrder from "../models/orderHistoryModel.js";
import Product from "../models/productModel.js";
import Coupon from "../models/couponModel.js";
import Offer from "../models/offerModel.js";
import Wallet from "../models/walletModel.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import bcrypt from "bcrypt";

// const admins = [{ email: 'nikhil@gmail.com', password: 'Nikhil' }, { email: 'sree@gmail.com', password: 'Nikhil' }];

// Login

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.status(422).json({ error: "Please fill in all fields." });
    }
    // const admin = admins.find((admin) => admin.email.toLowerCase() === email.toLowerCase());

    const admin = await User.findOne({
      email: email.toLowerCase(),
      isAdmin: true,
    });
    if (!admin) {
      return res.status(422).json({ error: "Invalid User." });
    }

    const comparePass = await bcrypt.compare(password, admin.password);
    if (!comparePass) {
      return res.status(422).json({ message: "Invalid Password." });
    }

    req.session.admin = { email: admin.email };

    console.log(req.session.admin);

    return res
      .status(200)
      .json({ message: "Login successful.", redirectUrl: "/admindashboard" });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// Users

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.isActive).length;
    const blockedUsers = totalUsers - activeUsers;

    res.status(200).json({
      success: true,
      data: users,
      counts: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error,
    });
  }
};

export const changeStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  console.log("id,active", id, isActive);

  try {
    await User.findByIdAndUpdate(id, { isActive });
    res.json({ success: true, message: "User status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update user status" });
  }
};

export const logoutAdmin = async (req, res) => {
  console.log(req.session.admin);

  req.session.admin = null;
  res.redirect("/admin");
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};

// brands
export const addBrand = async (req, res) => {
  try {
    const { "brand-name": name } = req.body;
    console.log("Brand name:", name);
    console.log("Request Body:", req.body);
    console.log("Files:", req.files);

    const image =
      req.files && req.files["brand-image"]
        ? req.files["brand-image"][0].path
        : null;
    console.log("Received image path:", image);

    if (!name || !image) {
      return res
        .status(400)
        .json({ message: "Brand name and image are required." });
    }

    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingBrand) {
      return res.status(409).json({ message: "Brand already exists." });
    }

    const brand = new Brand({ name, image });
    await brand.save();

    res.status(201).json({ message: "Brand created successfully!", brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ message: "Error creating brand.", error });
  }
};

export const getBrand = async (req, res) => {
  try {
    const brands = await Brand.find();
    const totalBrands = brands.length;
    const activeBrands = brands.filter((brand) => brand.isActive).length;
    const blockedBrands = totalBrands - activeBrands;

    res.status(200).json({
      brands,
      counts: {
        total: totalBrands,
        active: activeBrands,
        blocked: blockedBrands,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands.", error });
  }
};
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID", id);

    const { "brand-name": name } = req.body;
    console.log("brand name", name);
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const image =
      req.files && req.files["brand-image"]
        ? req.files["brand-image"][0].path
        : null;
    console.log("image ", image);
    const updateData = { name };
    if (image) updateData.image = image;
    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    console.log("Brand", updatedBrand);

    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found." });
    }

    res
      .status(200)
      .json({ message: "Brand updated successfully!", brand: updatedBrand });
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ message: "Error updating brand.", error });
  }
};

export const changeBrandStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  console.log("brandStatus", id, isActive);

  try {
    await Brand.findByIdAndUpdate(id, { isActive });
    console.log(id);

    await Product.updateMany({ brand: id }, { isActive });

    res.json({
      success: true,
      message: "Brand and associated products status updated",
    });
  } catch (error) {
    console.error("Error updating brand and products:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update brand and products status",
      });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const deletedBrand = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found." });
    }

    res.status(200).json({ message: "Brand deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand.", error });
  }
};

//   Category
export const addCategory = async (req, res) => {
  try {
    let { "category-name": name, "category-description": description } =
      req.body;
    console.log("Original Category Name", name);
    console.log("Original Category Description", description);

    name = name?.trim().replace(/\s+/g, " ") || "";
    description = description?.trim().replace(/\s+/g, " ") || "";
    console.log("Normalized Category Name", name);
    console.log("Normalized Category Description", description);

    console.log("Request Body", req.body);
    console.log("Uploaded Files", req.files);

    const image =
      req.files && req.files["category-image"]
        ? req.files["category-image"][0].path
        : null;
    console.log("Received image path:", image);

    if (!name || !description || !image) {
      return res
        .status(400)
        .json({
          message: "Category name, description, and image are required.",
        });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists." });
    }

    const category = new Category({ name, description, image });
    await category.save();

    res
      .status(201)
      .json({ message: "Category created successfully!", category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category.", error });
  }
};

export const getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    const totalCategory = categories.length;
    const activeCategory = categories.filter(
      (category) => category.isActive
    ).length;
    const blockedCategory = totalCategory - activeCategory;

    res.status(200).json({
      categories,
      counts: {
        total: totalCategory,
        active: activeCategory,
        blocked: blockedCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories.", error });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const { "category-name": name, "category-description": description } =
      req.body;
    console.log("name", name);
    console.log("description", description);

    console.log("Files:", req.files);

    const image =
      req.files && req.files["category-image"]
        ? req.files["category-image"][0].path
        : null;
    console.log("Received image path:", image);
    const updateData = { name, description };
    if (image) updateData.image = image;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    console.log("Updated Category:", updatedCategory);

    res
      .status(200)
      .json({
        message: "Category updated successfully!",
        category: updatedCategory,
      });
  } catch (error) {
    console.error("Error updating Category:", error);
    res.status(500).json({ message: "Error updating Category.", error });
  }
};

export const changeCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  console.log("categoryStatus", id, isActive);

  try {
    await Category.findByIdAndUpdate(id, { isActive });
    await Product.updateMany({ category: id }, { isActive });
    res.json({ success: true, message: "category status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update category status" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Category.", error });
  }
};

// Product

export const productCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const productBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands", error });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, description, basePrice, stock, category, brand, sizes } =
      req.body;

    const sizeQuantities = JSON.parse(sizes);
    console.log(req.files);

    const imageFiles = req.files["images"] || [];
    console.log(imageFiles);

    const imagePaths = imageFiles.map((file) => file.path.replace(/\\/g, "/"));

    console.log(imagePaths);

    const newProduct = new Product({
      name,
      description,
      basePrice,
      // discount,
      // actualPrice,
      stock,
      category,
      brand,
      sizes: sizeQuantities,
      images: imagePaths,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const totalProducts = products.length;
    const activeProducts = products.filter(
      (product) => product.isActive
    ).length;
    const blockedProducts = totalProducts - activeProducts;

    res.status(200).json({
      success: true,
      products: products,
      counts: {
        total: totalProducts,
        active: activeProducts,
        blocked: blockedProducts,
      },
    });
    // res.json();
    // console.log(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changeProductStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  console.log("categoryStatus", id, isActive);

  try {
    await Product.findByIdAndUpdate(id, { isActive });
    res.json({ success: true, message: "product status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update product status" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Product.", error });
  }
};

export const editProductId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received ID:", id);

    const product = await Product.findById(id);
    console.log(product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // console.log('Fetched Product:', product);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Error fetching product details", error });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    basePrice,
    category,
    brand,
    sizes,
    existingImages,
    stock,
  } = req.body;
  const imageFiles = req.files?.["images"] || [];

  if (!id) return res.status(400).json({ message: "Product ID is required" });

  let parsedSizes = {};
  if (sizes) {
    try {
      parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    } catch (err) {
      return res.status(400).json({ message: "Invalid sizes data format" });
    }
  }

  const newImagePaths = Array.isArray(imageFiles)
    ? imageFiles
        .map((file) => `uploads/uploaded-images/${file.filename}`)
        .filter(Boolean)
    : [];

  const existingImageArray = Array.isArray(existingImages)
    ? existingImages.map((image) =>
        image.startsWith("uploads/uploaded-images/")
          ? image
          : `uploads/uploaded-images/${image}`
      )
    : existingImages
    ? [`uploads/uploaded-images/${existingImages}`]
    : [];

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.basePrice = basePrice || product.basePrice;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock || product.stock;

    if (Object.keys(parsedSizes).length > 0) {
      Object.keys(parsedSizes).forEach((size) => {
        product.sizes.set(size, parsedSizes[size]);
      });
    }

    product.images = [...existingImageArray, ...newImagePaths];

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while updating the product",
        error: error.message,
      });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    const orders = await UserOrder.find()
      .populate({ path: "orderedItems.productId" })
      .populate({ path: "userId", select: "name email" });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found." });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status, orderId, itemId } = req.body;

  console.log(req.body);

  if (!orderId || !itemId || !status) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid data provided." });
  }

  try {
    const order = await UserOrder.findOne({ _id: orderId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const item = order.orderedItems.find(
      (item) => item._id.toString() === itemId
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in order." });
    }

    item.status = status;

    await order.save();

    res.json({ success: true, message: "Item status updated successfully." });
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// coupon

export const addCoupon = async (req, res) => {
  const {
    couponCode,
    type,
    minimumPrice,
    discount,
    maxRedeem,
    expiry,
    status,
  } = req.body;

  if (discount <= 0) {
    return res
      .status(400)
      .json({ message: "Discount must be a positive number." });
  }

  if (type === "percentageDiscount" && discount > 100) {
    return res
      .status(400)
      .json({ message: "Percentage discount cannot exceed 100%." });
  }

  try {
    const coupon = new Coupon({
      couponCode,
      type,
      minimumPrice,
      discount,
      maxRedeem,
      expiry,
      status,
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating coupon", error });
  }
};

export const editCoupon = async (req, res) => {
  const { id } = req.params;
  const couponId = id;
  console.log("editCoupon", couponId);

  const {
    couponCode,
    type,
    minimumPrice,
    discount,
    maxRedeem,
    expiry,
    status,
  } = req.body;
  console.log("req.body", req.body);

  if (discount <= 0) {
    return res
      .status(400)
      .json({ message: "Discount must be a positive number." });
  }

  if (type === "percentageDiscount" && discount > 100) {
    return res
      .status(400)
      .json({ message: "Percentage discount cannot exceed 100%." });
  }

  try {
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        couponCode,
        type,
        minimumPrice,
        discount,
        maxRedeem,
        expiry,
        status,
      },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    res.status(200).json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating coupon", error });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch coupons",
        error: error.message,
      });
  }
};

//   export const editCoupon = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedData = req.body;

//         const updatedCoupon = await Coupon.findByIdAndUpdate(id, updatedData, { new: true });

//         if (!updatedCoupon) {
//             return res.status(404).json({ success: false, message: 'Coupon not found' });
//         }

//         res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon: updatedCoupon });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Failed to update coupon', error: error.message });
//     }
//   };

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete coupon",
        error: error.message,
      });
  }
};

//   offer

export const getOfferBrand = async (req, res) => {
  try {
    const brands = await Brand.find({}, "_id name");
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

export const getOfferCategory = async (req, res) => {
  try {
    const categories = await Category.find({}, "_id name");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    console.log(offers);

    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch offers" });
  }
};

export const addOffers = async (req, res) => {
  try {
    const offer = new Offer(req.body);
    console.log(offer);

    if (offer.startDate > offer.endDate) {
      return res
        .status(400)
        .json({ error: "Start date cannot be after end date" });
    }

    await offer.save();

    await applyOffersToProducts();

    const avbleOffers = await Offer.find({ isActive: true });
    console.log("Available Offers:", avbleOffers);

    res
      .status(201)
      .json({ message: "Offer added and applied successfully", offer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteOffers = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Offer deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOffers = async (req, res) => {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    await applyOffersToProducts();
    console.log("req.body", req.body);

    console.log("updatedOffer", updatedOffer);

    res.json(updatedOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

import mongoose from "mongoose";

export const fetchOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Offer ID" });
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    let categoryDetails = null;
    if (offer.categoryId && mongoose.Types.ObjectId.isValid(offer.categoryId)) {
      categoryDetails = await Category.findById(offer.categoryId, "name");
    }
    let brandDetails = null;
    if (offer.brandId && mongoose.Types.ObjectId.isValid(offer.brandId)) {
      brandDetails = await Brand.findById(offer.brandId, "name"); 
    }


    const response = {
      ...offer.toObject(),
      categoryDetails: categoryDetails ? categoryDetails.name : null, 
      brandDetails: brandDetails ? brandDetails.name : null, 
    };

 
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatereturn = async (req, res) => {
  const { orderId, itemId, returnStatus } = req.body;

  console.log(req.body);

  try {
    const order = await UserOrder.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    const item = order.orderedItems.id(itemId);
    if (!item) return res.json({ success: false, message: "Item not found" });

    if (condition) {
    }

    item.returnStatus = returnStatus;
    await order.save();

    res.json({ success: true, message: "Return status updated successfully" });
  } catch (error) {
    console.error("Error updating return status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveReturnRequest = async (req, res) => {
  const { orderId, itemId, returnStatus } = req.body;
  console.log(req.body);

  try {
    const order = await UserOrder.findOne({
      _id: orderId,
      "orderedItems._id": itemId,
    });
    console.log(order);

    if (!order) {
      return res.status(404).json({ message: "Order or item not found" });
    }

    const item = order.orderedItems.id(itemId);
    console.log("Item found:", item);

    item.returnStatus = returnStatus;
    item.returnRequestedAt = new Date();
    console.log("jhdch", item.totalPrice);

    const totalAmount = Number(item.totalPrice);

    console.log("aaaaaaaaaaaaa", totalAmount);

    if (returnStatus === "Approved") {
      const userId = order.userId;
      const wallet = await Wallet.findOne({ userId });
      console.log("Wallet found:", wallet);

      if (!wallet) {
        return res
          .status(404)
          .json({ message: "Wallet not found for the user" });
      }

      wallet.balance += totalAmount;

      wallet.transactions.push({
        amount: totalAmount,
        type: "credit",
        paymentId: `Return for Order ID: ${orderId}`,
      });

      await wallet.save();

      console.log(`Wallet updated: ${wallet.balance}`);
    }

    await order.save();

    res
      .status(200)
      .json({
        success: true,
        message: `Return request ${returnStatus.toLowerCase()}`,
        order,
      });
  } catch (error) {
    console.error("Error approving return request:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error approving return request",
        error,
      });
  }
};

export const rejectReturnRequest = async (req, res) => {
  const { orderId, itemId, returnStatus } = req.body;

  try {
    const order = await UserOrder.findOne({
      _id: orderId,
      "orderedItems._id": itemId,
    });
    if (!order) {
      return res.status(404).json({ message: "Order or item not found" });
    }

    const item = order.orderedItems.id(itemId);
    item.returnStatus = returnStatus;
    item.returnRequestedAt = new Date();

    await order.save();

    res
      .status(200)
      .json({
        success: true,
        message: `Return request ${returnStatus.toLowerCase()}`,
        order,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: true,
        message: "Error rejecting return request",
        error,
      });
  }
};

export const applyOffersToProducts = async () => {
  try {
    const now = new Date();

 
    const activeOffers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    console.log("activeOffers", activeOffers);

   
    await Product.updateMany({}, [
      {
        $set: {
          offerPrice: "$basePrice",
        },
      },
    ]);

  
    for (const offer of activeOffers) {
      const updateQuery = [
        {
          $set: {
            offerPrice: {
              $cond: [
                { $eq: [offer.discountType, "percentage"] },
                {
                  $subtract: [
                    "$basePrice",
                    { $multiply: ["$basePrice", offer.discount / 100] },
                  ],
                },
                { $subtract: ["$basePrice", offer.discount] },
              ],
            },
          },
        },
      ];

      if (offer.offerType === "brand") {
        await Product.updateMany({ brand: offer.brandId }, updateQuery);
      } else if (offer.offerType === "category") {
        await Product.updateMany({ category: offer.categoryId }, updateQuery);
      }
    }

    console.log("Offers applied successfully.");
  } catch (error) {
    console.error("Error applying offers to products:", error);
  }
};

export const disableExpiredOffers = async () => {
  try {
    const now = new Date();

    const expiredOffers = await Offer.find({
      isActive: true,
      endDate: { $lt: now },
    });

    console.log("expiredOffers", expiredOffers);

    for (const offer of expiredOffers) {
      await Offer.findByIdAndUpdate(offer._id, { isActive: false });

      const resetQuery = {
        $set: { offerPrice: "$basePrice" },
      };

      if (offer.offerType === "brand") {
        await Product.updateMany({ brand: offer.brandId }, resetQuery);
      } else if (offer.offerType === "category") {
        await Product.updateMany({ category: offer.categoryId }, resetQuery);
      }
    }

    console.log("Expired offers disabled successfully.");
  } catch (error) {
    console.error("Error disabling expired offers:", error);
  }
};

import path from "path";

const calculateSalesData = async (startDate, endDate) => {
  try {
    console.log("Fetching orders for date range:", { startDate, endDate });

    const orders = await UserOrder.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      },
    }).populate("orderedItems.productId");

    console.log(`Found ${orders.length} orders`);

    let totalSales = 0;
    let totalDiscount = 0;
    let totalOrders = orders.length;
    let totalItems = 0;

    orders.forEach((order) => {
      totalSales += order.totalAmount || 0;
      totalDiscount += order.discount || 0;
      totalItems += order.orderedItems.length;
    });

    console.log("Calculated totals:", {
      totalSales,
      totalDiscount,
      totalOrders,
      totalItems,
    });

    return {
      totalSales,
      totalDiscount,
      totalOrders,
      totalItems,
      orders,
    };
  } catch (error) {
    console.error("Error in calculateSalesData:", error);
    throw error;
  }
};

export const salesReport = async (req, res) => {
  console.log("Received request body:", req.body);

  try {
    const { reportType, startDate, endDate, reportFormat } = req.body;

  
    if (!reportType || !startDate || !endDate || !reportFormat) {
      console.error("Missing parameters:", {
        reportType,
        startDate,
        endDate,
        reportFormat,
      });
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: reportType, startDate, endDate, or reportFormat",
      });
    }


    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      console.error("Invalid date format:", { startDate, endDate });
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }


    console.log("Calculating sales data...");
    const data = await calculateSalesData(startDate, endDate);

 
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
      console.log("Created temp directory:", tempDir);
    }

    const timestamp = Date.now();
    const fileName = `sales-report-${timestamp}`;

    if (reportFormat === "excel") {
      console.log("Generating Excel report...");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");


      worksheet.addRow(["Sales Report"]);
      worksheet.addRow([`Date Range: ${startDate} to ${endDate}`]);
      worksheet.addRow([]);
      worksheet.addRow(["Summary"]);
      worksheet.addRow(["Total Sales", data.totalSales]);
      worksheet.addRow(["Total Discount", data.totalDiscount]);
      worksheet.addRow(["Total Orders", data.totalOrders]);
      worksheet.addRow(["Total Items", data.totalItems]);

    
      const filePath = path.join(tempDir, `${fileName}.xlsx`);
      console.log("Saving Excel file to:", filePath);

      try {
        await workbook.xlsx.writeFile(filePath);
        console.log("Excel file created successfully");

        res.download(
          filePath,
          `sales-report-${startDate}-to-${endDate}.xlsx`,
          (err) => {
            if (err) {
              console.error("Excel download error:", err);
             
              if (!res.headersSent) {
                res.status(500).json({
                  success: false,
                  message: "Error downloading file",
                });
              }
            }
            
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) console.error("File cleanup error:", unlinkErr);
            });
          }
        );
      } catch (error) {
        console.error("Error creating Excel file:", error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error creating Excel file",
          });
        }
      }
    } else if (reportFormat === "pdf") {
      console.log("Generating PDF report...");
      const doc = new PDFDocument();
      const filePath = path.join(tempDir, `${fileName}.pdf`);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

   
      doc.fontSize(16).text("Sales Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`);
      doc.moveDown();
      doc.text(`Total Sales: $${data.totalSales}`);
      doc.text(`Total Discount: $${data.totalDiscount}`);
      doc.text(`Total Orders: ${data.totalOrders}`);
      doc.text(`Total Items: ${data.totalItems}`);

      doc.end();

      writeStream.on("finish", () => {
        console.log("PDF file created successfully");
        res.download(
          filePath,
          `sales-report-${startDate}-to-${endDate}.pdf`,
          (err) => {
            if (err) {
              console.error("PDF download error:", err);
              if (!res.headersSent) {
                res.status(500).json({
                  success: false,
                  message: "Error downloading file",
                });
              }
            }
           
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) console.error("File cleanup error:", unlinkErr);
            });
          }
        );
      });

      writeStream.on("error", (error) => {
        console.error("Error writing PDF:", error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error creating PDF file",
          });
        }
      });
    } else {
      console.error("Invalid report format:", reportFormat);
      return res.status(400).json({
        success: false,
        message: "Invalid report format. Accepted values: 'excel', 'pdf'",
      });
    }
  } catch (error) {
    console.error("Error in salesReport:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error while generating report",
        error: error.message,
      });
    }
  }
};

export const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;

   
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const dateFormat =
      reportType === "daily"
        ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        : reportType === "weekly"
        ? { $week: "$createdAt" }
        : { $dateToString: { format: "%Y-%m", date: "$createdAt" } }; 

    const reportData = await UserOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $unwind: "$orderedItems", 
      },
      {
        $group: {
          _id: dateFormat,
          totalOrders: { $sum: 1 },
          productCount: { $sum: "$orderedItems.count" },
          totalRevenue: { $sum: "$orderedItems.totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(
      reportData.map((entry) => ({
        date: entry._id,
        totalOrders: entry.totalOrders,
        productCount: entry.productCount,
        totalRevenue: entry.totalRevenue.toFixed(2),
      }))
    );
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ error: "Failed to generate sales report" });
  }
};

// sales report

export const getDailySalesReport = async (req, res) => {
  try {
    const dailyOrders = await UserOrder.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$totalAmount" },
          totalProducts: {
            $sum: {
              $reduce: {
                input: "$orderedItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.count"] },
              },
            },
          },
          couponDiscount: { $sum: "$discount" }, 
          offerDiscount: {
            $sum: {
              $reduce: {
                input: "$orderedItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.totalDiscount"] },
              },
            },
          }, 
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalAmount: 1,
          totalProducts: 1,
          orderCount: 1,
          couponDiscount: 1,
          offerDiscount: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.json({
      status: "success",
      data: dailyOrders,
    });
  } catch (error) {
    console.error("Error in getDailySalesReport:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getCustomDateRangeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const customRangeOrders = await UserOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$totalAmount" },
          totalProducts: {
            $sum: {
              $reduce: {
                input: "$orderedItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.count"] },
              },
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalAmount: 1,
          totalProducts: 1,
          orderCount: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.json({
      status: "success",
      data: customRangeOrders,
    });
  } catch (error) {
    console.error("Error in getCustomDateRangeReport:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getWeeklySalesReport = async (req, res) => {
  try {
    const weeklyOrders = await UserOrder.aggregate([
      {
        $group: {
          _id: {
            week: { $week: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          startDate: { $min: "$createdAt" },
          endDate: { $max: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
          totalProducts: {
            $sum: {
              $reduce: {
                input: "$orderedItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.count"] },
              },
            },
          },
          couponDiscount: { $sum: "$discount" },
          offerDiscount: {
            $sum: {
              $reduce: {
                input: "$orderedItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.totalDiscount"] },
              },
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          weekNumber: "$_id.week",
          year: "$_id.year",
          dateRange: {
            $concat: [
              { $dateToString: { format: "%Y-%m-%d", date: "$startDate" } },
              " to ",
              { $dateToString: { format: "%Y-%m-%d", date: "$endDate" } },
            ],
          },
          totalAmount: 1,
          totalProducts: 1,
          couponDiscount: 1,
          offerDiscount: 1,
          orderCount: 1,
        },
      },
      { $sort: { year: -1, weekNumber: -1 } },
    ]);

    res.json({
      status: "success",
      data: weeklyOrders,
    });
  } catch (error) {
    console.error("Error in getWeeklySalesReport:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getMonthlySalesReport = async (req, res) => {
  try {
    const monthlyOrders = await UserOrder.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          firstDay: { $min: "$createdAt" },
          lastDay: { $max: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
          totalProducts: {
            $sum: {
              $reduce: {
                input: "$orderedItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.count"] },
              },
            },
          },
          couponDiscount: { $sum: "$discount" },
          offerDiscount: {
            $sum: {
              $reduce: {
                input: "$orderedItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.totalDiscount"] },
              },
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          dateRange: {
            $concat: [
              { $dateToString: { format: "%B %Y", date: "$firstDay" } },
            ],
          },
          totalAmount: 1,
          totalProducts: 1,
          couponDiscount: 1,
          offerDiscount: 1,
          orderCount: 1,
        },
      },
      { $sort: { firstDay: -1 } },
    ]);

    res.json({
      status: "success",
      data: monthlyOrders,
    });
  } catch (error) {
    console.error("Error in getMonthlySalesReport:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// generating sales report

export const downloadSalesReport = async (req, res) => {
  try {
    const { reportType, format, startDate, endDate } = req.query;
    let reportData;

    console.log("Report Type:", reportType);
    console.log("Format:", format);
    console.log("Date Range:", startDate, endDate);

    
    switch (reportType) {
      case "daily":
        reportData = await UserOrder.aggregate([
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              totalAmount: { $sum: "$totalAmount" },
              totalProducts: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.count"] },
                  },
                },
              },
              couponDiscount: { $sum: "$discount" },
              offerDiscount: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.totalDiscount"] },
                  },
                },
              },
              orderCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              totalAmount: 1,
              totalProducts: 1,
              orderCount: 1,
              couponDiscount: 1,
              offerDiscount: 1,
            },
          },
          { $sort: { date: -1 } },
        ]);
        break;

      case "weekly":
        reportData = await UserOrder.aggregate([
          {
            $group: {
              _id: {
                week: { $week: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              startDate: { $min: "$createdAt" },
              endDate: { $max: "$createdAt" },
              totalAmount: { $sum: "$totalAmount" },
              totalProducts: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.count"] },
                  },
                },
              },
              couponDiscount: { $sum: "$discount" },
              offerDiscount: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.totalDiscount"] },
                  },
                },
              },
              orderCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              dateRange: {
                $concat: [
                  { $dateToString: { format: "%Y-%m-%d", date: "$startDate" } },
                  " to ",
                  { $dateToString: { format: "%Y-%m-%d", date: "$endDate" } },
                ],
              },
              totalAmount: 1,
              totalProducts: 1,
              couponDiscount: 1,
              offerDiscount: 1,
              orderCount: 1,
            },
          },
          { $sort: { startDate: -1 } },
        ]);
        break;

      case "monthly":
        reportData = await UserOrder.aggregate([
          {
            $group: {
              _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              firstDay: { $min: "$createdAt" },
              lastDay: { $max: "$createdAt" },
              totalAmount: { $sum: "$totalAmount" },
              totalProducts: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.count"] },
                  },
                },
              },
              couponDiscount: { $sum: "$discount" },
              offerDiscount: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.totalDiscount"] },
                  },
                },
              },
              orderCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              dateRange: {
                $concat: [
                  { $dateToString: { format: "%B %Y", date: "$firstDay" } },
                ],
              },
              totalAmount: 1,
              totalProducts: 1,
              couponDiscount: 1,
              offerDiscount: 1,
              orderCount: 1,
            },
          },
          { $sort: { firstDay: -1 } },
        ]);
        break;

      case "custom":
        reportData = await UserOrder.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              totalAmount: { $sum: "$totalAmount" },
              totalProducts: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.count"] },
                  },
                },
              },
              couponDiscount: { $sum: "$discount" },
              offerDiscount: {
                $sum: {
                  $reduce: {
                    input: "$orderedItems",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.totalDiscount"] },
                  },
                },
              },
              orderCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              totalAmount: 1,
              totalProducts: 1,
              orderCount: 1,
              couponDiscount: 1,
              offerDiscount: 1,
            },
          },
          { $sort: { date: -1 } },
        ]);
        break;
      default:
        throw new Error("Invalid report type");
    }

    console.log("Report Data:", reportData);

    if (!reportData || reportData.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No data available for the selected period",
      });
    }

    if (format === "excel") {
      return generateExcelReport(reportData, reportType, res);
    } else if (format === "pdf") {
      return generatePDFReport(reportData, reportType, res);
    }
  } catch (error) {
    console.error("Error in downloadSalesReport:", error);
    res.status(500).json({
      status: "error",
      message: "Error generating report",
    });
  }
};

function generateExcelReport(data, reportType, res) {
  const transformedData = data.map((item) => {
    const baseData = {
      "Order Count": item.orderCount,
      "Total Products": item.totalProducts,
      "Total Amount": `₹ ${item.totalAmount.toLocaleString("en-IN")}`,
      "Coupon Discount": `₹${(item.couponDiscount || 0).toLocaleString(
        "en-IN"
      )}`,
      "Offer Discount": `₹${(item.offerDiscount || 0).toLocaleString("en-IN")}`,
    };

    if (reportType === "monthly" || reportType === "weekly") {
      return {
        "Date Range": item.dateRange,
        ...baseData,
      };
    } else {
      return {
        Date: new Date(item.date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        ...baseData,
      };
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(transformedData);

  const columnWidths = [
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=sales-report-${reportType}-${
      new Date().toISOString().split("T")[0]
    }.xlsx`
  );

  const buffer = XLSX.write(workbook, { type: "buffer" });
  res.send(buffer);
}

function generatePDFReport(data, reportType, res) {
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  const totals = data.reduce(
    (acc, item) => ({
      orders: acc.orders + item.orderCount,
      products: acc.products + item.totalProducts,
      amount: acc.amount + item.totalAmount,
      couponDiscount: acc.couponDiscount + (item.couponDiscount || 0),
      offerDiscount: acc.offerDiscount + (item.offerDiscount || 0),
    }),
    { orders: 0, products: 0, amount: 0, couponDiscount: 0, offerDiscount: 0 }
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=sales-report-${reportType}-${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).font("Helvetica-Bold").text("ManMode", { align: "center" });
  doc
    .fontSize(16)
    .text(`Sales Report - ${reportType.toUpperCase()}`, { align: "center" });
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Generated on: ${new Date().toLocaleString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      { align: "right" }
    );
  doc.moveDown();

  const boxWidth = 130;
  const boxHeight = 70;
  const startX = 30;
  const startY = 120;
  const gap = 5;

  function drawSummaryBox(x, y, title, value, color) {
    doc.roundedRect(x, y, boxWidth, boxHeight, 5).lineWidth(1).stroke(color);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(title, x + 10, y + 10, { width: boxWidth - 20, align: "center" });

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(value, x + 10, y + 35, { width: boxWidth - 20, align: "center" });
  }

  drawSummaryBox(
    startX,
    startY,
    "Total Orders",
    totals.orders.toLocaleString("en-IN"),
    "#000000"
  );
  drawSummaryBox(
    startX + boxWidth + gap,
    startY,
    "Total Products",
    totals.products.toLocaleString("en-IN"),
    "#000000"
  );
  drawSummaryBox(
    startX + (boxWidth + gap) * 2,
    startY,
    "Total Amount",
    `₹${totals.amount.toLocaleString("en-IN")}`,
    "#000000"
  );
  drawSummaryBox(
    startX + (boxWidth + gap) * 3,
    startY,
    "Total Discounts",
    `₹${(totals.couponDiscount + totals.offerDiscount).toLocaleString(
      "en-IN"
    )}`,
    "#000000"
  );

  const yPosition = startY + boxHeight + 40;

  const headers =
    reportType === "monthly" || reportType === "weekly"
      ? [
          "Date Range",
          "Orders",
          "Products",
          "Amount (₹)",
          "Coupon (₹)",
          "Offer (₹)",
        ]
      : ["Date", "Orders", "Products", "Amount (₹)", "Coupon (₹)", "Offer (₹)"];

  const xPositions = [50, 150, 230, 300, 400, 480];
  const columnWidths = [140, 70, 70, 70, 70, 70];

  doc.rect(35, yPosition - 5, 530, 25).fill("#f3f4f6");

  doc.fontSize(10).font("Helvetica-Bold");
  headers.forEach((header, i) => {
    doc.fillColor("#000000").text(header, xPositions[i], yPosition, {
      width: columnWidths[i],
      align: i === 0 ? "left" : "right",
    });
  });

  let currentY = yPosition + 30;
  doc.font("Helvetica");

  data.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.rect(35, currentY - 5, 530, 20).fill("#f8fafc");
    }

    const dateField =
      reportType === "monthly" || reportType === "weekly"
        ? item.dateRange
        : new Date(item.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

    doc.fillColor("#000000");
    doc.text(dateField, xPositions[0], currentY, { width: columnWidths[0] });
    doc.text(item.orderCount.toString(), xPositions[1], currentY, {
      width: columnWidths[1],
      align: "right",
    });
    doc.text(item.totalProducts.toString(), xPositions[2], currentY, {
      width: columnWidths[2],
      align: "right",
    });
    doc.text(
      `₹${item.totalAmount.toLocaleString("en-IN")}`,
      xPositions[3],
      currentY,
      { width: columnWidths[3], align: "right" }
    );
    doc.text(
      `₹${(item.couponDiscount || 0).toLocaleString("en-IN")}`,
      xPositions[4],
      currentY,
      { width: columnWidths[4], align: "right" }
    );
    doc.text(
      `₹${(item.offerDiscount || 0).toLocaleString("en-IN")}`,
      xPositions[5],
      currentY,
      { width: columnWidths[5], align: "right" }
    );

    currentY += 20;

    if (currentY > 750) {
      doc.addPage();
      currentY = 50;

      doc.fontSize(10).font("Helvetica-Bold");

      doc.rect(35, currentY - 5, 530, 25).fill("#f3f4f6");

      headers.forEach((header, i) => {
        doc.fillColor("#000000").text(header, xPositions[i], currentY, {
          width: columnWidths[i],
          align: i === 0 ? "left" : "right",
        });
      });

      currentY += 30;
      doc.font("Helvetica");
    }
  });

  doc.rect(35, currentY - 5, 530, 2).fill("#e5e7eb");

  doc.end();
}

// dshboard details

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      UserOrder.countDocuments({ paymentStatus: "Success" }), 
      UserOrder.aggregate([ 
        { $match: { paymentStatus: "Success" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      UserOrder.distinct("userId", { paymentStatus: "Success" }), 
      User.find(), 
    ]);

    console.log("stats", stats);

    const totalCustomers = stats[3].length;

    return res.json({
      status: "success",
      data: {
        totalOrders: stats[0], 
        totalSales: stats[1][0]?.total || 0, 
        totalCustomers, 
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard statistics",
    });
  }
};


export const getDashboardAnalytics = async (req, res) => {  
  try {
    const { timeFilter = "yearly" } = req.query;
    const timeFrame = getTimeFrameFilter(timeFilter);
    console.log(req.query);

   
    const salesData = await UserOrder.aggregate([
      {
        $match: {
          createdAt: timeFrame,
          paymentStatus: "Success",
        },
      },
      {
        $group: {
          _id: getGroupByDate(timeFilter),
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

   
    const topProducts = await UserOrder.aggregate([
      { $match: { paymentStatus: "Success" } },
      { $unwind: "$orderedItems" },
      {
        $group: {
          _id: "$orderedItems.productId",
          totalSales: { $sum: "$orderedItems.totalPrice" },
          quantity: { $sum: "$orderedItems.count" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          totalSales: 1,
          quantity: 1,
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

   
    const topBrands = await UserOrder.aggregate([
      { $match: { paymentStatus: "Success" } },
      { $unwind: "$orderedItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "brands", // Assuming the Brand collection is named 'brands'
          localField: "product.brand", // This assumes brandId is stored in 'product.brand'
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" }, // Unwind to get the brand details
      {
        $group: {
          _id: "$brand._id", // Group by brandId
          brandName: { $first: "$brand.name" }, // Get the brand name
          totalSales: { $sum: "$orderedItems.totalPrice" },
          quantity: { $sum: "$orderedItems.count" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

  
    const topCategories = await UserOrder.aggregate([
      { $match: { paymentStatus: "Success" } },
      { $unwind: "$orderedItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories", // Assuming the Category collection is named 'categories'
          localField: "product.category", // This assumes categoryId is stored in 'product.category'
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" }, // Unwind to get the category details
      {
        $group: {
          _id: "$category._id", // Group by categoryId
          categoryName: { $first: "$category.name" }, // Get the category name
          totalSales: { $sum: "$orderedItems.totalPrice" },
          quantity: { $sum: "$orderedItems.count" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

    return res.json({
      status: "success",
      data: {
        salesData,
        topProducts,
        topCategories,
        topBrands,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch analytics data",
    });
  }
};

// Helper functions
function getTimeFrameFilter(timeFilter) {
  const now = new Date();
  switch (timeFilter) {
    case "yearly":
      return {
        $gte: new Date(now.getFullYear(), 0, 1),
        $lte: now,
      };
    case "monthly":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: now,
      };
    case "weekly":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return {
        $gte: weekStart,
        $lte: now,
      };
    case "daily":
      return {
        $gte: new Date(now.setHours(0, 0, 0, 0)),
        $lte: now,
      };
    default:
      return {};
  }
}

function getGroupByDate(timeFilter) {
  switch (timeFilter) {
    case "yearly":
      return { $month: "$createdAt" };
    case "monthly":
      return { $dayOfMonth: "$createdAt" };
    case "weekly":
      return { $dayOfWeek: "$createdAt" };
    case "daily":
      return { $hour: "$createdAt" };
    default:
      return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }
}
