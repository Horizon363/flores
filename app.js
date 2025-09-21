class MathematicalFlower3D {
    constructor() {
        // Parámetros del algoritmo Python
        this.params = {
            xPoints: 30,
            tPoints: 1200,
            timeMultiplier: 20,
            timeOffset: 4,
            deformationFactor: 0.5,
            exponentialDecay: 8,
            temporalFrequency: 15,
            changeAmplitude: 150,
            velocityModulator: 3.3,
            velocityPower: 4,
            coordinateMultiplier: 2,
            radialScale: 1.5,
            animationSpeed: 1.0,
            sinusoidalIntensity: 150
        };

        // Variaciones de las flores
        this.flowerVariations = [
            {timePhase: 0, scale: 1.0, position: [0, 0, 0], rotation: 0},
            {timePhase: 0.3, scale: 0.9, position: [40, -20, 15], rotation: 60},
            {timePhase: 0.6, scale: 0.85, position: [-35, -25, -10], rotation: 120},
            {timePhase: 0.9, scale: 0.95, position: [25, -45, 20], rotation: 180},
            {timePhase: 1.2, scale: 0.8, position: [-45, -40, 5], rotation: 240},
            {timePhase: 1.5, scale: 0.75, position: [15, -60, -15], rotation: 300}
        ];

        // Colores (azul a amarillo)
        this.colorGradient = {
            blue: [26, 85, 144],
            yellow: [255, 199, 13],
            steps: 200
        };

        // Estado de la aplicación
        this.isPlaying = true;
        this.currentTime = 0;
        this.debugMode = false;
        this.wireframeMode = false;
        this.showNormals = false;
        this.showParams = false;
        this.currentColorScheme = 0;
        this.formulasPanelVisible = false;

        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.flowers = [];
        this.particleSystem = null;
        this.controls = null;

        // Performance tracking
        this.frameCount = 0;
        this.fps = 60;
        this.lastTime = performance.now();

        this.init();
    }

    init() {
        this.setupThreeJS();
        this.createFlowers();
        this.setupParticleSystem();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        this.showLoadingComplete();
    }

    setupThreeJS() {
        const canvas = document.getElementById('canvas3d');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1f2121);
        this.scene.fog = new THREE.Fog(0x1f2121, 50, 200);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.camera.position.set(0, 50, 100);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x1f2121, 1);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffc70d, 0.5, 200);
        pointLight.position.set(0, 50, 0);
        this.scene.add(pointLight);

        // Mouse controls
        this.setupMouseControls();

        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupMouseControls() {
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        let rotationX = 0, rotationY = 0;

        const canvas = document.getElementById('canvas3d');

        canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;

            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;

            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;

            rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationX));

            this.camera.position.x = Math.sin(rotationY) * Math.cos(rotationX) * 100;
            this.camera.position.y = Math.sin(rotationX) * 100 + 50;
            this.camera.position.z = Math.cos(rotationY) * Math.cos(rotationX) * 100;

            this.camera.lookAt(0, 0, 0);

            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
        });
    }

    // Implementación exacta de las fórmulas del algoritmo Python con forma de flor mejorada
    generateFlowerGeometry(timeOffset = 0) {
        const vertices = [];
        const colors = [];
        const indices = [];
        const normals = [];

        const xPoints = Math.max(10, Math.min(50, this.params.xPoints)); // Limitar rango
        const tPoints = Math.max(200, Math.min(1200, this.params.tPoints)); // Más eficiente

        for (let i = 0; i < xPoints; i++) {
            for (let j = 0; j < tPoints; j++) {
                const x = i / (xPoints - 1);
                const t = (j / (tPoints - 1)) * this.params.timeMultiplier * Math.PI + 
                         this.params.timeOffset * Math.PI + timeOffset;

                // Fórmulas exactas del algoritmo Python
                const p = this.params.deformationFactor * Math.PI * 
                         Math.exp(-t / (this.params.exponentialDecay * Math.PI));
                
                const change = Math.sin(this.params.temporalFrequency * t) / this.params.sinusoidalIntensity;
                
                const mod = ((this.params.velocityModulator * t) % (2 * Math.PI)) / Math.PI;
                const u = 1 - Math.pow(1 - mod, this.params.velocityPower) / 2 + change;
                
                const y = this.params.coordinateMultiplier * 
                         Math.pow(x * x - x, 2) * Math.sin(p);
                
                const r = u * (x * Math.sin(p) + y * Math.cos(p)) * this.params.radialScale;
                const h = u * (x * Math.cos(p) - y * Math.sin(p));

                // Coordenadas finales con escalado para hacer más visible la forma de flor
                const scale = 15; // Factor de escala para hacer la flor más grande y visible
                const X = r * Math.cos(t) * scale;
                const Y = r * Math.sin(t) * scale;
                const Z = h * scale * 0.5; // Altura más comprimida para mejor forma

                vertices.push(X, Y, Z);

                // Calcular color basado en la distancia radial para mejor efecto
                const distance = Math.sqrt(X*X + Y*Y) / scale;
                const ratio = Math.min(1, distance / this.params.radialScale);
                
                const red = (this.colorGradient.blue[0] * (1 - ratio) + this.colorGradient.yellow[0] * ratio) / 255;
                const green = (this.colorGradient.blue[1] * (1 - ratio) + this.colorGradient.yellow[1] * ratio) / 255;
                const blue = (this.colorGradient.blue[2] * (1 - ratio) + this.colorGradient.yellow[2] * ratio) / 255;
                
                colors.push(red, green, blue);

                // Calcular normales más precisas
                const normalX = Math.cos(t) * u;
                const normalY = Math.sin(t) * u;
                const normalZ = 1;
                const length = Math.sqrt(normalX*normalX + normalY*normalY + normalZ*normalZ);
                
                normals.push(normalX/length, normalY/length, normalZ/length);

                // Generar índices para las caras (conectar puntos adyacentes)
                if (i < xPoints - 1 && j < tPoints - 1) {
                    const a = i * tPoints + j;
                    const b = (i + 1) * tPoints + j;
                    const c = (i + 1) * tPoints + (j + 1);
                    const d = i * tPoints + (j + 1);

                    // Dos triángulos por cuadrado
                    indices.push(a, b, c);
                    indices.push(a, c, d);
                }
            }
        }

        return { vertices, colors, indices, normals };
    }

    createFlowers() {
        this.flowers = [];

        this.flowerVariations.forEach((variation, index) => {
            const geometry = new THREE.BufferGeometry();
            const flowerData = this.generateFlowerGeometry(variation.timePhase);

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(flowerData.vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(flowerData.colors, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(flowerData.normals, 3));
            geometry.setIndex(flowerData.indices);
            geometry.computeVertexNormals(); // Mejorar iluminación

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                shininess: 100,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide,
                wireframe: this.wireframeMode
            });

            const mesh = new THREE.Mesh(geometry, material);
            
            // Aplicar transformaciones de la variación
            mesh.position.set(...variation.position);
            mesh.rotation.y = (variation.rotation * Math.PI) / 180;
            mesh.scale.setScalar(variation.scale);

            mesh.userData = { 
                variation: variation, 
                originalData: flowerData,
                index: index,
                timePhase: variation.timePhase
            };

            this.scene.add(mesh);
            this.flowers.push(mesh);
        });
    }

    updateFlowers() {
        this.flowers.forEach(flower => {
            const timeOffset = flower.userData.timePhase + 
                             this.currentTime * this.params.animationSpeed;
            
            const flowerData = this.generateFlowerGeometry(timeOffset);
            
            flower.geometry.setAttribute('position', 
                new THREE.Float32BufferAttribute(flowerData.vertices, 3));
            flower.geometry.setAttribute('color', 
                new THREE.Float32BufferAttribute(flowerData.colors, 3));
            flower.geometry.setAttribute('normal', 
                new THREE.Float32BufferAttribute(flowerData.normals, 3));
            
            flower.geometry.attributes.position.needsUpdate = true;
            flower.geometry.attributes.color.needsUpdate = true;
            flower.geometry.attributes.normal.needsUpdate = true;
            flower.geometry.computeVertexNormals();

            // Rotación suave del ramo
            flower.rotation.y += 0.005;
            flower.position.y += Math.sin(this.currentTime + flower.userData.index) * 0.1;
        });
    }

    setupParticleSystem() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 200,
                Math.random() * 100 - 50,
                (Math.random() - 0.5) * 200
            );

            colors.push(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                0
            );

            velocities.push(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.05,
                (Math.random() - 0.5) * 0.1
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.userData.velocities = velocities;
        this.scene.add(this.particleSystem);
    }

    updateParticleSystem() {
        if (!this.particleSystem) return;

        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Reset particle if it goes too far
            if (positions[i + 1] > 100) {
                positions[i] = (Math.random() - 0.5) * 200;
                positions[i + 1] = -50;
                positions[i + 2] = (Math.random() - 0.5) * 200;
            }
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    setupControls() {
        // Sliders
        this.setupSlider('xPoints', (value) => {
            this.params.xPoints = parseInt(value);
            this.regenerateFlowers();
        });

        this.setupSlider('timeMultiplier', (value) => {
            this.params.timeMultiplier = parseFloat(value) * 20;
        });

        this.setupSlider('deformationFactor', (value) => {
            this.params.deformationFactor = parseFloat(value);
        });

        this.setupSlider('animationSpeed', (value) => {
            this.params.animationSpeed = parseFloat(value);
        });

        this.setupSlider('sinusoidalIntensity', (value) => {
            this.params.sinusoidalIntensity = parseInt(value);
        });
    }

    setupSlider(id, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            valueDisplay.textContent = value;
            callback(value);
        });
    }

    setupEventListeners() {
        // Play/Pause
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            const btn = document.getElementById('playPauseBtn');
            btn.textContent = this.isPlaying ? 'Pausar' : 'Reproducir';
            btn.className = this.isPlaying ? 'btn btn--primary' : 'btn btn--secondary';
        });

        // Reset
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.currentTime = 0;
            this.resetParameters();
        });

        // Color change
        document.getElementById('colorBtn').addEventListener('click', () => {
            this.changeColorScheme();
        });

        // Debug toggle - Fixed
        document.getElementById('debugToggle').addEventListener('click', () => {
            this.toggleDebugMode();
        });

        // Debug options
        document.getElementById('wireframeMode').addEventListener('change', (e) => {
            this.toggleWireframe(e.target.checked);
        });

        document.getElementById('showNormals').addEventListener('change', (e) => {
            this.showNormals = e.target.checked;
        });

        document.getElementById('showParams').addEventListener('change', (e) => {
            this.showParams = e.target.checked;
        });

        // Close debug panel
        document.getElementById('closeDebug').addEventListener('click', () => {
            this.debugMode = false;
            document.getElementById('debugPanel').classList.add('hidden');
            document.getElementById('debugToggle').textContent = 'Modo Debug';
        });

        // Formulas panel - Fixed
        document.getElementById('showFormulas').addEventListener('click', () => {
            this.toggleFormulasPanel();
        });

        // Also handle the toggle button in the formulas panel
        const toggleFormulasBtn = document.getElementById('toggleFormulas');
        if (toggleFormulasBtn) {
            toggleFormulasBtn.addEventListener('click', () => {
                this.toggleFormulasPanel();
            });
        }
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        const debugPanel = document.getElementById('debugPanel');
        const debugBtn = document.getElementById('debugToggle');
        
        if (this.debugMode) {
            debugPanel.classList.remove('hidden');
            debugBtn.textContent = 'Cerrar Debug';
            debugBtn.className = 'btn btn--primary btn--sm';
        } else {
            debugPanel.classList.add('hidden');
            debugBtn.textContent = 'Modo Debug';
            debugBtn.className = 'btn btn--outline btn--sm';
        }
    }

    toggleWireframe(enabled) {
        this.wireframeMode = enabled;
        this.flowers.forEach(flower => {
            flower.material.wireframe = enabled;
        });
    }

    toggleFormulasPanel() {
        this.formulasPanelVisible = !this.formulasPanelVisible;
        const panel = document.getElementById('formulasPanel');
        const btn = document.getElementById('showFormulas');
        
        if (this.formulasPanelVisible) {
            panel.classList.remove('hidden');
            btn.style.transform = 'scale(1.1) rotate(45deg)';
            btn.style.backgroundColor = '#32CD32';
        } else {
            panel.classList.add('hidden');
            btn.style.transform = 'scale(1) rotate(0deg)';
            btn.style.backgroundColor = '';
        }
    }

    changeColorScheme() {
        this.currentColorScheme = (this.currentColorScheme + 1) % 4;
        
        const schemes = [
            { blue: [26, 85, 144], yellow: [255, 199, 13] },
            { blue: [144, 26, 85], yellow: [255, 13, 199] },
            { blue: [85, 144, 26], yellow: [199, 255, 13] },
            { blue: [85, 26, 144], yellow: [199, 13, 255] }
        ];

        this.colorGradient = { ...schemes[this.currentColorScheme], steps: 200 };
        
        // Update button text to show next color
        const colorNames = ['Azul-Amarillo', 'Rosa-Magenta', 'Verde-Lima', 'Púrpura-Violeta'];
        const nextIndex = (this.currentColorScheme + 1) % 4;
        document.getElementById('colorBtn').textContent = `Cambiar a ${colorNames[nextIndex]}`;
        
        this.regenerateFlowers();
    }

    regenerateFlowers() {
        this.flowers.forEach(flower => {
            this.scene.remove(flower);
            flower.geometry.dispose();
            flower.material.dispose();
        });
        this.createFlowers();
    }

    resetParameters() {
        this.params = {
            xPoints: 30,
            tPoints: 1200,
            timeMultiplier: 20,
            timeOffset: 4,
            deformationFactor: 0.5,
            exponentialDecay: 8,
            temporalFrequency: 15,
            changeAmplitude: 150,
            velocityModulator: 3.3,
            velocityPower: 4,
            coordinateMultiplier: 2,
            radialScale: 1.5,
            animationSpeed: 1.0,
            sinusoidalIntensity: 150
        };

        // Reset UI controls
        document.getElementById('xPoints').value = 30;
        document.getElementById('timeMultiplier').value = 1.0;
        document.getElementById('deformationFactor').value = 0.5;
        document.getElementById('animationSpeed').value = 1.0;
        document.getElementById('sinusoidalIntensity').value = 150;

        // Update displays
        document.getElementById('xPointsValue').textContent = 30;
        document.getElementById('timeMultiplierValue').textContent = '1.0';
        document.getElementById('deformationFactorValue').textContent = '0.5';
        document.getElementById('animationSpeedValue').textContent = '1.0';
        document.getElementById('sinusoidalIntensityValue').textContent = '150';

        // Reset play button state
        this.isPlaying = true;
        const btn = document.getElementById('playPauseBtn');
        btn.textContent = 'Pausar';
        btn.className = 'btn btn--primary';

        this.regenerateFlowers();
    }

    updateDebugInfo() {
        if (!this.debugMode) return;

        document.getElementById('timeValue').textContent = this.currentTime.toFixed(2);
        document.getElementById('fpsValue').textContent = Math.round(this.fps);
        
        const totalVertices = this.flowers.reduce((sum, flower) => 
            sum + (flower.geometry.attributes.position ? flower.geometry.attributes.position.count : 0), 0);
        document.getElementById('verticesValue').textContent = totalVertices.toLocaleString();

        this.updateDebugChart();
    }

    updateDebugChart() {
        const canvas = document.getElementById('debugChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 2;
        
        // Draw the deformation function p = 0.5π * exp(-t / 8π)
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i++) {
            const t = (i / canvas.width) * 4 * Math.PI + this.currentTime;
            const p = this.params.deformationFactor * Math.PI * 
                     Math.exp(-t / (this.params.exponentialDecay * Math.PI));
            const y = canvas.height - (p / (Math.PI * this.params.deformationFactor)) * canvas.height;
            
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
        }
        ctx.stroke();

        // Draw current time indicator
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        const timeX = ((this.currentTime % (4 * Math.PI)) / (4 * Math.PI)) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(timeX, 0);
        ctx.lineTo(timeX, canvas.height);
        ctx.stroke();
    }

    createMathParticles() {
        const particlesOverlay = document.getElementById('particlesOverlay');
        if (!particlesOverlay) return;
        
        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'math-particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.setProperty('--drift-x', (Math.random() - 0.5) * 100 + 'px');
            
            particlesOverlay.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 8000);
        }
    }

    showLoadingComplete() {
        // Remove any loading indicators
        const existingLoader = document.querySelector('.loading-indicator');
        if (existingLoader) {
            existingLoader.remove();
        }

        // Show initial formulas panel briefly
        setTimeout(() => {
            this.toggleFormulasPanel();
            setTimeout(() => {
                if (this.formulasPanelVisible) {
                    this.toggleFormulasPanel();
                }
            }, 3000);
        }, 1000);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isPlaying) {
            this.currentTime += 0.016; // Aproximadamente 60fps
            this.updateFlowers();
        }

        this.updateParticleSystem();
        this.updateDebugInfo();

        // Create occasional math particles
        if (Math.random() < 0.01) {
            this.createMathParticles();
        }

        // Performance tracking
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime > this.lastTime + 1000) {
            this.fps = (this.frameCount * 1000) / (currentTime - this.lastTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Generando flores 3D con fórmulas matemáticas...</span>
    `;
    document.body.appendChild(loadingDiv);

    // Initialize after a brief delay to show loading
    setTimeout(() => {
        try {
            new MathematicalFlower3D();
        } catch (error) {
            console.error('Error initializing 3D flowers:', error);
            loadingDiv.innerHTML = `
                <div style="color: #ff4444;">Error al cargar Three.js. Verifique la conexión.</div>
            `;
        }
    }, 500);
});

// Performance optimization for visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('performance-mode');
    } else {
        document.body.classList.remove('performance-mode');
    }
});