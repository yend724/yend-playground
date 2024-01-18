import * as THREE from 'three';
import Texture from '../../assets/img/texture.png';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
if (!canvas) {
  throw new Error('canvas not found');
}

// windowのサイズを取得
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
// shaderを取得
const getShader = (type: 'fragmentShader' | 'vertexShader') => {
  const script = document.querySelector<HTMLScriptElement>(`#${type}`);
  if (!script) {
    throw new Error(`script not found: ${type}`);
  }
  return script.innerText;
};

const app = (texture: THREE.Texture) => {
  const windowSize = getWindowSize();

  // rendererの作成
  const renderer = new THREE.WebGLRenderer({
    canvas,
  });
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowSize.width, windowSize.height);

  // sceneの作成
  const scene = new THREE.Scene();

  // cameraの作成
  // OrthographicCameraでwindowサイズを指定
  const camera = new THREE.OrthographicCamera(
    windowSize.width / -2,
    windowSize.width / 2,
    windowSize.height / 2,
    windowSize.height / -2,
    1,
    10
  );
  // cameraの位置を指定
  camera.position.z = 5;
  scene.add(camera);

  // textureのアスペクト比を取得
  const textureImg = texture.image as HTMLImageElement;
  const textureAspect = textureImg.width / textureImg.height;

  const FragmentShader = getShader('fragmentShader');
  const VertexShader = getShader('vertexShader');

  // uniformの定義
  const uniforms = {
    uTexture: {
      value: texture,
    },
    uTextureAspect: {
      value: textureAspect,
    },
    uScreenAspect: {
      value: windowSize.aspect,
    },
  };
  // planeの作成
  const geometry = new THREE.PlaneGeometry(windowSize.width, windowSize.height);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // requestAnimationFrameで描画
  const tick = () => {
    requestAnimationFrame(tick);
    renderer.render(scene, camera);
  };
  tick();

  // windowのリサイズ処理
  const onResize = () => {
    const windowSize = getWindowSize();

    // planeのサイズをwindowのサイズに合わせる
    plane.geometry = new THREE.PlaneGeometry(
      windowSize.width,
      windowSize.height
    );

    // uniformで渡しているwindowのアスペクト比を更新
    material.uniforms.uScreenAspect.value = windowSize.aspect;

    // cameraを更新
    camera.left = windowSize.width / -2;
    camera.right = windowSize.width / 2;
    camera.top = windowSize.height / 2;
    camera.bottom = windowSize.height / -2;
    camera.updateProjectionMatrix();

    // rendererを更新
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
