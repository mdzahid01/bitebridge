import { Router } from "express";
import { getShopDataBySlug } from "../controllers/shop.controller.js";

const shopRouter = Router()

shopRouter.get("/get-menu/:slug",getShopDataBySlug)

export default shopRouter