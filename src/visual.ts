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

import * as chroma from "chroma-js";
import * as geoProvider from './geoJsonProvider';
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";
import { util } from "./utility";




interface DataPoint {
    mapData;
    name: string;
    color: string;
    value: number;
}

interface DataModel {
    data: DataPoint[];
    minValue: number;
    maxValue: number;
}

export class Visual implements IVisual {
    private svg: Selection<SVGElement>;
    private g: Selection<SVGElement>;
    private path;

    private dataModel: DataModel;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.svg = d3.select(options.element).append('svg');
        this.g = this.svg.append('g');
        this.settings = new VisualSettings;
    }

    public update(options: VisualUpdateOptions) {
        console.log("update");
        var _this = this;        

        //parse des settings
        this.settings = VisualSettings.parse(options.dataViews[0]);
        //parse datamodel
        this.dataModel = Visual.parseDataModel(options.dataViews[0], this.settings);

        //delete previous drawing
        this.svg.selectAll('.path').remove()
        this.svg.selectAll('#legend').remove();
        this.svg.selectAll('#legendAxis').remove();

        //visual size
        var width = options.viewport.width;
        var height = options.viewport.height;

        this.svg.attr('width', width);
        this.svg.attr('height', height);

        this.g.attr('width', width);
        this.g.attr('height', height);

        //échelle
        //TODO: alligner l'échelle avec le graphe
        var xpos:number = Math.round(width*0.15);
        var ypos:number = Math.round(width*0.1);
        
        var legend = this.svg.append('g')
            .attr('id', 'legend')
            .attr('transform', 'translate('+xpos+','+ypos+')'); 

        legend.selectAll('.colorbar')
            .data(d3.range(this.settings.scale.rangeLevel))
            .enter()
            .append('rect')
            .attr('x','0px')
            .attr('y',function(d){return d*40+'px'})
            .attr('height','40px')
            .attr('width','40px')
            .attr('fill',function(d){return _this.settings.scale.colors.getColor(d); })

        //axe gradué

        var legendScale = d3.scaleLinear()
            .domain([0,this.dataModel.maxValue])
            .range([0,this.settings.scale.rangeLevel*40]);
        xpos = xpos - 10;


        var legendAxis = this.svg.append('g')
            .attr('id','legendAxis')
            .attr('transform','translate('+xpos+','+ypos+')')
            .call(d3.axisLeft(legendScale).ticks(5));


        //projection
        var projection = d3.geoConicConformal()
            .center([2.454071, 46.279229])
            .scale(2600)
            .translate([width / 2, height / 2]);

        //drawing
        this.path = d3.geoPath().projection(projection);

        this.g
            .selectAll('path')
            .data(this.dataModel.data)
            .enter()
            .append('path')
            .attr('class', 'path')
            .attr('d', function (d) { return _this.path(d.mapData) })
            .attr('id', function (d) { return d.name })
            .attr('fill', function (d) { return d.color })
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        var objectName = options.objectName;
        var objectEnumeration: VisualObjectInstance[] = [];

        switch (objectName) {
            case 'map':
                objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        mapBackground: this.settings.mapBackground.selectedMap
                    },
                    selector: null
                })
                break;
        }
        return objectEnumeration;
    }

    //fonction de parse des datapoints
    public static parseDataModel(dataView: DataView, settings: VisualSettings): DataModel {
        var dps: DataPoint[] = [];
        var values: number[] = dataView.categorical.values[0].values as number[];
        var categories: string[] = dataView.categorical.categories[0].values as string[];
        var categoriesSimple = util.simplifyStringArray(categories);

        var min: number = dataView.categorical.values[0].minLocal as number;
        var max: number = dataView.categorical.values[0].maxLocal as number;

        //on récupère le fond de carte si il est selectionner ou régions par défaut
        var map: string = settings.mapBackground.selectedMap ? settings.mapBackground.selectedMap : "regions";
        var geo = geoProvider.getJson(map);

        var quantile = d3.scaleQuantile()
            .domain([0, max])
            .range(d3.range(settings.scale.rangeLevel));

        for (var i = 0; i < geo.features.length; ++i) {
            //récupération du nom de la forme
            var name = geo.features[i].properties.nom;
            //récupération du tracer de la forme
            var feat = geo.features[i];
            //assignation de la valeur
            var nameSimple = util.simplifyString(name);
            var value = util.valueMatcher(nameSimple, values, categoriesSimple);
            //création de la couleur
            var color = settings.scale.colors.getColor(quantile(value));

            var dp: DataPoint = { name: name, mapData: feat, value: value, color: color};
            dps.push(dp);
        }

        //resultat
        var model: DataModel = { data: dps, minValue: min, maxValue: max };
        return model;
    }

    public destroy(): void { }
}
