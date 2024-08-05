"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rhApi = exports.port = void 0;
const axios_1 = require("axios");
require("dotenv").config();
exports.port = 3000;
exports.rhApi = axios_1.default.create({
    baseURL: "https://kazitour-rh.com/api",
    params: { api_key: process.env.API_SECRET },
});
//# sourceMappingURL=config.js.map