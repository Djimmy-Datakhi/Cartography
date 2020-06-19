import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.extensibility.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import * as geoProvider from './geoJsonProvider';
import * as d3 from "d3";
import { util } from "./utility";
import { VisualSettings } from "./settings";

export interface DataPoint {
    mapData; //donné de la forme géographique
    name: string; //nom de la forme
    color: string; //couleur de la forme
    value: number; //valeur de la forme
    selectionId: ISelectionId; //Id permettant le drilldown
    highlight: number; //valeur highlight, null si aucune valeur n'est highlight, 0 sinon
}

export interface DataModel {
    data: DataPoint[]; //tableau de datapoint
    minValue: number; //valeur minimal du dataview
    maxValue: number; //valeur maximal du dataview
}

export function parseDataModel(dataView: DataView, settings: VisualSettings, host: IVisualHost): DataModel {
    var dps: DataPoint[] = [];
    var values: number[] = dataView.categorical.values[0].values as number[];
    var highlight:number[] = dataView.categorical.values[0].highlights as number[];
    var categories: string[] = dataView.categorical.categories[0].values as string[];
    var categoriesSimple = util.simplifyStringArray(categories); //on simplifie le nom des catégorie pour facilité le matching avec le nom des formes

    //valeur extréme du dataview
    var minValue: number = dataView.categorical.values[0].minLocal as number;
    var maxValue: number = dataView.categorical.values[0].maxLocal as number;

    //on récupère le fond de carte si il y en a un de selectionner ou régions par défaut
    var map: string = settings.mapBackground.selectedMap ? settings.mapBackground.selectedMap : "regions";
    var geo = geoProvider.getJson(map);

    //on créer la fonction d'échelle d3. Cela permettras de définir la couleur de la forme en fonction de la valeur
    var quantile = d3.scaleQuantile()
        .domain([0, maxValue])
        .range(d3.range(settings.scale.rangeLevel));

    //booleen pour savoir si il y a une valeur highlighté
    var hasHighlight:boolean = highlight ? true : false;

    //on boucle sur les formes, pour récupérer les informations
    for (var i = 0; i < geo.features.length; ++i) {
        //récupération du nom de la forme
        var name = geo.features[i].properties.nom;

        //récupération de l'index de catégories et values correspondant à la forme traité
        var nameSimple = util.simplifyString(name); //on simplifie le nom de la forme pour faciliter le matching avec le nom des catégories
        var index = util.valueMatcher(nameSimple, categoriesSimple);
        if (index == -1) //Si l'index retourner est 0, on passe a l'ittération suivante
            continue

        //récupération du tracer de la forme
        var feat = geo.features[i];

        //assignation de la valeur
        var value = values[index];

        
        var highVal = null;
        //si il y a un highlight
        if(hasHighlight){
            //et que cette forme est highlighté, on récupère sa valeur, sinon on la met a 0
            highVal = highlight[index] ? highlight[index] : 0;
        }
        //si il n'y a pas de highlight, on garde la valeur null.

        //création de la couleur
        var color = settings.scale.colors.getColor(quantile(value)); //on utilise la fonction d'échelle créer précedemment

        //création de l'id de selection de la forme
        var selectionId = host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], index).createSelectionId()

        var dp: DataPoint = { name: name, mapData: feat, value: value, color: color, selectionId: selectionId, highlight: highVal };
        dps.push(dp);
    }

    //resultat
    var model: DataModel = { data: dps, minValue: minValue, maxValue: maxValue };
    return model;
}