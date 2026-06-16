// // salesController.js
// import Order from  '../models/orderHistoryModel.js'

// const salesController = {
//     async getDailySalesReport(req, res) {
//         try {
//             const today = new Date();
//             const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//             const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//             const dailyReport = await Order.aggregate([
//                 {
//                     $match: {
//                         orderDate: { $gte: startOfDay, $lte: endOfDay },
//                         orderStatus: { $ne: 'cancelled' }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
//                         orderCount: { $sum: 1 },
//                         totalProducts: { $sum: "$items.quantity" },
//                         totalAmount: { $sum: "$totalAmount" },
//                         couponDiscount: { $sum: "$couponDiscount" },
//                         offerDiscount: { $sum: "$offerDiscount" }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         date: "$_id",
//                         orderCount: 1,
//                         totalProducts: 1,
//                         totalAmount: 1,
//                         couponDiscount: 1,
//                         offerDiscount: 1
//                     }
//                 }
//             ]);

//             res.json({ status: 'success', data: dailyReport });
//         } catch (error) {
//             res.status(500).json({ status: 'error', message: error.message });
//         }
//     },

//     async getWeeklySalesReport(req, res) {
//         try {
//             const today = new Date();
//             const startOfWeek = new Date(today);
//             startOfWeek.setDate(today.getDate() - today.getDay());
//             startOfWeek.setHours(0, 0, 0, 0);

//             const weeklyReport = await Order.aggregate([
//                 {
//                     $match: {
//                         orderDate: { $gte: startOfWeek },
//                         orderStatus: { $ne: 'cancelled' }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: { 
//                             week: { $week: "$orderDate" },
//                             year: { $year: "$orderDate" }
//                         },
//                         orderCount: { $sum: 1 },
//                         totalProducts: { $sum: "$items.quantity" },
//                         totalAmount: { $sum: "$totalAmount" },
//                         couponDiscount: { $sum: "$couponDiscount" },
//                         offerDiscount: { $sum: "$offerDiscount" },
//                         startDate: { $min: "$orderDate" },
//                         endDate: { $max: "$orderDate" }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         dateRange: {
//                             $concat: [
//                                 { $dateToString: { format: "%b %d", date: "$startDate" } },
//                                 " - ",
//                                 { $dateToString: { format: "%b %d, %Y", date: "$endDate" } }
//                             ]
//                         },
//                         orderCount: 1,
//                         totalProducts: 1,
//                         totalAmount: 1,
//                         couponDiscount: 1,
//                         offerDiscount: 1
//                     }
//                 }
//             ]);

//             res.json({ status: 'success', data: weeklyReport });
//         } catch (error) {
//             res.status(500).json({ status: 'error', message: error.message });
//         }
//     },

//     async getMonthlySalesReport(req, res) {
//         try {
//             const startOfYear = new Date(new Date().getFullYear(), 0, 1);

//             const monthlyReport = await Order.aggregate([
//                 {
//                     $match: {
//                         orderDate: { $gte: startOfYear },
//                         orderStatus: { $ne: 'cancelled' }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: {
//                             month: { $month: "$orderDate" },
//                             year: { $year: "$orderDate" }
//                         },
//                         orderCount: { $sum: 1 },
//                         totalProducts: { $sum: "$items.quantity" },
//                         totalAmount: { $sum: "$totalAmount" },
//                         couponDiscount: { $sum: "$couponDiscount" },
//                         offerDiscount: { $sum: "$offerDiscount" }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         month: {
//                             $dateToString: {
//                                 format: "%B %Y",
//                                 date: {
//                                     $dateFromParts: {
//                                         year: "$_id.year",
//                                         month: "$_id.month",
//                                         day: 1
//                                     }
//                                 }
//                             }
//                         },
//                         orderCount: 1,
//                         totalProducts: 1,
//                         totalAmount: 1,
//                         couponDiscount: 1,
//                         offerDiscount: 1
//                     }
//                 },
//                 {
//                     $sort: { "_id.year": 1, "_id.month": 1 }
//                 }
//             ]);

//             res.json({ status: 'success', data: monthlyReport });
//         } catch (error) {
//             res.status(500).json({ status: 'error', message: error.message });
//         }
//     },

//     async getCustomSalesReport(req, res) {
//         try {
//             const { startDate, endDate } = req.query;
            
//             if (!startDate || !endDate) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: 'Start date and end date are required'
//                 });
//             }

//             const start = new Date(startDate);
//             const end = new Date(endDate);
//             end.setHours(23, 59, 59, 999);

//             const customReport = await Order.aggregate([
//                 {
//                     $match: {
//                         orderDate: { $gte: start, $lte: end },
//                         orderStatus: { $ne: 'cancelled' }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
//                         orderCount: { $sum: 1 },
//                         totalProducts: { $sum: "$items.quantity" },
//                         totalAmount: { $sum: "$totalAmount" },
//                         couponDiscount: { $sum: "$couponDiscount" },
//                         offerDiscount: { $sum: "$offerDiscount" }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         date: "$_id",
//                         orderCount: 1,
//                         totalProducts: 1,
//                         totalAmount: 1,
//                         couponDiscount: 1,
//                         offerDiscount: 1
//                     }
//                 },
//                 {
//                     $sort: { date: 1 }
//                 }
//             ]);

//             res.json({ status: 'success', data: customReport });
//         } catch (error) {
//             res.status(500).json({ status: 'error', message: error.message });
//         }
//     }
// };

// module.exports = salesController;