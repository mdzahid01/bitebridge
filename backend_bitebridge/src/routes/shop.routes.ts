import { Router } from "express";
import { getShopDataBySlug } from "../controllers/shop.controller.js";
import { getCustomerOpenOrders, getGuestOpenOrders, placeOrder } from "../controllers/order.controller.js";
import { checkIsVendorOpen } from "../middlewares/vendor.middleware.js";
import protectedRoute from "../middlewares/auth.middleware.js";

const shopRouter = Router()

shopRouter.get("/get-menu/:slug",getShopDataBySlug)
shopRouter.post("/place-order",checkIsVendorOpen,placeOrder)

shopRouter.get('/my-orders',protectedRoute,getCustomerOpenOrders)
shopRouter.get('/guest-orders',getGuestOpenOrders)
shopRouter.get('/my-previous-orders',protectedRoute,)
export default shopRouter