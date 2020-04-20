import 'bootstrap';
import helpers from './helper';
import './all.scss';
import go from 'gojs';
import Graph from './graph';

if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
var $ = go.GraphObject.make;  // for more concise visual tree definitions

// colors used, named for easier identification
var blue = "#0288D1";
var pink = "#B71C1C";
var pinkfill = "#F8BBD0";
var bluefill = "#B3E5FC";

var myDiagram =
  $(go.Diagram, "myDiagramDiv", {
      initialAutoScale: go.Diagram.Uniform,
      layout: $(go.LayeredDigraphLayout)
    });

// The node template shows the activity name in the middle as well as
// various statistics about the activity, all surrounded by a border.
// The border's color is determined by the node data's ".critical" property.
// Some information is not available as properties on the node data,
// but must be computed -- we use converter functions for that.
myDiagram.nodeTemplate =
$(go.Node, "Auto",
    $(go.Shape, "RoundedRectangle",  // the border
        { fill: "white", strokeWidth: 2 },
        new go.Binding("fill", "critical", function(b) { return (b ? pinkfill : bluefill); }),
        new go.Binding("stroke", "critical", function(b) { return (b ? pink : blue); })
    ),
    $(go.Panel, "Table",
        { padding: 0.5 },
        $(go.RowColumnDefinition, { column: 1, separatorStroke: "black" }),
        $(go.RowColumnDefinition, { column: 2, separatorStroke: "black" }),
        $(go.RowColumnDefinition, { row: 1, separatorStroke: "black", background: "white", coversSeparators: true }),
        $(go.RowColumnDefinition, { row: 2, separatorStroke: "black" }),
        $(go.TextBlock, // earlyStart
            new go.Binding("text", "earlyStart"),
            { row: 0, column: 0, margin: 5, textAlign: "center" }),
        $(go.TextBlock,
            new go.Binding("text", "length"),
            { row: 0, column: 1, margin: 5, textAlign: "center" }),
        $(go.TextBlock,  // earlyFinish
            new go.Binding("text", "earlyFinish"),
            // function(d) { return (d.earlyStart + d.length).toFixed(2); }),
            { row: 0, column: 2, margin: 5, textAlign: "center" }),

        $(go.TextBlock,
            new go.Binding("text", "text"),
            {
            row: 1, column: 0, columnSpan: 3, margin: 5,
            textAlign: "center", font: "bold 14px sans-serif"
            }),

        $(go.TextBlock,  // lateStart
            new go.Binding("text", "lateStart"),
            { row: 2, column: 0, margin: 5, textAlign: "center" }),
        $(go.TextBlock,  // slack
            new go.Binding("text", "",
            function(d) { return (d.lateFinish - (d.earlyStart + d.length)); }),
            { row: 2, column: 1, margin: 5, textAlign: "center" }),
        $(go.TextBlock, // lateFinish
            new go.Binding("text", "lateFinish"),
            { row: 2, column: 2, margin: 5, textAlign: "center" })
    )  // end Table Panel
);  // end Node

 // The link data object does not have direct access to both nodes
// (although it does have references to their keys: .from and .to).
// This conversion function gets the GraphObject that was data-bound as the second argument.
// From that we can get the containing Link, and then the Link.fromNode or .toNode,
// and then its node data, which has the ".critical" property we need.
//
// But note that if we were to dynamically change the ".critical" property on a node data,
// calling myDiagram.model.updateTargetBindings(nodedata) would only update the color
// of the nodes.  It would be insufficient to change the appearance of any Links.
function linkColorConverter(linkdata, elt) {
    var link = elt.part;
    if (!link) return blue;
    var f = link.fromNode;
    if (!f || !f.data || !f.data.critical) return blue;
    var t = link.toNode;
    if (!t || !t.data || !t.data.critical) return blue;
    return pink;  // when both Link.fromNode.data.critical and Link.toNode.data.critical
}

// The color of a link (including its arrowhead) is red only when both
// connected nodes have data that is ".critical"; otherwise it is blue.
// This is computed by the binding converter function.
myDiagram.linkTemplate =
    $(go.Link,
        {   
            toShortLength: 6, 
            toEndSegmentLength: 20,
        },
        $(go.Shape,
            { strokeWidth: 4 },
            new go.Binding("stroke", "", linkColorConverter)
        ),
        $(go.Shape,  // arrowhead
            { toArrow: "Triangle", stroke: null, scale: 1.5 },
            new go.Binding("fill", "", linkColorConverter)
        )
    );

/**
 * Example usage.
 **/

