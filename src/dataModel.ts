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
}

export interface DataModel {
    data: DataPoint[]; //tableau de datapoint
    minValue: number; //valeur minimal du dataview
    maxValue: number; //valeur maximal du dataview
    centroid: [number, number];
    scale: number;
}

export function parseDataModel(dataView: DataView, settings: VisualSettings, host: IVisualHost): DataModel {
    var dps: DataPoint[] = [];
    var values: number[] = dataView.categorical.values[0].values as number[];
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

    //on va chercher les bordure min et max pour trouver le zoom adéquat et le centre de notre map
    var maxBound: [number, number] = [-180, -90];
    var minBound: [number, number] = [180, 90];

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

        //on cherche si on a trouvé une nouvelles bordure
        var bound: [[number, number], [number, number]] = d3.geoBounds(feat);
        maxBound = util.getMaxCoord(maxBound, bound[1]);
        minBound = util.getMinCoord(minBound, bound[0]);

        //assignation de la valeur
        var value = values[index];

        //création de la couleur
        var color = settings.scale.colors.getColor(quantile(value)); //on utilise la fonction d'échelle créer précedemment

        //création de l'id de selection de la forme
        var selectionId = host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], index).createSelectionId()

        var dp: DataPoint = { name: name, mapData: feat, value: value, color: color, selectionId: selectionId };
        dps.push(dp);
    }

    //a partir des bordures précedemment calculé, on définir le centroid
    var centroid: [number, number] = util.getCentroid(maxBound, minBound);
    //calcul du zoom en fonction des bordures
    var scale = util.getZoomScale(maxBound, minBound);

    //resultat
    var model: DataModel = { data: dps, minValue: minValue, maxValue: maxValue, centroid: centroid, scale: scale };
    return model;
}