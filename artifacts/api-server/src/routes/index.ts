import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import profileRouter from "./profile.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/profile", profileRouter);

export default router;
