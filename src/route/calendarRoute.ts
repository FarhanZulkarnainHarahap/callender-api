import { Router } from "express";
import {
  calendarController,
  dayController,
  healthController,
  saveDescriptionController
} from "../controller/calendarController.js";

const router = Router();

router.get("/health", healthController);
router.get("/calendar", calendarController);
router.get("/day/:date", dayController);
router.put("/day/:date/description", saveDescriptionController);

export default router;
