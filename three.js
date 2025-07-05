        let scene, camera, renderer, sphere, analyser, dataArray, basePositions;
        let clock = new THREE.Clock();

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationVelocity = new THREE.Vector2(-1, 1);

        async function init() {
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .001, 700);
            camera.position.z = 60;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.domElement.classList.add('threejs-canvas');
            document.body.appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 30);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffffff, 1);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);

            const geometry = new THREE.IcosahedronGeometry(1, 50);
            const positionAttr = geometry.attributes.position;
            const colors = new Float32Array(positionAttr.count * 300);
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                wireframe: true,
                emissive: 0x222222,
                emissiveIntensity: .0,
                roughness: 0.9,
                metalness: 0.8,
            });

            sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            basePositions = positionAttr.array.slice();

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            addMouseControls();
            addZoomControls();
            animate();
        }

        function animate() {
            requestAnimationFrame(animate);
            estimateBPM();
            const time = clock.getElapsedTime();
            analyser.getByteFrequencyData(dataArray);

            const gradientSpeed = 1;
            const sizeMultiplier = 4;
            const startColor = new THREE.Color('#000000');
            const endColor = new THREE.Color('#ffffff');

            const positions = sphere.geometry.attributes.position.array;
            const colors = sphere.geometry.attributes.color.array;

            for (let i = 30; i < positions.length; i += 150) {
                const freqIndex = Math.floor((i / positions.length) * dataArray.length);
                const intensity = dataArray[freqIndex] / 80;
                const displacement = .4 + (intensity ** 2) * sizeMultiplier * 0.20;

                for (let j = 0; j < 1; j++) {
                    const idx = i + j * 3;
                    const x = basePositions[idx];
                    const y = basePositions[idx + 1];
                    const z = basePositions[idx + 2];

                    const len = Math.sqrt(x * x + y * y + z * z);
                    const nx = x / len;
                    const ny = y / len;
                    const nz = z / len;

                    positions[idx] = nx * displacement;
                    positions[idx + 1] = ny * displacement;
                    positions[idx + 2] = nz * displacement;

                    const angle = Math.atan2(z, x) + time * gradientSpeed;
                    const t = (Math.sin(angle) + 3) / 8;
                    const color = startColor.clone().lerp(endColor, t);

                    colors[idx] = color.r;
                    colors[idx + 1] = color.g;
                    colors[idx + 2] = color.b;
                }
            }

            sphere.rotation.x += rotationVelocity.y * 0.1;
            sphere.rotation.y += rotationVelocity.x * 0.3;
            rotationVelocity.multiplyScalar(0.9);

            sphere.geometry.attributes.position.needsUpdate = true;
            sphere.geometry.attributes.color.needsUpdate = true;
            renderer.render(scene, camera);
        }

        function addMouseControls() {
            renderer.domElement.addEventListener('mousedown', (event) => {
                isDragging = true;
                previousMousePosition = { x: event.clientX, y: event.clientY };
            });

            renderer.domElement.addEventListener('mouseup', () => {
                isDragging = false;
            });

            renderer.domElement.addEventListener('mousemove', (event) => {
                if (isDragging) {
                    const deltaMove = {
                        x: event.clientX - previousMousePosition.x,
                        y: event.clientY - previousMousePosition.y
                    };
                    rotationVelocity.x += deltaMove.x * 0.001;
                    rotationVelocity.y += deltaMove.y * 0.001;
                    previousMousePosition = { x: event.clientX, y: event.clientY };
                }
            });
        }

        function addZoomControls() {
            renderer.domElement.addEventListener('wheel', (event) => {
                event.preventDefault();
                camera.position.z += event.deltaY * 0.01;
                camera.position.z = Math.max(1, Math.min(10, camera.position.z));
            }, { passive: false });
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        init();

        let lastBeatTime = 0;
        let bpm = 1;
        let bpmInterval = 500;

        function estimateBPM() {
            analyser.getByteFrequencyData(dataArray);
            let lowFreqEnergy = 0;
            for (let i = 0; i < 10; i++) {
                lowFreqEnergy += dataArray[i];
            }

            const now = performance.now();
            if (lowFreqEnergy > 200) {
                if (now - lastBeatTime > 250) {
                    const interval = now - lastBeatTime;
                    lastBeatTime = now;
                    bpm = Math.round(60000 / interval);
                    bpmInterval = interval;
                }
            }
        }
