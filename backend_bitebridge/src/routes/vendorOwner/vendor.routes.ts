import { Router } from "express";
import protectedRoute from "../../middlewares/auth.middleware.js";
import checkVendorOwner, { checkVendorExist, checkVendorMember } from "../../middlewares/vendor.middleware.js";
import { uploadVendor, uploadAvatar,uploadMenuItem, multerErrorHandler } from "../../middlewares/multer.middleware.js";
import {
    createVendor,
    createCategories,

    addCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    deleteManyCategories,

    addEmployee,
    updateEmployee,
    deleteEmployee,
    deleteManyEmployees,
    getEmployee,
    getAllEmployees,

    toggleShopStatus,

    addMenuItem,
    getMenuItem,
    getAllMenuItems,
    updateMenuItem,
    deleteMenuItem,
    deleteManyMenuItems,
    getShopStatus,

} from "../../controllers/vendor.controller.js";
import { acceptOrder, completeOrder, getOrderDetails, getVendorPastOrders, getVendorsOpenOrders, getVendorsRequestedOrders, rejectOrder, updateOrderItemStatus } from "../../controllers/order.controller.js";
// import { compressImage } from "../../middlewares/compressImage.middleware.js";
const vendorRouter = Router()

//vendor creation
vendorRouter.post('/create-vendor', 
    protectedRoute, 
    checkVendorOwner, 
    uploadVendor.single('shopImage'),
    multerErrorHandler,
    createVendor
)

//category management
vendorRouter.post('/create-categories', protectedRoute, checkVendorOwner, checkVendorExist, createCategories)
vendorRouter.get('/get-all-categories', protectedRoute, checkVendorOwner, checkVendorExist, getAllCategories)
vendorRouter.get('/get-category/:id', protectedRoute, checkVendorOwner, checkVendorExist, getCategory)
vendorRouter.post('/add-category', protectedRoute, checkVendorOwner, checkVendorExist, addCategory)
vendorRouter.put('/update-category/:id', protectedRoute, checkVendorOwner, checkVendorExist, updateCategory)
vendorRouter.delete('/delete-category/:id', protectedRoute, checkVendorOwner, checkVendorExist, deleteCategory)
vendorRouter.delete('/delete-categories', protectedRoute, checkVendorOwner, checkVendorExist, deleteManyCategories)

// shop : open/close 
vendorRouter.patch('/toggle-shop', protectedRoute, checkVendorOwner, checkVendorExist, toggleShopStatus)
vendorRouter.get('/get-shop-status', protectedRoute, checkVendorOwner, checkVendorExist, getShopStatus)

//employee management
vendorRouter.post('/add-employee', protectedRoute, checkVendorOwner, checkVendorExist, uploadAvatar.single('profileImage'),multerErrorHandler, addEmployee)
vendorRouter.put('/update-employee/:id', protectedRoute, checkVendorOwner, checkVendorExist, uploadAvatar.single('profileImage'),multerErrorHandler, updateEmployee)
vendorRouter.delete('/delete-employee/:id', protectedRoute, checkVendorOwner, checkVendorExist, deleteEmployee)
vendorRouter.delete('/delete-employees/', protectedRoute, checkVendorOwner, checkVendorExist, deleteManyEmployees)
vendorRouter.get('/get-all-employees', protectedRoute, checkVendorOwner, checkVendorExist, getAllEmployees)
vendorRouter.get('/get-employees/:id', protectedRoute, checkVendorOwner, checkVendorExist, getEmployee)


// --------------------menu order( for vendorMembers) related routes starts from here
vendorRouter.post('/add-menu-item',
    protectedRoute,
    checkVendorOwner,
    checkVendorExist,
    uploadMenuItem.single('menuItemImage'),
    multerErrorHandler,
    // compressImage,
    addMenuItem
)
vendorRouter.get('/get-menu-item/:id',
    protectedRoute,
    checkVendorOwner,
    checkVendorExist,
    getMenuItem,
)
vendorRouter.get('/get-all-menu-items',
    protectedRoute,
    checkVendorOwner,
    checkVendorExist,
    getAllMenuItems
)
vendorRouter.delete('/delete-menu-item/:id',
    protectedRoute,
    checkVendorOwner,
    checkVendorExist,
    deleteMenuItem
)

vendorRouter.delete('/delete-many-menu-item/',
    protectedRoute,
    checkVendorOwner,
    checkVendorExist,
    deleteManyMenuItems
)

vendorRouter.put('/update-menu-item/:id',
    protectedRoute,
    checkVendorOwner,
    checkVendorExist,
    uploadMenuItem.single('menuItemImage'),
    multerErrorHandler,
    // compressImage,
    updateMenuItem,
)

// --------------------order( for vendorMembers) related routes starts from here
vendorRouter.get('/open-orders',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    getVendorsOpenOrders
)
vendorRouter.get('/new-orders',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    getVendorsRequestedOrders
)

vendorRouter.patch('/accept-order',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    acceptOrder,
)
vendorRouter.patch('/reject-order',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    rejectOrder,
)

vendorRouter.patch('/:orderId/complete',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    completeOrder
)

vendorRouter.patch('/:orderId/items/:iId',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    updateOrderItemStatus
)

vendorRouter.get('/order/:orderId',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    getOrderDetails
)
vendorRouter.get('/previous-orders',
    protectedRoute,
    checkVendorExist,
    checkVendorMember,
    getVendorPastOrders
)
export default vendorRouter