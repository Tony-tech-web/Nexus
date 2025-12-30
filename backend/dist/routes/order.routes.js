"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STAFF']), order_controller_1.OrderController.create);
router.get('/', auth_1.authenticate, order_controller_1.OrderController.getAll);
exports.default = router;
