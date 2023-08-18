var boxIndexUnderPosition = -1;
var currentScale = 0.5;
var targetScale = 1.0;
var currentAlpha = 0.0;
var targetAlpha = 1.0;
var lastTime;
var firstFrame = true;
var canvas;
var context;
var maleBoxColor = '#98C147';
var lighterMaleBoxColor;
var femaleBoxColor = '#EA884D';
var lighterFemaleBoxColor;
var unknownGenderBoxColor;
var lighterUnknownGenderBoxColor;
var linesColor = '#E4E57F';
var animateInterval;

function initPersonChart() {
    canvas = document.getElementById('person_chart_canvas_id');
    
    if (canvas.getContext) {
        context = canvas.getContext('2d');
    }
    else {
        alert('Canvas not supported on this browser!');
    }
    
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("touchstart", touchStart, false);
    canvas.addEventListener("touchmove", touchMove, true);
    //canvas.addEventListener("touchend", touchUp, false);
    
    //document.body.addEventListener("mouseup", mouseUp, false);
    //document.body.addEventListener("touchcancel", touchUp, false);
    
    retinaSupport();
    
    lighterMaleBoxColor = lighterHexColor(maleBoxColor, 0.1);
    lighterFemaleBoxColor = lighterHexColor(femaleBoxColor, 0.1);
    
    unknownGenderBoxColor = '#DDD';
    lighterUnknownGenderBoxColor = lighterHexColor(unknownGenderBoxColor, 0.1);
    
    lastDate = new Date();
    currentScale = 0.5;
    targetScale = 1.0;
    animateInterval = setInterval(animate, 50);
}

function retinaSupport() {
    devicePixelRatio = window.devicePixelRatio || 1;
    
    backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    
    if (devicePixelRatio != backingStoreRatio) {
        ratio = devicePixelRatio / backingStoreRatio;
        
        var oldWidth = canvas.width;
        var oldHeight = canvas.height;
        
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        
        context.scale(ratio, ratio);
    }
}

function animate() {
    var deltaT;
    
    var now = new Date();
    
    var time = now.getUTCSeconds() * 1000 + now.getUTCMilliseconds();
    
    if (firstFrame)
    {
        lastTime = time;
        firstFrame = false;
    }
    
    deltaT = time - lastTime;
    
    if (deltaT < 0) {
        deltaT = 0;
    }
    
    var animationSpeed = deltaT * 0.006;
    
    if (animationSpeed > 1.0) {
        animationSpeed = 1.0;
    }
    
    lastTime = time;
    
    if ((targetScale - currentScale) > 0.001)
    {
        currentScale += (targetScale - currentScale) * animationSpeed;
    }
    else
    {
        currentScale = targetScale;
        clearInterval(animateInterval);
    }
    
    if ((targetAlpha - currentAlpha) > 0.01 && currentScale < 1.2)
    {
        currentAlpha += (targetAlpha - currentAlpha) * animationSpeed;
    }
    
    drawPersonChart();
}

function drawPersonChart()
{
    context.save();
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2.0, canvas.height / 2.0);
    context.scale(currentScale, currentScale);
    context.translate(-canvas.width / 2.0, -canvas.height / 2.0);
    context.globalAlpha = currentAlpha;
    
    for (var i = 0; i < personChartData.length; i++) {
        //Draw connection lines
        context.save();
        
        drawLinesForBox(personChartData[i]);
        
        context.restore();
        
        //Draw box
        context.save();
        
        if (i == boxIndexUnderPosition) {
            drawBoxForPerson(personChartData[i], true);
        }
        else {
            drawBoxForPerson(personChartData[i], false);
        }
        
        context.restore();
        
        //Draw text
        context.save();
        
        context.fillStyle = '#333';
        context.textAlign = 'center';
        context.font = 'bold 14px Helvetica';
        context.textBaseline = 'top';
        
        var currentPosition = personChartData[i].top + personChartData[i].height / 2.0 - (personChartData[i].nameTextLines.length * personChartData[i].nameLineSpacing + personChartData[i].dateTextLines.length * personChartData[i].dateLineSpacing) / 2.0;
        
        currentPosition -= 2.0;
        
        for (var j = 0; j < personChartData[i].nameTextLines.length; j++) {
            context.fillText(personChartData[i].nameTextLines[j], personChartData[i].left + personChartData[i].width / 2.0, currentPosition);
            currentPosition += personChartData[i].nameLineSpacing;
        }
        
        context.font = '12px Helvetica';
        
        currentPosition += 4.0;
        
        for (var j = 0; j < personChartData[i].dateTextLines.length; j++) {
            context.fillText(personChartData[i].dateTextLines[j], personChartData[i].left + personChartData[i].width / 2.0, currentPosition);
            currentPosition += personChartData[i].dateLineSpacing;
        }
        
        context.restore();
    }
    
    context.restore();
}

