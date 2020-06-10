/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import {ColorScale} from "./colorScale";

class MapBackgroundSetting {
  public selectedMap: string = "regions";
}

class ScaleSetting {
  public rangeLevel: number = 6;
  public colors:ColorScale = new ColorScale;
}

export class VisualSettings {
  public mapBackground: MapBackgroundSetting = new MapBackgroundSetting;
  public scale: ScaleSetting = new ScaleSetting;

  public static parse(dataview:DataView):VisualSettings{
    var setting:VisualSettings = new VisualSettings;

    //map background setting
    //setting.mapBackground.selectedMap = dataview.metadata.objects["map"]["mapBackground"] as string;
    setting.mapBackground.selectedMap = "regions";

    //color scale setting
    setting.scale.rangeLevel = 6;
    setting.scale.colors.setColor('#FFFF00','#FF0000');
    setting.scale.colors.setRange(6);

    return setting;
  }
}


