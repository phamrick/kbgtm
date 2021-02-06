
function getFilenameNoExt (iFilePath) {
    var filename = iFilePath.split('/').pop();
    return filename.substr(0, filename.lastIndexOf('.'));
}

function LoadJSON(iConfigPath, callback) {

    // read in the json configuration file
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', iConfigPath, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(JSON.parse(xobj.responseText));
        }
    };

    xobj.send(null);  
}

var loadImages = function(iImageFilenames, callback, params)
{
    var loadedImages = 0;
    var i = 0;
    while(i < iImageFilenames.length)
    {
        var fileName = iImageFilenames[i];
        var imgKey = getFilenameNoExt(fileName);

        if(imgKey in images)
        {
            loadedImages++;
        } else {
            images[imgKey] = new Image();
            images[imgKey].onload = function() {
                loadedImages++;
                console.log('loadedImages: ' + loadedImages.toString());
                if (loadedImages >= iImageFilenames.length) {
                    if(callback)
                        callback(params);
                }
            }

            images[imgKey].src = "/img/" + fileName;
        }

        i++;
    }
}

function DistBetween(x1, y1, x2, y2)
{
    var a = x1 - x2;
    var b = y1 - y2;
    
    return Math.sqrt( a*a + b*b );
}

function SpliceRandom(iArray)
{
    return iArray.splice(Math.floor(Math.random() * iArray.length), 1)[0];
}