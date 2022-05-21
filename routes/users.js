import express from "express";
import { getUserById, updateUserRewards } from "../controllers/users.js";

const router = express.Router();

router.get("/:id/rewards", getUserById);

router.patch("/:id/rewards/:at/redeem", updateUserRewards);

export default router;
