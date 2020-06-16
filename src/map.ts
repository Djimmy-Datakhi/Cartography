import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import {DataModel} from "./dataModel"
import { VisualSettings } from "./settings";

export class Map {
    private div:Selection<SVGElement>;
    private path;

    constructor(svg:Selection<SVGElement>){
        this.div = svg.append('g');
    }

    public erase(){
        this.div.selectAll('.path').remove();
    }

    public draw(dataModel: DataModel,settings: VisualSettings,selectionManager: ISelectionManager,x:number,y:number){
        var _this = this;

        //supprimer le dessin précédent
        this.erase();

        //creation de la fonction de traçage
        var projection = d3.geoConicConformal()
        .center([2.454071, 46.279229]) //centre de la forme
        .scale(2600) //zoom
        .translate([x, y]) //on place la carte au centre de la div

        this.path = d3.geoPath().projection(projection); //on initialise la fonction de traçage avec la prise en compte de la projection

        var xtot = 0;
        var ytot = 0;
        var len = dataModel.data.length;
        for(var i = 0; i <len  ;++i){
            var center = this.path.centroid(dataModel.data[i].mapData);
            xtot = xtot + center[0];
            ytot = ytot + center[1];
        }
        var centroid = [x - (xtot/len), y - (ytot/len)]; 
        console.log(x+" "+y);
        console.log(centroid[0]+ " " + centroid[1]);
        
        //dessin
        this.div //on dessine les formes une par une
            .selectAll('path')
            .data(dataModel.data)
            .enter()
            .append('path')
            .attr('class', 'path')
            .attr('d', function (d) { return _this.path(d.mapData) }) //dessin de la forme
            .attr('id', function (d) { return d.name }) //nom de la forme
            .attr('fill', function (d) { return d.color }) //couleur
            .on('click', function (d) { //gestion du clic droit
                selectionManager.select(d.selectionId);
            })
            .on('contextmenu', function (d) { //gestion du clic gauche
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                selectionManager.showContextMenu(d.selectionId, {
                    x: mouseEvent.clientX,
                    y: mouseEvent.clientY
                });
                mouseEvent.preventDefault();
            });

        this.div.transition().duration(750).attr("transform","translate("+centroid[0]+","+centroid[1]+")scale("+1+")");
    }
}