/**
 * WebGL Renderer for the Visual Engine
 * Provides hardware-accelerated 2D graphics using WebGL
 */

export class WebGLRenderer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            width: options.width || 800,
            height: options.height || 600,
            pixelRatio: options.pixelRatio || window.devicePixelRatio || 1,
            alpha: options.alpha !== false,
            antialias: options.antialias !== false,
            powerPreference: options.powerPreference || 'default',
            ...options
        };

        this.canvas = null;
        this.gl = null;
        this.programs = new Map();
        this.buffers = new Map();
        this.textures = new Map();
        this.activeProgram = null;
        
        // Transformation matrix
        this.projectionMatrix = new Float32Array(16);
        this.modelMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        
        // Object batching
        this.batchBuffer = [];
        this.maxBatchSize = 1000;
        
        this.initialize();
    }

    initialize() {
        try {
            // Create canvas element
            this.canvas = document.createElement('canvas');
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.display = 'block';
            
            // Set canvas size with device pixel ratio
            this.canvas.width = this.options.width * this.options.pixelRatio;
            this.canvas.height = this.options.height * this.options.pixelRatio;
            
            // Get WebGL context
            this.gl = this.canvas.getContext('webgl', {
                alpha: this.options.alpha,
                antialias: this.options.antialias,
                powerPreference: this.options.powerPreference
            }) || this.canvas.getContext('experimental-webgl');
            
            if (!this.gl) {
                throw new Error('WebGL not supported');
            }
            
            // Setup WebGL state
            this.setupWebGL();
            this.createShaders();
            this.createBuffers();
            this.setupMatrices();
            
            // Add accessibility attributes
            this.canvas.setAttribute('role', 'img');
            this.canvas.setAttribute('aria-label', 'WebGL simulation graphics');
            
            // Append to container
            this.container.appendChild(this.canvas);
            
            console.log('WebGLRenderer: Initialized successfully');
        } catch (error) {
            console.error('WebGLRenderer: Failed to initialize:', error);
            throw error;
        }
    }

    setupWebGL() {
        const gl = this.gl;
        
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

        const program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
        this.programs.set('basic', program);
        
        // Get attribute and uniform locations
        program.locations = {
            attributes: {
                position: this.gl.getAttribLocation(program, 'a_position'),
                texCoord: this.gl.getAttribLocation(program, 'a_texCoord'),
                color: this.gl.getAttribLocation(program, 'a_color')
            },
            uniforms: {
                projection: this.gl.getUniformLocation(program, 'u_projection'),
                model: this.gl.getUniformLocation(program, 'u_model'),
                texture: this.gl.getUniformLocation(program, 'u_texture'),
                useTexture: this.gl.getUniformLocation(program, 'u_useTexture')
            }
        };
        
        this.useProgram('basic');
    }

    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error('Failed to link shader program: ' + error);
        }
        
        return program;
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Failed to compile shader: ' + error);
        }
        
        return shader;
    }

    createBuffers() {
        const gl = this.gl;
        
        // Create vertex buffer
        this.buffers.set('vertex', gl.createBuffer());
        
        // Create index buffer
        this.buffers.set('index', gl.createBuffer());
        
        // Create a buffer for batched rendering
        this.buffers.set('batch', gl.createBuffer());
    }

    setupMatrices() {
        // Setup orthographic projection matrix
        this.setOrthographicProjection(0, this.options.width, this.options.height, 0, -1, 1);
        
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
        matrix[10] = -2 / (far - near);
        matrix[11] = 0;
        
        matrix[12] = -(right + left) / (right - left);
        matrix[13] = -(top + bottom) / (top - bottom);
        matrix[14] = -(far + near) / (far - near);
        matrix[15] = 1;
    }

    setIdentityMatrix(matrix) {
        matrix[0] = 1; matrix[1] = 0; matrix[2] = 0; matrix[3] = 0;
        matrix[4] = 0; matrix[5] = 1; matrix[6] = 0; matrix[7] = 0;
        matrix[8] = 0; matrix[9] = 0; matrix[10] = 1; matrix[11] = 0;
        matrix[12] = 0; matrix[13] = 0; matrix[14] = 0; matrix[15] = 1;
    }

    useProgram(programName) {
        const program = this.programs.get(programName);
        if (program && program !== this.activeProgram) {
            this.gl.useProgram(program);
            this.activeProgram = program;
            
            // Update matrices
            this.gl.uniformMatrix4fv(program.locations.uniforms.projection, false, this.projectionMatrix);
            this.gl.uniformMatrix4fv(program.locations.uniforms.model, false, this.modelMatrix);
        }
    }

    // Required methods for Visual Engine integration
    get type() {
        return 'webgl';
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
            type: object.type || 'rect',
            x: object.x || 0,
            y: object.y || 0,
            width: object.width || 50,
            height: object.height || 50,
            color: this.parseColor(object.fill || '#ffffff'),
            alpha: object.alpha !== undefined ? object.alpha : 1,
            rotation: object.rotation || 0,
            scale: object.scale || 1
        };
        
        this.batchBuffer.push(batchItem);
        
        // Flush batch if it gets too large
        if (this.batchBuffer.length >= this.maxBatchSize) {
            this.flushBatch();
        }
    }

    flushBatch() {
        if (this.batchBuffer.length === 0) return;
        
        const gl = this.gl;
        const program = this.activeProgram;
        
        if (!program) return;
        
        // Prepare vertex data for all batched objects
        const vertices = [];
        const indices = [];
        let vertexIndex = 0;
        
        this.batchBuffer.forEach((item, i) => {
            const { x, y, width, height, color, alpha, rotation, scale } = item;
            
            // Create quad vertices
            const x1 = x;
            const y1 = y;
            const x2 = x + width;
            const y2 = y + height;
            
            // Vertex data: [x, y, u, v, r, g, b, a]
            vertices.push(
                x1, y1, 0, 0, color[0], color[1], color[2], alpha,
                x2, y1, 1, 0, color[0], color[1], color[2], alpha,
                x2, y2, 1, 1, color[0], color[1], color[2], alpha,
                x1, y2, 0, 1, color[0], color[1], color[2], alpha
            );
            
            // Indices for two triangles
            const baseIndex = vertexIndex;
            indices.push(
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
            );
            
            vertexIndex += 4;
        });
        
        // Upload vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.get('batch'));
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        
        // Upload index data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.get('index'));
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
        
        // Setup vertex attributes
        const stride = 8 * 4; // 8 floats per vertex
        
        gl.enableVertexAttribArray(program.locations.attributes.position);
        gl.vertexAttribPointer(program.locations.attributes.position, 2, gl.FLOAT, false, stride, 0);
        
        gl.enableVertexAttribArray(program.locations.attributes.texCoord);
        gl.vertexAttribPointer(program.locations.attributes.texCoord, 2, gl.FLOAT, false, stride, 2 * 4);
        
        gl.enableVertexAttribArray(program.locations.attributes.color);
        gl.vertexAttribPointer(program.locations.attributes.color, 4, gl.FLOAT, false, stride, 4 * 4);
        
        // Set uniforms
        gl.uniform1i(program.locations.uniforms.useTexture, false);
        
        // Draw
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        
        // Clear batch
        this.batchBuffer = [];
    }

    parseColor(colorString) {
        // Simple color parsing - just handle hex colors for now
        if (typeof colorString === 'string' && colorString.startsWith('#')) {
            const hex = colorString.slice(1);
            if (hex.length === 3) {
                return [
                    parseInt(hex[0] + hex[0], 16) / 255,
                    parseInt(hex[1] + hex[1], 16) / 255,
                    parseInt(hex[2] + hex[2], 16) / 255
                ];
            } else if (hex.length === 6) {
                return [
                    parseInt(hex.slice(0, 2), 16) / 255,
                    parseInt(hex.slice(2, 4), 16) / 255,
                    parseInt(hex.slice(4, 6), 16) / 255
                ];
            }
        }
        
        // Default to white
        return [1, 1, 1];
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
            this.setOrthographicProjection(0, this.options.width, this.options.height, 0, -1, 1);
            
            // Update projection matrix in shader
            if (this.activeProgram) {
                this.gl.uniformMatrix4fv(this.activeProgram.locations.uniforms.projection, false, this.projectionMatrix);
            }
        }
    }

    // Texture management
    createTexture(image) {
        const gl = this.gl;
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
        const gl = this.gl;
        return {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
        };
    }

    destroy() {
        if (this.gl) {
            // Clean up WebGL resources
            this.programs.forEach(program => this.gl.deleteProgram(program));
            this.buffers.forEach(buffer => this.gl.deleteBuffer(buffer));
            this.textures.forEach(texture => this.gl.deleteTexture(texture));
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        console.log('WebGLRenderer: Destroyed');
    }
}

export default WebGLRenderer;
