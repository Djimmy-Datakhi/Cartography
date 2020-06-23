import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.extensibility.ISelectionId;

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { DataModel } from "./dataModel"
import { VisualSettings } from "./settings";
import { util } from "./utility";
import { ITooltipServiceWrapper, TooltipEventArgs } from "./toolTip";

export class Map {
    private div: Selection<SVGElement>;
    private path;
    private previousSelected: ISelectionId;

    constructor(svg: Selection<SVGElement>) {
        this.div = svg.append('g');
    }

    public erase() {
        this.div.selectAll('.path').remove();
    }

    private static getTooltipData(value: any) {
        return [{
            displayName: value.name,
            value: value.value.toString()
        }];
    }

    private selected(shape: SVGPathElement,scale:number) {
        d3.select(shape)
            .style('opacity', 1)
            .style('stroke-width', 1/scale)
            .style('stroke', 'black');
    }

    private unselected(shape: SVGPathElement) {
        d3.select(shape)
            .style('opacity', 0.5)
            .style('stroke-width', 0);
    }

    private neutral(shape: SVGElement) {
        d3.select(shape)
            .style('opacity', 1)
            .style('stroke-width', 0);
    }

    public draw(dataModel: DataModel, settings: VisualSettings, selectionManager: ISelectionManager, x: number, y: number, toolTip: ITooltipServiceWrapper) {
        var _this = this;

        //supprimer le dessin précédent
        this.erase();

        //creation de la fonction de traçage
        var projection = d3.geoConicConformal()
            .center([2.454071, 47.279229]) //centre de la france
            .scale(2600) //zoom
            .translate([x, y]) //on place la carte au centre de la div

        this.path = d3.geoPath().projection(projection); //on initialise la fonction de traçage avec la prise en compte de la projection        

        //on calcule le zoom et la translation a appliquer
        var scale = util.getZoomScale(dataModel, this.path, x, y * 2); //on considère la hauteur entière car on veut que la forme prenne toute la hauteur de la div
        var translate = util.getTranslation(dataModel, this.path, x, y, scale);

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
            .each(function (d) {
                //si une forme est sélectionner
                console.log("hasSelection : " + selectionManager.hasSelection());
                if (selectionManager.hasSelection()) {
                    if (JSON.stringify(_this.previousSelected) === JSON.stringify(d.selectionId)) { //update créer une nouvelle instance de selectionId, il faut donc trouve un autre moyen de tester l'égalité. 
                        _this.selected(this as SVGPathElement,scale);
                    }
                    //sinon en transparent
                    else {
                        _this.unselected(this as SVGPathElement);
                    }
                }
                //si pas de région sélectionner
                else {
                    //si il y a un highlight
                    if (d.highlight != null) {
                        //cette forme n'est pas sélectionner
                        if (d.highlight === 0) {
                            _this.unselected(this as SVGPathElement);
                        }
                        else {
                            //elle est sélectionner
                            _this.selected(this as SVGPathElement,scale);
                        }
                    }
                    else {
                        //si il n'y en a pas de highlight
                        _this.neutral(this as SVGPathElement);
                    }
                }
            })
            .on('click', function (d) { //gestion du clic droit
                //si on clic sur la forme déja sélectionner, on la désélectionne
                console.log(_this.previousSelected)
                console.log(d.selectionId)
                if (selectionManager.hasSelection() && JSON.stringify(_this.previousSelected) === JSON.stringify(d.selectionId)) {
                    _this.previousSelected = null
                    d3.selectAll('path').each(function () { _this.neutral(this as SVGPathElement); })
                    selectionManager.clear();
                    console.log("deselection")
                }
                //sinon on sélectionne la forme cliquer
                else {
                    _this.previousSelected = d.selectionId;
                    d3.selectAll('path').each(function () { _this.unselected(this as SVGPathElement) })
                    d3.select(this).each(function () { _this.selected(this as SVGPathElement,scale)})
                    selectionManager.select(d.selectionId);
                    console.log("selection")
                }             
            })
            .on('contextmenu', function (d) { //gestion du clic gauche
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                selectionManager.showContextMenu(d.selectionId, {
                    x: mouseEvent.clientX,
                    y: mouseEvent.clientY
                });
                mouseEvent.preventDefault();
            })
            .each(function (d) {

            });

        //animation
        this.div
            .transition().duration(750)
            .attr("transform", "translate(" + translate[0] + "," + translate[1] + ")scale(" + scale + ")")

        //tooltip
        if (settings.tooltip.show) {
            toolTip.addTooltip(this.div.selectAll('path'),
                (tooltipEvent: TooltipEventArgs<number>) => Map.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);
        }


    }
}