import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { TDSLoader } from "three/examples//jsm/loaders/TDSLoader.js";

let camera, scene, renderer;
let orbit, control;

init();
window.onload = function() {
  render();
};

function init() {
  // ------------------------------------------- Рендерер ------------------------------------------- //

  const container = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.7);
  container.appendChild(renderer.domElement);
  renderer.toneMapping = THREE.ReinhardToneMapping;

  // ------------------------------------------- Камера ------------------------------------------ //

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    30000
  );
  camera.position.set(1000, 500, 1000);
  camera.lookAt(0, 200, 0);
  // ------------------------------------------- Сцена ------------------------------------------- //

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);
  scene.add(new THREE.GridHelper(700, 1));

  // ------------------------------------------- Свет ------------------------------------------- //

  scene.add(new THREE.AmbientLight(0xffffff));
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  scene.add(directionalLight);
  directionalLight.position.set(10, -550, 10);
  // var lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5, 0xff0000);
  // scene.add(lightHelper);

  const pointLight = new THREE.PointLight(0xffffff, 1, 10000);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
  // var pointLightHelper = new THREE.PointLightHelper(pointLight, 1, 0xff0000);
  // scene.add(pointLightHelper);

  // ------------------------------------------- Объекты ------------------------------------------- //

  // ------------------------------------------- Текстуры ---------------------- //

  const geometryLoader = new TDSLoader();
  geometryLoader.setResourcePath("public/models/textures/");
  const redTreeTexture = new THREE.MeshStandardMaterial();
  redTreeTexture.map = new THREE.TextureLoader().load(
    "public/models/textures/redTreeTexture.jpg"
  );
  redTreeTexture.map.wrapS = redTreeTexture.map.wrapT = THREE.RepeatWrapping;

  const blackTreeTexture = new THREE.MeshStandardMaterial();
  blackTreeTexture.map = new THREE.TextureLoader().load(
    "public/models/textures/blackTreeTexture.png"
  );

  blackTreeTexture.map.wrapS = blackTreeTexture.map.wrapT =
    THREE.RepeatWrapping;

  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const brownMaterial = new THREE.MeshStandardMaterial({ color: 0x54130e });
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x2913a8 });

  // ------------------------------------------- Стол ---------------------- //

  let changePosition = document.getElementById("changePosition");
  const selectedTableTop = document.getElementById("tableTopSelect");
  const selectedTableBody = document.getElementById("tableBodySelect");
  geometryLoader.load("public/models/table.3ds", function(object) {
    object.traverse(function(child) {
      if (child.isMesh) {
        child.position.set(4, -27, -1);
        child.scale.set(6, 6, 6);
        child.rotation.y = Math.PI;
        // выбор цвета столешницы
        if (child.name === "o00000005") {
          child.material = redTreeTexture;
          selectedTableTop.addEventListener("change", function() {
            if (selectedTableTop.value === "red") {
              child.material = redTreeTexture;
            }
            if (selectedTableTop.value === "black") {
              child.material = blackTreeTexture;
            }
            render();
          });
        } else {
          child.material = brownMaterial;

          selectedTableBody.addEventListener("change", function() {
            if (selectedTableBody.value === "brown") {
              child.material = brownMaterial;
            }
            if (selectedTableBody.value === "black") {
              child.material = blackMaterial;
            }
            if (selectedTableBody.value === "white") {
              child.material = whiteMaterial;
            }
            render();
          });
        }
      }
    });

    scene.add(object);
    render();

    changePosition.addEventListener("change", function(event) {
      if (changePosition.value === "table") {
        control.attach(object);
        scene.add(control);
      }
      if (changePosition.value === "none") {
        control.detach();
      }
      render();
    });
  });

  // ------------------------------------------- Кресло ---------------------- //

  var selectedСhairUpholstery = document.getElementById("chairUpholstery");
  var selectedСhairBody = document.getElementById("chairBody");

  geometryLoader.load("public/models/chair.3ds", function(object) {
    object.traverse(function(child) {
      if (child.isMesh) {
        child.position.set(10, 0, -15);
        child.scale.set(6, 6, 6);
        child.rotation.x = (3 * Math.PI) / 2;
        // выбор цвета спинки и сидения
        if (child.name === "o00000003" || child.name === "o00000004") {
          child.material = brownMaterial;
          selectedСhairUpholstery.addEventListener("change", function() {
            if (selectedСhairUpholstery.value === "black") {
              child.material = blackMaterial;
            }
            if (selectedСhairUpholstery.value === "blue") {
              child.material = blueMaterial;
            }
            if (selectedСhairUpholstery.value === "brown") {
              child.material = brownMaterial;
            }
            render();
          });
        } else {
          child.material = blackMaterial;
          selectedСhairBody.addEventListener("change", function() {
            render();
            if (selectedСhairBody.value === "brown") {
              child.material = brownMaterial;
            }
            if (selectedСhairBody.value === "black") {
              child.material = blackMaterial;
            }
            render();
          });
        }
      }
    });

    changePosition.addEventListener("change", function(event) {
      if (changePosition.value === "chair") {
        control.attach(object);
        scene.add(control);
      }
      render();
    });

    scene.add(object);
    render();
  });

  // ------------------------------------------- Управление ------------------------------------------- //
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.update();
  orbit.addEventListener("change", render);

  control = new TransformControls(camera, renderer.domElement);
  control.addEventListener("change", render);

  control.addEventListener("dragging-changed", function(event) {
    orbit.enabled = !event.value;
  });

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function render() {
  renderer.render(scene, camera);
}
