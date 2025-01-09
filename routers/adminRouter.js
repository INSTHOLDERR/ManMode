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
    res.render('admin/dashboard', { error: null }); 
});

router.get('/adminusers',isAdminNotLogin,(req, res) => {
    res.render('admin/users', { error: null }); 
});

router.post('/adminlogin', adminLogin); 

router.get("/users",isAdminNotLogin, getAllUsers);
router.patch("/users/:id/status",isAdminNotLogin,changeStatus)
router.delete("/deleteusers/:id",isAdminNotLogin,deleteUser)


router.get('/adminbrands',isAdminNotLogin, (req, res) => {
    res.render('admin/brands', { error: null });
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
    res.render('admin/categories', { error: null });
});

router.post("/category",isAdminNotLogin,categoryUploader, addCategory); 
router.get("/getcategory",isAdminNotLogin, getCategory);
router.put("/category/:id",isAdminNotLogin, categoryUploader, updateCategory);
router.patch("/category/:id/status",isAdminNotLogin,changeCategoryStatus)
  router.delete("/category/:id",isAdminNotLogin, deleteCategory);


// products


  router.get('/adminproducts',isAdminNotLogin, (req, res) => {
    res.render('admin/products', { error: null });
});
router.get('/admineditproducts',isAdminNotLogin, (req, res) => {
    res.render('admin/editproduct', { error: null });
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
    res.render('admin/orders', { error: null }); 
});

router.get('/getallorderdetails',getAllOrder)
router.post('/updateItemStatus',updateOrderStatus)




router.post('/adminlogout',isAdminNotLogin,logoutAdmin)

router.get('/admincoupon',isAdminNotLogin,(req, res) => {
    res.render('admin/coupon', { error: null }); 
});
router.get('/adminoffers',isAdminNotLogin,(req, res) => {
    res.render('admin/offers', { error: null }); 
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

export default router;