import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import {DataModel} from "./dataModel"
import { VisualSettings } from "./settings";
import { util } from "./utility";

export class Map {
    private div:Selection<SVGElement>;
    private path;

    constructor(svg:Selection<SVGElement>){
        this.div = svg.append('g');
    }

    public erase(){
        this.div.selectAll('.path').remove();
    }

    public draw(dataModel: DataModel,settings: VisualSettings,selectionManager: ISelectionManager,x:number,y:number,viewPortW:number,viewPortH){
        var _this = this;

        //supprimer le dessin précédent
        this.erase();

        //creation de la fonction de traçage
        var projection = d3.geoConicConformal()
        .center([2.454071, 46.279229]) //centre de la france
        .scale(2600) //zoom
        .translate([x, y]) //on place la carte au centre de la div

        this.path = d3.geoPath().projection(projection); //on initialise la fonction de traçage avec la prise en compte de la projection        
        
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
        
        var scale = settings.mapBackground.drillLevel * 2;
        scale = scale == 0 ? 1 : scale;
        var translate = util.getTranslation(dataModel,this.path,x,y);
        console.log(translate[0]+" "+translate[1]);
        //console.log(util.getZoomScale(dataModel,this.path,viewPortW,viewPortH));
        
        //this.div.transition().duration(750).attr("transform","scale("+scale+")");

        this.div
        .transition().duration(750)
        .attr("transform","translate("+(-(scale-1)*x +translate[0]*scale)+","+(-(scale-1)*y + translate[1]*scale)+")scale("+scale+")")
        
       // .transition().duration(750).attr("transform","scale("+scale+")");

    }
}