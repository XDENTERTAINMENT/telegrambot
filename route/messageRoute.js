import { Router } from "express";
import { receiveMessage } from "../controller.js/messageController.js";

const router = Router();

router.post("/webhook", receiveMessage);

export default router;
