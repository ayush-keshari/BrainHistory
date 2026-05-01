/**
 * Next.js instrumentation hook — runs once when the server process starts.
 *
 * Problem: Zscaler (corporate HTTPS proxy) intercepts TLS connections and
 * re-signs certificates with its own CA. Node.js rejects these because its
 * built-in CA bundle doesn't include the Zscaler root CA.
 *
 * Fix: disable strict TLS verification for outbound HTTPS connections.
 * This covers OpenAI embeddings, Anthropic/OpenAI chat LLM calls, and any
 * other HTTPS API the server makes. MongoDB Atlas is unaffected (it uses the
 * mongodb+srv protocol, not HTTPS).
 *
 * IMPORTANT: Only do this in development. In production, TLS verification
 * must be enabled.
 */

// Polyfill DOMMatrix for Node.js environment (needed by pdfjs-dist)
if (typeof globalThis !== 'undefined' && !globalThis.DOMMatrix) {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    constructor(init?: string | number[]) {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
    a: number; b: number; c: number; d: number; e: number; f: number;
    toString() { return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`; }
    multiply(other: any) { return this; }
    multiplySelf(other: any) { return this; }
    preMultiplySelf(other: any) { return this; }
    translate(tx: number, ty: number) { return this; }
    translateSelf(tx: number, ty: number) { return this; }
    scale(scaleX: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number) { return this; }
    scaleSelf(scaleX: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number) { return this; }
    scale3d(scale: number, originX?: number, originY?: number, originZ?: number) { return this; }
    scale3dSelf(scale: number, originX?: number, originY?: number, originZ?: number) { return this; }
    rotate(rotX: number, rotY?: number, rotZ?: number) { return this; }
    rotateSelf(rotX: number, rotY?: number, rotZ?: number) { return this; }
    rotateFromVector(x: number, y: number) { return this; }
    rotateFromVectorSelf(x: number, y: number) { return this; }
    rotateAxisAngle(x: number, y: number, z: number, angle: number) { return this; }
    rotateAxisAngleSelf(x: number, y: number, z: number, angle: number) { return this; }
    skewX(sx: number) { return this; }
    skewXSelf(sx: number) { return this; }
    skewY(sy: number) { return this; }
    skewYSelf(sy: number) { return this; }
    perspective(p: number) { return this; }
    perspectiveSelf(p: number) { return this; }
    transpose() { return this; }
    transposeSelf() { return this; }
    flipX() { return this; }
    flipXSelf() { return this; }
    flipY() { return this; }
    flipYSelf() { return this; }
    inverse() { return this; }
    invertSelf() { return this; }
    setMatrixValue(init: string) { return this; }
    get is2D() { return true; }
    get isIdentity() { return true; }
    toFloat32Array() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
    toFloat64Array() { return new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
    transformPoint(point: { x: number; y: number; z?: number; w?: number }) { return { x: point.x, y: point.y, z: point.z || 0, w: point.w || 1 }; }
  };
}

export async function register() {
  if (process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
}
