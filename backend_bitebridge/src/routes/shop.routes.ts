import { Router } from "express";
import { getShopDataBySlug } from "../controllers/shop.controller.js";
import { getCustomerOpenOrders, getGuestOpenOrders, placeOrder, getCustomerPreviousOrder } from "../controllers/order.controller.js";
import { checkIsVendorOpen } from "../middlewares/vendor.middleware.js";
import protectedRoute, { optionalAuth } from "../middlewares/auth.middleware.js";

const shopRouter = Router()

shopRouter.get("/get-menu/:slug",getShopDataBySlug)
shopRouter.post("/place-order",checkIsVendorOpen,optionalAuth,placeOrder)

shopRouter.get('/customer-open-orders',protectedRoute,getCustomerOpenOrders)
shopRouter.post('/guest-open-orders',getGuestOpenOrders)
shopRouter.get('/my-previous-orders',protectedRoute,getCustomerPreviousOrder)
export default shopRouter