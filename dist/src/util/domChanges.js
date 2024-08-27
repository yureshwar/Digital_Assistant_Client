var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { addBodyEvents } from "./addBodyEvents";
import { CONFIG } from "../config";
import { getFromStore } from "./index";
export let timer = null;
const observer = new MutationObserver((mutationList, observer) => __awaiter(void 0, void 0, void 0, function* () {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const isRecording = getFromStore(CONFIG.RECORDING_SWITCH_KEY, true) == "true";
        if (isRecording) {
            yield addBodyEvents();
        }
    }), CONFIG.indexInterval);
}));
observer.observe(document.body, { attributes: true, childList: true, subtree: true });
//# sourceMappingURL=domChanges.js.map