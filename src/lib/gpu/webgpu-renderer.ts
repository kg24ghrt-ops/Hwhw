/**
 * WebGPU Renderer for A5 Paper
 * Renders vector content to GPU textures using WGSL shaders
 */

import { A5_PX_300 } from './paperConfig';

export interface WebGPURenderer {
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
  uniformBuffer: GPUBuffer;
  depthTexture: GPUTexture | null;
  colorTexture: GPUTexture;
  configure: (width: number, height: number) => void;
  render: (transform: Transform2D) => void;
  dispose: () => void;
}

export interface Transform2D {
  scale: number;
  translateX: number;
  translateY: number;
}

const BLIT_VERTEX_SHADER = `
struct Uniforms {
  scale: f32,
  translateX: f32,
  translateY: f32,
  paperWidth: f32,
  paperHeight: f32,
  viewportWidth: f32,
  viewportHeight: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  
  var uvs = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 1.0),
    vec2<f32>(2.0, 1.0),
    vec2<f32>(0.0, -1.0)
  );
  
  let pos = positions[vertexIndex];
  let uv = uvs[vertexIndex];
  
  return VertexOutput(
    vec4<f32>(pos, 0.0, 1.0),
    uv
  );
}
`;

const BLIT_FRAGMENT_SHADER = `
struct Uniforms {
  scale: f32,
  translateX: f32,
  translateY: f32,
  paperWidth: f32,
  paperHeight: f32,
  viewportWidth: f32,
  viewportHeight: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var paperTexture: texture_2d<f32>;
@group(0) @binding(2) var paperSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  // Apply pan/zoom transform to UVs
  let centeredUV = input.uv - vec2<f32>(0.5);
  let scaledUV = centeredUV / uniforms.scale;
  let transformedUV = scaledUV + vec2<f32>(0.5) + 
    vec2<f32>(uniforms.translateX / uniforms.viewportWidth, uniforms.translateY / uniforms.viewportHeight);
  
  // Check bounds
  if (transformedUV.x < 0.0 || transformedUV.x > 1.0 || 
      transformedUV.y < 0.0 || transformedUV.y > 1.0) {
    return vec4<f32>(0.95, 0.93, 0.88, 1.0); // Background color
  }
  
  let color = textureSample(paperTexture, paperSampler, transformedUV);
  return color;
}
`;

export async function createWebGPURenderer(
  device: GPUDevice,
  canvas: HTMLCanvasElement
): Promise<WebGPURenderer> {
  const context = canvas.getContext('webgpu') as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();
  
  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });

  // Create uniform buffer (6 floats: scale, translateX, translateY, paperW, paperH, viewportW, viewportH)
  const uniformBufferSize = 7 * 4; // 7 floats
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Create bind group layout
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  // Create render pipeline
  const module = device.createShaderModule({
    code: BLIT_VERTEX_SHADER + BLIT_FRAGMENT_SHADER,
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module,
      entryPoint: 'vertexMain',
    },
    fragment: {
      module,
      entryPoint: 'fragmentMain',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  // Create paper texture (A5 at 300 DPI)
  const colorTexture = device.createTexture({
    size: [A5_PX_300.w, A5_PX_300.h],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
  });

  // Create sampler
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  let bindGroup: GPUBindGroup | null = null;

  const configure = (width: number, height: number) => {
    canvas.width = width;
    canvas.height = height;
    context.configure({
      device,
      format,
      alphaMode: 'premultiplied',
    });
  };

  const render = (transform: Transform2D) => {
    // Update uniforms
    const uniformData = new Float32Array([
      transform.scale,
      transform.translateX,
      transform.translateY,
      A5_PX_300.w,
      A5_PX_300.h,
      canvas.width,
      canvas.height,
    ]);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    // Create bind group with current texture
    bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: colorTexture.createView() },
        { binding: 2, resource: sampler },
      ],
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.95, g: 0.93, b: 0.88, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.draw(3);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  };

  const dispose = () => {
    uniformBuffer.destroy();
    colorTexture.destroy();
  };

  return {
    device,
    canvas,
    context,
    pipeline,
    uniformBuffer,
    depthTexture: null,
    colorTexture,
    configure,
    render,
    dispose,
  };
}
