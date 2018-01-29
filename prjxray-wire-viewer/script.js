
  function init() {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;  //for conciseness in defining node templates

    myDiagram =
      $(go.Diagram, "myDiagramDiv",  //Diagram refers to its DIV HTML element by id
        { initialContentAlignment: go.Spot.Center, "undoManager.isEnabled": true });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function(e) {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });

    // To simplify this code we define a function for creating a context menu button:
    function makeButton(text, action, visiblePredicate) {
      return $("ContextMenuButton",
               $(go.TextBlock, text),
               { click: action },
               // don't bother with binding GraphObject.visible if there's no predicate
               visiblePredicate ? new go.Binding("visible", "", function(o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
    }

    var nodeMenu =  // context menu for each Node
      $(go.Adornment, "Vertical",
        makeButton("Copy",
                   function(e, obj) { e.diagram.commandHandler.copySelection(); }),
        makeButton("Delete",
                   function(e, obj) { e.diagram.commandHandler.deleteSelection(); }),
        $(go.Shape, "LineH", { strokeWidth: 2, height: 1, stretch: go.GraphObject.Horizontal }),
        makeButton("Add top port",
                   function (e, obj) { addPort("top"); }),
        makeButton("Add left port",
                   function (e, obj) { addPort("left"); }),
        makeButton("Add right port",
                   function (e, obj) { addPort("right"); }),
        makeButton("Add bottom port",
                   function (e, obj) { addPort("bottom"); })
      );

    var portSize = new go.Size(8, 8);

    var portMenu =  // context menu for each port
      $(go.Adornment, "Vertical",
        makeButton("Remove port",
                   // in the click event handler, the obj.part is the Adornment;
                   // its adornedObject is the port
                   function (e, obj) { removePort(obj.part.adornedObject); }),
        makeButton("Change color",
                   function (e, obj) { changeColor(obj.part.adornedObject); }),
        makeButton("Remove side ports",
                   function (e, obj) { removeAll(obj.part.adornedObject); })
      );

    // the node template
    // includes a panel on each side with an itemArray of panels containing ports
    myDiagram.nodeTemplate =
      $(go.Node, "Table",
        { locationObjectName: "BODY",
          locationSpot: go.Spot.Center,
          selectionObjectName: "BODY",
          contextMenu: nodeMenu
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

        // the body
        $(go.Panel, "Auto",
          { row: 1, column: 1, name: "BODY",
            stretch: go.GraphObject.Fill },
          $(go.Shape, "Rectangle",
            { fill: "#AC193D", stroke: null, strokeWidth: 0,
              minSize: new go.Size(56, 56) },  new go.Binding("fill", "fillColor")),
          $(go.TextBlock,
            { margin: 10, textAlign: "center", font: "14px  Segoe UI,sans-serif", stroke: "black", editable: true },
            new go.Binding("text", "name").makeTwoWay())
        ),  // end Auto Panel body

        // the Panel holding the left port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.leftArray
        $(go.Panel, "Vertical",
          new go.Binding("itemArray", "leftArray"),
          { row: 1, column: 0,
            itemTemplate:
              $(go.Panel,
                { _side: "left",  // internal property to make it easier to tell which side it's on
                  fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(1,0) },
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        ),  // end Vertical Panel

        // the Panel holding the top port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.topArray
        $(go.Panel, "Horizontal",
          new go.Binding("itemArray", "topArray"),
          { row: 0, column: 1,
            itemTemplate:
              $(go.Panel,
                { _side: "top",
                  fromSpot: go.Spot.Top, toSpot: go.Spot.Top,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(0, 1) },
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        ),  // end Horizontal Panel

        // the Panel holding the right port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.rightArray
        $(go.Panel, "Vertical",
          new go.Binding("itemArray", "rightArray"),
          { row: 1, column: 2,
            itemTemplate:
              $(go.Panel,
                { _side: "right",
                  fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(1, 0) },
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        ),  // end Vertical Panel

        // the Panel holding the bottom port elements, which are themselves Panels,
        // created for each item in the itemArray, bound to data.bottomArray
        $(go.Panel, "Horizontal",
          new go.Binding("itemArray", "bottomArray"),
          { row: 2, column: 1,
            itemTemplate:
              $(go.Panel,
                { _side: "bottom",
                  fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  contextMenu: portMenu },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  { stroke: null, strokeWidth: 0,
                    desiredSize: portSize,
                    margin: new go.Margin(0, 1) },
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }
        )  // end Horizontal Panel
      );  // end Node

    // an orthogonal link template, reshapable and relinkable
    myDiagram.linkTemplate =
      $(CustomLink,  // defined below
        {
          routing: go.Link.AvoidsNodes,
          corner: 4,
          curve: go.Link.JumpGap,
          reshapable: true,
          resegmentable: true,
          relinkableFrom: true,
          relinkableTo: true
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape, { stroke: "#2F4F4F", strokeWidth: 2 })
      );

    // support double-clicking in the background to add a copy of this data as a node
    myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
      name: "Unit",
      leftArray: [],
      rightArray: [],
      topArray: [],
      bottomArray: []
    };

    myDiagram.contextMenu =
      $(go.Adornment, "Vertical",
          makeButton("Paste",
                     function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                     function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
          makeButton("Undo",
                     function(e, obj) { e.diagram.commandHandler.undo(); },
                     function(o) { return o.diagram.commandHandler.canUndo(); }),
          makeButton("Redo",
                     function(e, obj) { e.diagram.commandHandler.redo(); },
                     function(o) { return o.diagram.commandHandler.canRedo(); })
      );

    // load the diagram from JSON data
    load();
  }


  // This custom-routing Link class tries to separate parallel links from each other.
  // This assumes that ports are lined up in a row/column on a side of the node.
  function CustomLink() {
    go.Link.call(this);
  };
  go.Diagram.inherit(CustomLink, go.Link);

  CustomLink.prototype.findSidePortIndexAndCount = function(node, port) {
    var nodedata = node.data;
    if (nodedata !== null) {
      var portdata = port.data;
      var side = port._side;
      var arr = nodedata[side + "Array"];
      var len = arr.length;
      for (var i = 0; i < len; i++) {
        if (arr[i] === portdata) return [i, len];
      }
    }
    return [-1, len];
  };

  /** @override */
  CustomLink.prototype.computeEndSegmentLength = function(node, port, spot, from) {
    var esl = go.Link.prototype.computeEndSegmentLength.call(this, node, port, spot, from);
    var other = this.getOtherPort(port);
    if (port !== null && other !== null) {
      var thispt = port.getDocumentPoint(this.computeSpot(from));
      var otherpt = other.getDocumentPoint(this.computeSpot(!from));
      if (Math.abs(thispt.x - otherpt.x) > 20 || Math.abs(thispt.y - otherpt.y) > 20) {
        var info = this.findSidePortIndexAndCount(node, port);
        var idx = info[0];
        var count = info[1];
        if (port._side == "top" || port._side == "bottom") {
          if (otherpt.x < thispt.x) {
            return esl + 4 + idx * 8;
          } else {
            return esl + (count - idx - 1) * 8;
          }
        } else {  // left or right
          if (otherpt.y < thispt.y) {
            return esl + 4 + idx * 8;
          } else {
            return esl + (count - idx - 1) * 8;
          }
        }
      }
    }
    return esl;
  };

  /** @override */
  CustomLink.prototype.hasCurviness = function() {
    if (isNaN(this.curviness)) return true;
    return go.Link.prototype.hasCurviness.call(this);
  };

  /** @override */
  CustomLink.prototype.computeCurviness = function() {
    if (isNaN(this.curviness)) {
      var fromnode = this.fromNode;
      var fromport = this.fromPort;
      var fromspot = this.computeSpot(true);
      var frompt = fromport.getDocumentPoint(fromspot);
      var tonode = this.toNode;
      var toport = this.toPort;
      var tospot = this.computeSpot(false);
      var topt = toport.getDocumentPoint(tospot);
      if (Math.abs(frompt.x - topt.x) > 20 || Math.abs(frompt.y - topt.y) > 20) {
        if ((fromspot.equals(go.Spot.Left) || fromspot.equals(go.Spot.Right)) &&
            (tospot.equals(go.Spot.Left) || tospot.equals(go.Spot.Right))) {
          var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
          var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
          var c = (fromseglen - toseglen) / 2;
          if (frompt.x + fromseglen >= topt.x - toseglen) {
            if (frompt.y < topt.y) return c;
            if (frompt.y > topt.y) return -c;
          }
        } else if ((fromspot.equals(go.Spot.Top) || fromspot.equals(go.Spot.Bottom)) &&
                   (tospot.equals(go.Spot.Top) || tospot.equals(go.Spot.Bottom))) {
          var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
          var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
          var c = (fromseglen - toseglen) / 2;
          if (frompt.x + fromseglen >= topt.x - toseglen) {
            if (frompt.y < topt.y) return c;
            if (frompt.y > topt.y) return -c;
          }
        }
      }
    }
    return go.Link.prototype.computeCurviness.call(this);
  };
  // end CustomLink class


  // Add a port to the specified side of the selected nodes.
  function addPort(side) {
    myDiagram.startTransaction("addPort");
    myDiagram.selection.each(function(node) {
      // skip any selected Links
      if (!(node instanceof go.Node)) return;
      // compute the next available index number for the side
      var i = 0;
      while (node.findPort(side + i.toString()) !== node) i++;
      // now this new port name is unique within the whole Node because of the side prefix
      var name = side + i.toString();
      // get the Array of port data to be modified
      var arr = node.data[side + "Array"];
      if (arr) {
        // create a new port data object
        var newportdata = {
          portId: name,
          portColor: go.Brush.randomColor()
          // if you add port data properties here, you should copy them in copyPortData above
        };
        // and add it to the Array of port data
        myDiagram.model.insertArrayItem(arr, -1, newportdata);
      }
    });
    myDiagram.commitTransaction("addPort");
  }

  // Remove the clicked port from the node.
  // Links to the port will be redrawn to the node's shape.
  function removePort(port) {
    myDiagram.startTransaction("removePort");
    var pid = port.portId;
    var arr = port.panel.itemArray;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].portId === pid) {
        myDiagram.model.removeArrayItem(arr, i);
        break;
      }
    }
    myDiagram.commitTransaction("removePort");
  }

  // Remove all ports from the same side of the node as the clicked port.
  function removeAll(port) {
    myDiagram.startTransaction("removePorts");
    var nodedata = port.part.data;
    var side = port._side;  // there are four property names, all ending in "Array"
    myDiagram.model.setDataProperty(nodedata, side + "Array", []);  // an empty Array
    myDiagram.commitTransaction("removePorts");
  }

  // Change the color of the clicked port.
  function changeColor(port) {
    myDiagram.startTransaction("colorPort");
    var data = port.data;
    myDiagram.model.setDataProperty(data, "portColor", go.Brush.randomColor());
    myDiagram.commitTransaction("colorPort");
  }


  // Save the model to / load it from JSON text shown on the page itself, not in a database.
  function save() {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;
  }
  function load() {
    // Create the Diagram's Model:
    window.nodeDataArray = [
      {key: 1,
        name: "unit One",
        loc:"101 204",
        leftArray: [ {"portColor":"#425e5c", "portId":"left0"} ],
        topArray: [ {"portColor":"#d488a2", "portId":"top0"} ],
        bottomArray: [ {"portColor":"#316571", "portId":"bottom0"} ],
        rightArray: [ {"portColor":"#923951", "portId":"right0"},{"portColor":"#ef3768", "portId":"right1"} ],
      },
      {
        key: 2,
        name: "unit Two",
        loc:"320 152",
        leftArray: [ {"portColor":"#7d4bd6", "portId":"left0"},{"portColor":"#cc585c", "portId":"left1"},{"portColor":"#b1273a", "portId":"left2"} ],
        topArray: [ {"portColor":"#14abef", "portId":"top0"} ],
        bottomArray: [ {"portColor":"#dd45c7", "portId":"bottom0"},{"portColor":"#995aa6", "portId":"bottom1"},{"portColor":"#6b95cb", "portId":"bottom2"} ],
        rightArray: [  ],
      },
      {
        key: 3,
        name: "unit Three",
        loc:"384 319",
        leftArray: [ {"portColor":"#bd8f27", "portId":"left0"},{"portColor":"#c14617", "portId":"left1"},{"portColor":"#47fa60", "portId":"left2"} ],
        topArray: [ {"portColor":"#d08154", "portId":"top0"} ],
        bottomArray: [ {"portColor":"#6cafdb", "portId":"bottom0"} ],
        rightArray: [  ],
      },
      {
        key: 4,
        name: "unit Four",
        loc:"138 351",
        leftArray: [ {"portColor":"#491389", "portId":"left0"} ],
        topArray: [ {"portColor":"#77ac1e", "portId":"top0"} ],
        bottomArray: [ {"portColor":"#e9701b", "portId":"bottom0"} ],
        rightArray: [ {"portColor":"#24d05e", "portId":"right0"},{"portColor":"#cfabaa", "portId":"right1"} ],
      },
    ];

    nodeDataArray = [];

    // Build map of [x, y] -> tile
    var grid = {};

    // Map of [type] -> [list of tiles with that type]
    var grid_by_type = [];

    // Convert tilegrid.tiles to nodes
    for (var tile_id in tilegrid.tiles) {
      var tile = tilegrid.tiles[tile_id];
      var newNode = {
        key: tile_id,
        name: tile_id,
        type: tile.type,
        loc: (tile.grid_x * 300) + " " + (tile.grid_y * 300),
        grid_x: tile.grid_x,
        grid_y: tile.grid_y,
        leftArray: [],
        topArray: [],
        bottomArray: [],
        rightArray: [],
      };

      grid[[tile.grid_x, tile.grid_y]] = newNode;

      if (!grid_by_type[tile.type])
        grid_by_type[tile.type] = []
      grid_by_type[tile.type].push(newNode);

      if (tile.type == 'CLBLL_L') {
        newNode.fillColor = '#ffffaa';
      } else if (tile.type == 'CLBLL_R') {
        newNode.fillColor = '#ffffaa';
      } else if (tile.type == 'CLBLM_L') {
        newNode.fillColor = '#ffaaaa';
      } else if (tile.type == 'CLBLM_R') {
        newNode.fillColor = '#ffaaaa';
      } else if (tile.type == 'HCLK_L') {
        newNode.fillColor = '#aaffaa';
      } else if (tile.type == 'HCLK_R') {
        newNode.fillColor = '#aaffaa';
      } else if (tile.type == 'INT_L') {
        newNode.fillColor = '#aaaaff';
      } else if (tile.type == 'INT_R') {
        newNode.fillColor = '#aaaaff';
      } else {
        // BRKH_B_TERM_INT, BRKH_CLB, BRKH_INT, HCLK_CLB, HCLK_VBRK,
        // HCLK_VFRAME, NULL, T_TERM_INT, VBRK, VFRAME
        newNode.fillColor = '#aaaaaa';
      }

      nodeDataArray.push(newNode);
    }

    window.linkDataArray = [
      {from: 4, to: 2, fromPort: "top0", toPort: "bottom0"},
      {from: 4, to: 2, fromPort: "top0", toPort: "bottom0"},
      {from: 3, to: 2, fromPort: "top0", toPort: "bottom1"},
      {from: 4, to: 3, fromPort: "right0", toPort: "left0"},
      {from: 4, to: 3, fromPort: "right1", toPort: "left2"},
      {from: 1, to: 2, fromPort: "right0", toPort: "left1"},
      {from: 1, to: 2, fromPort: "right1", toPort: "left2"},
    ];

    linkDataArray = [];

    // Link tiles together
    window.grid = grid;
    for (var tile_coord in grid) {
      var tile = grid[tile_coord];
      var x = parseInt(tile_coord.split(',')[0]);
      var y = parseInt(tile_coord.split(',')[1]);
      tile.top = grid[[x, y - 1]];
      tile.bottom = grid[[x, y + 1]];
      tile.left = grid[[x - 1, y]];
      tile.right = grid[[x + 1, y]];
    }

    // Convert tileconn to links
    window.counter = 0;

    console.log("Building links...");

    for (var i in tileconn) {
      var conn = tileconn[i];
      var type0 = conn.tile_types[0];
      var type1 = conn.tile_types[1];

      if (conn.grid_deltas[0] == 0 && conn.grid_deltas[1] == 1) {
        // Direction: down
        for (var j in grid_by_type[type0])  {
          var type_tile = grid_by_type[type0][j];
          if (type_tile.bottom && type_tile.bottom.type == type1) {
            for (k in conn.wire_pairs) {
              var wireSrc = conn.wire_pairs[k][0];
              var wireDest = conn.wire_pairs[k][1];

              if (counter < 500) {
                counter += 1;
                type_tile.bottomArray.push({portColor: 'black', portId: type_tile.name + '-' + wireSrc});
                linkDataArray.push({
                  from: type_tile.name,
                  to: type_tile.bottom.name,
                  fromPort: type_tile.name + '-' + wireSrc,
                  toPort: type_tile.name + '-' + wireDest,
                });
                type_tile.bottom.topArray.push({portColor: 'black', portId: type_tile.name + '-' + wireDest});
              }
            }
          }
        }
      } else if (conn.grid_deltas[0] == 1 && conn.grid_deltas[1] == 0) {
        // Direction: right
        for (var j in grid_by_type[type0])  {
          var type_tile = grid_by_type[type0][j];
          if (type_tile.right && type_tile.right.type == type1) {
            for (k in conn.wire_pairs) {
              var wireSrc = conn.wire_pairs[k][0];
              var wireDest = conn.wire_pairs[k][1];

              if (counter < 500) {
                counter += 1;
                type_tile.rightArray.push({portColor: 'black', portId: type_tile.name + '-' + wireSrc});
                linkDataArray.push({
                  from: type_tile.name,
                  to: type_tile.right.name,
                  fromPort: type_tile.name + '-' + wireSrc,
                  toPort: type_tile.name + '-' + wireDest,
                });
                type_tile.right.leftArray.push({portColor: 'black', portId: type_tile.name + '-' + wireDest});
              }
            }
          }
        }
      }
    }

    console.log("Graph built. Rendering...");



























    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    myDiagram.model.class = "go.GraphLinksModel";
    myDiagram.model.copiesArrays = true;
    myDiagram.model.copiesArrayObjects = true;
    myDiagram.model.linkFromPortIdProperty = "fromPort";
    myDiagram.model.linkToPortIdProperty = "toPort";

    // When copying a node, we need to copy the data that the node is bound to.
    // This JavaScript object includes properties for the node as a whole, and
    // four properties that are Arrays holding data for each port.
    // Those arrays and port data objects need to be copied too.
    // Thus Model.copiesArrays and Model.copiesArrayObjects both need to be true.

    // Link data includes the names of the to- and from- ports;
    // so the GraphLinksModel needs to set these property names:
    // linkFromPortIdProperty and linkToPortIdProperty.
  }

  init();