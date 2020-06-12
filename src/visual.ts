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
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionId = powerbi.extensibility.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import * as geoProvider from './geoJsonProvider';
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";
import { util } from "./utility";

interface DataPoint {
    mapData; //donné de la forme géographique
    name: string; //nom de la forme
    color: string; //couleur de la forme
    value: number; //valeur de la forme
    selectionId: ISelectionId; //Id permettant le drilldown
}

interface DataModel {
    data: DataPoint[]; //tableau de datapoint
    minValue: number; //valeur minimal du dataview
    maxValue: number; //valeur maximal du dataview
}

export class Visual implements IVisual {
    private svg: Selection<SVGElement>; //div principale
    private g: Selection<SVGElement>; //div contenant les graphiques
    private path; //fonction qui permet de le tracé des formes
    private host:IVisualHost;
    private selectionManager: ISelectionManager;

    private dataModel: DataModel;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.svg = d3.select(options.element).append('svg');
        this.g = this.svg.append('g');
        this.settings = new VisualSettings;
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
    }

    public update(options: VisualUpdateOptions) {
        console.log("update");
        var _this = this; //permet d'accéder à this quand il y a un changement de scope (les lambda par ex)

        //parse des settings
        this.settings = VisualSettings.parse(options.dataViews[0]);
        //parse du datamodel
        this.dataModel = Visual.parseDataModel(options.dataViews[0], this.settings,this.host);

        //supprimer le dessin précédent
        this.svg.selectAll('.path').remove() //suppression des formes
        this.svg.selectAll('#legend').remove(); //suppression de l'échelle de couleur
        this.svg.selectAll('#legendAxis').remove(); //suppression de l'axe de l'échelle de couleur

        //Attribution de la taille aux div
        var width = options.viewport.width;
        var height = options.viewport.height;

        this.svg.attr('width', width);
        this.svg.attr('height', height);

        this.g.attr('width', width);
        this.g.attr('height', height);

        //TODO: alligner l'échelle avec le graphe
        //échelle de couleur
        var xpos:number = Math.round(width*0.15);
        var ypos:number = Math.round(width*0.1);
        
        var legend = this.svg.append('g') //on va supperposer les carréer de couleur pour créer notre échelle de couleur
            .attr('id', 'legend')
            .attr('transform', 'translate('+xpos+','+ypos+')')
            .selectAll('.colorbar')
            .data(d3.range(this.settings.scale.rangeLevel))
            .enter()
            .append('rect')
            .attr('x','0px')
            .attr('y',function(d){return d*40+'px'})
            .attr('height','40px')
            .attr('width','40px')
            .attr('fill',function(d){return _this.settings.scale.colors.getColor(d); })

        //axe gradué
        var legendScale = d3.scaleLinear() //échelle linéaire pour nous permettre d'afficher les valeurs
            .domain([0,this.dataModel.maxValue])
            .range([0,this.settings.scale.rangeLevel*40]);
        xpos = xpos - 10; //Pour décaler l'axe pour qu'il ne soit pas collé à l'échelle

        var legendAxis = this.svg.append('g') //création de l'axe
            .attr('id','legendAxis')
            .attr('transform','translate('+xpos+','+ypos+')')
            .call(d3.axisLeft(legendScale).ticks(5));


        //projection
        var projection = d3.geoConicConformal()
            .center([2.454071, 46.279229])  //centré sur la france
            .scale(2600) //zoom
            .translate([width / 2, height / 2]); //on place la carte au centre de la div
        
        //dessin
        this.path = d3.geoPath().projection(projection); //on initialise la fonction de traçage avec la prise en compte de la projection

        this.g //on dessine les formes une par une
            .selectAll('path')
            .data(this.dataModel.data)
            .enter()
            .append('path')
            .attr('class', 'path')
            .attr('d', function (d) { return _this.path(d.mapData) })
            .attr('id', function (d) { return d.name })
            .attr('fill', function (d) { return d.color })
            .on('click',function(d){ //gestion du clic droit
                _this.selectionManager.select(d.selectionId);
            })
            .on('contextmenu',function(d){ //gestion du clic gauche
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                _this.selectionManager.showContextMenu(d.selectionId,{
                    x: mouseEvent.clientX,
                    y: mouseEvent.clientY
                });
                mouseEvent.preventDefault();
            })
    }

/*
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        var objectName = options.objectName;
        var objectEnumeration: VisualObjectInstance[] = [];

        switch (objectName) {
            case 'map':
                objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        mapBackground: this.settings.mapBackground.selectedMap //choix du fond de carte, est utiliser pour l'appel de geoJsonProvider
                    },
                    selector: null
                })
                break;
        }
        return objectEnumeration;
    }
 */

    //fonction de parse des datapoints
    public static parseDataModel(dataView: DataView, settings: VisualSettings,host: IVisualHost): DataModel {
        var dps: DataPoint[] = [];
        var values: number[] = dataView.categorical.values[0].values as number[];
        var categories: string[] = dataView.categorical.categories[0].values as string[];
        var categoriesSimple = util.simplifyStringArray(categories); //on simplifie le nom des catégorie pour facilité le matching avec le nom des formes

        //valeur extréme du dataview //TODO: chercher la min et max des formes qui sont réellement déssiner
        var minValue: number = dataView.categorical.values[0].minLocal as number;
        var maxValue: number = dataView.categorical.values[0].maxLocal as number;

        //on récupère le fond de carte si il y en a un de selectionner ou régions par défaut
        var map: string = settings.mapBackground.selectedMap ? settings.mapBackground.selectedMap : "regions";
        var geo = geoProvider.getJson(map);
        

        //on créer la fonction d'échelle d3. Cela permettras de définir la couleur de la forme en fonction de la valeur
        var quantile = d3.scaleQuantile()
            .domain([0, maxValue])
            .range(d3.range(settings.scale.rangeLevel));

        //on boucle sur les formes, pour récupérer les informations
        for (var i = 0; i < geo.features.length; ++i) {
            //récupération du nom de la forme
            var name = geo.features[i].properties.nom;
            //récupération de l'index de catégories et values correspondant à la forme traité
            var nameSimple = util.simplifyString(name); //on simplifie le nom de la forme pour faciliter le matching avec le nom des catégories
            var index = util.valueMatcher(nameSimple, categoriesSimple);
            if(index == -1) //Si l'index retourner est 0, on passe a l'ittération suivante
                continue
            //Si il n'y a pas de match, on passe à l'itération suivante
            //récupération du tracer de la forme
            var feat = geo.features[i];      
            //assignation de la valeur
            var value = values[index];
            //création de la couleur
            var color = settings.scale.colors.getColor(quantile(value)); //on utilise la fonction d'échelle créer précedemment
            //création de l'id de selection de la forme
            var selectionId = host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0],index).createSelectionId()

            var dp: DataPoint = { name: name, mapData: feat, value: value, color: color,selectionId:selectionId};
            dps.push(dp);
        }

        //resultat
        var model: DataModel = { data: dps, minValue: minValue, maxValue: maxValue};
        return model;
    }

    public destroy(): void { }
}
