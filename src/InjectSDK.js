import {checkBrowser} from "./util/checkBrowser";
import {checkScreenSize} from "./util/checkScreenSize";

let {enablePlugin, browserVar, identifiedBrowser} = checkBrowser();

const {enablePluginForScreenFlag, showScreenAlertFlag} = checkScreenSize();

if(enablePlugin === false) {
    console.log('Plugin disabled for browser: '+identifiedBrowser.name);
} else if(enablePluginForScreenFlag === false){
    console.log('Plugin disabled due to lower resolution');
} else {
    require("./AuthService");
    require("./index");
}
