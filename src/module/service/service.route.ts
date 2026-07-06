import { Router } from "express";
import { serviceController } from "./service.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.get('/', serviceController.getAllService)
router.get('/:id', serviceController.getSingleService)
router.post('/', auth(Role.TECHNICIAN), serviceController.createService)
router.put('/:id',auth(Role.TECHNICIAN), serviceController.updateService)
router.delete('/:id',auth(Role.TECHNICIAN), serviceController.deleteService)


export const serviceRoutes = router;