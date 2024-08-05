"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("./lib/utils");
const router = (0, express_1.Router)();
router.get("/updateEmployees", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.agency) {
        res.status(400).send("Missing agency");
        return;
    }
    const employees = yield (0, utils_1.FetchEmployees)(req.query.agency);
    return employees;
}));
exports.default = (0, express_1.Router)().use("/api", router);
//# sourceMappingURL=routes.js.map