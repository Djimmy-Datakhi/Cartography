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

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";

import * as geoProvider from './geoJsonProvider';

export class Visual implements IVisual {
    private svg: Selection<SVGElement>;
    private g: Selection<SVGElement>;
    private path;
    private setting: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.svg = d3.select(options.element).append('svg');
        this.g = this.svg.append('g');
        this.setting = new VisualSettings;
    }

    public update(options: VisualUpdateOptions) {
        var _this = this;

        //parse setting
        this.setting = this.setting.parse(options.dataViews[0])

        //visual size
        var width = options.viewport.width;
        var height = options.viewport.height;

        this.svg.attr('width',width);
        this.svg.attr('height',height);

        this.g.attr('width',width);
        this.g.attr('height',height);
        
        //projection
        var projection = d3.geoConicConformal()
            .center([2.454071,46.279229])
            .scale(2600)
            .translate([width/2,height/2]);

        //delete previous drawing
        this.svg.selectAll('.path').remove()

        //drawing
        this.path = d3.geoPath().projection(projection);
        
        this.g
            .selectAll('path')
            .data(geoProvider.getJson(this.setting.mapBackground.selectedMap).features)
            .enter()
            .append('path')
            .attr('class','path')
            .attr('d',this.path)
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        var objectName = options.objectName;
        var objectEnumeration: VisualObjectInstance[] = [];

        switch(objectName) {
            case 'map':
                objectEnumeration.push({
                    objectName: objectName,
                    properties:{
                        mapBackground: this.setting.mapBackground.selectedMap
                    },
                    selector: null
                })
                break;
        }
        return objectEnumeration;
    }

    public destroy():void{}
}
