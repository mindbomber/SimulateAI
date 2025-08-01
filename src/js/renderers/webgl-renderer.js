/**
 * WebGL Renderer for the Visual Engine
 * Provides hardware-accelerated 2D graphics using WebGL
 */

import logger from "../utils/logger.js";

// WebGL renderer constants
const WEBGL_CONSTANTS = {
  // Default dimensions
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,

  // Matrix dimensions
  MATRIX_SIZE: 16,

  // WebGL math constants
  DEPTH_PROJECTION: -2,

  // Geometry constants
  VERTICES_PER_QUAD: 4,
  TRIANGLE_VERTEX_COUNT: 3,
  FLOATS_PER_VERTEX: 8, // x, y, u, v, r, g, b, a
  BYTES_PER_FLOAT: 4,

  // Default object dimensions
  DEFAULT_OBJECT_SIZE: 50,

  // Color parsing constants
  HEX_SHORT_LENGTH: 3,
  HEX_LONG_LENGTH: 6,
  HEX_RADIX: 16,
  COLOR_COMPONENT_MAX: 255,
  HEX_SLICE_START: 2,
  HEX_SLICE_MID: 4,
  HEX_SLICE_END: 6,

  // Default colors
  DEFAULT_COLOR: [1, 1, 1], // White
};

