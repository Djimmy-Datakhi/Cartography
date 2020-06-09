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
import DataView = powerbi.DataView;

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";

import * as geoProvider from './geoJsonProvider';

interface DataPoint{
    feature;
    name:string;
}

interface DataModel{
    data:DataPoint[];
    settings:VisualSettings;
}

export class Visual implements IVisual {
    private svg: Selection<SVGElement>;
    private g: Selection<SVGElement>;
    private path;

    private dataModel: DataModel;

    constructor(options: VisualConstructorOptions) {
        this.svg = d3.select(options.element).append('svg');
        this.g = this.svg.append('g');
    }

    public update(options: VisualUpdateOptions) {
        var _this = this;

        //parse datamodel
        this.dataModel = Visual.parseDataModel(options.dataViews[0]);

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
            .data(this.dataModel.data) 
            .enter()
            .append('path')
            .attr('class','path')
            .attr('d',function(d){return _this.path(d.feature)})
            .attr('id',function(d){return d.name})
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        var objectName = options.objectName;
        var objectEnumeration: VisualObjectInstance[] = [];

        switch(objectName) {
            case 'map':
                objectEnumeration.push({
                    objectName: objectName,
                    properties:{
                        mapBackground: this.dataModel.settings.mapBackground.selectedMap
                    },
                    selector: null
                })
                break;
        }
        return objectEnumeration;
    }

    //fonction de parse des datapoints
    public static parseDataModel(dataView:DataView):DataModel{
        //parse des settings
        var setting = new VisualSettings;
        setting = setting.parse(dataView);

        //parse des datapoints
        var dps:DataPoint[] = [];
        var geo = geoProvider.getJson(setting.mapBackground.selectedMap) 
        for(var i = 0; i < geo.features.length; ++i){
            var name = geo.features[i].properties.nom;
            var feat = geo.features[i];

            var dp:DataPoint = {name:name,feature:feat};
            dps.push(dp);
        }

        //resultat
        var model:DataModel = {data:dps,settings:setting};
        return model;
    }

    public destroy():void{}
}