function drawBoxForPerson(person, boxUnderPosition) {
    var x, y, w, h, r = 10;
    
    if (boxUnderPosition) {
        x = person.left - 2.0;
        y = person.top - 2.0;
        w = person.width + 4.0;
        h = person.height + 4.0;
    }
    else {
        x = person.left;
        y = person.top;
        w = person.width;
        h = person.height;
    }
    
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    
    context.beginPath();
    context.moveTo(x+r, y);
    context.lineTo(x + w-r, y);
    context.quadraticCurveTo(x + w, y, x + w, y+r);
    context.lineTo(x + w, y+h-r);
    context.quadraticCurveTo(x + w, y + h, x + w-r, y + h);
    context.lineTo(x+r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h-r);
    context.lineTo(x, y+r);
    context.quadraticCurveTo(x, y, x+r, y);
    context.closePath();
    
    context.save();
    
    if (boxUnderPosition) {
        if (person.currentPerson) {
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 20;
            switch (person.personGender)
            {
                case 0:
                {
                    context.shadowColor = lighterMaleBoxColor;
                    break;
                }
                case 1:
                {
                    context.shadowColor = lighterFemaleBoxColor;
                    break;
                }
                case 2:
                {
                    context.shadowColor = lighterUnknownGenderBoxColor;
                    break;
                }
            }
            if (!person.personExported) {
                context.shadowColor = '#666';
            }
        }
        else {
            context.shadowOffsetX = 4;
            context.shadowOffsetY = 4;
            context.shadowBlur = 4;
            context.shadowColor = '#666';
        }
    }
    else
    {
        if (person.currentPerson) {
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 20;
            switch (person.personGender)
            {
                case 0:
                {
                    context.shadowColor = lighterMaleBoxColor;
                    break;
                }
                case 1:
                {
                    context.shadowColor = lighterFemaleBoxColor;
                    break;
                }
                case 2:
                {
                    context.shadowColor = lighterUnknownGenderBoxColor;
                    break;
                }
            }
            if (!person.personExported) {
                context.shadowColor = '#666';
            }
        }
    }
    
    var boxGradient = context.createLinearGradient(0, person.top, 0, person.top + person.height);
    
    if (person.personExported) {
        switch (person.personGender)
        {
            case 0:
            {
                boxGradient.addColorStop(0, lighterMaleBoxColor);
                boxGradient.addColorStop(1, maleBoxColor);
                break;
            }
            case 1:
            {
                boxGradient.addColorStop(0, lighterFemaleBoxColor);
                boxGradient.addColorStop(1, femaleBoxColor);
                break;
            }
            case 2:
            {
                boxGradient.addColorStop(0, lighterUnknownGenderBoxColor);
                boxGradient.addColorStop(1, unknownGenderBoxColor);
                break;
            }
        }
    }
    else
    {
        boxGradient.addColorStop(0, '#CCCCCC');
        boxGradient.addColorStop(1, '#999999');
    }
    
    context.fillStyle = boxGradient;
    
    context.fill();
    context.restore();
    
    context.lineWidth = 0.1;
    context.strokeStyle = '#333';
    
    context.stroke();
}

