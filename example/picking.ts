import { Vector3, Vector2, Raycaster, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
import { ClipMode, PointCloudOctree, Potree } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer = new Viewer();
viewer.initialize(targetEl);

let pointCloud: PointCloudOctree | undefined;
let loaded: boolean = false;

const unloadBtn = document.createElement('button');
unloadBtn.textContent = 'Unload';
unloadBtn.addEventListener('click', () => {
  if (!loaded) {
    return;
  }

  viewer.unload();
  loaded = false;
  pointCloud = undefined;
});

const loadBtn = document.createElement('button');
loadBtn.textContent = 'Load';
loadBtn.addEventListener('click', () => {
  if (loaded) {
    return;
  }

  loaded = true;

  viewer
  .load(
    'cloud.js',
    'http://5.9.65.151/mschuetz/potree/resources/pointclouds/surface_and_edge/land_building/',
  )
  .then(pco => {
    pointCloud = pco;
    pointCloud.rotateX(-Math.PI / 2);
    pointCloud.material.size = 1.0;

    pointCloud.material.clipMode = ClipMode.HIGHLIGHT_INSIDE;
    pointCloud.material.clipExtent = [0.0, 0.0, 0.5, 1.0];

    const camera = viewer.camera;
    camera.far = 1000;
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, 10);
    camera.lookAt(new Vector3());

    viewer.add(pco);
  })
  .catch(err => console.error(err));
});
const geometry = new SphereGeometry(0.1);
const material = new MeshBasicMaterial( { color: 'white' } );
const cube = new Mesh( geometry, material );
viewer.scene.add(cube)

const slider = document.createElement('input');
slider.type = 'range';
slider.min = String(10_000);
slider.max = String(500_000);
slider.className = 'budget-slider';

slider.addEventListener('change', () => {
  if (!pointCloud) {
    return;
  }

  pointCloud.potree.pointBudget = parseInt(slider.value, 10);
  console.log(pointCloud.potree.pointBudget);
});

const btnContainer = document.createElement('div');
btnContainer.className = 'btn-container';
document.body.appendChild(btnContainer);
btnContainer.appendChild(unloadBtn);
btnContainer.appendChild(loadBtn);
btnContainer.appendChild(slider);

const raycaster = new Raycaster;
const mouse = new Vector2;

document.body.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, viewer.camera);
  const point = Potree.pick(viewer.pointClouds, viewer.renderer, viewer.camera, raycaster.ray);
  if (point) {
    if (point.position)
    {
      cube.position.set(point.position.x, point.position.y, point.position.z);
      console.log(point.position);
    }
  }
})