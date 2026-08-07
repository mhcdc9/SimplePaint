const toolbar = document.getElementById("toolbar");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d",{"willReadFrequently":false});
const colorPreview = document.getElementById("colorpreview");
const sizePreview = document.getElementById("sizepreview");
const coord = document.getElementById("coord");
const save = document.getElementById("save");

let x = 0;
let y = 0;
let savedX = null;
let savedY = null;
let drawing = false;
let selectedSize = null;
let selectedColor = null;

let mainColor = "black";

const sizes = [1,2,3,5,8,13,21,34,55];
for( let s of sizes)
{
    createSizeButton(s);
}
resetColorRow(1);
resetColorRow(2);
/*
createSizeButton(1);
createSizeButton(2);
createSizeButton(3);
selectedSize = createSizeButton(5);
selectedSize.classList.add("selected");
createSizeButton(7);
createSizeButton(10);
createSizeButton(15);
createSizeButton(20);
createSizeButton(30);
*/

document.addEventListener("keydown", keyDown);
toolbar.addEventListener("click", toolClick);
canvas.addEventListener("pointermove", logCoord);
canvas.addEventListener("click", click);
save.addEventListener("click", () => {
    var url = canvas.toDataURL("image/png");
    var download = document.createElement("a");
    download.href = url;
    download["download"] = "simplepaint.png";
    const date = new Date();
    const hr = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    var div = document.createElement("div");
    div.append(download);
    download.append(document.createTextNode(`Download Link(${hr}:${min}:${sec})`));
    save.after(div);
});
setTimeout(window.addEventListener("beforeunload", function(e) {
    e.preventDefault();
}), 30000);

ctx.lineWidth = 5;

setBounds(500,500);


colorPreview.style.width = "2.8rem";
colorPreview.style.height = "2.8rem";
colorPreview.style.background = "black";
colorPreview.style.marginRight = "1rem";

function setBounds(width, height) {
    let lineWidth = ctx.lineWidth;

    canvas.width = width;
    canvas.height = height;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.lineWidth = lineWidth;

    //selectedColor?.classList.remove("selected");
    //selectedSize?.classList.remove("selected");
}

function resetColorRow(index) {
    toolbar.rows[index].innerHTML = "";
    for(let i=0; i<=8; i++)
    {
        var v = i*.125;
        createColorButton(`oklch(${v} 0 none)`, index);
    }
}

function paintBackground(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0,0,canvas.width, canvas.height);
}

function createSizeButton(size) {
    const button = document.createElement("td");
    button.classList.add("size");
    button["storedSize"] = size;
    button.style.width = "1.2rem";
    button.style.height = "1.2rem";
    button.textContent = size;
    toolbar.rows[0].append(button);
    return button;
}

function addHue(lightness, chroma, hue, rowIndex = 2) {
    if (lightness > 1)
    {
        lightness /= 100;
    }

    toolbar.rows[rowIndex].remove();
    const row = document.createElement("tr");
    toolbar.append(row);
    let l,c;
    for(let i=0; i<=8; i++)
    {
        l = i*0.125;
        c = l < lightness ? ((lightness-l)/(lightness)) : (l-lightness)/(1-lightness);
        c = 1 - c;
        c *= chroma;
        createColorButton(`oklch(${l} ${c} ${hue})`, rowIndex);
        console.log(`oklch(${l} ${c} ${hue})`)
    }
}

function addHue2(chroma, degrees, rowIndex = 2) {
    toolbar.rows[rowIndex].remove();
    const row = document.createElement("tr");
    toolbar.append(row);
    for(let i=0; i<=8; i++)
    {
        createColorButton(`oklch(${i*0.125} ${chroma} ${degrees})`, rowIndex);
    }
}

function addColor(color) {
    createColorButton(color, 1);
}

function addSingle(lightness, chroma, hue) {
    if (lightness > 1)
    {
        lightness /= 100;
    }
    createColorButton(`oklch(${lightness} ${chroma} ${hue})`, 1);
}

function mixRow(style) {
    const cells = toolbar.rows[2].cells;
    const color1 = cells[0]["storedColor"];
    const color2 = cells[8]["storedColor"];
    console.log(color1);
    console.log(color2);
    for(let i=1; i<8; i++) {
        var newColor = `color-mix( in oklch ${style}, ${color1} ${100-i*12.5}%, ${color2} ${i*12.5}%)`;
        console.log(newColor);
        changeColorButton(cells[i],newColor);
    }
    selectedColor?.classList?.remove("selected");
    //setMainColor(`color-mix( in oklch, ${mainColor}, ${newColor})`);
}

