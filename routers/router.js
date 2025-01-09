import express from 'express';
import uploader from '../middlewares/multer.js'

import {registerUser,sendOTP,validateOTP,getBrandProducts, loginUser,userLogout,forgotsendOTP,updatePassword,homeBrand,getLatestProducts,homeRandomProducts,getProductDetail,getsimilarCategoryProduct,getAllProducts,userReviews,getReviews,userProfile,updateUserProfile,addUserAddress,getUserAddress,getAddressById,updateAddress,deleteAddress,removeWishlist,addWishlist,checkWishlist,addToCart,getWishlist,getCart,updateCart,removeCartItem,checkOutDetails,placeOrder,userOrderHistorys,getOrderDetails,cancelOrder,search,createRazorpayOrder,capturePayment,userCoupon,dshboard,getWallet,addWallet,getWalletBalance,updateWalletBalance,requestReturn,userCoupons,getCategories,getCategoryProduct
,getCategoryProducts,generateInvoice,paymentFailed,retryPaymentController,sendMail} from '../controllers/controller.js'

import { isLogin, isNotLogin} from '../middlewares/authentication.js';

const router = express.Router();




//users

router.get('/', isLogin,(req, res) => {
    res.render('user/home'); 
});

// User Home Page
router.get('/userhome', isNotLogin, (req, res) => {
    res.render('user/userhome'); 
});

// Authentication Pages
router.get('/login', isLogin, (req, res) => {
    res.render('user/login', { error: null });
});

router.get('/register', isLogin, (req, res) => {
    res.render('user/register', { error: null }); 
});

router.get('/forgot-password-email', isLogin, (req, res) => {
    res.render('user/forgotpassword-email'); 
});

router.get('/forgot-password', isLogin, (req, res) => {
    res.render('user/forgotpassword');
});


router.post('/forgot-send-otp', isLogin, forgotsendOTP); 
router.post('/update-password', isLogin, updatePassword); 

// User registration and OTP verification
router.post('/register', isLogin, registerUser); 
router.post('/send-otp', isLogin, sendOTP);
router.post('/validate-otp', isLogin, validateOTP);

// User login and logout
router.post('/login', isLogin, loginUser); 
router.get('/logout', isNotLogin, userLogout);





// Home page
router.get('/homebrands',homeBrand)
router.get('/homelatestproduct',getLatestProducts)
router.get('/randomproducts',homeRandomProducts)


router.get('/viewuser', (req, res) => {
    res.render('user/viewproduct', { error: null });
});
router.get('/viewuser/:id',getProductDetail)



router.get('/getsimilarproducts/:id',getsimilarCategoryProduct)

router.get('/viewallproducts', (req, res) => {
    res.render('user/viewallproducts', { error: null });
});

router.get('/getallproducts',getAllProducts)

// profile


router.get('/userprofile', isNotLogin, (req, res) => {
    res.render('user/profile/userProfile'); 
});

router.get('/userordering', isNotLogin, (req, res) => {
    res.render('user/profile/orders'); 
});

router.get('/getuserprofile',userProfile)


const profileUploader = uploader([
    { name: "image", maxCount: 1 },
]);
router.put("/saveuserprofile", profileUploader, updateUserProfile);




// Address

router.get('/useraddress', isNotLogin, (req, res) => {
    res.render('user/profile/userAddress'); 
});

router.post('/add-user-address',addUserAddress)
router.get('/get-user-addresses',getUserAddress)
router.get('/get-user-address/:id', getAddressById);

// Wishlist
router.get('/userwishlist', isNotLogin, (req, res) => {
    res.render('user/profile/userWishlist'); 
});




// Cart
router.get('/usercart', isNotLogin, (req, res) => {
    res.render('user/profile/userCart'); 
});



// reviews

router.post('/senduserreviews',isNotLogin, userReviews);
router.get('/getreviews', getReviews);
router.put('/update-user-address/:id', updateAddress);
router.delete('/delete-user-address/:id',deleteAddress);



// wishlist
router.post("/addwishlist",addWishlist)
router.post("/removewishlist",removeWishlist)
router.delete("/removewishlist",removeWishlist)
router.get("/checkwishlist/:productId",checkWishlist)
router.get('/getwishlist',getWishlist)


// cart 
router.post("/addtocart", addToCart);
router.get('/getusercart', getCart)
router.post('/updateCart',updateCart)
router.delete('/removeCartItem',removeCartItem)


import Cart from '../models/cartMosel.js';

router.get('/usercheckout', isNotLogin, async (req, res) => {
    try {
        if (!req.session.previousPage) {
            req.session.previousPage = req.headers.referer || '/';
        }

        const userId = req.session.user?.id;
        if (!userId) {
            return res.redirect('/login');
        }

        const cartItems = await Cart.find({ userId });
        
        if (cartItems.length === 0) {
            req.flash('error', 'Your cart is empty. Add items to proceed to checkout.');
            return res.redirect(req.session.previousPage);
        }

        const previousPage = req.session.previousPage;
        delete req.session.previousPage;
        
        res.render('user/profile/checkOut', {
            previousPage: previousPage
        });

    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.redirect(req.session.previousPage || '/');
    }
});


router.get('/back', (req, res) => {
    const previousPage = req.session.previousPage || '/';
    delete req.session.previousPage;
    res.redirect(previousPage);
});

router.get('/checkoutdetails',checkOutDetails)
router.post('/placeorder', placeOrder);


router.get('/orderhistory', isNotLogin, (req, res) => {
    res.render('user/profile/orderHistory'); 
});

router.get('/userorderhistorys',userOrderHistorys)

router.get("/getorderdetails/:orderId", getOrderDetails);

router.patch('/cancelOrderItem/:orderId/:itemId',cancelOrder)



router.get('/userwallet', isNotLogin, (req, res) => {
    res.render('user/profile/wallet'); 
});

// Search
router.get('/search',search)

// Razorpay 
router.post('/createRazorpayOrder',createRazorpayOrder)
router.post('/capturePayment',capturePayment)


// coupon
router.get('/usercoupons',userCoupon)


router.get('/dashboard',dshboard)

// wallet 

router.get('/wallet',getWallet);
router.post('/wallet/createRazorpayOrder',createRazorpayOrder);
router.post('/addwallet',addWallet);
router.get('/get-wallet',getWallet)

router.get('/get-wallet', getWalletBalance);
router.post('/update-wallet', updateWalletBalance);


// return
router.patch('/requestReturn/:orderId/:itemId',requestReturn)

// coupon
router.get("/userusedcoupons",userCoupons)




// categories
router.get('/categories', (req, res) => {
    res.render('user/categories'); 
});
// router.get('/categories', getCategories);

router.get('/products-by-category', getCategoryProduct);

router.get('/getCategoryProducts', (req, res) => {
    res.render('user/categoryproducts', { error: null });
});
router.get('/getCategoryProducts/:categoryId', getCategoryProducts);



router.get('/brandproductsare', (req, res) => {
    res.render('user/brandproducts', { error: null });
});
router.get('/brandproductsare/:brandId', getBrandProducts);


// invioce
router.get('/generateInvoice/:orderId/:itemId',generateInvoice)
router.post('/paymentFailed', paymentFailed);
router.post('/retrypayment', retryPaymentController);

// about-us and contact-us


router.get('/aboutus', (req, res) => {
    res.render('user/aboutus', { error: null });
});


router.get('/contactus', (req, res) => {
    res.render('user/contactus', { error: null });
});

router.post('/send-email',sendMail)




export default router;
