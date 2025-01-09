import User from '../models/model.js'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer';
import passport from 'passport';
import Razorpay from 'razorpay';
import Brand from '../models/brandModer.js'
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import Review from '../models/reviewModel.js'
import Address from "../models/addressMolder.js";
import mongoose from "mongoose";
import Cart from '../models/cartMosel.js'
import Wishlist from '../models/wishlistModel.js'
import Wallet from '../models/walletModel.js'
import UserOrder  from '../models/orderHistoryModel.js'
import Coupon from '../models/couponModel.js';
import crypto from 'crypto'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv'
dotenv.config();


// Configure Passport Google OAuth 
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_SECRET_KEY,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { email, name } = profile._json;

        console.log(profile);
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name,
            email,
          });

          await user.save();
        }
        return done(null, user);
      } catch (error) {
        console.error("Error authenticating user:", error);
        return done(error, null);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user._id); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); 
    done(null, user); 
  } catch (error) {
    done(error, null);
  }
});






export const sendOTP = async (req, res) => {
    const { email } = req.body;

    

    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please log in." });
        }
        
       
        const otp = Math.floor(100000 + Math.random() * 900000);

  
        req.session.otpData = {
            email,
            otp,
            createdAt: Date.now()
        };
        console.log(req.session.otpData);
        

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'nikhilpramod425@gmail.com',
                pass: 'ebdz bdze hgcu yfka'
            }
        });

        const mailOptions = {
            from: 'nikhilpramod425@gmail.com',
            to: email,
            subject: 'Thank You For Using ManMode.',
            text: `Your OTP code is: ${otp}`
        };


        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
    }
};



