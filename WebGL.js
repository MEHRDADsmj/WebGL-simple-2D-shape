var gl;

function InitGL(canvas)
{
    gl = canvas.getContext("experimental-webgl");
    gl.viewportHeight = canvas.height;
    gl.viewportWidth = canvas.width;
    if(!gl)
    {
        alert("InitGL failed");
    }
}

function getShader(gl, id)
{
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

var Program;

function InitShaders()
{
    var fragment = getShader(gl, "fragment");
    var vertex = getShader(gl, "vertex");

    Program = gl.createProgram();
    gl.attachShader(Program, fragment);
    gl.attachShader(Program, vertex);
    gl.linkProgram(Program);

    if(!gl.getProgramParameter(Program, gl.LINK_STATUS))
    {
        alert("InitShaders linking program failed");
    }

    gl.useProgram(Program);

    gl.deleteShader(fragment);
    gl.deleteShader(vertex);

    Program.vertexPositionAttribute = gl.getAttribLocation(Program, "aVertexPosition");
    gl.enableVertexAttribArray(Program.vertexPositionAttribute);

    Program.pMatrixUniform = gl.getUniformLocation(Program, "uPMatrix");
    Program.mvMatrixUniform = gl.getUniformLocation(Program, "uMVMatrix");
}

var TriangleVertexPositionBuffer;

function InitBuffers()
{
    // Trying to make gitlab logo
    var vertices = [
        -1.0, 2.0, 0.0,
        -1.5, 1.0, 0.0,
        -0.5, 1.0, 0.0,
        ///////////////
        1.0, 2.0, 0.0,
        1.5, 1.0, 0.0,
        0.5, 1.0, 0.0,
        ///////////////
        -2.0, 0.0, 0.0,
        2.0, 0.0, 0.0,
        -1.5, 1.0, 0.0,
        ///////////////
        2.0, 0.0, 0.0,
        -1.5, 1.0, 0.0,
        1.5, 1.0, 0.0,
        ///////////////
        2.0, 0.0, 0.0,
        -2.0, 0.0, 0.0,
        0.0, -1.5, 0.0,
    ];

    TriangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TriangleVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    TriangleVertexPositionBuffer.itemSize = 3;
    TriangleVertexPositionBuffer.numItems = 15;
}

function DrawScene()
{
    gl.viewport(0.0, 0.0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, TriangleVertexPositionBuffer);
    gl.vertexAttribPointer(Program.vertexPositionAttribute, TriangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    SetMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, TriangleVertexPositionBuffer.numItems);
}

var pMatrix = mat4.create();
var mvMatrix = mat4.create();

function SetMatrixUniforms()
{
    gl.uniformMatrix4fv(Program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(Program.mvMatrixUniform, false, mvMatrix);
}

window.onload = function()
{
    var canvas = document.getElementById("main_canvas");
    InitGL(canvas);
    InitShaders();
    InitBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    DrawScene();
}