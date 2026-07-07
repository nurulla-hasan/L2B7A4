import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { reviewValidation } from "../../validation/review.schema";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), validate(reviewValidation.createReviewSchema), reviewController.createReview);

export const reviewRoutes = router;