export class WebGLRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || WEBGL_CONSTANTS.DEFAULT_WIDTH,
      height: options.height || WEBGL_CONSTANTS.DEFAULT_HEIGHT,
      pixelRatio: options.pixelRatio || window.devicePixelRatio || 1,
      alpha: options.alpha !== false,
      antialias: options.antialias !== false,
      powerPreference: options.powerPreference || "default",
      ...options,
    };

    this.canvas = null;
    this.gl = null;
    this.programs = new Map();
    this.buffers = new Map();
    this.textures = new Map();
    this.activeProgram = null;

    // Transformation matrix
    this.projectionMatrix = new Float32Array(WEBGL_CONSTANTS.MATRIX_SIZE);
    this.modelMatrix = new Float32Array(WEBGL_CONSTANTS.MATRIX_SIZE);
    this.viewMatrix = new Float32Array(WEBGL_CONSTANTS.MATRIX_SIZE);

    // Object batching
    this.batchBuffer = [];
    this.maxBatchSize = 1000;

    this.initialize();
  }

  initialize() {
    try {
      // Create canvas element
      this.canvas = document.createElement("canvas");
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.display = "block";

      // Set canvas size with device pixel ratio
      this.canvas.width = this.options.width * this.options.pixelRatio;
      this.canvas.height = this.options.height * this.options.pixelRatio;

      // Get WebGL context
      this.gl =
        this.canvas.getContext("webgl", {
          alpha: this.options.alpha,
          antialias: this.options.antialias,
          powerPreference: this.options.powerPreference,
        }) || this.canvas.getContext("experimental-webgl");

      if (!this.gl) {
        throw new Error("WebGL not supported");
      }

      // Setup WebGL state
      this.setupWebGL();
      this.createShaders();
      this.createBuffers();
      this.setupMatrices();

      // Add accessibility attributes
      this.canvas.setAttribute("role", "img");
      this.canvas.setAttribute("aria-label", "WebGL simulation graphics");

      // Append to container
      this.container.appendChild(this.canvas);

      logger.info("WebGLRenderer: Initialized successfully");
    } catch (error) {
      logger.error("WebGLRenderer: Failed to initialize:", error);
      throw error;
    }
  }

  setupWebGL() {
    const { gl } = this;

    // Set viewport
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Set clear color
    gl.clearColor(0, 0, 0, 0);
  }

  createShaders() {
    // Simple 2D vertex shader
    const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            attribute vec4 a_color;
            
            uniform mat4 u_projection;
            uniform mat4 u_model;
            
            varying vec2 v_texCoord;
            varying vec4 v_color;
            
            void main() {
                gl_Position = u_projection * u_model * vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
                v_color = a_color;
            }
        `;

    // Simple fragment shader
    const fragmentShaderSource = `
            precision mediump float;
            
            varying vec2 v_texCoord;
            varying vec4 v_color;
            
            uniform sampler2D u_texture;
            uniform bool u_useTexture;
            
            void main() {
                if (u_useTexture) {
                    gl_FragColor = texture2D(u_texture, v_texCoord) * v_color;
                } else {
                    gl_FragColor = v_color;
                }
            }
        `;

    const program = this.createShaderProgram(
      vertexShaderSource,
      fragmentShaderSource,
    );
    this.programs.set("basic", program);

    // Get attribute and uniform locations
    program.locations = {
      attributes: {
        position: this.gl.getAttribLocation(program, "a_position"),
        texCoord: this.gl.getAttribLocation(program, "a_texCoord"),
        color: this.gl.getAttribLocation(program, "a_color"),
      },
      uniforms: {
        projection: this.gl.getUniformLocation(program, "u_projection"),
        model: this.gl.getUniformLocation(program, "u_model"),
        texture: this.gl.getUniformLocation(program, "u_texture"),
        useTexture: this.gl.getUniformLocation(program, "u_useTexture"),
      },
    };

    this.useProgram("basic");
  }

  createShaderProgram(vertexSource, fragmentSource) {
    const { gl } = this;

    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      fragmentSource,
    );

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Failed to link shader program: ${error}`);
    }

    return program;
  }

  createShader(type, source) {
    const { gl } = this;
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${error}`);
    }

    return shader;
  }

  createBuffers() {
    const { gl } = this;

    // Create vertex buffer
    this.buffers.set("vertex", gl.createBuffer());

    // Create index buffer
    this.buffers.set("index", gl.createBuffer());

    // Create a buffer for batched rendering
    this.buffers.set("batch", gl.createBuffer());
  }

  setupMatrices() {
    // Setup orthographic projection matrix
    this.setOrthographicProjection(
      0,
      this.options.width,
      this.options.height,
      0,
      -1,
      1,
    );

    // Initialize model matrix as identity
    this.setIdentityMatrix(this.modelMatrix);
    this.setIdentityMatrix(this.viewMatrix);
  }

  setOrthographicProjection(left, right, bottom, top, near, far) {
    const matrix = this.projectionMatrix;

    matrix[0] = 2 / (right - left);
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;

    matrix[4] = 0;
    matrix[5] = 2 / (top - bottom);
    matrix[6] = 0;
    matrix[7] = 0;

    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = WEBGL_CONSTANTS.DEPTH_PROJECTION / (far - near);
    matrix[11] = 0;

    matrix[12] = -(right + left) / (right - left);
    matrix[13] = -(top + bottom) / (top - bottom);
    matrix[14] = -(far + near) / (far - near);
    matrix[15] = 1;
  }

  setIdentityMatrix(matrix) {
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 0;
    matrix[5] = 1;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = 1;
    matrix[11] = 0;
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    matrix[15] = 1;
  }

  useProgram(programName) {
    const program = this.programs.get(programName);
    if (program && program !== this.activeProgram) {
      this.gl.useProgram(program);
      this.activeProgram = program;

      // Update matrices
      this.gl.uniformMatrix4fv(
        program.locations.uniforms.projection,
        false,
        this.projectionMatrix,
      );
      this.gl.uniformMatrix4fv(
        program.locations.uniforms.model,
        false,
        this.modelMatrix,
      );
    }
  }

  // Required methods for Visual Engine integration
  get type() {
    return "webgl";
  }

  getElement() {
    return this.canvas;
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.batchBuffer = [];
  }

  render(scene) {
    this.clear();
    if (scene && scene.render) {
      scene.render(this);
    }
    this.flushBatch();
  }

  renderObject(object) {
    if (!object || object.visible === false) return;

    // Add object to batch for efficient rendering
    this.addToBatch(object);
  }

  addToBatch(object) {
    // Simple batching - add object data to buffer
    const batchItem = {
      type: object.type || "rect",
      x: object.x || 0,
      y: object.y || 0,
      width: object.width || WEBGL_CONSTANTS.DEFAULT_OBJECT_SIZE,
      height: object.height || WEBGL_CONSTANTS.DEFAULT_OBJECT_SIZE,
      color: this.parseColor(object.fill || "#ffffff"),
      alpha: object.alpha !== undefined ? object.alpha : 1,
      rotation: object.rotation || 0,
      scale: object.scale || 1,
    };

    this.batchBuffer.push(batchItem);

    // Flush batch if it gets too large
    if (this.batchBuffer.length >= this.maxBatchSize) {
      this.flushBatch();
    }
  }

  flushBatch() {
    if (this.batchBuffer.length === 0) return;

    const { gl } = this;
    const { activeProgram: program } = this;

    if (!program) return;

    // Prepare vertex data for all batched objects
    const vertices = [];
    const indices = [];
    let vertexIndex = 0;

    this.batchBuffer.forEach((item, _i) => {
      const { x, y, width, height, color, alpha } = item;

      // Create quad vertices
      const x1 = x;
      const y1 = y;
      const x2 = x + width;
      const y2 = y + height;

      // Vertex data: [x, y, u, v, r, g, b, a]
      vertices.push(
        x1,
        y1,
        0,
        0,
        color[0],
        color[1],
        color[2],
        alpha,
        x2,
        y1,
        1,
        0,
        color[0],
        color[1],
        color[2],
        alpha,
        x2,
        y2,
        1,
        1,
        color[0],
        color[1],
        color[2],
        alpha,
        x1,
        y2,
        0,
        1,
        color[0],
        color[1],
        color[2],
        alpha,
      );

      // Indices for two triangles
      const baseIndex = vertexIndex;
      indices.push(
        baseIndex,
        baseIndex + 1,
        baseIndex + 2,
        baseIndex,
        baseIndex + 2,
        baseIndex + WEBGL_CONSTANTS.TRIANGLE_VERTEX_COUNT,
      );

      vertexIndex += WEBGL_CONSTANTS.VERTICES_PER_QUAD;
    });

    // Upload vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.get("batch"));
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Upload index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.get("index"));
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.DYNAMIC_DRAW,
    );

    // Setup vertex attributes
    const stride =
      WEBGL_CONSTANTS.FLOATS_PER_VERTEX * WEBGL_CONSTANTS.BYTES_PER_FLOAT; // 8 floats per vertex

    gl.enableVertexAttribArray(program.locations.attributes.position);
    gl.vertexAttribPointer(
      program.locations.attributes.position,
      2,
      gl.FLOAT,
      false,
      stride,
      0,
    );

    gl.enableVertexAttribArray(program.locations.attributes.texCoord);
    gl.vertexAttribPointer(
      program.locations.attributes.texCoord,
      2,
      gl.FLOAT,
      false,
      stride,
      WEBGL_CONSTANTS.HEX_SLICE_START * WEBGL_CONSTANTS.BYTES_PER_FLOAT,
    );

    gl.enableVertexAttribArray(program.locations.attributes.color);
    gl.vertexAttribPointer(
      program.locations.attributes.color,
      WEBGL_CONSTANTS.VERTICES_PER_QUAD,
      gl.FLOAT,
      false,
      stride,
      WEBGL_CONSTANTS.VERTICES_PER_QUAD * WEBGL_CONSTANTS.BYTES_PER_FLOAT,
    );

    // Set uniforms
    gl.uniform1i(program.locations.uniforms.useTexture, false);

    // Draw
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clear batch
    this.batchBuffer = [];
  }

  parseColor(colorString) {
    // Simple color parsing - just handle hex colors for now
    if (typeof colorString === "string" && colorString.startsWith("#")) {
      const hex = colorString.slice(1);
      if (hex.length === WEBGL_CONSTANTS.HEX_SHORT_LENGTH) {
        return [
          parseInt(hex[0] + hex[0], WEBGL_CONSTANTS.HEX_RADIX) /
            WEBGL_CONSTANTS.COLOR_COMPONENT_MAX,
          parseInt(hex[1] + hex[1], WEBGL_CONSTANTS.HEX_RADIX) /
            WEBGL_CONSTANTS.COLOR_COMPONENT_MAX,
          parseInt(hex[2] + hex[2], WEBGL_CONSTANTS.HEX_RADIX) /
            WEBGL_CONSTANTS.COLOR_COMPONENT_MAX,
        ];
      } else if (hex.length === WEBGL_CONSTANTS.HEX_LONG_LENGTH) {
        return [
          parseInt(
            hex.slice(0, WEBGL_CONSTANTS.HEX_SLICE_START),
            WEBGL_CONSTANTS.HEX_RADIX,
          ) / WEBGL_CONSTANTS.COLOR_COMPONENT_MAX,
          parseInt(
            hex.slice(
              WEBGL_CONSTANTS.HEX_SLICE_START,
              WEBGL_CONSTANTS.HEX_SLICE_MID,
            ),
            WEBGL_CONSTANTS.HEX_RADIX,
          ) / WEBGL_CONSTANTS.COLOR_COMPONENT_MAX,
          parseInt(
            hex.slice(
              WEBGL_CONSTANTS.HEX_SLICE_MID,
              WEBGL_CONSTANTS.HEX_SLICE_END,
            ),
            WEBGL_CONSTANTS.HEX_RADIX,
          ) / WEBGL_CONSTANTS.COLOR_COMPONENT_MAX,
        ];
      }
    }

    // Default to white
    return WEBGL_CONSTANTS.DEFAULT_COLOR;
  }

  renderByType(object) {
    // For WebGL, we batch everything and render later
    this.addToBatch(object);
  }

  resize() {
    if (this.container && this.canvas) {
      const rect = this.container.getBoundingClientRect();
      this.options.width = rect.width;
      this.options.height = rect.height;

      this.canvas.width = this.options.width * this.options.pixelRatio;
      this.canvas.height = this.options.height * this.options.pixelRatio;

      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.setOrthographicProjection(
        0,
        this.options.width,
        this.options.height,
        0,
        -1,
        1,
      );

      // Update projection matrix in shader
      if (this.activeProgram) {
        this.gl.uniformMatrix4fv(
          this.activeProgram.locations.uniforms.projection,
          false,
          this.projectionMatrix,
        );
      }
    }
  }

  // Texture management
  createTexture(image) {
    const { gl } = this;
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
  }

  // Performance monitoring
  getInfo() {
    const { gl } = this;
    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    };
  }

  destroy() {
    if (this.gl) {
      // Clean up WebGL resources
      this.programs.forEach((program) => this.gl.deleteProgram(program));
      this.buffers.forEach((buffer) => this.gl.deleteBuffer(buffer));
      this.textures.forEach((texture) => this.gl.deleteTexture(texture));
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    logger.info("WebGLRenderer: Destroyed");
  }
}

export default WebGLRenderer;
