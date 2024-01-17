import * as THREE from 'three';
import FragmentShader from '../shader/fragmentShader.frag?raw';
import VertexShader from '../shader/vertexShader.vert?raw';
import Texture from '../../assets/img/texture.png';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
if (!canvas) {
  throw new Error('canvas not found');
}
const getWindowSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;
  return {
    width,
    height,
    aspect,
  };
};

const app = (texture: THREE.Texture) => {
  const windowSize = getWindowSize();

  const renderer = new THREE.WebGLRenderer({
    canvas,
  });
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowSize.width, windowSize.height);

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(
    windowSize.width / -2,
    windowSize.width / 2,
    windowSize.height / 2,
    windowSize.height / -2,
    1,
    10
  );
  camera.position.z = 5;
  scene.add(camera);

  const textureImg = texture.image as HTMLImageElement;
  const textureWidth = textureImg.width;
  const textureHeight = textureImg.height;

  const uniforms = {
    uTexture: {
      value: texture,
    },
    uTextureAspect: {
      value: textureWidth / textureHeight,
    },
    uScreenAspect: {
      value: windowSize.aspect,
    },
  };
  const geometry = new THREE.PlaneGeometry(windowSize.width, windowSize.height);
  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  const tick = () => {
    requestAnimationFrame(tick);
    material.uniforms.uScreenAspect.value = uniforms.uScreenAspect.value;

    renderer.render(scene, camera);
  };
  tick();

  const onResize = () => {
    const windowSize = getWindowSize();

    plane.geometry = new THREE.PlaneGeometry(
      windowSize.width,
      windowSize.height
    );

    uniforms.uScreenAspect.value = windowSize.aspect;

    camera.left = windowSize.width / -2;
    camera.right = windowSize.width / 2;
    camera.top = windowSize.height / 2;
    camera.bottom = windowSize.height / -2;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowSize.width, windowSize.height);
  };
  window.addEventListener('resize', onResize);
};

const init = async () => {
  const texture = await new THREE.TextureLoader().loadAsync(Texture);
  app(texture);
};
init();