function drawLinesForBox(box) {
    for (var i = 0; i < box.childBoxIndexes.length; i++) {
        var index = box.childBoxIndexes[i];
        context.beginPath();
        context.moveTo(box.left, box.top + box.height / 2.0);
        context.lineTo(personChartData[index].left + personChartData[index].width, personChartData[index].top + personChartData[index].height / 2.0);
        context.strokeStyle = linesColor;
        context.stroke();
    }
    
    for (var i = 0; i < box.partnerBoxIndexes.length; i++) {
        var index = box.partnerBoxIndexes[i];
        context.beginPath();
        
        if (box.top < personChartData[index].top) {
            context.moveTo(box.left + box.width / 2.0, box.top + box.height);
            context.lineTo(personChartData[index].left + personChartData[index].width / 2.0, personChartData[index].top);
        }
        else {
            context.moveTo(box.left + box.width / 2.0, box.top);
            context.lineTo(personChartData[index].left + personChartData[index].width / 2.0, personChartData[index].top + personChartData[index].height);
        }
        
        context.strokeStyle = linesColor;
        context.stroke();
    }
    
    for (var i = 0; i < box.ancestorBoxIndexes.length; i++) {
        var index = box.ancestorBoxIndexes[i];
        context.beginPath();
        context.moveTo(box.left + box.width, box.top + box.height / 2.0);
        context.lineTo(personChartData[index].left, personChartData[index].top + personChartData[index].height / 2.0);
        context.strokeStyle = linesColor;
        context.stroke();
    }
}

function getTouchPosition(event) {
    var rect = canvas.getBoundingClientRect();
    return {
    x: event.targetTouches[0].clientX - rect.left,
    y: event.targetTouches[0].clientY - rect.top
    };
}

function touchMove(event) {
    var touchPos = getTouchPosition(event);
    var index = indexOfRectUnderPosition(touchPos);
    
    if  (index >= 0 && personChartData[index].personExported) {
        if (index != boxIndexUnderPosition) {
            boxIndexUnderPosition = index;
            setTimeout(drawPersonChart, 1);
        }
    }
    else {
        if (index != boxIndexUnderPosition) {
            boxIndexUnderPosition = -1;
            setTimeout(drawPersonChart, 1);
        }
    }
}

function touchStart(event) {
    var touchPos = getTouchPosition(event);
    var index = indexOfRectUnderPosition(touchPos);
    
    if  (index >= 0 && personChartData[index].personExported) {
        var linkToPersonPage = personChartData[index].linkToPersonPage;
        document.location.href = linkToPersonPage;
    }
}

function getMousePosition(event) {
    var rect = canvas.getBoundingClientRect();
    return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
    };
}

function mouseMove(event) {
    var mousePos = getMousePosition(event);
    var index = indexOfRectUnderPosition(mousePos);
    
    if  (index >= 0 && personChartData[index].personExported) {
        if (index != boxIndexUnderPosition) {
            boxIndexUnderPosition = index;
            setTimeout(drawPersonChart, 1);
        }
    }
    else {
        if (index != boxIndexUnderPosition) {
            boxIndexUnderPosition = -1;
            setTimeout(drawPersonChart, 1);
        }
    }
}

function mouseDown(event) {
    var mousePos = getMousePosition(event);
    var index = indexOfRectUnderPosition(mousePos);
    
    if  (index >= 0 && personChartData[index].personExported) {
        var linkToPersonPage = personChartData[index].linkToPersonPage;
        document.location.href = linkToPersonPage;
    }
}

function indexOfRectUnderPosition(p) {
    for (var i = 0; i < personChartData.length; i++) {
        if (pointInRect(p, personChartData[i].left, personChartData[i].top, personChartData[i].width, personChartData[i].height)) {
            return i;
        }
    }
    
    return -1;
}

function pointInRect(p, x, y, w, h) {
    if (p.x > x && p.x < x + w && p.y > y && p.y < y + h) {
        return true;
    }
    
    return false;
}

function lighterHexColor(hexColor, lighter) {
    hexColor = String(hexColor).replace(/[^0-9a-f]/gi, '');
	if (hexColor.length < 6) {
		hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
	}
    
	lighter = lighter || 0;
    
	var theLighterHexColor = "#", colorComponent, i;
	for (i = 0; i < 3; i++) {
		colorComponent = parseInt(hexColor.substr(i*2, 2), 16);
        colorComponent = Math.round(Math.min(Math.max(0, colorComponent + (255 * lighter)), 255)).toString(16);
		theLighterHexColor += ("00"+colorComponent).substr(colorComponent.length);
	}
    
	return theLighterHexColor;
}