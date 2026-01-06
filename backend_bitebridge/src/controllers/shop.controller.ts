import { Request, Response } from "express";
import Vendor from "../models/vendor.model.js";
import Category from "../models/category.model.js";
import MenuItem from "../models/menuItem.model.js";

const getShopDataBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params

        if (!slug) {
            return res.status(400).json({ message: "Slug is Required" })
        }

        const vendor = await Vendor.findOne({ slug: slug })

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not Found" })
        }
        const [categories, rawMenuItem] = await Promise.all([
            Category.find({ vendorId: vendor._id }).sort({name: 1}),
            MenuItem.find({ vendorId: vendor._id }).populate("categoryId", "name").sort({name: 1})
        ])

        const products = rawMenuItem.map((item) => {
            const itemObj = item.toObject()
            return {
                ...itemObj,
                category: itemObj.categoryId,
                categoryId: undefined
            }
        })

        return res.status(200).json({
            message: "Shop data fetched successfully",
            vendor: vendor,
            categories: categories,
            products: products,
        });

    } catch (error: any) {
        console.error("Error in getShopDataBySlug:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

export {
    getShopDataBySlug,
}