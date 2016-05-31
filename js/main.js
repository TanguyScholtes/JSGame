/*
 * Javascript Puzzle Game
 * /js/main.js - main script file
 * By Tanguy Scholtés, 2384
 * For the Multimédia course by Pierre-Antoine DELNATTE, for the Haute Ecole de la Province de Liège
 * 2015 - 2016
 */

( function () {
    "use strict";

    //General variables declaration
    var oApp = {
        "canvas": null,
        "context": null,
        "width": null,
        "height": null
    };

    var gameDifficulty = 4, //Game difficulty - The puzzle will contain X by X tiles
        oImage, //loaded image
        aTiles, //array of all the tiles on the board, from top left to bottom right, line by line
        iGameWidth, //board width
        iGameHeight, //board height - can be different from board width to allow rectangular images
        iTileWidth, //width of a puzzle tile according to the image's size
        iTileHeight, //height of a puzzle tile acccording to the image's size
        oCurrentTile, //tile currently being dragged
        oHoveredTile, //tile being hovered while dragging a tile
        oMousePosition, //X and Y position of the mouse cursor
        oCanvasRect; //object containing the canvas position

    function _isCanvasSupported ( $canvasElt ) {
        //Get given canvas element, return a boolean - "true" if canvas is supported and "false" if it isn't
        return !!$canvasElt.getContext;
    };

    function fShuffleArray ( array ) {
        var j,
            x,
            i;

        for ( i = array.length; i; i -= 1 ) {
            j = Math.floor( Math.random() * i );
            x = array[ i - 1 ];
            array[ i - 1 ] = array[ j ];
            array[ j ] = x;
        }

        return array;
    };

    function fGetClickedTile(){
        var i;
        var oTile;
        for( i = 0; i < aTiles.length; i++ ){
            oTile = aTiles[ i ];
            if( oMousePosition.x < oTile.xPosition || oMousePosition.x > ( oTile.xPosition + iTileWidth ) || oMousePosition.y < oTile.yPosition || oMousePosition.y > ( oTile.yPosition + iTileHeight ) ) {
                //no tile clicked
            } else {
                //return the clicked tile
                return oTile;
            }
        }
        //if the loop ends whithout any tile clicked, we return null
        return null;
    };

    function setup () {
        //setup initial canvas variables
        oApp.canvas = document.getElementById('canvas');

        if ( !_isCanvasSupported( oApp.canvas ) ) {
            return console.error( "Canvas not supported." );
        }

        oApp.context = oApp.canvas.getContext('2d');
        //canvas width & height based on board dimensions to allow rectangular images
        oApp.canvas.width = iGameWidth;
        oApp.canvas.height = iGameHeight;
    };

    function main () {
        //load random image to use as puzzle
        oImage = new Image();
        oImage.addEventListener( 'load', fImageLoaded, false );
        oImage.src = "./img/" + Math.floor( ( Math.random() * 5 ) + 1) + ".png";
        //note that the random image is made possible by naming all the images with a number ranging 1 to 5 (the range of the current random number generated)
        //a way of doing that without relying on images names would be to get all the images of a folder in an array, and randomly select an image in that array, but that seems time and power-consuming to me

        console.log( "Random image selected : " + oImage.src );
    };

    function fImageLoaded ( e ) {
        //tiles width & height based on puzzle image width & height to have tiles with same ratio
        //width & height determined separately to allow rectangular images
        iTileWidth = Math.floor( oImage.width / gameDifficulty );
        iTileHeight = Math.floor( oImage.height / gameDifficulty );

        //board dimensions based on tiles dimensions & difficulty to allow rectangular images
        iGameWidth = iTileWidth * gameDifficulty;
        iGameHeight = iTileHeight * gameDifficulty;

        setup(); //call canvas setup function
        initGame(); //call game initiation function
    };

    function initGame () {
        //Initial game state - starting screen

        //game variables reset
        aTiles = [];
        oMousePosition = { x: 0, y: 0 };
        oCurrentTile = null;
        oHoveredTile = null;

        oApp.context.drawImage( oImage, 0, 0, iGameWidth, iGameHeight, 0, 0, iGameWidth, iGameHeight);

        drawMessage( "Click to Start" );
        createTiles();
    };

    function drawMessage( sMessage ){
        //Draw the given message in the center of the canvas

        //Cat icon
        var oCatImage = new Image();
        oCatImage.src = "./img/catIcon.png";
        oApp.context.drawImage( oCatImage, 0, 0, oCatImage.width, oCatImage.height, ( iGameWidth / 2 ) - 63, ( iGameHeight / 2 ) - 150, oCatImage.width, oCatImage.height);


        //Text background (make text easier to read)
        oApp.context.fillStyle = "black";
        oApp.context.globalAlpha = 0.5; //alpha modified so the image is still visible through the background
        oApp.context.fillRect( ( iGameHeight / 2 ) - 100, ( iGameWidth / 2 ) - 25, 200, 50 );

        //Text
        oApp.context.fillStyle = "white";
        oApp.context.globalAlpha = 1; //restore alpha to normal
        oApp.context.textAlign = "center";
        oApp.context.textBaseline = "middle";
        oApp.context.font = "20px Arial";
        oApp.context.fillText( sMessage, iGameWidth / 2, iGameHeight / 2 );
    };

    function createTiles(){
        var i,
            oTile,
            xPosition = 0,
            yPosition = 0;

        //Repeat the loop for each tile to create (not drawn now)
        for ( i = 0; i < gameDifficulty * gameDifficulty; i++ ) {
            oTile = {};
            //sx & sy refere to the initial (winning) position of the tile
            oTile.sx = xPosition;
            oTile.sy = yPosition;

            aTiles.push( oTile ); //add tile to the array, line by line from left to right

            //X & Y update for next tile & canvas border detection
            xPosition += iTileWidth;
            if ( xPosition >= iGameWidth ){
                xPosition = 0;
                yPosition += iTileHeight;
            }
        }
        //When all tiles are created, we wait for the user to click
        document.onmousedown = shuffleGame;
    };

    function shuffleGame () {
        var i,
            oTile,
            xPosition = 0,
            yPosition = 0;

        //Shuffle tiles in the tiles array
        aTiles = fShuffleArray( aTiles );
        //Clear the canvas of the starting screen
        oApp.context.clearRect( 0, 0, iGameWidth, iGameHeight );

        //create each tile according to their shuffled order
        for ( i = 0; i < aTiles.length; i++ ) {
            oTile = aTiles[ i ];
            //xPosition & yPosition refere to current position of the tile on the board
            oTile.xPosition = xPosition;
            oTile.yPosition = yPosition;

            //draw the puzzle tiles
            oApp.context.drawImage( oImage, oTile.sx, oTile.sy, iTileWidth, iTileHeight, xPosition, yPosition, iTileWidth, iTileHeight );
            //add a border to each tile to better see them
            oApp.context.strokeRect( xPosition, yPosition, iTileWidth,iTileHeight );

            //updating x & y coordinates with border detection for next tile
            xPosition += iTileWidth;
            if(xPosition >= iGameWidth){
                xPosition = 0;
                yPosition += iTileHeight;
            }
        }
        document.onmousedown = dragTile; //event listener to detect click & dragging
    };

    function dragTile ( e ) {
        //get mouse click position in canvas
        oCanvasRect = oApp.canvas.getBoundingClientRect();
        oMousePosition.x = e.clientX - oCanvasRect.left;
        oMousePosition.y = e.clientY - oCanvasRect.top;

        //affect clicked tile to the tile currently being dragged
        oCurrentTile = fGetClickedTile();

        if ( oCurrentTile != null ) {
            //if user clicked a tile

            //we clear the tile from the board, as we display it being dragged
            oApp.context.clearRect( oCurrentTile.xPosition, oCurrentTile.yPosition, iTileWidth, iTileHeight );
            oApp.context.save();
            oApp.context.globalAlpha = 0.8;
            oApp.context.drawImage( oImage, oCurrentTile.sx, oCurrentTile.sy, iTileWidth, iTileHeight, oMousePosition.x - ( iTileWidth / 2 ), oMousePosition.y - ( iTileHeight / 2 ), iTileWidth, iTileHeight);
            oApp.context.restore();

            document.onmousemove = draggingTile;
            document.onmouseup = droppedTile;
        }
    };

    function draggingTile ( e ) {
        //called at each mouse move while a tile is being dragged

        var oTile,
            i;
        oHoveredTile = null;

        //get current mouse position
        oCanvasRect = oApp.canvas.getBoundingClientRect();
        oMousePosition.x = e.clientX - oCanvasRect.left;
        oMousePosition.y = e.clientY - oCanvasRect.top;

        //clear the board to avoid having residual images behind the cursor as we drag a tile
        oApp.context.clearRect( 0, 0, iGameWidth, iGameHeight );

        for( i = 0; i < aTiles.length; i++) {
            oTile = aTiles[ i ];
            if( oTile == oCurrentTile ) {
                continue; //simply stops the current iteration of the loop
                //break would have stopped the loop (then the code would have continued on executing what's after the loop)
            }

            //Draw the dragged tile at updated position
            oApp.context.drawImage( oImage, oTile.sx, oTile.sy, iTileWidth, iTileHeight, oTile.xPosition, oTile.yPosition, iTileWidth, iTileHeight );
            oApp.context.strokeRect( oTile.xPosition, oTile.yPosition, iTileWidth, iTileHeight );

            if ( oHoveredTile == null ) {
                if ( oMousePosition.x < oTile.xPosition || oMousePosition.x > ( oTile.xPosition + iTileWidth ) || oMousePosition.y < oTile.yPosition || oMousePosition.y > ( oTile.yPosition + iTileHeight ) ) {
                    //no tile hovered
                }
                else{
                    //a tile is hovered => we color it in green so the user can better see which tiles will be swapped
                    oHoveredTile = oTile;
                    oApp.context.save();
                    oApp.context.globalAlpha = 0.4;
                    oApp.context.fillStyle = "green";
                    oApp.context.fillRect( oHoveredTile.xPosition, oHoveredTile.yPosition, iTileWidth, iTileHeight);
                    oApp.context.restore();
                }
            }
        }

        oApp.context.save();
        oApp.context.globalAlpha = 0.6;
        oApp.context.drawImage( oImage, oCurrentTile.sx, oCurrentTile.sy, iTileWidth, iTileHeight, oMousePosition.x - ( iTileWidth / 2 ), oMousePosition.y - ( iTileHeight / 2 ), iTileWidth, iTileHeight );
        oApp.context.restore();
        oApp.context.strokeRect( oMousePosition.x - ( iTileWidth / 2 ), oMousePosition.y - ( iTileHeight / 2 ), iTileWidth, iTileHeight );
    };

    function droppedTile ( e ) {
        //called when a tile is dropped

        //remove event listeners for the duration of the swap
        document.onmousemove = null;
        document.onmouseup = null;

        //swap tiles
        if( oHoveredTile != null ) {
            var oTmp = {
                xPosition: oCurrentTile.xPosition,
                yPosition: oCurrentTile.yPosition
            };

            oCurrentTile.xPosition = oHoveredTile.xPosition;
            oCurrentTile.yPosition = oHoveredTile.yPosition;
            oHoveredTile.xPosition = oTmp.xPosition;
            oHoveredTile.yPosition = oTmp.yPosition;
        }

        updateGame();
    };

    function updateGame () {
        var win = true,
            oTile,
            i;

        //clear board to redraw it with new tiles positions
        oApp.context.clearRect( 0, 0, iGameWidth, iGameHeight );

        for( i = 0; i < aTiles.length; i++ ) {
            oTile = aTiles[ i ];
            oApp.context.drawImage( oImage, oTile.sx, oTile.sy, iTileWidth, iTileHeight, oTile.xPosition, oTile.yPosition, iTileWidth, iTileHeight );
            oApp.context.strokeRect( oTile.xPosition, oTile.yPosition, iTileWidth, iTileHeight );
            if ( oTile.xPosition != oTile.sx || oTile.yPosition != oTile.sy ) {
                win = false;
            }
        }

        if ( win ) {
            gameOver();
        }
    };

    function gameOver(){
        //forbid further interactions with the tiles
        document.onmousedown = null;
        document.onmousemove = null;
        document.onmouseup = null;

        //display win message
        drawMessage( "You won !" );
    };

    main(); //canvas function call

} ) ();
