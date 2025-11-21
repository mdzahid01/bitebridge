import { Router } from "express";
import protectedRoute from "../../middlewares/auth.middleware.js";
import checkVendorOwner, {checkVendorExist} from "../../middlewares/vendor.middleware.js";
import { uploadVendor, uploadAvatar } from "../../middlewares/multer.middleware.js";
import { createVendor,
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
    toggleShopStatus,} from "../../controllers/vendor.controller.js";
const vendorRouter = Router()

//vendor creation
vendorRouter.post('/create-vendor',protectedRoute,checkVendorOwner,uploadVendor.single('shopPhoto'), createVendor)

//category management
vendorRouter.post('/create-categories',protectedRoute,checkVendorOwner,checkVendorExist, createCategories)
vendorRouter.get('/get-all-categories',protectedRoute,checkVendorOwner,checkVendorExist, getAllCategories)
vendorRouter.get('/get-category/:id',protectedRoute,checkVendorOwner,checkVendorExist, getCategory)
vendorRouter.post('/add-category',protectedRoute,checkVendorOwner,checkVendorExist,  addCategory)
vendorRouter.put('/update-category/:id',protectedRoute,checkVendorOwner,checkVendorExist,  updateCategory)
vendorRouter.delete('/delete-category/:id',protectedRoute,checkVendorOwner,checkVendorExist,  deleteCategory)
vendorRouter.delete('/delete-categories',protectedRoute,checkVendorOwner,checkVendorExist,  deleteManyCategories)

// shop : open/close 
vendorRouter.post('/toggle-shop',protectedRoute,checkVendorOwner,checkVendorExist, toggleShopStatus)

//employee management
vendorRouter.post('/add-employee',protectedRoute,checkVendorOwner,checkVendorExist, uploadAvatar.single('profileImage'), addEmployee)
vendorRouter.put('/update-employee/:id',protectedRoute,checkVendorOwner,checkVendorExist, uploadAvatar.single('profileImage') ,updateEmployee)
vendorRouter.delete('/delete-employee/:id',protectedRoute,checkVendorOwner,checkVendorExist,  deleteEmployee)
vendorRouter.delete('/delete-employees/',protectedRoute,checkVendorOwner,checkVendorExist,  deleteManyEmployees)
vendorRouter.get('/get-all-employees',protectedRoute,checkVendorOwner,checkVendorExist,  getAllEmployees)
vendorRouter.get('/get-employees/:id',protectedRoute,checkVendorOwner,checkVendorExist,  getEmployee)



export default vendorRouter