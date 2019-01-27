"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const tableCtrl_1 = require("./tableCtrl");
class ChoiceCtrl extends tableCtrl_1.TableCtrl {
    getChoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM choices WHERE id = $1';
            this.params = [
                req.query.id
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let choice = new models_1.Choice();
                choice.id = this.result.rows[0].id;
                choice.value = this.result.rows[0].value;
                choice.text = this.result.rows[0].text;
                this.result = choice;
            }
            return this.result;
        });
    }
    postChoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = "INSERT INTO choices ( id, text, value ) VALUES ($1,$2,$3)";
            this.params = [
                req.body.id,
                req.body.text,
                req.body.value
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            return this.result;
        });
    }
}
exports.ChoiceCtrl = ChoiceCtrl;
//# sourceMappingURL=choiceCtrl.js.map