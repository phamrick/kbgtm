
var utilKonvas = (function(iClient) {
 
    var layerMap;
    var layerPieces;
    var stage;
    var client = iClient;

    var CreateStage =  function(iWidth, iHeight)
    {
        stage = new Konva.Stage({
            container: 'container',
            width: iWidth,
            height: iHeight
        });

        layerMap = new Konva.Layer();
        layerPieces = new Konva.Layer();
        
        stage.add(layerMap);
        stage.add(layerPieces);

        layerMap.draw();
        layerPieces.draw();

        stage.on('contextmenu', function(e) {

            e.evt.preventDefault();
            if (e.target === stage)
                return;
        });
    }

    var InstantiateImgArray = function(iImgKeys, iX, iY, iScale, iGap, iXdir, iCentered, iAddToLayer, iDraggable, iDrawLayer)
    {
        var i = 0;
        var xOffset = 0;
        var yOffset = 0;

        var widthKeep = 0;
        var heightKeep = 0;

        var kimgs = [];

        while(i < iImgKeys.length)
        {
            var imageDOM = images[iImgKeys[i]];

            if (imageDOM.width > widthKeep)
                widthKeep = imageDOM.width;
            if (imageDOM.height > heightKeep)
                heightKeep = imageDOM.height;

            var kimg = InstantiateImg(imageDOM, iX + xOffset, iY + yOffset, iScale, iCentered, iDraggable, false, false);
            kimgs.push(kimg);

            if(iXdir === true)
            {
                xOffset = xOffset + imageDOM.width + (i < iImgKeys.length - 1 ? iGap: 0);
            } else {
                yOffset = yOffset + imageDOM.height + (i < iImgKeys.length - 1 ? iGap: 0);
            }

            i++;
        }

        if (iAddToLayer)
            AddKobjsToPiecesLayer(kimgs, iDrawLayer);

        if (iDrawLayer)
            layerPieces.draw();

        return { kimgs: kimgs, 
                width: iXdir ? xOffset : widthKeep , 
                height: iXdir ? heightKeep: yOffset };
    } 

    var InstantiateSingleImg = function(iImgKey,iX, iY, iScale, iCentered, iDraggable, iAddToLayer, iDrawLayer)
    {
        var imageDOM = images[iImgKey];
        var kimg = InstantiateImg(imageDOM, iX, iY, iScale, iCentered, iDraggable, iAddToLayer, iDrawLayer);
        return kimg;
    }

    var InstantiateImg = function (imageDOM, iX, iY, iScale, iCentered, iDraggable, iAddToLayer, iDrawLayer)
    {
        iX = ConvXpercXpos(iX);
        iY = ConvYpercYpos(iY);

        var oKimg = new Konva.Image({
            image: imageDOM,
            x: parseInt(iX) + (iCentered ? (-imageDOM.width/2): 0),
            y: parseInt(iY) + (iCentered ? (-imageDOM.height/2): 0),
			width: imageDOM.width * iScale,
			height: imageDOM.height * iScale,
            id: getFilenameNoExt(imageDOM.src),
            draggable: iDraggable
        });

        if( iAddToLayer == true)
            layerPieces.add(oKimg);

        if (iDraggable)
        {
            oKimg.on('click', EvtNodeTopMostAndSelected);
            oKimg.on('dragstart', EvtDragStart);
        }

        if (iDrawLayer === true)
            layerPieces.draw();

        return oKimg;
    }

    var CreateRectGroup = function(iX, iY, iWidth, iHeight, iFillColor, iOpacity, iShadColor, iShadBlr, iShadX, iShadY, iShadOp)
    {
		var group1 = new Konva.Group({
			x: iX,
			y: iY,
			width: iWidth,
			height: iHeight
		});

		var rect1 = new Konva.Rect({
			x: 0,      //0,
			y: 0,      //0,
			width: iWidth,  //screen.width,
			height: iHeight, //220,
            fill: iFillColor,   //'#fffef7',
            opacity: iOpacity,
			shadowColor: iShadColor,
			shadowBlur: iShadBlr, //5,
			shadowOffset: { x: iShadX, y: iShadY},//{ x: 0, y: -5 },
			shadowOpacity: iShadOp//0.35
        });
        
        group1.add(rect1);
        
        layerPieces.add(group1);

        layerPieces.draw();

        return group1;
    }

    var CreateRect = function(iX, iY, iWidth, iHeight, iId)
    {
		var rect1 = new Konva.Rect({
			x: ConvToInt(iX),      //0,
			y: ConvToInt(iY),      //0,
			width: ConvToInt(iWidth),  //screen.width,
            height: ConvToInt(iHeight),
            id: iId
        });

        layerPieces.add(rect1);

        layerPieces.draw();

        return rect1;
    }

    var DrawPiecesLayer = function()
    {
        layerPieces.draw();
    }

    var AddKobjsToPiecesLayer = function(iKobjs, iDrawLayer)
    {
      var i = 0;
      for (i = 0; i < iKobjs.length; i++) {
        AddKobjToPiecesLayer(iKobjs[i], false);
      }
      if(iDrawLayer)
        layerPieces.draw();
    }

    var AddKobjToPiecesLayer = function(iKobj, iDrawLayer)
    {
        layerPieces.add(iKobj);
        if(iDrawLayer)
            layerPieces.draw();
    }

    var SetImagesToDoubleClickPosExpose = function(iNode)
    {
        var node = iNode;
        if(!node)
            node = layerPieces;

        var children = node.getChildren(function(node) {
            return node.getClassName() === 'Image';
        });

        children.each(function(node, n) {
            node.off('dblclick');
            node.on('dblclick', function() {
                var textVal = $('#posDivCoordList').text();
                $('#posDivCoordList').text(textVal +'\n{"x": "' + node.x() + '", "y": "' + node.y() + '"},');
            });
            SetImagesToDoubleClickPosExpose(node);
        })
    }

    var GetNodeFromPiecesLayer = function(id)
    {
      var children = layerPieces.getChildren(function(node){
        return node.id() === id;
      });
  
      return children[0];
  
    }

    var ConvXpercXpos = function (iX)
    {
        if(typeof iX === 'string')
            if(iX.endsWith('%'))
                return (stage.width() *parseInt(iX.replace('%',''))/100).toString();
        return iX;
    }

    var ConvYpercYpos = function (iY)
    {
        if(typeof iY === 'string')
            if(iY.endsWith('%'))
                return (stage.height() *parseInt(iY.replace('%',''))/100).toString();
        return iY;
    }

    var ConvToInt = function(iVal)
    {
        if(typeof iVal === 'string')
            iVal = parseInt(iVal);

        return iVal; 
    }

    var EvtDragStart = function(e) {
		
        var draggedObj = e.target;
        draggedObj.moveToTop();
        draggedObj.getLayer().draw();
    };
    
    var EvtNodeTopMostAndSelected = function(e) {
                    
        var oNode = e.target;
        oNode.moveToTop();
        oNode.getLayer().draw();
    };
    
    return {
        CreateStage: CreateStage,
        InstantiateImgArray: InstantiateImgArray,
        InstantiateImg: InstantiateImg,
        InstantiateSingleImg: InstantiateSingleImg,
        AddKobjToPiecesLayer: AddKobjToPiecesLayer,
        DrawPiecesLayer: DrawPiecesLayer,
        SetImagesToDoubleClickPosExpose: SetImagesToDoubleClickPosExpose,
        CreateRectGroup: CreateRectGroup,
        CreateRect: CreateRect,
        GetNodeFromPiecesLayer: GetNodeFromPiecesLayer
        
    };

})(window.client);