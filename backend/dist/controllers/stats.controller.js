"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const stats_service_1 = require("../services/stats.service");
class StatsController {
    static async getStats(req, res, next) {
        try {
            const stats = await stats_service_1.StatsService.getPublicStats();
            res.json(stats);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.StatsController = StatsController;
