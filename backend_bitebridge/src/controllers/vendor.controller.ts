import { Request, Response } from "express";
import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";
import validator from 'validator'
import Category, { iCategory } from "../models/category.model.js";
import QRCode from "qrcode";
import MenuItem, { iMenuItem } from "../models/menuItem.model.js";
import { generateSlug } from "../utils/slugGenerator.js";
import { deleteImageFromCloudinary } from "../utils/cloudinary.utils.js";
import cloudinary from "../config/cloudinary.js";

const createVendor = async (req: Request, res: Response) => {
    const shopImage = req.file;
    let qrCloudinaryPublicId = ""
    try {
        const { shopName, address } = req.body;
        const user = req.user;

        // basic validators
        if (!user) {
            if(shopImage){
                await deleteImageFromCloudinary(shopImage)
            }
            return res.status(401).json({ message: "Unauthorized, user not found." });
        }
        if (user.role !== "vendorOwner") {
            if(shopImage){
                await deleteImageFromCloudinary(shopImage)
            }
            return res
                .status(401)
                .json({
                    message: "Unauthorized, only vendor owner can create vendor.",
                });
        }
        if (!shopName || !address) {
            if(shopImage){
                await deleteImageFromCloudinary(shopImage)
            }
            return res
                .status(400)
                .json({ message: "ShopName and address are required" });
        }

        if (!shopImage) {
            return res.status(400).json({ message: "shopImage are required" });
        }

        //ensuring no vendorshop exist before creating for same user
        const existingVendor = await Vendor.findOne({ ownerId: user._id });
        if (existingVendor) {
           if(shopImage){
                await deleteImageFromCloudinary(shopImage)
            }
            return res
                .status(409)
                .json({ message: "This user has already created a vendor." });
        }
        //genrating slug
        let baseSlug = generateSlug(shopName)
        let finalSlug = baseSlug
        let unique = false
        
        //run loop until slug become unique
        while(!unique){
            const slugExist = await Vendor.exists({slug:finalSlug})
            if(slugExist){
                finalSlug = `${baseSlug}-${Math.floor(Math.random()*1000)}`
            }
            else{
                unique = true
            }
        }

        const shopUrl = `${process.env.FRONTEND_URL}/menu/${finalSlug}`;

        const qrDataUrl = await QRCode.toDataURL(shopUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#FFFFFF"
            }
        });

        const qrUploadResponse = await cloudinary.uploader.upload(qrDataUrl,{
            folder: "bitebridge/qrcodes",
            public_id: `qr-${finalSlug}`,
            resource_type: "image"
        })

        qrCloudinaryPublicId = qrUploadResponse.public_id;

        // Set up the 7-day trial expiry date
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + 7);

        const newVendor = new Vendor({
            ownerId: user._id,
            shopName,
            address,
            slug: finalSlug,
            qrCode: qrUploadResponse.secure_url,
            subscriptionExpiry: expiryDate,
            imageUrl: shopImage.path,
        });

        //saving vendor
        const savedVendor = await newVendor.save();

        //link vendor to user
        await User.findByIdAndUpdate(user._id, {
            vendorId: savedVendor._id,
        });

        res.status(200).json({
            message: "Vendor created successfully",
            vendor: savedVendor,
        });
    } catch (error: any) {
        if(shopImage){
            await deleteImageFromCloudinary(shopImage)  
        }
        // agar QR ban gya but db me save fail hua to QR bhi udao
        if(qrCloudinaryPublicId){
            await deleteImageFromCloudinary(qrCloudinaryPublicId)  
        }
        console.log("error in createVendor:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const getShopStatus = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId; 

        if (!vendorId) {
            return res.status(400).json({
                message: "Vendor ID not found for this user",
            });
        }

        // Sirf 'isOpen' field fetch kar rahe hain taaki database query fast ho (.select ka jadoo)
        const vendor = await Vendor.findById(vendorId).select("isOpen");

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor Not Found",
            });
        }

        return res.status(200).json({
            message: "Shop status fetched successfully",
            isOpen: vendor.isOpen, // True ya False
        });

    } catch (err: any) {
        console.error("Error fetching shop status: ", err);

        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

const toggleShopStatus = async (req: Request, res: Response) => {
    try {
        const { isOpen } = req.body;
        const user = req.user;

        if (typeof isOpen !== "boolean") {
            return res.status(400).json({
                message: "Invalid Input: 'isOpen should be boolean(True/False)",
            });
        }

        const vendorId = user?.vendorId;
        if (!vendorId) {
            return res.status(400).json({
                message: "Vendor not found for this user",
            });
        }

        const updatedVendor = await Vendor.findOneAndUpdate(
            { _id: vendorId, ownerId: user._id },
            { isOpen: isOpen },
            { new: true }
        );

        if (!updatedVendor) {
            return res.status(400).json({
                message: "Vendor Not Found or You are not a Vendor Owner",
            });
        }

        return res.status(200).json({
            message: `Shop status Updated to: ${isOpen ? "Open" : "Close"}`,
            vendor: updatedVendor,
        });
    } catch (err: any) {
        console.log("Error toggling shop: ", err);

        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

const createCategories = async (req: Request, res: Response) => {
    const {categoryNames} = req.body as {categoryNames: string[]};
    const user = req.user;

    const vendorId = user?.vendorId;
    if (!vendorId) {
        return res.status(400).json({
            message: " Vendor not found. Please create a vendor first",
        });
    }

    if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
        return res.status(400).json({
            message: "Categories must be sent as a non-empty array.",
        });
    }

    // table se existing category documents nikale
    const existingCategories = await Category.find({ vendorId: vendorId });

    // un documents se sirf category name nikale
    const existingNames = new Set(existingCategories.map((cat) => cat.name));

    // user se diye category names me wo names hataye jo already save hain
    const filteredNames = categoryNames.filter(
        (name) => !existingNames.has(name)
    );

    // if all categories are already saved in table then
    if (filteredNames.length === 0) {
        return res.status(409).json({
            // 409 Conflict
            message: "All categories provided are already exist.",
        });
    }

    const documentToInsert = filteredNames.map((name) => ({
        name: name,
        vendorId: vendorId,
    }));

    const createdCategories = await Category.insertMany(documentToInsert);

    return res.status(201).json({
        message: "Categories Created successfully!",
        categories: createdCategories,
    });
};

const addCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const user = req.user;
        const vendorId = user?.vendorId;

        if (!name) {
            return res.status(400).json({
                message: " Category Name cannot be Empty",
            });
        }

        if (!vendorId) {
            return res.status(400).json({
                message: " Vendor not found. Please create a vendor first",
            });
        }

        const existingCategory = await Category.findOne({
            name: name,
            vendorId: vendorId,
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "This category name already exists.",
            });
        }

        const newCategory = new Category({
            name: name,
            vendorId: vendorId,
        });

        const savedCategory = await newCategory.save();

        return res.status(201).json({
            message: "Category Added Successfully",
            category: savedCategory,
        });
    } catch (err: any) {
        console.log("addCategory Error: ", err);

        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }
};

const getCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(400).json({
                message: "Category not found",
            });
        }

        res.status(200).json({
            message: "category fetched successfully",
            category: category,
        });
    } catch (err: any) {
        console.log("getCategory Error: ", err);
        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }
};

const getAllCategories = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId;
        const categories = await Category.find({ vendorId: vendorId })
        .select('name')
        .lean();

        if (categories.length === 0) {
            return res.status(404).json({
                message: "No Categories Found for this Vendor.",
                categories: [],
            });
        }

        res.status(200).json({
            message: "Categories fetched successfully",
            categories: categories,
        });
    } catch (err: any) {
        console.log("getAllCategory Error: ", err);
        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }
};

const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name } = req.body

        if (!name) {
            return res.status(400).json({
                message: "Category name is Required"
            })
        }

        const vendorId = req.user?.vendorId
        if (!vendorId) {
            return res.status(404).json({
                message: "No Vendor Found: Create Vendor first"
            })
        }

        const existingCategory = await Category.findOne({
            name: name,
            vendorId: vendorId
        }).lean();       // .lean() - plain object milega isse, taki typescript ki gandmasti rok saku
        // ab ye sirf plain object hai jisme .save() ya koi aur  mongoos ke method use nahi kr sakte 
        if (existingCategory && existingCategory?._id.toString() !== id) {
            return res.status(409).json({ message: "This category name already exists." });
        }

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: id, vendorId: vendorId },
            { name: name },
            { new: true }
        )

        if (!updatedCategory) {
            return res.status(404).json({
                message: "Category not found or you are not the owner."
            });
        }

        res.status(200).json({
            message: "Category Updated Successfully",
            Category: updatedCategory
        })
    } catch (err: any) {
        console.log("updatedCategory Error: ", err);
        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }

};

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const vendorId = req.user?.vendorId;
        if (!vendorId) {
            return res.status(404).json({ message: "Vendor not found for this user." });
        }
        if (!id) {
            return res.status(400).json({
                message: "cannot delete category without category-ID",
            })
        }

        const deletedCategory = await Category.findOneAndDelete({
            _id: id,
            vendorId: vendorId
        });

        if (!deletedCategory) {
            return res.status(404).json({
                message: "Category not found or you are not the owner."
            });
        }
        await MenuItem.updateMany(
            {categoryId: id},
            {$set: {categoryId:null}}
        )

        return res.status(200).json({
            message: 'data Deleted successfully',
            deletedCategory: deletedCategory
        })
    } catch (err: any) {
        console.log("deletedCategory Error: ", err);
        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }
};

