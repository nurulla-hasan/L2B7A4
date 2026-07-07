import { Router } from "express";
import { serviceController } from "./service.controller";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { serviceValidation } from "../../validation/service.schema";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.get('/', serviceController.getAllService)
router.get('/:id', serviceController.getSingleService)
router.post('/', auth(Role.TECHNICIAN), validate(serviceValidation.createServiceSchema), serviceController.createService)
router.put('/:id', auth(Role.TECHNICIAN), validate(serviceValidation.updateServiceSchema), serviceController.updateService)
router.delete('/:id', auth(Role.TECHNICIAN), serviceController.deleteService)


export const serviceRoutes = router;