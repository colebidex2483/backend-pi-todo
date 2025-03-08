import { Router } from "express";
import { incompleteDonation,approveDonation,completeDonation,cancelDonation,} from "../controllers/paymentController.js";
const router = Router();


router.post("/incomplete", incompleteDonation);
router.post("/approve", approveDonation);
router.post("/complete", completeDonation);
router.post("/cancel", cancelDonation);

export default router;
