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
        this.ttl = 180000; // server side caching (not required as http response is static but just for demo we are caching response data for sometime then it will get invalid and we will request new data)
        this.fetchECOData();
    }
    async getAll() {
        if (!this.validCache())
            this.ecoData = await this.fetchECOData();
        return this.ecoData;
    }
    async getMovesWithCode(code) {
        if (!this.validCache())
            this.ecoData = await this.fetchECOData();
        return this.ecoData.find((data) => data.code === code.toLowerCase());
    }
    async getNextMove(code, playedMovesSequence) {
        if (!this.validCache())
            this.ecoData = await this.fetchECOData();
        const moveDetails = await this.getMovesWithCode(code);
        if (!moveDetails)
            return null;
        const movesSequence = moveDetails.moves.join('/');
        // playedMovesSequence should start from index 0 of movesSequence and should be valid move sequence to be a substring of available move sequence.
        if (movesSequence.indexOf(playedMovesSequence.toLowerCase()) !== 0) {
            return "invalid-move-sequence";
        }
        const playedMovesSequenceArray = playedMovesSequence.split('/').filter((moves) => {
            if (!moves)
                return false; // handling "" while splitting.
            return moves;
        });
        if (moveDetails.moves.length === playedMovesSequenceArray.length) {
            return "no-move-left";
        }
        return moveDetails.moves[playedMovesSequenceArray.length];
    }
    async fetchECOData() {
        const response = await (0, node_fetch_1.default)("https://www.chessgames.com/chessecohelp.html");
        const htmlString = await response.text();
        return this.parseHtml(htmlString);
    }
    parseHtml(htmlString) {
        var _a;
        const ecoData = [];
        const parsedHtml = htmlParser.parse(htmlString);
        const trArray = parsedHtml.getElementsByTagName('tr');
        // remove uncommon opening
        trArray.slice(0, 1);
        for (const tr of trArray) {
            const fontTags = tr.getElementsByTagName('font');
            /* 3 font tags in each row font[0].innerText = code name
             * font[1](b tag).innerText = opening name
             * font[2].innerText = moves
             */
            const openingName = (_a = fontTags[1].getElementsByTagName('b')[0]) === null || _a === void 0 ? void 0 : _a.innerText;
            const moves = [];
            for (const element of fontTags[2].innerText.split(' ')) {
                const elementNum = Number(element);
                if (isNaN(elementNum)) {
                    moves.push(element.toLowerCase());
                }
            }
            ecoData.push({
                code: fontTags[0].innerText.toLowerCase(),
                openingName,
                moves
            });
        }
        this.lastUpdate = new Date();
        return ecoData;
    }
    validCache() {
        if (!this.ecoData || (new Date()).getTime() > this.lastUpdate.getTime() + this.ttl)
            return false;
        return true;
    }
}
exports.ECO = ECO;
//# sourceMappingURL=ECO.js.map