const deleteManyCategories = async (req: Request, res: Response) => {
    try {
        const { deletingCategory } = req.body
        const vendorId = req.user?.vendorId

        if (!Array.isArray(deletingCategory) || deletingCategory.length === 0) {
            return res.status(400).json({
                message: "An array of 'deletingCategory' is required in the body."
            });
        }

        const deleteResult = await Category.deleteMany({
            _id: { $in: deletingCategory },
            vendorId: vendorId
        })
        
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: "No categories deleted." });
        }

        //category delete to usse associated saari menuitems ki category null set kr dete hain 
        await MenuItem.updateMany(
            { categoryId: { $in: deletingCategory } }, // Query
            { $set: { categoryId: null } }             // Update
        );

        res.status(200).json({
            message: `${deleteResult.deletedCount} categories deleted. Associated items are now Uncategorized.`,
            deletedData: deleteResult
        });

    } catch (err: any) {
        console.log("deleteManyCategory Error: ", err);
        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }
};

const addEmployee = async (req: Request, res: Response) => {
    const uploadedFile = req.file

    try {
        const vendorId = req.user?.vendorId;
        if (!vendorId) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(404).json({ message: "Vendor not found." });
        }

        const { name, email, password, phone } = req.body
        const role = "vendorStaff";

        if (!name || !email || !password || !phone) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        if (!validator.isEmail(email)) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: `${email} is not valid`
            })
        }
        if (phone.length !== 10) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "mobile number must be 10 digit"
            })
        }

        const isNumberExist = await User.findOne({ phone: phone }, null, { withDeleted: true })
        if (isNumberExist) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "user Already exist with this Phone number"
            })
        }

        const existingUser = await User.findOne({ email: email }, null, { withDeleted: true })
        if (existingUser) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "user Already exist with this email"
            })
        }

        if (password.length < 6) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            })
        }

        const defaultPermissions = [
            'view_orders',
            'update_order_status',
            'create_order',
            'collect_payment'
        ];

        const newEmployee = new User({
            name,
            email,
            phone,
            role,
            vendorId: vendorId,
            password,
            permissions: defaultPermissions,
            imageUrl: uploadedFile ? uploadedFile.path : ''
        })

        const savedEmployee = await newEmployee.save();

        if (!savedEmployee) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
        const employeeToSend = savedEmployee.toObject()
        delete employeeToSend.password;
        delete employeeToSend.isDeleted;

        return res.status(201).json({
            message: "Staff Added Successfully",
            newEmployee: employeeToSend
        })
    } catch (err: any) {
        if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
        console.log("AddEmployee Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }

};

const getEmployee = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId
        const { id } = req.params
        if (!id) {
            return res.status(400).json({
                message: "staff ID is required"
            })
        }

        const employee = await User.find({
            _id: id,
            role: 'vendorStaff',
            vendorId: vendorId
        })

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found or does not belong to this vendor."
            })
        }
        return res.status(200).json({
            message: "employee's data fetched successfully",
            employee: employee
        })
    } catch (err: any) {
        console.log("getEmployee Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
};

const getAllEmployees = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId
        const ownerId = req.user?._id

        const allEmployees = await User.find({ vendorId: vendorId, role: 'vendorStaff' })
        if (allEmployees.length === 0) {
            return res.status(200).json({
                messaage: "no emplyee found for this vendor",
                allEmployees: []
            })
        }

        return res.status(200).json({
            message: "AllEmplyees fetched succesfully",
            allEmployees: allEmployees
        })
    } catch (err: any) {
        console.log("getAllEmployee Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
};

const getAllDeletedEmployee = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId
        const ownerId = req.user?._id

        const allDeletedEmployees = await User.find({ vendorId: vendorId, role: 'vendorStaff', isDeleted: true }, null, { withDeleted: true })
        if (allDeletedEmployees.length === 0) {
            return res.status(404).json({
                messaage: "no emplyee found for this vendor",
                allDeletedEmployees: []
            })
        }

        return res.status(200).json({
            message: "allDeletedEmployees fetched succesfully",
            allDeletedEmployees: allDeletedEmployees
        })
    } catch (err: any) {
        console.log("getAllEmployee Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
}

const updateEmployee = async (req: Request, res: Response) => {
    const uploadedFile = req.file
    try {
        const vendorId = req.user?.vendorId
        const { name, email, password, phone } = req.body

        if (!name || !email || !phone) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "No field with blank data is accepted",
            })
        }
        if (name.length < 6) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "Name should be atleast 6 charecter long",
            })
        }
        if (!validator.isEmail(email)) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "Invalid Email",
            })
        }
        if (phone.length !== 10) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "Mobile number should be 10 digit long",
            })
        }
        if (password && password.length < 6) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "Password should be atleast 6 charecter long",
            })
        }

        const { id } = req.params
        if (!id) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "staff ID is required",
            })
        }

        const employee = await User.findOne({
            _id: id,
            vendorId: vendorId,
        })

        if (!employee) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({
                message: "staff ID is required",
            })
        }

        if (uploadedFile) {
            if (employee.imageUrl) {
                await deleteImageFromCloudinary(employee.imageUrl);
            }
            employee.imageUrl = uploadedFile.path;
        }
        employee.name = name
        employee.email = email
        employee.phone = phone
        if (password) {
            employee.password = password;
            // .save() se password hash ho jayega
        }
        await employee.save();

        return res.status(200).json({
            messasge: "updated Succesfully",
        })


    } catch (err: any) {
        if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
        console.log("updateEmployee Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
};

const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const vendorId = req.user?.vendorId;

        if (!id) {
            return res.status(400).json({
                message: "cannot delete category without category-ID",
            })
        }

        const deletedEmployee = await User.findOne({
            _id: id,
            vendorId: vendorId
        });

        deletedEmployee?.softDelete()

        if (!deletedEmployee) {
            return res.status(404).json({
                message: "Staff not found or you are not the owner."
            });
        }

        return res.status(200).json({
            message: 'data Deleted successfully',
            deletedEmployee: deletedEmployee
        })
    } catch (err: any) {
        console.log("deletedEmployee Error: ", err);
        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }
};