function createColorButton(color, row=1) {
    const button = document.createElement("td");
    button.classList.add("color");
    button["storedColor"] = color;
    button.style.width = "1.2rem";
    button.style.height = "1.2rem";
    button.style.background = color;
    toolbar.rows[row].append(button);
    return button;
}

function changeColorButton(button, color)
{
    button.style.background = color;
    button["storedColor"] = color;
}

function setMainColorLCH(lightness, chroma, hue) {
    if (lightness > 1)
    {
        lightness /= 100;
    }
    setMainColor(`oklch(${lightness} ${chroma} ${hue})`);
}

function setMainColor(color) {
    selectedColor?.classList?.remove("selected");
    colorPreview.style.background = color;
    mainColor = window.getComputedStyle(colorPreview).backgroundColor;
    console.log(mainColor);
}

function toolClick(e) {
    const target = e.target;
    //console.log("you clicked on " + target.nodeName);
    if (target.nodeName == "TD")
    {
        if (target.classList.contains("color"))
        {
            //mainColor = target["storedColor"];
            

            if (e.shiftKey) //Mix colors
            {
                setMainColor(`color-mix( in oklch, ${mainColor}, ${target["storedColor"]})`);
            }
            else if (e.altKey) //repalce color in button
            {
                selectedColor?.classList?.remove("selected");
                selectedColor = target;
                selectedColor.classList.add("selected");
                changeColorButton(selectedColor, mainColor);
            }
            else //replace current color
            {
                setMainColor(target["storedColor"]);
                selectedColor = target;
                selectedColor.classList.add("selected");
            }
            //colorPreview.style.background = mainColor;
        }
        else if (target.classList.contains("size"))
        {
            ctx.lineWidth = target["storedSize"];
            selectedSize?.classList?.remove("selected");
            selectedSize = target;
            selectedSize.classList.add("selected");
            sizePreview.textContent = target["storedSize"];
        }
    }
}

function logCoord(e) {
    let rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.x;
    y = e.clientY - rect.y;
    coord.textContent = `${mainColor}: ${Math.trunc(x)},${Math.trunc(y)}`;

    if(e.ctrlKey || e.shiftKey)
    {
        return;
    }

    const mouseButtons = e.buttons;

    if (e.buttons % 2 == 1)
    {
        setDraw(true);
        if (Math.abs(x-savedX) + Math.abs(y-savedY) > (ctx.lineWidth/3))
        {
            ctx.lineTo(x,y);
            savedX = x;
            savedY = y;
            ctx.stroke();
        }
    }
    else
    {
        setDraw(false);
    }

}

function setDraw(b)
{
    if (b && !drawing)
    {
        ctx.strokeStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(x,y);
        savedX = x;
        savedY = y;
    }
    drawing = b;
}

function click(e) 
{
    if (e.ctrlKey || e.shiftKey)
    {
        let rect = canvas.getBoundingClientRect();
        x = e.clientX - rect.x;
        y = e.clientY - rect.y;
        let data = ctx.getImageData(x,y,1,1).data;
        let newColor = `rgb( ${data[0]} ${data[1]} ${data[2]})`;
        if (e.shiftKey)
        {
            setMainColor(`color-mix( in oklch, ${mainColor}, ${newColor})`);
        }
        else
        {
            setMainColor(newColor);
        }
    }
    ctx.strokeStyle = mainColor;
    ctx.beginPath();
    
    
}

function keyDown(event)
{
    if (event.repeat)
    {
        return;
    }

    if (event.code == 'KeyQ')
    {
        var lch = colorDeconstruct(mainColor);
        if (lch.length == 3)
        {
            addHue(lch[0],lch[1],lch[2]);
        }
    }
    else if(event.code == 'KeyA')
    {
        mixRow('shorter hue');
    }
    else if(event.code == 'KeyS')
    {
        mixRow('longer hue');
    }
}

function colorDeconstruct(color)
{
    if (color.startsWith("oklch"))
    {
        console.log(color);
        parts = color.slice(6,-1).split(" ");
        return [parts[0],parts[1],parts[2]];
    }
    return [];
}

function quickType(lightness, chroma, hue)
{
    lightnessinput.value = lightness;
    chromainput.value = chroma;
    hueinput.value = hue;
    setMainColorLCH(lightnessinput.value, chromainput.value, hueinput.value);
}

