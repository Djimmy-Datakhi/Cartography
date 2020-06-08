"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";

import * as geoProvider from './geoJsonProvider';

export class Visual implements IVisual {
    private svg: Selection<SVGElement>;
    private g: Selection<SVGElement>;
    private target:HTMLElement;
    private path;

    constructor(options: VisualConstructorOptions) {
        this.svg = d3.select(options.element).append('svg');
        this.g = this.svg.append('g');
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        var _this = this;
        var width = options.viewport.width;
        var height = options.viewport.height;

        this.svg.attr('width',width);
        this.svg.attr('height',height);

        this.g.attr('width',width);
        this.g.attr('height',height);
        
        var projection = d3.geoConicConformal()
            .center([2.454071,46.279229])
            .scale(2600)
            .translate([width/2,height/2]);

        this.path = d3.geoPath().projection(projection);
        
        this.g
            .selectAll('path')
            .data(geoProvider.getJson('regions').features)
            .enter()
            .append('path')
            .attr('d',this.path)
    }

    /*
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {

    }
    */

    public destroy():void{}
}
