"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;


import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./VisualSettings";
import * as model from "./dataModel"
import { Map } from "./map";
import { Scale } from "./scale"
import { ITooltipServiceWrapper, createTooltipServiceWrapper } from "./toolTip";

export class Visual implements IVisual {
    private svg: Selection<SVGElement>; //div principale
    private colorScale: Scale; //div contenant l'échelle de couleur
    private map: Map; //div contenant la carte
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private tooltipServiceWrapper: ITooltipServiceWrapper;

    private dataModel: model.DataModel;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.svg = d3.select(options.element).append('svg');
        this.map = new Map(this.svg);
        this.colorScale = new Scale(this.svg);
        this.settings = new VisualSettings;
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
    }

    public update(options: VisualUpdateOptions) {
        console.log("update");

        //parse des settings
        this.settings.parse(options.dataViews[0]);
        //parse du datamodel     
        this.dataModel = model.parseDataModel(options.dataViews[0], this.settings, this.host);
        //Attribution de la taille a la div principal
        var width = options.viewport.width;
        var height = options.viewport.height;

        this.svg.attr('width', width);
        this.svg.attr('height', height);
        this.svg.on('contextmenu', (d) => { //gestion du clic gauche
            const mouseEvent: MouseEvent = <MouseEvent> d3.event;
            
            this.selectionManager.showContextMenu(this.host.createSelectionIdBuilder().createSelectionId(), {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY
            });
            mouseEvent.preventDefault();
        });

        //dessin de l'échelle de couleur
        this.colorScale.draw(this.dataModel, this.settings, this.selectionManager);
        //dessin de la carte
        this.map.draw(this.dataModel, this.settings, this.selectionManager, width / 2, height / 2, this.tooltipServiceWrapper);

    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        var objectName = options.objectName;
        var objectEnumeration: VisualObjectInstance[] = [];

        switch (objectName) {
            case 'couleur':
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: objectName,
                    properties: {
                        minColor: {
                            solid: {
                                color: this.settings.color.minColor.solid.color
                            }
                        },
                        maxColor: {
                            solid: {
                                color: this.settings.color.maxColor.solid.color
                            }
                        },
                        colorRange: this.settings.scale.rangeLevel
                    },
                    validValues:{
                        colorRange: {
                            numberRange:{
                                min: 3,
                                max: 30
                            }
                        }
                    },
                    selector: null
                });
                break;
            case 'tooltip':
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: objectName,
                    properties: {
                        show: this.settings.tooltip.show
                    },
                    selector: null
                });
                break;
            case 'scale':
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: objectName,
                    properties: {
                        height: this.settings.scale.height,
                        width: this.settings.scale.width,
                        xpos: this.settings.scale.xpos,
                        ypos: this.settings.scale.ypos
                    },
                    validValues:{
                        height: {
                            numberRange:{
                                min: 50,
                                max: 500
                            }
                        },
                        width: {
                            numberRange:{
                                min: 10,
                                max: 100
                            }
                        },
                        xpos: {
                            numberRange:{
                                min: 0,
                                max: 5000
                            }
                        },
                        ypos: {
                            numberRange:{
                                min: 0,
                                max: 5000
                            }
                        }
                    },
                    selector: null
                });
                break;
            case 'map':
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: objectName,
                    properties: {
                        level1: this.settings.mapBackground.mapSelection[0],
                        level2: this.settings.mapBackground.mapSelection[1],
                        level3: this.settings.mapBackground.mapSelection[2]
                    },
                    selector:null
                })
                break;
        }
        return objectEnumeration;
    }

    public destroy(): void { }
}
