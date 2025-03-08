import { Router } from "express";
import { signInUser, signOutUser } from "../controllers/userController.js";

const router = Router();

// Define routes
router.post('/signin', signInUser);
router.get('/signout', signOutUser);

export default router;