// here's the data defining the graph
var nodeDataArray = [
    { key: 1, text: "1", length: 1, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 2, text: "2", length: 9, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 3, text: "3", length: 17, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 4, text: "4", length: 9, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 5, text: "5", length: 2, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 6, text: "6", length: 10, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 7, text: "7", length: 12, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 8, text: "8", length: 5, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 9, text: "9", length: 17, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 10, text: "10", length: 3, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 11, text: "11", length: 14, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 12, text: "12", length: 3, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 13, text: "13", length: 10, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 14, text: "14", length: 4, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 15, text: "15", length: 9, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
    { key: 16, text: "16", length: 3, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false },
];

var linkDataArray = [
    { from: 1, to: 2, mode: 'FS'},
    { from: 1, to: 3, mode: 'FS'},
    { from: 1, to: 4, mode: 'FS'},
    { from: 2, to: 5, mode: 'FS'},
    { from: 2, to: 6, mode: 'FS'},
    { from: 6, to: 8, mode: 'FS'},
    { from: 8, to: 12, mode: 'FS'},
    { from: 9, to: 11, mode: 'FS'},
    { from: 12, to: 13, mode: 'FS'},
    { from: 11, to: 13, mode: 'FS'},
    { from: 13, to: 15, mode: 'FS'},
    { from: 4, to: 7, mode: 'FS'},
    { from: 8, to: 10, mode: 'FS'},
    { from: 10, to: 14, mode: 'FS'},
    { from: 7, to: 9, mode: 'FS'},
    { from: 5, to: 8, mode: 'FS'},
    { from: 3, to: 8, mode: 'FS'},
    { from: 6, to: 14, mode: 'FS'},
    { from: 14, to: 16, mode: 'FS'},
    { from: 15, to: 16, mode: 'FS'},
];

// convert obj array to array array structure
const graph = helpers.objArr2ArrArr(linkDataArray); 

// list all paths
var paths = Graph.paths({
    graph,
    from: '1',
    to: '16'
});

// add critical path
nodeDataArray = Graph.addCriticalPath(nodeDataArray, paths); 

// add all dependencies items
Graph.fillRestItem(nodeDataArray, graph);

// draw the PERT plot  
myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray); 

// create an unbound Part that acts as a "legend" for the diagram
myDiagram.add(
$(go.Node, "Auto",
    $(go.Shape, "RoundedRectangle",  // the border
    { fill: bluefill }),
    $(go.Panel, "Table",
    $(go.RowColumnDefinition, { column: 1, separatorStroke: "black" }),
    $(go.RowColumnDefinition, { column: 2, separatorStroke: "black" }),
    $(go.RowColumnDefinition, { row: 1, separatorStroke: "black", background: "white", coversSeparators: true }),
    $(go.RowColumnDefinition, { row: 2, separatorStroke: "black"}),
    $(go.TextBlock, "最早開始時間",
        { row: 0, column: 0, margin: 5, textAlign: "center" }),
    $(go.TextBlock, "工期",
        { row: 0, column: 1, margin: 5, textAlign: "center" }),
    $(go.TextBlock, "最早完成時間",
        { row: 0, column: 2, margin: 5, textAlign: "center" }),

    $(go.TextBlock, "工項名稱",
        {
            row: 1, column: 0, columnSpan: 3, margin: 5,
            textAlign: "center", font: "bold 14px sans-serif",
        }),
    $(go.TextBlock, "最晚開始時間",
        { row: 2, column: 0, margin: 5, textAlign: "center" }),
    $(go.TextBlock, "浮時",
        { row: 2, column: 1, margin: 5, textAlign: "center" }),
    $(go.TextBlock, "最晚完成時間",
        { row: 2, column: 2, margin: 5, textAlign: "center" })
    )  // end Table Panel
));

var controlPannel = new Vue({
    el: '#control-panel',
    data: {
        todo: nodeDataArray
    }
});

// graph try
// var nodeDataArrayTry = [
//     { key: 1, text: "1", length: 1, earlyStart: 0, lateFinish: 0, critical: 0 },
//     { key: 2, text: "2", length: 3, earlyStart: 0, lateFinish: 0, critical: 0 },
//     { key: 3, text: "3", length: 1, earlyStart: 0, lateFinish: 0, critical: 0 },
//     { key: 4, text: "4", length: 2, earlyStart: 0, lateFinish: 0, critical: 0 },
//     { key: 5, text: "5", length: 2, earlyStart: 0, lateFinish: 0, critical: 0 },
//     { key: 6, text: "6", length: 1, earlyStart: 0, lateFinish: 0, critical: 0 },
//     { key: 7, text: "7", length: 2, earlyStart: 0, lateFinish: 0, critical: 0 },
//     { key: 8, text: "8", length: 1, earlyStart: 0, lateFinish: 0, critical: 0 }
// ];

// var linkDataArrayTry = [ 
//     { from: 1, to: 2 },
//     { from: 1, to: 3 },
//     { from: 1, to: 4 },
//     { from: 2, to: 5 },
//     { from: 2, to: 6 },
//     { from: 3, to: 7 },
//     { from: 4, to: 7 },
//     { from: 5, to: 8 },
//     { from: 6, to: 8 },
//     { from: 7, to: 8 }
// ];

