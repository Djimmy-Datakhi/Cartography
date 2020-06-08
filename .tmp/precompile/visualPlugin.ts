import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var cartography6439711748644562B5895D8406A5421D_DEBUG: IVisualPlugin = {
    name: 'cartography6439711748644562B5895D8406A5421D_DEBUG',
    displayName: 'cartography',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["cartography6439711748644562B5895D8406A5421D_DEBUG"] = cartography6439711748644562B5895D8406A5421D_DEBUG;
}

export default cartography6439711748644562B5895D8406A5421D_DEBUG;