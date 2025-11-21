import { Request, Response } from "express";
import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";
import fs from "fs";
import validator from 'validator'
import Category, { iCategory } from "../models/category.model.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createVendor = async (req: Request, res: Response) => {
    try {
        const { shopName, address } = req.body;
        const shopPhoto = req.file;
        const user = req.user;

        // basic validators
        if (!user) {
            return res.status(401).json({ message: "Unauthorized, user not found." });
        }
        if (user.role !== "vendorOwner") {
            return res
                .status(401)
                .json({
                    message: "Unauthorized, only vendor owner can create vendor.",
                });
        }
        if (!shopName || !address) {
            return res
                .status(400)
                .json({ message: "ShopName and address are required" });
        }

        if (!shopPhoto) {
            return res.status(400).json({ message: "ShopPhoto are required" });
        }

        //ensuring no vendorshop exist before creating for same user
        const existingVendor = await Vendor.findOne({ ownerId: user._id });
        if (existingVendor) {
            fs.unlinkSync(shopPhoto.path);
            return res
                .status(409)
                .json({ message: "This user has already created a vendor." });
        }

        // Set up the 7-day trial expiry date
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + 7);

        const newVendor = new Vendor({
            ownerId: user._id,
            shopName,
            address,
            subscriptionExpiry: expiryDate,
            imageUrl: shopPhoto.filename,
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
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.log("error in createVendor:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
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
    const categoryNames: string[] = req.body;
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
                message: " Category already exist for this Vendor",
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

        const categories = await Category.find({ vendorId: vendorId });

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

        const deletedEmployee = await Category.findOneAndDelete({
            _id: id,
            vendorId: vendorId
        });

        if (!deletedEmployee) {
            return res.status(404).json({
                message: "Category not found or you are not the owner."
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

const deleteManyCategories = async (req: Request, res: Response) => {
    try {
        const { deletedEmployee } = req.body
        const vendorId = req.user?.vendorId

        if (!Array.isArray(deletedEmployee) || deletedEmployee.length === 0) {
            return res.status(400).json({
                message: "An array of 'deletedEmployee' is required in the body."
            });
        }

        if (!vendorId) {
            return res.status(404).json({ message: "Vendor not found." });
        }

        const deleteResult = await Category.deleteMany(
            {
                _id: { $in: deletedEmployee },
                vendorId: vendorId
            }
        )

        res.status(200).json({
            message: `${deleteResult.deletedCount} categories deleted successfully.`,
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
    const imgURl = req.file

    try {
        const vendorId = req.user?.vendorId;
        if (!vendorId) {
            if (imgURl) fs.unlinkSync(imgURl.path);
            return res.status(404).json({ message: "Vendor not found." });
        }

        const { name, email, password, phone } = req.body
        const role = "vendorStaff";

        if (!name || !email || !password || !phone) {
            if (imgURl) fs.unlinkSync(imgURl.path);
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        if (!validator.isEmail(email)) {
            if (imgURl) fs.unlinkSync(imgURl.path);
            return res.status(400).json({
                message: `${email} is not valid`
            })
        }
        if (phone.length !== 10) {
            if (imgURl) fs.unlinkSync(imgURl.path);
            return res.status(400).json({
                message: "mobile number must be 10 digit"
            })
        }

        const isNumberExist = await User.findOne({ phone: phone }, null, {withDeleted:true})
        if (isNumberExist) {
            if (imgURl) fs.unlinkSync(imgURl.path);
            return res.status(400).json({
                message: "user Already exist with this Phone number"
            })
        }

        const existingUser = await User.findOne({ email: email }, null, {withDeleted:true})
        if (existingUser) {
            if (imgURl) fs.unlinkSync(imgURl.path);
            return res.status(400).json({
                message: "user Already exist with this email"
            })
        }

        if (password.length < 6) {
            if (imgURl) fs.unlinkSync(imgURl.path);
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
            imageUrl: imgURl ? imgURl.filename : null
        })

        const savedEmployee = await newEmployee.save();

        if (!savedEmployee) {
            if (imgURl) fs.unlinkSync(imgURl.path)
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
        if (imgURl) {
            fs.unlinkSync(imgURl.path);
        }
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
            return res.status(404).json({
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

const getAllDeletedEmployee = async (req: Request, res: Response)=>{
     try {
        const vendorId = req.user?.vendorId
        const ownerId = req.user?._id

        const allDeletedEmployees = await User.find({ vendorId: vendorId, role: 'vendorStaff',isDeleted:true },null, {withDeleted: true})
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
    const imgURl = req.file
    try {
        const vendorId = req.user?.vendorId
        const { name, email, password, phone } = req.body

        if (!name || !email || !phone) {
            if (imgURl) fs.unlinkSync(imgURl?.path)
            return res.status(400).json({
                message: "No field with blank data is accepted",
            })
        }
        if (name.length < 6) {
            if (imgURl) fs.unlinkSync(imgURl?.path)
            return res.status(400).json({
                message: "Name should be atleast 6 charecter long",
            })
        }
        if (!validator.isEmail(email)) {
            if (imgURl) fs.unlinkSync(imgURl?.path)
            return res.status(400).json({
                message: "Invalid Email",
            })
        }
        if (phone.length !== 10) {
            if (imgURl) fs.unlinkSync(imgURl?.path)
            return res.status(400).json({
                message: "Mobile number should be 10 digit long",
            })
        }
        if (password && password.length < 6) {
            if (imgURl) fs.unlinkSync(imgURl?.path)
            return res.status(400).json({
                message: "Password should be atleast 6 charecter long",
            })
        }

        const { id } = req.params
        if (!id) {
            if (imgURl) fs.unlinkSync(imgURl?.path)
            return res.status(400).json({
                message: "staff ID is required",
            })
        }

        const employee = await User.findOne({
            _id: id,
            vendorId: vendorId,
        })

        if (!employee) {
            if (imgURl) fs.unlinkSync(imgURl?.path)
            return res.status(400).json({
                message: "staff ID is required",
            })
        }

        if (imgURl && employee.imageUrl) {
            const oldImageFile = path.join(__dirname, '..', '..', 'media', 'avatars', employee.imageUrl)
            if (fs.existsSync(oldImageFile)) {
                fs.unlinkSync(oldImageFile)
                console.log("previous image has been deleted...");

            }
        }
        if (imgURl) {
            employee.imageUrl = imgURl.filename
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
        if (imgURl) fs.unlinkSync(imgURl?.path)
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
            res.status(200).json({
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

    // employee management
    addEmployee, //done
    getEmployee,
    getAllEmployees,
    updateEmployee,
    deleteEmployee,
    deleteManyEmployees,
};
