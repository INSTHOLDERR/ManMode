import express from 'express';
import uploader from '../middlewares/multer.js'
import cron from 'node-cron';

import {adminLogin,getAllUsers,changeStatus,deleteUser,addBrand,getBrand,updateBrand,changeBrandStatus,deleteBrand,addCategory,getCategory,updateCategory,changeCategoryStatus,deleteCategory,productCategories,productBrands,addProduct,getProducts,changeProductStatus,deleteProduct,editProductId,updateProduct,logoutAdmin,getAllOrder,updateOrderStatus,addCoupon,getCoupons,editCoupon,deleteCoupon,getOfferBrand,getOfferCategory,getOffers,deleteOffers,updateOffers,addOffers,fetchOfferById,updatereturn,approveReturnRequest,rejectReturnRequest,applyOffersToProducts,disableExpiredOffers,salesReport,generateReport, getDailySalesReport,
    getWeeklySalesReport,
    getMonthlySalesReport,
    getCustomDateRangeReport,
    downloadSalesReport,
    getDashboardStats, getDashboardAnalytics
    
} from '../controllers/adminController.js'
// import {salesController} from '../controllers/salesReport'
import {isAdminLogin,isAdminNotLogin} from '../middlewares/authentication.js'

const router=express.Router()


router.get('/',isAdminLogin, (req, res) => {
    res.render('admin/adminlogin', { error: null });
});


router.get('/admindashboard',isAdminNotLogin,(req, res) => {
    res.render('admin/dashboard',    { error: null, currentPage: 'dashboard' }); 
});

router.get('/adminusers',isAdminNotLogin,(req, res) => {
    res.render('admin/users',        { error: null, currentPage: 'users' }); 
});

router.post('/adminlogin', adminLogin); 

router.get("/users",isAdminNotLogin, getAllUsers);
router.patch("/users/:id/status",isAdminNotLogin,changeStatus)
router.delete("/deleteusers/:id",isAdminNotLogin,deleteUser)


router.get('/adminbrands',isAdminNotLogin, (req, res) => {
    res.render('admin/brands',       { error: null, currentPage: 'brands' });
});


const brandUploader = uploader([
    { name: "brand-image", maxCount: 1 },
]);
const categoryUploader = uploader([
    { name: "category-image", maxCount: 1 }, 
]);


  router.post("/brands",isAdminNotLogin,brandUploader, addBrand); 
  router.get("/getbrands",isAdminNotLogin, getBrand); 
  router.put("/brands/:id",isAdminNotLogin, brandUploader, updateBrand);
  router.patch("/brands/:id/status",isAdminNotLogin,changeBrandStatus)
  router.delete("/brands/:id",isAdminNotLogin,deleteBrand);



  router.get('/admincategories',isAdminNotLogin, (req, res) => {
    res.render('admin/categories',   { error: null, currentPage: 'categories' });
});

router.post("/category",isAdminNotLogin,categoryUploader, addCategory); 
router.get("/getcategory",isAdminNotLogin, getCategory);
router.put("/category/:id",isAdminNotLogin, categoryUploader, updateCategory);
router.patch("/category/:id/status",isAdminNotLogin,changeCategoryStatus)
  router.delete("/category/:id",isAdminNotLogin, deleteCategory);


// products


  router.get('/adminproducts',isAdminNotLogin, (req, res) => {
    res.render('admin/products',     { error: null, currentPage: 'products' });
});
router.get('/admineditproducts',isAdminNotLogin, (req, res) => {
    res.render('admin/editproduct',  { error: null, currentPage: 'products' });
});


const productUploader = uploader([
    { name: "images", maxCount: 5 }, 
]);

router.post('/addproduct',isAdminNotLogin,productUploader,addProduct)

router.get("/productcategory",isAdminNotLogin,productCategories)
router.get("/productbrand",isAdminNotLogin,productBrands)
router.get("/getproducts",isAdminNotLogin,getProducts)
router.patch("/product/:id/status",isAdminNotLogin,changeProductStatus)
router.delete("/product/:id",isAdminNotLogin, deleteProduct);
router.get("/geteditproduct/:id",isAdminNotLogin,editProductId)


const productEditor = uploader([
    { name: "images", maxCount: 4 }, 
]);
router.put('/updateproduct/:id',isAdminNotLogin, productEditor, updateProduct);



// orders

router.get('/adminorders',isAdminNotLogin,(req, res) => {
    res.render('admin/orders',       { error: null, currentPage: 'orders' }); 
});

router.get('/getallorderdetails',getAllOrder)
router.post('/updateItemStatus',updateOrderStatus)




router.post('/adminlogout', logoutAdmin)
router.get('/adminlogout',  logoutAdmin)

