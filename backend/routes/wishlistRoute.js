import express from "express";
import { addToWishlist, removeFromWishlist, getUserWishlist } from "../controllers/wishlistController.js";
import authUser from "../middlewares/auth.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/add", authUser, addToWishlist);
wishlistRouter.post("/remove", authUser, removeFromWishlist);
wishlistRouter.post("/get", authUser, getUserWishlist);

export default wishlistRouter;