export const forgotsendOTP = async (req, res) => {
  const { email } = req.body;

  

  try {

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return res.status(400).json({ message: "You Don't have an account." });
    }
    
     
      const otp = Math.floor(100000 + Math.random() * 900000);

      req.session.otpData = {
          email,
          otp,
          createdAt: Date.now()
      };
      console.log(req.session.otpData);
      

     
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'nikhilpramod425@gmail.com',
              pass: 'ebdz bdze hgcu yfka'
          }
      });

      const mailOptions = {
          from: 'nikhilpramod425@gmail.com',
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP code is: ${otp}`
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: 'OTP sent successfully!' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
  }
};


export const validateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

  
    const clientOtp = otp.trim();
    console.log('Received OTP from client:', clientOtp, typeof clientOtp);


    if (!req.session.otpData) {
      return res.status(400).json({ error: 'Session expired. Please request a new OTP.' });
    }

    const { email: storedEmail, otp: storedOtp, createdAt } = req.session.otpData;

    console.log('Stored OTP in session:', storedOtp, typeof storedOtp);

    const sessionOtp = storedOtp.toString().trim();
    console.log('Converted OTPs to strings:', { clientOtp, sessionOtp });

    if (clientOtp !== sessionOtp) {
      console.log('Invalid OTP. Please try again.');
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }
    console.log('OTP validation passed.');

    if (email !== storedEmail) {
      return res.status(400).json({ error: 'The provided email does not match the session email.' });
    }


    const expirationTime = 1 * 60 * 1000; 
    if (Date.now() - createdAt > expirationTime) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    req.session.userData = {
      email: storedEmail
      
    };

    console.log('Session created with email and userId:', req.session.userData);

    return res.status(200).json({ message: 'OTP validated successfully!', sessionData: req.session.userData });
  } catch (error) {
    console.error('Error in validateOTP:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

// Registration

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  console.log("registration", req.body);
    try {
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: "User already exists. Please log in." });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
  
      const newUser = new User({ name, email, password: hashedPassword});

      await newUser.save();
      return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to register user" });
    }
  };



 


// login
export const loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;


      if (!email || !password) {
          return res.status(422).json({ message: "Fill in all fields." });
      }


      const newEmail = email.toLowerCase();
      const user = await User.findOne({ email: newEmail });

      if (!user) {
          return res.status(422).json({ message: "Invalid User." });
      }


      if (!user.isActive) {
          return res.status(403).json({ message: "User is blocked." });
      }

      const comparePass = await bcrypt.compare(password, user.password);
      if (!comparePass) {
          return res.status(422).json({ message: "Invalid Password." });
      }


      req.session.user = {
          id: user._id,
          email: user.email,
          name: user.name,
      };


      console.log("user session",req.session.user);
      

      return res.status(200).json({
          message: "Login successful!"
      });
  } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: "Login Failed" });
  }
};


// update password


export const updatePassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        console.log(password, confirmPassword );
        
        if (!password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        const email = req.session?.otpData?.email;
        console.log(req.session.otpData);
        if (!email) {
            return res.status(401).json({ error: 'Unauthorized. Please log in again.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Could not log out. Please try again.' });
            }
            res.status(200).json({ message: 'Password updated successfully. Redirecting to login...' });
        });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
};





//HOME PAGE

export const homeBrand = async (req, res) => {
  try {
    const activeBrands = await Brand.find({ isActive: true });
    res.json(activeBrands); 
    console.log();
    
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
};







export const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8); 
    res.json(products); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const homeRandomProducts =async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 8 } }      
    ]);
    
    console.log(products);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching random products:', error);
    res.status(500).send('Server Error');
  }
}



export const getProductDetail = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const productId = id;
  const userId = req.session.user?.id; 

  console.log("userIdddd",userId);
  
 
  if (!productId) {
      return res.status(400).json({ message: 'Product ID is missing' });
  }
  try {
      const product = await Product.findById(productId);
     
      console.log(product);
     
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }
      const brand = await Brand.findById(product.brand);
      if (!brand) {
          return res.status(404).json({ message: 'Brand not found' });
      }
      const category = await Category.findById(product.category)
      if (!category) {
          return res.status(404).json({ message: 'category not found' });
      }
      res.json({ 
          product, 
          brand, 
          category,
          userId,
      });
  } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getsimilarCategoryProduct = async (req, res) => {
  const { id } = req.params; 
  const limit = 12; 

 
  if (!id) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  try {
  
    const products = await Product.find({ category: id, isActive: true }).limit(limit);
    console.log("similar products",products);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this category' });
    }


    res.json(products);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query; 

    const products = await Product.find({ isActive: true })
      .skip((page - 1) * limit) 
      .limit(parseInt(limit)); 

    const totalProducts = await Product.countDocuments({ isActive: true });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};





// review


export const userReviews = async (req, res) => {
  const { productId, review, rating } = req.body;
  const userSession = req.session.user;

  if (!userSession) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  const userId = userSession.id;

  if (!productId || !review || !rating) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
      
      const newReview = new Review({ productId, userId, review, rating });
      await newReview.save();

      
      const reviews = await Review.find({ productId });
      const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRatings / reviews.length;

    
      await Product.findByIdAndUpdate(productId, { averageRating }, { new: true });

      res.status(201).json({ message: 'Review added successfully.', review: newReview });
  } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
};
export const getReviews = async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
      const reviews = await Review.find({ productId }).populate('userId', 'name image');
      console.log("reviews",reviews);
      
      res.status(200).json({ reviews });
  } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
};



// user profile

export const userProfile = async (req, res) => {
  const userId = req.session.user; 
  console.log(userId.id);
  

  try {
    const user = await User.findById(userId.id);
    console.log("loghhhhhh",user);
    

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).json(user);
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    console.log(req.body);
    
    const userId = req.session.user.id;

   
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
  

    if (name) user.name = name;
    if (phone) user.number = phone;
    if (password) user.password = hashedPassword; 


    if (req.files && req.files['image']) {
      const image = req.files['image'][0].filename; 
      user.image = image; 
    }

    console.log("profile user",user,user.image);
    
 
    await user.save();

    res.status(200).json({ success: true, message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const addUserAddress = async (req, res) => {
  try {
    const { addressData } = req.body; 
    const userId = req.session.user.id;
    if (!userId) {
      return res.status(401).json({ message: "User not logged in" });
    }
    const newAddress = new Address({
      ...addressData,
      userId,
    });
console.log(newAddress);

    await newAddress.save();

    res.status(201).json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const getUserAddress = async (req, res) => {
  try {
    const userId = req.session.user.id; 
    console.log("Fetching addresses for user:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    const userAddresses = await Address.find({ userId });

    if (!userAddresses.length) {
      return res.status(404).json({ message: "No addresses found for this user" });
    }

    res.status(200).json({ message: "Addresses retrieved successfully", addresses: userAddresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const getAddressById = async (req, res) => {
  try {
      const { id } = req.params;
      const address = await Address.findById(id);

      if (!address) {
          return res.status(404).json({ error: "Address not found." });
      }

      res.status(200).json(address);
  } catch (error) {
      console.error("Error fetching address by ID:", error);
      res.status(500).json({ error: "Failed to fetch the address." });
  }
};

export const updateAddress = async (req, res) => {
  try {
      const { id } = req.params;
      const updates = req.body;

      const updatedAddress = await Address.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
      });

      if (!updatedAddress) {
          return res.status(404).json({ error: "Address not found." });
      }

      res.status(200).json({ message: "Address updated successfully.", address: updatedAddress });
  } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ error: "Failed to update the address." });
  }
};

export const deleteAddress = async (req, res) => {
  try {
      const { id } = req.params;

      const deletedAddress = await Address.findByIdAndDelete(id);

      if (!deletedAddress) {
          return res.status(404).json({ error: "Address not found." });
      }

      res.status(200).json({ message: "Address deleted successfully." });
  } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ error: "Failed to delete the address." });
  }
};

// wishlist


export const addWishlist=async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.user.id;
  console.log("add",productId);
  

  try {
      const existingEntry = await Wishlist.findOne({ userId, productId });
      console.log(existingEntry);
      
      if (existingEntry) {
          return res.status(400).json({ message: "Product already in wishlist." });
      }

      const newWishlistItem = new Wishlist({ userId, productId });
      await newWishlistItem.save();

      res.status(200).json({ message: "Product added to wishlist." });
  } catch (error) {
      res.status(500).json({ message: "Error adding to wishlist.", error });
  }
}

export const removeWishlist = async (req, res) => {
  const { productId } = req.body;
  console.log("productId",productId);
  
  const userId = req.session.user.id;
  console.log(productId);

  try {
      const deletedItem = await Wishlist.findOneAndDelete({ userId, productId });
      if (!deletedItem) {
          return res.status(404).json({ message: "Product not found in wishlist." });
      }

      res.status(200).json({ message: "Product removed from wishlist." });
  } catch (error) {
      res.status(500).json({ message: "Error removing from wishlist.", error });
  }
}

export const checkWishlist =async (req, res) => {
  const productId = req.params.productId;
  const userId = req.session.user?.id;

  console.log(productId,userId);
  

  if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
  }

  try {
      const isWishlisted = await Wishlist.exists({ userId, productId });
      res.status(200).json({ isWishlisted: !!isWishlisted });
  } catch (error) {
      res.status(500).json({ message: "Error checking wishlist status.", error });
  }
}


export const getWishlist = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const wishlistItems = await Wishlist.find({ userId })
      .populate('productId');  

    console.log("getwishlist", wishlistItems);

    if (wishlistItems.length === 0) {
      return res.status(404).json({ message: "Wishlist is empty." });
    }

    return res.status(200).json(wishlistItems); 
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: "Error fetching wishlist", error });
  }
}


// cart

export const addToCart = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.session.user.id;

    console.log("cart", productId, size);

    if (!userId || !productId || !size) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const normalActualPrice = product.basePrice;
    console.log("product.basePrice",product.basePrice);
    
    const actualPrice = product.offerPrice;
    
    const productSizeData = product.sizes.get(size);

    if (!productSizeData || productSizeData < 1) {
      return res.status(400).json({
        message: `Insufficient stock for size: ${size}. Available stock: ${productSizeData || 0}`,
      });
    }

    const existingCartItem = await Cart.findOne({ userId, productId, size });

    if (existingCartItem) {
      if (existingCartItem.count >= 4) {
        return res.status(400).json({ message: "You can only add up to 4 items of this product." });
      }

      if (existingCartItem.count + 1 > productSizeData) {
        return res.status(400).json({
          message: `Insufficient stock for size: ${size}. Available stock: ${productSizeData}`,
        });
      }

      existingCartItem.count += 1;
      existingCartItem.totalCount += 1;
      
      existingCartItem.totalPrice = existingCartItem.count * actualPrice;
      existingCartItem.normalTotalPrice = existingCartItem.count * normalActualPrice;

      await existingCartItem.save();
      req.session.isCheckout = true;

      return res.status(200).json({ message: "Cart updated successfully.", cart: existingCartItem });
    }

    if (1 > productSizeData) {
      return res.status(400).json({
        message: `Insufficient stock for size: ${size}. Available stock: ${productSizeData}`,
      });
    }

    const newCartItem = new Cart({
      userId,
      productId,
      size,
      count: 1,
      totalCount: 1,
      actualPrice,
      totalPrice: actualPrice,
      normalActualPrice,
      normalTotalPrice:normalActualPrice,
    });

    await newCartItem.save();
    req.session.isCheckout = true;

    return res.status(201).json({ message: "Product added to cart successfully.", cart: newCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};



export const updateCart = async (req, res) => {
  try {
    const { cartId, count } = req.body;

    if (!cartId || count === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (count < 1) {
      return res.status(400).json({ message: "Count must be at least 1." });
    }

    if (count > 4) {
      return res.status(400).json({ message: "You can only set a maximum count of 4 for this product." });
    }

    const cartItem = await Cart.findById(cartId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const productSizeData = product.sizes.get(cartItem.size);

    if (!productSizeData || count > productSizeData) {
      return res.status(400).json({
        message: `Insufficient stock for size: ${cartItem.size}. Available stock: ${productSizeData || 0}`,
      });
    }

    cartItem.count = count;
    cartItem.totalPrice = count * cartItem.actualPrice;
    cartItem.normalTotalPrice = count * cartItem.normalActualPrice;

    await cartItem.save();

    return res.status(200).json({ message: "Cart updated successfully.", cart: cartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const getCart = async (req, res) => {
  try {
      const userId = req.session.user.id;

      const cartItems = await Cart.find({ userId }).populate('productId');
      if (!cartItems.length) {
          return res.status(200).json({ message: "Your cart is empty.", cart: [] });
      }

      res.status(200).json({ message: "Cart fetched successfully.", cart: cartItems });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
  }
};




export const removeCartItem = async (req, res) => {
  try {
      const { cartId } = req.body;

     
      const result = await Cart.findByIdAndDelete(cartId);

      if (!result) {
          return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      return res.status(200).json({
          success: true,
          message: 'Item removed successfully',
          cart: result,
      });
  } catch (error) {
      console.error('Error removing cart item:', error);
      return res.status(500).json({
          success: false,
          message: 'Failed to remove item. Please try again later.',
      });
  }
};



// checkout
export const checkOutDetails = async (req, res) => {
  const userId = req.session.user.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is not present" });
  }

  try {
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }


    const userAddresses = await Address.find({ userId });

    
    res.json({
      user:user,
      addresses: userAddresses
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}



export const placeOrder = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const {
      addressId,
      orderIds,
      paymentMethod,
      totalPrice,
      ActualtotalPriceText,
      discount,
      shippingFee,
      appliedCouponId,
    } = req.body;

    console.log("Order Details:", req.body);

    if (!userId || !addressId || !orderIds || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid user or address ID" });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const cartItems = await Cart.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "Cart items not found" });
    }

    console.log("Cart Items:", cartItems);

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
      }

      const productSizeData = product.sizes.get(item.size);
      if (!productSizeData || productSizeData < item.count) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}, size: ${item.size}. Available: ${
            productSizeData || 0
          }, Requested: ${item.count}`,
        });
      }

      product.sizes.set(item.size, productSizeData - item.count);
      product.stock -= item.count;
      await product.save();
    }

    const orderedItems = cartItems.map((item) => {
      const itemDiscount = item.normalActualPrice - item.actualPrice;
      const itemTotalDiscount = item.normalTotalPrice - item.totalPrice;

      return {
        productId: item.productId,
        size: item.size,
        count: item.count,
        actualPrice: item.actualPrice,
        totalPrice: item.totalPrice,
        normalActualPrice: item.normalActualPrice,
        normalTotalPrice: item.normalTotalPrice,
        itemDiscount,
        totalDiscount: itemTotalDiscount,
      };
    });

    const actualtotalAmount = orderedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const newOrder = new UserOrder({
      userId,
      addresses: address,
      orderedItems,
      paymentMethod,
      paymentStatus: "Success",
      totalAmount: totalPrice,
      actualTotalAmount:ActualtotalPriceText,
      discount,
      shippingFee,
    });

    const savedOrder = await newOrder.save();


    if (appliedCouponId) {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { appliedCoupons: appliedCouponId } },
        { new: true }
      );
    }

    await Cart.deleteMany({ userId });

    req.session.isCheckout = false;

    return res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const paymentFailed = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const {
      addressId,
      orderIds,
      paymentMethod,
      totalPrice,
      ActualtotalPriceText,
      discount,
      shippingFee,
      appliedCouponId,
    } = req.body;

    console.log("Order Details (Payment Failed):", req.body);

    if (!userId || !addressId || !orderIds || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid user or address ID" });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const cartItems = await Cart.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "Cart items not found" });
    }

    console.log("Cart Items (Payment Failed):", cartItems);

    const orderedItems = cartItems.map((item) => {
      const itemDiscount = item.normalActualPrice - item.actualPrice;
      const itemTotalDiscount = item.normalTotalPrice - item.totalPrice;

      return {
        productId: item.productId,
        size: item.size,
        count: item.count,
        actualPrice: item.actualPrice,
        totalPrice: item.totalPrice,
        normalActualPrice: item.normalActualPrice,
        normalTotalPrice: item.normalTotalPrice,
        itemDiscount,
        totalDiscount: itemTotalDiscount,
        status: "Payment Pending",
      };
    });

    // const totalAmount = orderedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const newOrder = new UserOrder({
      userId,
      addresses: address,
      orderedItems,
      paymentMethod,
      paymentStatus: "Failed",
      totalAmount:totalPrice,
      actualTotalAmount: ActualtotalPriceText,
      discount,
      shippingFee,
    });

    const savedOrder = await newOrder.save();

    if (appliedCouponId) {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { appliedCoupons: appliedCouponId } },
        { new: true }
      );
    }


    req.session.isCheckout = false;

    return res.status(201).json({ message: "Order recorded as payment failed", order: savedOrder });
  } catch (error) {
    console.error("Error recording payment failure:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const retryPaymentController = async (req, res) => {
  try {
    const { orderId } = req.body;
console.log("jkfdhgigfdknjf",req.body);


    const order = await UserOrder.findById(orderId);
    console.log(order);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

   
    for (const item of order.orderedItems) {
      console.log("item",item);
      
      const product = await Product.findById(item.productId);
      console.log("product",product);
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
      }

      const productSizeData = product.sizes.get(item.size);
      if (!productSizeData || productSizeData < item.count) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}, size: ${item.size}. Available: ${
            productSizeData || 0
          }, Requested: ${item.count}`,
        });
      }

      product.sizes.set(item.size, productSizeData - item.count);
      product.stock -= item.count;
      await product.save();
    }

  
    order.orderedItems.forEach((item) => {
      item.status = 'Order Confirmed';
    });
    order.paymentStatus = 'Success';
    await order.save();


    return res.status(200).json({
      success: true,
      message: 'Payment retried and order confirmed successfully',
    });
  } catch (error) {
    console.error('Error in retryPaymentController', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
// export const paymentFailed = async (req, res) => {
//   try {
//       const { addressId, orderIds, totalPrice, paymentMethod, discount, appliedCouponId } = req.body;

//     console.log("payment failed",req.body);
    
//       // const order = new Order({
//       //     addressId,
//       //     orderIds,
//       //     totalPrice,
//       //     paymentMethod,
//       //     discount,
//       //     appliedCouponId,
//       //     status: 'Payment Failed',
//       // });

//       // await order.save();

//       res.status(200).json({ message: 'Order saved with Payment Failed status.' });
//   } catch (error) {
//       console.error('Error saving failed payment order:', error);
//       res.status(500).json({ message: 'Failed to save order. Please try again.', error: error.message });
//   }
// };



    // const newOrder = new UserOrder({
    //   userId,
    //   addresses: [address],
    //   orderedItems: [orderedItems],
    //   paymentMethod,
    //   totalAmount,
    // });

    // console.log("new Orders",newOrder);

    // const savedOrder = await newOrder.save();

    // return res.status(201).json({ message: "Order placed successfully", order: savedOrder });



    export const userOrderHistorys = async (req, res) => {
      const userId = req.session.user?.id; 
      // console.log(userId);
      
      try {
        const orders = await UserOrder.find({ userId });
        // console.log("userOrders",orders);
        
        if (!orders || orders.length === 0) {
          return res.status(404).json({ message: "No orders found for this user." });
        }
        res.status(200).json({ success: true, orders });
      } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders." });
      }
    };
    
    
    
    // cancel order
    
    export const cancelOrder = async (req, res) => {
      const { orderId, itemId } = req.params;
      console.log("cancel req.params", req.params);
    
      try {
        const order = await UserOrder.findById(orderId);
        console.log(order);
    
        if (!order) {
          return res.status(404).json({ success: false, message: "Order not found." });
        }
    
        const item = order.orderedItems.find((i) => i._id.toString() === itemId);
        if (!item) {
          return res.status(404).json({ success: false, message: "Item not found in the order." });
        }
    
        if (item.status === "Cancelled") {
          return res.status(400).json({ success: false, message: "Item is already cancelled." });
        }
    
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found." });
        }
    
        const productSizeData = product.sizes.get(item.size);
        product.sizes.set(item.size, productSizeData + item.count);
        product.stock += item.count;
        await product.save();
    
        let refundAmount = item.totalPrice;
    
        if (order.discount) {
      
          const discountPerItem = order.discount / order.orderedItems.length;
          refundAmount -= discountPerItem;
        }
    
        let additionalMessage = "";
    
  
        const remainingActiveItems = order.orderedItems.filter((i) => i.status !== "Cancelled");
    
        if (remainingActiveItems.length === 1 && remainingActiveItems[0]._id.toString() === itemId) {
          refundAmount += order.shippingFee || 0;
          additionalMessage = " Shipping fee also refunded.";
        }
    
        item.status = "Cancelled";
  
        if (order.paymentMethod !== "COD") {
          const userId = order.userId;
          const wallet = await Wallet.findOne({ userId });
    
          if (!wallet) {
            return res.status(404).json({ message: "Wallet not found for the user." });
          }
    
          wallet.balance += refundAmount;
          wallet.transactions.push({
            amount: refundAmount,
            type: "credit",
            paymentId: `Cancelled Order Item - Order ID: ${orderId}`,
          });
    
          await wallet.save();
        }
    
      
        await order.save();
    
        res.status(200).json({
          success: true,
          message: `Order item cancelled successfully.${additionalMessage} ${
            order.paymentMethod !== "COD" ? " Amount credited to wallet." : ""
          }`,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to cancel order item." });
      }
    };
    
    
    
    
    
    export const getOrderDetails = async (req, res) => {
      const { orderId } = req.params;
    
      try {
        const order = await UserOrder.findById(orderId).populate("orderedItems.productId");
    
        // console.log("ordersssss",order);
        
      
        if (!order) {
          return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json({ success: true, order });
      } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ success: false, message: "Failed to fetch order details." });
      }
    };
    
    
    
    
    // searching
    
    export const search =async (req, res) => {
      const query = req.query.query;
      if (!query) {
        return res.status(400).json([]);
      }
    
      try {
        const results = await Product.find({ name: { $regex: query, $options: 'i' } }); // Adjust for your DB schema
        res.json(results);
      } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    
    
    
    // Razorpay
    
    
    const razorpayInstance = new Razorpay({
      key_id: 'rzp_test_nFGQUv9h5ezSv8',
      key_secret: 'p1tSzjY9lQvJD3wKa5PIYaTx', 
    });
    
    
    export const createRazorpayOrder = async (req, res) => {
      const { amount } = req.body;
    console.log("req.body",req.body);
    
      try {
          const order = await razorpayInstance.orders.create({
              amount: amount * 100,
              currency: 'INR',
          });
    console.log("orders",order);
    
          res.json(order);
      } catch (error) {
          console.error('Error creating Razorpay order:', error);
          res.status(500).json({ message: 'Failed to create Razorpay order.' });
      }
    };
    
    
    export const capturePayment = async (req, res) => {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
      try {
        
          res.json({ message: 'Payment captured successfully.' });
      } catch (error) {
          console.error('Error capturing Razorpay payment:', error);
          res.status(500).json({ message: 'Failed to capture payment.' });
      }
    };
    
    
    
    // coupon 
    
    export const userCoupon = async (req, res) => {
      try {
        const currentDate = new Date();
        const userId = req.session?.user?.id;
    
        if (!userId) {
          return res.status(401).json({ message: "User not logged in" });
        }
    
      
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const appliedCoupons = user.appliedCoupons || [];
    
      
        const coupons = await Coupon.find({
          expiry: { $gte: currentDate },
          status: true,
          _id: { $nin: appliedCoupons }, 
        });
    
        res.json(coupons);
      } catch (error) {
        console.error("Error fetching coupons:", error.message);
        res.status(500).json({ message: "Error fetching coupons", error });
      }
    };
    
    
    
    
    // dashboard
    
    export const dshboard = async (req, res) => {
      try {
        const userId = req.session.user?.id;
    
        if (!userId) {
          return res.status(401).json({ message: "User not authenticated" });
        }
    
        const user = await User.findById(userId);
    
        const userImage = user?.image
          ? `http://localhost:5000/uploaded-images/${user.image.replace(/\\/g, "/").replace("uploads", "")}`
          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
    
        const [cartCount, wishlistCount] = await Promise.all([
          Cart.countDocuments({ userId }),
          Wishlist.countDocuments({ userId }),
        ]);
    
        res.json({ userImage, cartCount, wishlistCount });
      } catch (error) {
        console.error("Error fetching user dashboard data:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    };
    
    
    
    export const getWallet = async (req, res) => {
      try {
        const userId = req.session.user.id;
        let wallet = await Wallet.findOne({ userId });
    
        if (!wallet) {
          wallet = await Wallet.create({ userId });
        }
    
       
        res.json({
          balance: wallet.balance,
          transactions: wallet.transactions,
        });
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch wallet details', error: error.message });
      }
    };
    
    
    export const addWallet = async (req, res) => {
      try {
        const userId = req.session?.user?.id; 
        const { amount, paymentId } = req.body;
    
    
        console.log(userId);
        console.log(" req.body", req.body);
        
        
    
      
        if (!userId) {
          return res.status(401).json({ message: "User not logged in." });
        }
    
        if (!amount || !paymentId) {
          return res.status(400).json({ message: "Missing required fields." });
        }
    
       
        let wallet = await Wallet.findOne({ userId });
    
      console.log("wallet",wallet);
      
        if (!wallet) {
          wallet = new Wallet({
            userId,            
            balance: 0,       
            transactions: []   
          });
        }
    
    
        if (!Array.isArray(wallet.transactions)) {
          wallet.transactions = [];
        }
    
       
        wallet.balance += amount; 
        wallet.transactions.push({
          amount,
          type: "credit",  
          paymentId,
          date: new Date()  
        });
    
        
        console.log('Wallet before saving:', wallet);
    
      
        await wallet.save();
    
       
        res.status(200).json({
          message: "Money added to wallet successfully.",
          walletBalance: wallet.balance
        });
      } catch (error) {
      
        console.error("Error adding money to wallet:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    };
    
    
    export const getWalletBalance = async (req, res) => {
      try {
        if (!req.session.user || !req.session.user.id) {
          return res.status(401).json({ message: 'User not authenticated' });
        }
    
        const userId = req.session.user.id;
        const wallet = await Wallet.findOne({ userId });
    
        if (!wallet) {
          return res.status(404).json({ message: 'Wallet not found' });
        }
    
        return res.json({ balance: wallet.balance });
      } catch (error) {
        console.error('Error getting wallet balance:', error);
        return res.status(500).json({ message: 'Server error while fetching wallet balance' });
      }
    };
    
    export const updateWalletBalance = async (req, res) => {
      try {
        
        if (!req.session.user || !req.session.user.id) {
          return res.status(401).json({ message: 'User not authenticated' });
        }
    
        const { newBalance } = req.body;  
        const userId = req.session.user.id;
    
        console.log("userId:", userId, "newBalance:", newBalance);
    
     
        const wallet = await Wallet.findOne({ userId });
    
        if (!wallet) {
          return res.status(404).json({ message: 'Wallet not found' });
        }
    
       
        wallet.transactions.push({
          amount: wallet.balance - newBalance,  
          type: 'debit', 
          paymentId: "Wallet Payment", 
        });
    
     
        wallet.balance = newBalance;
    
     
        await wallet.save();
    
      
        return res.json({
          message: 'Wallet balance updated successfully',
          updatedBalance: newBalance,
          transaction: wallet.transactions[wallet.transactions.length - 1],  
        });
      } catch (error) {
        console.error('Error updating wallet balance:', error);
        return res.status(500).json({ message: 'Server error while updating wallet balance' });
      }
    };
    
    
    
    // return 
    
    
    export const requestReturn = async (req, res) => {
      const { orderId, itemId } = req.params;
      const { reason,status } = req.body;
    
      try {
       
        const order = await UserOrder.findById(orderId);
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }
    
        
        const orderItem = order.orderedItems.find(item => item._id.toString() === itemId);
    
        if (!orderItem) {
          return res.status(404).json({ success: false, message: 'Order item not found' });
        }
    
      
        if (orderItem.status !== 'Delivered') {
          return res.status(400).json({ success: false, message: 'Item must be delivered to request a return' });
        }
    
       
        orderItem.returnStatus = status;
        orderItem.returnReason = reason;
        orderItem.returnRequestedAt = new Date();
    
      
        await order.save();
    
        res.json({ success: true, message: 'Return requested successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    };
    
    
    
    // coupons 
    export const userCoupons = async (req, res) => {
      const userId = req.session.user.id;
    
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
      }
    
      try {
     
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const appliedCoupons = user.appliedCoupons;
    
        if (appliedCoupons.length === 0) {
          return res.json({ message: "You haven't used any coupons.", coupons: [] });
        }
    
     
        const coupons = await Coupon.find({ _id: { $in: appliedCoupons } });
    
        res.json({ coupons });
      } catch (error) {
        res.status(500).json({ message: "Error fetching coupons", error });
      }
    }
    
    
    
    
    // category displaying
    
    export const getCategories = async (req, res) => {
      try {
        const categories = await Category.find({ isActive: true });
        res.status(200).json(categories);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch categories", error });
      }
    };
    
    export const getCategoryProduct = async (req, res) => {
      try {
        const productsByCategory = await Product.aggregate([
          { $match: { isActive: true } }, 
          {
            $lookup: {
              from: 'categories', 
              localField: 'category', 
              foreignField: '_id', 
              as: 'categoryDetails',
            },
          },
          {
            $unwind: '$categoryDetails', 
          },
          {
            $group: {
              _id: { 
                name: '$categoryDetails.name', 
                id: '$categoryDetails._id' 
              }, 
              products: { $push: '$$ROOT' }, 
            },
          },
        ]);
    
        // Format the response for better readability
        const formattedResponse = productsByCategory.map((category) => ({
          categoryId: category._id.id,
          categoryName: category._id.name,
          products: category.products,
        }));
    
        res.json(formattedResponse);
        console.log('Formatted products by category:', formattedResponse);
    
      } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Error fetching products by category' });
      }
    };
    
    export const getCategoryProducts = async (req, res) => {
      try {
        console.log(req.params);
        
        const { categoryId } = req.params;
    
     
    
        console.log("categoryId", categoryId);
    
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).json({ message: 'Invalid category ID' });
        }
    
        const productsByCategory = await Product.find({ category: categoryId, isActive: true });
    
        console.log("productsByCategory", productsByCategory);
    
        if (productsByCategory.length === 0) {
          return res.status(404).json({ message: 'No products found for this category' });
        }
    
        res.json( productsByCategory );
      } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Error fetching products by category' });
      }
    };
    
    
    export const getBrandProducts= async (req, res) => {
      try {
        console.log(req.params);
        
        const { brandId } = req.params;
    
     
    
        console.log("brandId", brandId);
    
        if (!mongoose.Types.ObjectId.isValid(brandId)) {
          return res.status(400).json({ message: 'Invalid brand ID' });
        }
    
        const productsByBrand= await Product.find({ brand: brandId, isActive: true });
    
        console.log("productsByBrand", productsByBrand);
    
        if (productsByBrand.length === 0) {
          return res.status(404).json({ message: 'No products found for this brand' });
        }
    
        res.json( productsByBrand );
      } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Error fetching products by category' });
      }
    };
    
    
    
    // invoice
    
    
    
    import PDFDocument from 'pdfkit'
    import fs from 'fs'
    import path from 'path'
    
    
    
    export const generateInvoice = async (req, res) => {
      try {
        const { orderId, itemId } = req.params;
        console.log(req.params);
    
        const order = await UserOrder.findById(orderId)
          .populate('orderedItems.productId')
          .populate('userId');
    
        console.log(order);
    
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }
    
        const orderItem = order.orderedItems.find(item => item._id.toString() === itemId);
        if (!orderItem) {
          return res.status(404).json({ success: false, message: 'Order item not found' });
        }
    
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${itemId}.pdf`);
        doc.pipe(res);
    
        // Header Section
        doc.fontSize(20).fillColor('#333333').text('ManMode', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).fillColor('#555555').text('Tax Invoice/Bill of Supply', { align: 'center' });
        doc.moveDown();
    
        // Invoice Metadata
        doc.fontSize(12).fillColor('#000000');
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Order ID: ${order._id}`);
        doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.moveDown();
    
        // Customer Details
        doc.fontSize(14).fillColor('#000000').text('Customer Details');
        doc.fontSize(12);
        doc.text(`Name: ${order.userId.name}`);
        const address = order.addresses[0];
        doc.text(`Address: ${address.address}, ${address.city}, ${address.state}, ${address.zipCode}`);
        doc.moveDown();
    
        // Product Details Table
        const tableX = 50;
        const headerHeight = 20;
        const rowHeight = 25;
        let tableY = doc.y;
    
        // Header Background
        doc.rect(tableX, tableY, 500, headerHeight).fill('#4CAF50');
        doc.fillColor('#FFFFFF').fontSize(12).text('Item', tableX + 10, tableY + 5);
        doc.text('Size', tableX + 150, tableY + 5);
        doc.text('Quantity', tableX + 250, tableY + 5);
        doc.text('Price', tableX + 350, tableY + 5);
    
        // Reset Color for Rows
        doc.fillColor('#000000');
        tableY += headerHeight;
    
        // Row Background Alternating Colors
        const rowColor1 = '#F8F9FA';
        const rowColor2 = '#E9ECEF';
    
        const rowBackground = tableY % 2 === 0 ? rowColor1 : rowColor2;
    
        // Draw Row Background
        doc.rect(tableX, tableY, 500, rowHeight).fill(rowBackground);
    
        // Row Data
        doc.fillColor('#000000').text(orderItem.productId.name, tableX + 10, tableY + 5);
        doc.text(orderItem.size, tableX + 150, tableY + 5);
        doc.text(orderItem.count.toString(), tableX + 250, tableY + 5);
        doc.text(`₹ ${orderItem.totalPrice}`, tableX + 350, tableY + 5);
    
        tableY += rowHeight;
    
        // Total Amount Section
        doc.moveDown(2);
        doc.fontSize(14).fillColor('#000000').text(`Total Amount: ₹ ${orderItem.totalPrice}`, { align: 'right' });
    
        // Footer
        doc.fontSize(10).fillColor('#555555');
        doc.moveDown(2);
        doc.text('Thank you for shopping with ManMode!', { align: 'center' });
    
        doc.end();
      } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ success: false, message: 'Failed to generate invoice' });
      }
    };
    


    // send mail

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nikhilpramod425@gmail.com',
        pass: 'ebdz bdze hgcu yfka'
    }
});

export const sendMail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        console.log(req.body);

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                message: 'Please fill in all fields' 
            });
        }

        const mailOptions = {
            from: email,
            to: 'nikhilpramod425@gmail.com',
            subject: `ManMode Contact Form: ${subject}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true,
            message: 'Email sent successfully' 
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error sending email. Please try again later.' 
        });
    }
};
    // logout
    
    
    export const userLogout = async (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.redirect('/userhome');
            }
            res.redirect('/');
        });
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    