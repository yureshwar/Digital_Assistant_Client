import {getScreenSize} from "./getScreenSize";

export const checkScreenSize = () => {
    const screenSize = getScreenSize();

    let enablePluginForScreenFlag = true;
    let showScreenAlertFlag = false;

    if(screenSize.resolution.height < 768) {
        enablePluginForScreenFlag = false;
    } else if(screenSize.resolution.height < 1080) {
        showScreenAlertFlag = true;
    }

    if(screenSize.resolution.width < 1366) {
        enablePluginForScreenFlag = false;
    } else if(screenSize.resolution.width < 1920) {
        showScreenAlertFlag = true;
    }

    return {enablePluginForScreenFlag: enablePluginForScreenFlag, showScreenAlertFlag: showScreenAlertFlag}

}
