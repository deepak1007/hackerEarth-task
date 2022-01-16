"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECO = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const htmlParser = __importStar(require("node-html-parser"));
class ECO {
    constructor() {
        this.ttl = 180;
        this.fetchECOData();
    }
    async getMovesWithCode(code) {
        if (!this.validCache())
            this.ecoData = await this.fetchECOData();
    }
    async fetchECOData() {
        const response = await (0, node_fetch_1.default)("https://www.chessgames.com/chessecohelp.html");
        const htmlString = await response.text();
        console.log(htmlString);
        console.log(htmlParser.parse(htmlString));
    }
    validCache() {
        if (!this.ecoData || new Date().getTime() > this.lastUpdate.getTime() + this.ttl)
            return false;
        return true;
    }
}
exports.ECO = ECO;
//# sourceMappingURL=ECO.js.map