export default class Vector3D {
    x;
    y;
    z;
    w;
    static add(v1, v2) {
        return new Vector3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    static sub(v1, v2) {
        return new Vector3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    static multiply(v, k) {
        return new Vector3D(v.x * k, v.y * k, v.z * k);
    }
    static divide(v, k) {
        7;
        return new Vector3D(v.x / k, v.y / k, v.z / k);
    }
    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static normalise(v) {
        let length = v.length();
        if (length == 0) {
            return new Vector3D();
        }
        return Vector3D.divide(v, length);
    }
    static crossProduct(v1, v2) {
        let newV = new Vector3D();
        newV.x = v1.y * v2.z - v1.z * v2.y;
        newV.y = v1.z * v2.x - v1.x * v2.z;
        newV.z = v1.x * v2.y - v1.y * v2.x;
        return newV;
    }
    static floor(v) {
        return new Vector3D(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z), Math.floor(v.w));
    }
    static intersectPlane(planePoint, planeNormal, lineStart, lineEnd) {
        planeNormal = Vector3D.normalise(planeNormal);
        let planeDP = -Vector3D.dotProduct(planePoint, planeNormal);
        let aDP = Vector3D.dotProduct(lineStart, planeNormal);
        let bDP = Vector3D.dotProduct(lineEnd, planeNormal);
        let distance = (-planeDP - aDP) / (bDP - aDP); //pourcentage position du point intersection
        let lineStartToEnd = Vector3D.sub(lineEnd, lineStart);
        let lineStartToIntersect = Vector3D.multiply(lineStartToEnd, distance);
        return { vector: Vector3D.add(lineStart, lineStartToIntersect), distance: distance };
    }
    static distance(v1, v2) {
        return Math.sqrt(Math.pow((v1.x - v2.x), 2) +
            Math.pow((v1.y - v2.y), 2) +
            Math.pow((v1.z - v2.z), 2));
    }
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    equals(v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        this.w = Math.floor(this.w);
    }
    length() {
        return Math.sqrt(Vector3D.dotProduct(this, this));
    }
    toLog() {
        return "\n X:" + this.x + "\n Y:" + this.y + "\n Z:" + this.z;
    }
    copy() {
        return new Vector3D(this.x, this.y, this.z, this.w);
    }
}