router.get('/admincoupon',isAdminNotLogin,(req, res) => {
    res.render('admin/coupon',       { error: null, currentPage: 'coupons' }); 
});
router.get('/adminoffers',isAdminNotLogin,(req, res) => {
    res.render('admin/offers',       { error: null, currentPage: 'offers' }); 
});



// coupon
router.post('/addcoupon',addCoupon);
router.get('/getcoupon',getCoupons);
router.put('/editcoupon/:id', editCoupon);
router.delete('/deletecoupon/:id',deleteCoupon);

// offers  

router.get('/getofferbrands',getOfferBrand)
router.get('/getoffercategories',getOfferCategory)
router.get('/getoffer',getOffers)
router.post('/addoffers',addOffers)
router.delete('/deleteoffers/:id',deleteOffers)
router.put('/updateoffers/:id',updateOffers)
router.get('/fetchofferbyid/:id',fetchOfferById)

// return 
router.post('/updateReturnStatus',updatereturn)
router.post('/approveReturn', approveReturnRequest);

router.post('/rejectReturn', rejectReturnRequest);



cron.schedule('0 * * * *', async () => {
    console.log('Running offer application job...');
    await applyOffersToProducts();
});

cron.schedule('0 * * * *', async () => {
    console.log('Running expired offers cleanup...');
    await disableExpiredOffers();
});


(async () => {
    console.log('Initializing offers...');
    await applyOffersToProducts();
})();




router.post("/generate-sales-report",salesReport )
router.post('/generate', generateReport);


router.get('/sales-report/daily', getDailySalesReport);
router.get('/sales-report/weekly', getWeeklySalesReport);
router.get('/sales-report/monthly', getMonthlySalesReport);
router.get('/sales-report/custom', getCustomDateRangeReport);

router.get('/download-sales-report', downloadSalesReport);


router.get('/dashboard-stats',  getDashboardStats);
router.get('/dashboard-analytics', getDashboardAnalytics);

// ── Banner routes ──────────────────────────────────────────────────
import Banner from '../models/bannerModel.js';
const bannerUploader = uploader([{ name: 'image', maxCount: 1 }]);

router.get('/adminbanners', isAdminNotLogin, (req, res) => res.render('admin/banners',      { error: null, currentPage: 'banners' }));
router.get('/getbanners',   isAdminNotLogin, async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
  res.json(banners);
});
router.post('/banners', isAdminNotLogin, bannerUploader, async (req, res) => {
  try {
    const { title, subtitle, btnText, btnLink, order } = req.body;
    const image = req.files?.image?.[0]?.filename;
    if (!image) return res.status(400).json({ error: 'Image required' });
    const banner = await Banner.create({ title, subtitle, btnText: btnText||'Shop Now', btnLink: btnLink||'/viewallproducts', image, order: order||0 });
    res.status(201).json({ success: true, banner });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
router.put('/banners/:id', isAdminNotLogin, bannerUploader, async (req, res) => {
  try {
    const { title, subtitle, btnText, btnLink, order } = req.body;
    const update = { title, subtitle, btnText, btnLink, order };
    if (req.files?.image?.[0]) update.image = req.files.image[0].filename;
    const banner = await Banner.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, banner });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
router.patch('/banners/:id/toggle', isAdminNotLogin, async (req, res) => {
  const b = await Banner.findById(req.params.id);
  b.isActive = !b.isActive; await b.save();
  res.json({ success: true, isActive: b.isActive });
});
router.delete('/banners/:id', isAdminNotLogin, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ── Extra utility routes ──────────────────────────────────────────
router.post('/uploadbanner', isAdminNotLogin, bannerUploader, (req, res) => {
  try {
    res.json({ success: true, message: 'Banner updated successfully' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/getallorders', isAdminNotLogin, async (req, res) => {
  try {
    const UserOrder = (await import('../models/orderHistoryModel.js')).default;
    const orders = await UserOrder.find();
    res.json({ orders });
  } catch(e) { res.json({ orders: [] }); }
});
router.get('/getallusers', isAdminNotLogin, async (req, res) => {
  try {
    const User = (await import('../models/model.js')).default;
    const users = await User.find({ isAdmin: false });
    res.json({ data: users, counts: { total: users.length, active: users.filter(u=>u.isActive).length, blocked: users.filter(u=>!u.isActive).length } });
  } catch(e) { res.json({ data:[], counts:{} }); }
});
router.get('/getallproducts', isAdminNotLogin, async (req, res) => {
  try {
    const Product = (await import('../models/productModel.js')).default;
    const products = await Product.find();
    res.json({ products });
  } catch(e) { res.json({ products:[] }); }
});

export default router;
