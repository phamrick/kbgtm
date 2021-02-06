var images = {};
var projCards = null;
var corpCards = null;

var panelBottomYpeek = 20;
var panelBottomYretract = 200;
var panelBottomDefaultY = screen.height - panelBottomYpeek;
var panelBottomHeight = panelBottomYretract + panelBottomYpeek;
var panelBottomWidth = screen.width;
var panelBottomColor = '#ffffe6';

var panelRightXpeek = 20;
var panelRightXretract = 160;
var panelRightDefaultX = screen.width - panelRightXpeek;
var panelRightHeight = screen.height;
var panelRightWidth = panelRightXretract + panelRightXpeek;
var panelRightColor = '#ffffe6';

var playerBoardYpeek = -20;

var client = (function(window) {

	var config = null;
	
	var kimgProjDeck = null;
	var groupBottomPanel = null;
	var groupRightPanel = null;
	var keyDownCode = null;
	var newNumber1 = -1;
	var newNumber2 = -1;
	var supplyStacks =  {};

	var inProgPlayProjectCard = false;
	var inpProgToggleBottomPanel = false;

	var cardMouseOver = null;

	var playerCardRegionID = '';
    
    var init = function()
    {
        utilKonvas.CreateStage(screen.width, screen.height);

        LoadJSON('/config/config.json', function(iJson) {
            config = iJson;
            LoadStartingPieces();
		});
		
		document.addEventListener('keydown', function(e) {
			keyDownCode = e.keyCode;

			if(e.altKey)
			{
				CardMouseOverEnlargeKimg(cardMouseOver);

			} else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) { 

				if(newNumber1 === newNumber2)
				{
					$('#floatingNumDiv').text('');
					newNumber1 = e.keyCode-96;

				} else {
					var blah = (e.keyCode-96).toString();
					blah = newNumber1.toString() + blah;
					newNumber1 = parseInt(blah);
				}

				$('#floatingNumDiv').text(newNumber1.toString());
				setTimeout(() => {
					newNumber2 = newNumber1;
				}, 1000);

			} else if (e.keyCode === 13)
			{
				//var rect = utilKonvas.GetNodeFromPiecesLayer(playerCardRegionID);
				var region = null;
				switch(playerCardRegionID) {

					case "megaCredits":
						region = config.playerCardMap.regions.megaCredits;
						break;
					case "iron":
						region = config.playerCardMap.regions.iron;
						break;
					default:
					  // code block
				  }
				  
				TransferCubes(region, parseInt($('#floatingNumDiv').text()));	
			}

		});
	}
	
	function TransferCubes(iRegion, iCubeValueTotal)
	{
		// "megaCredits" : {
		// 	"overalRegion" : {"x": "1260", "y": "605", "width" : "250", "height" : "130"},
		// 	"cubeSlots" :

		var cubeSlots = iRegion.cubeSlots;
		var supply = supplyStacks['cube_gold'];
		var allPieces = supply.allPieces;
		var i = 0;
		var j = 0;

		var supplyGold = [];
		var freeSlotIndex = 0;
		for(i = 0; i < allPieces.length; i++)
		{
			var kimg = allPieces[i];
			var kx = kimg.x();
			var ky = kimg.y();

			if(supply.x == kx && supply.y == ky)
			{
				supplyGold.push(kimg);
			} else {
				for(j = 0; j < cubeSlots.length; j++)
				{
					if (cubeSlots[j].x == kx && cubeSlots[j].y == ky)
					{
						freeSlotIndex++;
					}  
				}
			}
		}

		var k = -1;
		for(i = 0; i < iCubeValueTotal; i++)
		{
			k++;
			var kimg = supplyGold[k];
			if(supply.x == kimg.x() && supply.y == kimg.y())
			{
				kimg.to({x: cubeSlots[freeSlotIndex].x, y: cubeSlots[freeSlotIndex].y});
				freeSlotIndex++;
			}
		}
	}
    
    function CreateBottomPanel() 
    {
        groupBottomPanel = utilKonvas.CreateRectGroup(0, 
                                                    panelBottomDefaultY, 
                                                    panelBottomWidth, 
                                                    panelBottomHeight, 
													panelBottomColor,
													1,
                                                    'black', 
													5, 0, 0, 0.35);
													
        groupBottomPanel.on('click', ToggleBottomPanel);
	}

	function ToggleBottomPanel()
	{
		inpProgToggleBottomPanel = true;

		var yToPanel = groupBottomPanel.y() === panelBottomDefaultY ?
		panelBottomDefaultY - panelBottomYretract: 
		panelBottomDefaultY;

		groupBottomPanel.moveToTop();

		groupBottomPanel.to( {
			y : yToPanel,
			duration : 0.35,
			easing: Konva.Easings.EaseInOut,
			onFinish: () => {
				inpProgToggleBottomPanel = false;
			}
		});
	}
	
	function CreateSidePanel() {

        groupRightPanel = utilKonvas.CreateRectGroup(panelRightDefaultX, 
														0, 
														panelRightWidth, 
														panelRightHeight, 
														panelRightColor,
														1,
														'black', 
														5, 0, -5, 0.35);

		groupRightPanel.on('click', ToggleSidePanel);
	}

	function ToggleSidePanel()
	{
		var xTo = groupRightPanel.x() === panelRightDefaultX ?
		panelRightDefaultX - panelRightXretract: 
		panelRightDefaultX;

		groupRightPanel.moveToTop();

		groupRightPanel.to( {
			x : xTo,
			duration : 0.35,
			easing: Konva.Easings.EaseInOut
		});
	}

	//function CreatePlayerBoard(iGroup) {
	function CreatePlayerBoard() {

		var imgDom = images['player_board'];

		// var kimg = utilKonvas.InstantiateImg(imgDom, 
		// 							screen.width - imgDom.width - panelRightXpeek*2,
		// 							playerBoardYpeek,
		// 							1, false, false, true, false);

		var xLoc = screen.width - imgDom.width - panelRightXpeek*2;
		var yLoc = screen.height - imgDom.height - 2*panelBottomYpeek;

		var kimg = utilKonvas.InstantiateImg(	imgDom, 
												xLoc,
												yLoc,
												1, false, false, true, false);

		kimg.stroke('rgba(0,0,0,0)');
		kimg.shadowEnabled(true);
		kimg.shadowColor('white');
		kimg.shadowBlur(25);
		kimg.shadowOffset({x: 0, y: 0});
		kimg.shadowOpacity(0.5);

		kimg.zIndex(0);

		//kimg.on('dblclick', PlayerBoardDoubleClick)

		utilKonvas.DrawPiecesLayer();

		var oGroup = utilKonvas.CreateRectGroup(kimg.x(), kimg.y(), kimg.width(), kimg.height(), 'white', 0, '', '', '', '', '');

		var region = config.playerCardMap.regions.megaCredits.overalRegion;
		var oRect = utilKonvas.CreateRect(region.x, region.y, region.width, region.height, "megaCredits");
		oRect.on('dblclick', ActivateCubeTransfer);

		var region = config.playerCardMap.regions.iron.overalRegion;
		var oRect = utilKonvas.CreateRect(region.x, region.y, region.width, region.height, "iron");
		oRect.on('dblclick', ActivateCubeTransfer);
		
		return kimg;
	}

	function ActivateCubeTransfer(e)
	{
		var oTarget = e.target;

		var region = null;

		switch(oTarget.id()) {
			case "megaCredits":
				region = config.playerCardMap.regions.megaCredits.overalRegion;
				break;
			case "iron":
				region = config.playerCardMap.regions.iron.overalRegion;
			  break;
			default:
			  // code block
		  }

		playerCardRegionID = oTarget.id();

		$('#floatingNumDiv').css('visibility','visible');
		$('#floatingNumDiv').show();
	}

	function CreateCorpCards() {

		var CreateCorpCard = function(iCards) {

			var scale = parseFloat(config.decksSetup.deckCorp.scale);

			var kobjs = utilKonvas.InstantiateImgArray(iCards, 10, 20, scale, 20, true, false, false, true, false);

			var i = 0;
			for(i = 0; i < kobjs.kimgs.length; i++)
			{
				var kimg = kobjs.kimgs[i];
				kimg.on('mouseenter', CardMouseOverEnlarge);
				kimg.on('mouseleave', CardMouseOutHideEnlarged);
				kimg.on('click', function(e) { 
					e.cancelBubble = true;
				});

				kimg.on('dblclick', function(e) { 
					if(e.evt.shiftKey)
					{
						e.target.destroy();
						utilKonvas.DrawPiecesLayer();
					}
				});

				groupBottomPanel.add(kimg);
			}

			utilKonvas.DrawPiecesLayer();
		}

		var cards1 = []; 
		cards1.push(SpliceRandom(corpCards));
		cards1.push(SpliceRandom(corpCards));

		var cards2 = [];
		cards2.push(getFilenameNoExt(cards1[0]));
		cards2.push(getFilenameNoExt(cards1[1]));
		
		loadImages(cards1, CreateCorpCard, cards2);
	}

	function LoadStartingPieces() {

		var imgFilenames = config.piecesSetup.imageLoad.fileNames;
		
		projCards = [...config.decksSetup.deckProject.cards];
		corpCards = [...config.decksSetup.deckCorp.cards];

		loadImages(imgFilenames, 
					LoadStartingPiecesCB, 
					function() { 
						CreatePlayerBoard();
						CreateBottomPanel();
						CreateSidePanel();
						CreateCorpCards();
					});  
    }
    
    function LoadStartingPiecesCB(callback)
    {
        var kimgs = [];

        for(var key1 in config.piecesSetup)
        {
            var configObj = config.piecesSetup[key1];

            if ( configObj.hasOwnProperty('type') === true )
            {
                var draggable = configObj.draggable === "true";

                if(configObj.type === "pieceArray")
                {
                    var srcKey = configObj.srcKey;
                    var insts = configObj.instances;
                    var scale = parseFloat(configObj.scale);
                    
                    var index = 0; 
                    while (index < insts.length) { 
                        var inst = insts[index];
                        var kimg = utilKonvas.InstantiateSingleImg(srcKey, inst.x, inst.y, scale, false, draggable, true, false);
                        kimgs.push(kimg);
                        index++; 
                    }

                } else if (configObj.type === "pieceSingle")
                {
                    var srcKey = configObj.srcKey;
                    var pos = configObj.position;
                    var scale = parseFloat(configObj.scale);

                    var kimg = utilKonvas.InstantiateSingleImg(srcKey, pos.x, pos.y, scale, false, draggable, true, false);
                    kimgs.push(kimg);

                    ProcessAttractors(key1, configObj, kimg);

                } else if (configObj.type === "supplyStack")
                {
                    var srcKey = configObj.srcKey;
                    var pos = configObj.position;
                    var scale = parseFloat(configObj.scale);
					var count = parseInt(configObj.count)
					
					var allPieces = [];

                    var i = 0;
                    for(i = 0; i < count; i++) {
						var kimg = utilKonvas.InstantiateSingleImg(srcKey, pos.x, pos.y, scale, false, draggable, true, false);
						
                        ProcessAttractors(key1, configObj, kimg);
						kimgs.push(kimg);
						
						allPieces.push(kimg);
					}
					
					supplyStacks[configObj.srcKey] = { srcKey: configObj.srcKey, x : pos.x, y: pos.y, allPieces : allPieces};

                }

            }
        }

        // create the white glow under the project card deck
		var i =0;
		
        for(i = 0; i < kimgs.length; i++)
        {
            var kimg = kimgs[i];
			var imageDom = kimg.image();

            if (imageDom.src.endsWith('project_back.png'))
            {
				kimgProjDeck = kimg;
				
				kimg.stroke('rgba(0,0,0,0)');
				kimg.shadowEnabled(true);
				kimg.shadowColor('white');
				kimg.shadowBlur(50);
				kimg.shadowOffset({x: 0, y: 0});
				kimg.shadowOpacity(0.5);

				kimg.on('dblclick', function(e) {

					var cardCount = 4;
					if (keyDownCode > 47 && keyDownCode < 58)
					{
						if (keyDownCode == 48)
							cardCount = 10;
						else
							cardCount = keyDownCode - 48;
					}

					var cards = [];
					var i = 0;
					for(i = 0; i < cardCount; i++)
						cards.push(SpliceRandom(projCards));

					loadImages(cards, DrawCards, cards);
				});
            }
		}

        utilKonvas.DrawPiecesLayer();

        callback();
	}

	function DrawCards(iCardFileNames)
	{
		var x = kimgProjDeck.width();
		var y = kimgProjDeck.height();
		var scale = parseFloat(config.decksSetup.deckProject.scale)

		var i = 0;
		for(i = 0; i < iCardFileNames.length; i++)
		{
			var key = getFilenameNoExt(iCardFileNames[i]);
			var kimg = utilKonvas.InstantiateSingleImg(key, x, y, scale, false, false, true, false);
			DistributeCard(kimg, i, iCardFileNames.length);
		}
	}
	
	function DistributeCard(iKimg, iCardIndex, iCardCount)
	{
		var overlap = iCardIndex === 0 ? 0 : (iKimg.width()*iCardCount - screen.width)/iCardCount;

		iKimg.to( {
			y: 0,
			x : (iKimg.width()-overlap)*iCardIndex,
			duration : 0.35,
			easing: Konva.Easings.EaseInOut
		});

		iKimg.on('dblclick', TakeProjCardIntoHand);

		iKimg.on('mouseenter', CardMouseOverEnlarge);

		iKimg.on('mouseleave', CardMouseOutHideEnlarged);
	}

	function CardMouseOverEnlarge(e)
	{
		var kimg = e.target;
		cardMouseOver = kimg;

		if(e.evt.altKey)
		{
			CardMouseOverEnlargeKimg(kimg);
		}
	}

	function CardMouseOverEnlargeKimg(iKimg)
	{
		if(iKimg)
			$('#enlargedImg')[0].src = iKimg.image().src;
	}

	function CardMouseOutHideEnlarged(e)
	{
		cardMouseOver = null;
		$('#enlargedImg')[0].src = '';
	}

	function CardDestroy(e)
	{
		var kimg = e.target;
		kimg.destroy();
	}

	function TakeProjCardIntoHand(e)
	{
		if(e.evt.shiftKey)
		{
			e.target.destroy();
			utilKonvas.DrawPiecesLayer();
			return;
		}

		var kimg = e.target;
//========================================
		var nextX= 0;

		var childImages = groupBottomPanel.getChildren(function(node){
			return node.getClassName() === 'Image';
		});

		var childCount = 0;

		childImages.each(function(node, n) {

			if (getFilenameNoExt(node.image().src).startsWith('proj'))
			{
				childCount++;
				var x = node.x();
				if (x > nextX)
					nextX = x;
			}
		});

		var offsetProportion = 0.9;
		nextX = childCount > 0 ? nextX + kimg.width()*offsetProportion : 0;
//========================================

		kimg.to( {
			y : groupBottomPanel.y(),
			x : nextX,
			duration : 0.5,
			easing: Konva.Easings.EaseInOut,

			onFinish: () => {

				kimg.moveTo(groupBottomPanel);
				kimg.y(-20);
				utilKonvas.DrawPiecesLayer();
				kimg.draggable(true);
				kimg.off('dblclick');
				kimg.on('dblclick', PlayProjectCard);
				kimg.on('click', function(e) { 
					e.cancelBubble = true;
					setTimeout(
						function()
						{  
							if (inpProgToggleBottomPanel === false && inProgPlayProjectCard === false)  
								ToggleBottomPanel();
						}, 
						250);
				});	
			}
		});
	}

	function PlayProjectCard(e)
	{
		if(e.evt.shiftKey)
		{
			e.target.destroy();
			utilKonvas.DrawPiecesLayer();
		}

		if (groupBottomPanel.y() !== panelBottomDefaultY - panelBottomYretract)
			 return;

		inProgPlayProjectCard = true;

		var kimg = e.target;
		var nextY = 0;
		var prevName = "";
		
		var childImages = groupRightPanel.getChildren(function(node){
			
			return node.getClassName() === 'Image';
		});

		var childCount = 0;

		childImages.each(function(node, n) {
			childCount++;
			var y = node.y();
			if (y > nextY)
			{
				nextY = y;
				prevName = node.image().src;
			}
		});

		var offsetProportion = 0.2
		if(prevName.endsWith('blue.png'))
			offsetProportion = 0.4;

		nextY = childCount > 0 ? nextY + kimg.height()*offsetProportion : 0;

		yTo = nextY - groupBottomPanel.y();
		xTo = groupRightPanel.x() - 10;

		kimg.to( {
				x : xTo,
				y : yTo,
				duration : 0.5,
				easing: Konva.Easings.EaseInOut,
				onFinish: () => {
					kimg.moveTo(groupRightPanel);
					kimg.x(-10);
					kimg.y(nextY);
					utilKonvas.DrawPiecesLayer();
					kimg.off('dblclick');
					inProgPlayProjectCard = false;
					kimg.off('click');
					kimg.on('click', ToggleSidePanel);
					kimg.draggable(false);
				}
			});

		if (groupBottomPanel.y() === panelBottomDefaultY)
			e.cancelBubble = true;
	}

    var dragEndAttractorFncs = {}
    //var dragEndAttractorPts = {}

    function ProcessAttractors(iName, iConfigObj, iKimg)
    {
        if ( iConfigObj.hasOwnProperty('attractors') === true  )
        {
            var attractorsConfig = iConfigObj.attractors;
            var key = iName + '_' + attractorsConfig.name;

            var attractorPts = attractorsConfig.points;

            var pts = []
            var i = 0;
            for(i = 0; i < attractorPts.length; i++)
            {
                var jsonPoint = attractorPts[i];
                pts.push( {x: parseInt(jsonPoint.x), y: parseInt(jsonPoint.y)});
            }

            //dragEndAttractorPts[key] = points;

            dragEndAttractorFncs[key] = function(e) {

                var kimg = e.target;
                //var pts = dragEndAttractorPts[key];

                var kx = kimg.x();
                var ky = kimg.y();

                var j = 0;
                for(j = 0; j < pts.length; j++)
                {
                    var dist = DistBetween(kx,ky, pts[j].x, pts[j].y);
                    if (dist < 50)
                    {
                        kimg.position( {x: pts[j].x, y: pts[j].y});
                        break;
                    }
                }

                kimg.getLayer().draw();
            }
        }

        if ( iConfigObj.hasOwnProperty('attracted') === true  )
        {
            var attractedConfig = iConfigObj.attracted;
            var key = attractedConfig.pieceName + '_' + attractedConfig.pointsName;

            iKimg.on('dragend', dragEndAttractorFncs[key]);

            //"attracted": { "pieceName": "board", "pointsName": "tiles"}
        }
    }


    return {
        init: init
    }

})(window);