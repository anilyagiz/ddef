import * as THREE from 'three';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {FilmPass} from 'three/examples/jsm/postprocessing/FilmPass.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import gsap from 'gsap';
import {noise, fragmentShader, vertexShader, settings} from './shaders/shaders.js';
import vertexParticles from './shaders/vertexParticles.glsl';
import fragmentParticles from './shaders/fragmentParticles.glsl';

export default class Scene {
    constructor(options) {
        this.container = options.domElement;
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setClearColor( 0x101010, 1 );
        this.canvas = this.renderer.domElement;
        this.composer = new EffectComposer( this.renderer );
        
        this.camera = new THREE.PerspectiveCamera(
          45,
          this.container.offsetWidth / this.container.offsetHeight,
          0.1,
          1000
        );
        
        this.camera.position.set(2.0, -1.2, 1.0);
        
        this.scene = new THREE.Scene();
        
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.mouseTarget = new THREE.Vector2();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.init();
        this.animate();
        this.setupResize();

    }

    init() {
        this.addCanvas();
        this.addElements();
        this.addParticles();
        this.addEvents();
        this.resize();
        this.cameraReset();
    } 

    addCanvas() {
        this.canvas.classList.add('webgl');
        this.container.appendChild(this.canvas);
    }

    addElements() {
        const geometry = new THREE.IcosahedronGeometry(2.0, 96, 96);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: settings.speed },
                uNoiseDensity: { value: settings.density },
                uNoiseStrength: { value: settings.strength },
                uFrequency: { value: settings.frequency },
                uAmplitude: { value: settings.amplitude },
                uIntensity: { value: settings.intensity }
            },
            //wireframe: true,
            //transparent: true
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        const renderScene = new RenderPass( this.scene, this.camera );

        const params = {
            exposure: 1.0,
            bloomStrength: 0.2,
            bloomThreshold: 0.2,
            bloomRadius: 0.2
        };

        const bloomPass = new UnrealBloomPass( 
            new THREE.Vector2( window.innerWidth, window.innerHeight ), 
            0.8,
            0.315,
            0
        );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        this.composer.addPass( renderScene );
        //this.composer.addPass( bloomPass );
    }

    addParticles(){
        let N = 7000;
        let positions = new Float32Array( N * 3 );
        this.particleGeometry = new THREE.IcosahedronGeometry( 2., 24, 24 );

        let inc = Math.PI*(3 - Math.sqrt(5));
        let offset = 2/N;
        let rad = 2.5;

        for (let i = 0; i < N; i++) {


            let y = i * offset - 1 + (offset / 2);
            let r = Math.sqrt(1 - y*y);
            let phi = i * inc;

            positions[3*i] = rad * Math.cos(phi)*r;
            positions[3*i+1] = rad * y;
            positions[3*i+2] = rad * Math.sin(phi)*r;
        }

        this.particleGeometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 4 ) );

        this.particleMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexParticles,
            fragmentShader: fragmentParticles,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: settings.speed },
                uNoiseDensity: { value: settings.density },
                uNoiseStrength: { value: settings.strength },
                uFrequency: { value: settings.frequency },
                uAmplitude: { value: settings.amplitude },
                uIntensity: { value: settings.intensity }
            }
        });
        this.points = new THREE.Points( this.particleGeometry, this.particleMaterial );

        this.scene.add( this.points );
    }

    addEvents() {
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('mousemove', this.mouseMove.bind(this));
    }  

    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.camera.aspect = this.width/this.height;
        this.renderer.setSize(this.width, this.height);
        this.camera.updateProjectionMatrix();
    }

    setupResize(){
        window.addEventListener('resize',this.resize.bind(this));
    }

    mouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }

    animate() {

        this.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();
        this.points.material.uniforms.uTime.value = this.clock.getElapsedTime();

        // Lerp movement
        this.mouseTarget.x = gsap.utils.interpolate(this.mouseTarget.x, this.mouse.x, 0.3);
        this.mouseTarget.y = gsap.utils.interpolate(this.mouseTarget.y, this.mouse.y, 0.3);

        gsap.to(this.mesh.material.uniforms.uAmplitude, { value: this.mouseTarget.x / 2 + 0.5});
        //gsap.to(this.mesh.material.uniforms.uIntensity, { value: this.mouseTarget.y });
        gsap.to(this.mesh.material.uniforms.uNoiseStrength, { value: this.mouseTarget.y / 2 + 0.7});

        this.points.material.uniforms.uNoiseStrength.value = this.mouseTarget.y;

        this.scene.rotation.set(
          this.mouseTarget.y * 0.035,
          this.mouseTarget.x * 0.035,
          0
        );

        requestAnimationFrame(this.animate.bind(this));
        this.composer.render();
    }

    cameraReset() {
        this.camera.position.x = 2.0;
        //console.log(this.camera.position);
    }
}