const deleteManyEmployees = async (req: Request, res: Response) => {
    try {
        const { deletedEmployee } = req.body
        const vendorId = req.user?.vendorId

        if (!Array.isArray(deletedEmployee) || deletedEmployee.length === 0) {
            return res.status(400).json({
                message: "An array of 'deletedEmployee' is required in the body."
            });
        }

        const updatedResult = await User.updateMany(
            {
                _id: { $in: deletedEmployee },
                vendorId: vendorId
            },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            }
        )
        if (updatedResult.modifiedCount === 0) {
            return res.status(200).json({
                message: 'No matching employee found to delete',
            });
        }

        res.status(200).json({
            message: `${updatedResult.modifiedCount} employees soft deleted successfully.`,
            deletedData: updatedResult
        });

    } catch (err: any) {
        console.log("deleteManyCategory Error: ", err);
        return res.status(500).json({
            message: "Internal server Error",
            error: err.message,
        });
    }
};


const addMenuItem = async (req: Request, res: Response) => {
    const menuItemImage = req.file
    try {
        const vendorId = req.user?.vendorId
        const { name, category, price ,isveg, availability} = req.body
        
        const isVegBoolean = isveg ==='true'
        const isAvailableBoolean = availability === 'true'

        if (!name || !name.trim() || !category || price === undefined || price === '' || isveg=== undefined) {
            if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
            return res.status(400).json({
                message: "All fields (Name, Category, Price) are required"
            })
        }
        const numPrice = Number(price)
        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({
                message: "Price must be a valid positive number"
            })
        }
        const isCategoryExist = await Category.findOne({ vendorId: vendorId, _id: category })
        if (!isCategoryExist) {
            if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
            return res.status(400).json({
                message: "Invalid Category given"
            })
        }

        const existingMenuItem = await MenuItem.findOne({vendorId,name:name.trim().toLowerCase()})
        if(existingMenuItem){
            return res.status(409).json({
                message:"You already have an item with this name.",
            })
        }

        const newMenuItem = new MenuItem({
            name: name.trim().toLowerCase(),
            vendorId: vendorId,
            categoryId: category,
            price: numPrice,
            isveg: isVegBoolean,
            availability: isAvailableBoolean,
            imageUrl: menuItemImage ? menuItemImage.path : null
        })


        const savedItem = await newMenuItem.save()

        return res.status(201).json({
            message: " Item Added successfully",
            newItem: savedItem
        })

    } catch (err: any) {
        if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

const getMenuItem = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId
        const { id } = req.params
        if (!id) {
            return res.status(400).json({
                message: "Menu item ID is required"
            })
        }

        const item = await MenuItem.findOne({
            _id: id,
            vendorId: vendorId
        }).lean();

        if (!item) {
            return res.status(404).json({
                message: "This item does not exist or does not belong to this vendor."
            })
        }
        return res.status(200).json({
            message: "Menu item fetched successfully",
            item: item
        })
    } catch (err: any) {
        console.log("getMenuItem Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
}

const getAllMenuItems = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId

        const allMenuItems = await MenuItem.find({ vendorId: vendorId })
        .populate('categoryId','name').select(['-vendorId'])

        if (allMenuItems.length===0) return res.status(200).json({
            message: "No Item on this vendor's Menu",
            allMenuItems: []
        })

        return res.status(200).json({
            message: "Items fetched successfully",
            allMenuItems: allMenuItems
        })
    } catch (err: any) {
        console.log("getAllMenuItems Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
}

const updateMenuItem = async (req: Request, res: Response) => {
    const menuItemImage = req.file;
    const { id } = req.params;

    try {
        const vendorId = req.user?.vendorId;
        const { name, price, category, availability,isveg } = req.body;

        // 1. Basic ID Check
        if (!id) {
            if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
            return res.status(400).json({ message: "Menu Item ID is required" });
        }

        // 2. Find Item (Aur check karo ki ye isi vendor ka hai)
        const menuItem = await MenuItem.findOne({ _id: id, vendorId: vendorId });

        if (!menuItem) {
            if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
            return res.status(404).json({ message: "Item not found or you don't own it" });
        }

        // 3. Category Validation (Agar user category badal raha hai)
        if (category) {
            const categoryExists = await Category.findOne({ _id: category, vendorId: vendorId });
            if (!categoryExists) {
                if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
                return res.status(400).json({ message: "Invalid Category or it doesn't belong to you" });
            }
            menuItem.categoryId = category;
        }

        // 4. Text Fields Update (Agar provide kiye gaye hain to)
        if (name){
            const existingMenuItem = await MenuItem.findOne({
                name: name,vendorId: vendorId
            });

            if(existingMenuItem && existingMenuItem._id.toString() !== id){
                if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
                return res.status(409).json({
                    message: "You already have an item with this name.",
                })
            }
            menuItem.name = name;   
        }

        // 5. Image Handling (Purani Udaao, Nayi Lagao)
        if (menuItemImage) {
            // A. Purani file delete karo (Agar exist karti hai)
            if (menuItem.imageUrl) {
                await deleteImageFromCloudinary(menuItem.imageUrl);
            }
            // B. Nayi file ka naam set karo
            menuItem.imageUrl = menuItemImage.path;
        }
        
        // Price undefined ya empty string nahi hona chahiye
        if (price !== undefined && price !== "") {
            const numPrice = Number(price);
            if (!isNaN(numPrice) && numPrice >= 0) {
                menuItem.price = numPrice;
            }
        }

        // Availability handle karo (Boolean conversion zaroori hai FormData ke liye)
        if (availability !== undefined) {
            menuItem.availability = availability === 'true'; 
        }

        if (isveg !== undefined) {
            menuItem.isveg = isveg === 'true'; 
        }

        const updatedItem = await menuItem.save();

        return res.status(200).json({
            message: "Menu Item updated successfully",
            updatedItem: updatedItem
        });

    } catch (err: any) {
        if (menuItemImage) await deleteImageFromCloudinary(menuItemImage);
        console.log("updateMenuItem Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vendorId = req.user?.vendorId;

        // 1. Validation
        if (!id) {
            return res.status(400).json({ message: "Menu Item ID is required" });
        }

        // 2. Find and Delete
        // Security: Hum vendorId bhi check kar rahe hain taaki koi aur delete na kar sake
        const deletedItem = await MenuItem.findOneAndDelete({
            _id: id,
            vendorId: vendorId
        });

        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found or you don't own it" });
        }

        // 3. Image Cleanup (Safai Abhiyaan 🧹)
        // Agar item delete ho gaya, to uski image bhi server se uda do
        if (deletedItem.imageUrl) {
            await deleteImageFromCloudinary(deletedItem.imageUrl);
        }

        return res.status(200).json({
            message: "Menu Item deleted successfully",
            deletedItem: deletedItem
        });

    } catch (err: any) {
        console.log("deleteMenuItem Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

const deleteManyMenuItems = async (req: Request, res: Response) => {
    try {
        // Frontend se array aana chahiye: { "menuItemIds": ["id1", "id2"] }
        const { menuItemIds } = req.body;
        const vendorId = req.user?.vendorId;

        if (!Array.isArray(menuItemIds) || menuItemIds.length === 0) {
            return res.status(400).json({
                message: "An array of 'menuItemIds' is required."
            });
        }

        if (!vendorId) {
            return res.status(404).json({ message: "Vendor not found." });
        }

        // image cleanup ke liye aisa kr rhe hain warna direct deleteMany use krte
        const itemsToDelete = await MenuItem.find({
            _id: { $in: menuItemIds },
            vendorId: vendorId // Security: Sirf apne items dhoondo
        });

        if (itemsToDelete.length === 0) {
            return res.status(200).json({
                message: "No matching menu items found to delete."
            });
        }

        // pahle image delete krenge server se

        const deletePromises = itemsToDelete.map(async (item) => {
            if (item.imageUrl) {
                await deleteImageFromCloudinary(item.imageUrl);
            }
        });
        await Promise.all(deletePromises);


        const deleteResult = await MenuItem.deleteMany({
            _id: { $in: menuItemIds },
            vendorId: vendorId
        });

        return res.status(200).json({
            message: `${deleteResult.deletedCount} menu items deleted successfully.`,
            deletedCount: deleteResult.deletedCount
        });

    } catch (err: any) {
        console.log("deleteManyMenuItems Error: ", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

export {
    // shop
    createVendor, //done
    toggleShopStatus, //done

    // category
    createCategories, //done
    addCategory, //done
    getCategory, //done
    getAllCategories, //done
    updateCategory, //done
    deleteCategory, //done
    deleteManyCategories, //done

    // menu management
    addMenuItem,    //done
    updateMenuItem, //done
    getMenuItem,    //done
    getAllMenuItems,//done
    deleteMenuItem, //done
    deleteManyMenuItems, //done

    // employee management
    addEmployee, //done
    getEmployee,//done
    getAllEmployees,//done
    updateEmployee,//done
    deleteEmployee,//done
    deleteManyEmployees,//done
    getAllDeletedEmployee//done
};
