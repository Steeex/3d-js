class Vector3D{
    static add(v1, v2){
        return new Vector3D(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
    }

    static sub(v1, v2){
        return new Vector3D(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z);
    }

    static multiply(v, k){
        let newV =  new Vector3D(v.x*k, v.y*k, v.z*k);
        return newV;
    }

    static divide(v, k){
        let newV =  new Vector3D(v.x/k, v.y/k, v.z/k);
        return newV;
    }

    static dotProduct(v1, v2){ //produit scalaire
        return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
    }

    static length(v){
        return Math.sqrt(Vector3D.dotProduct(v, v));
    }

    static normalise(v){
        let length = Vector3D.length(v);
        if(length == 0){
            return new Vector3D();
        }
        return Vector3D.divide(v, length);
    }

    static crossProduct(v1, v2){ //produit vectoriel
        let newV = new Vector3D();
        newV.x = v1.y*v2.z - v1.z*v2.y;
        newV.y = v1.z*v2.x - v1.x*v2.z;
        newV.z = v1.x*v2.y - v1.y*v2.x;
        return newV;
    }

    static intersectPlane(planePoint, planeNormal, lineStart, lineEnd){
        planeNormal = Vector3D.normalise(planeNormal);
        let planeDP = -Vector3D.dotProduct(planeNormal, planePoint);
        let aDP = Vector3D.dotProduct(lineStart, planeNormal);
        let bDP = Vector3D.dotProduct(lineEnd, planeNormal);
    
        let t = (-planeDP - aDP) / (bDP - aDP); //pourcentage position du point intersection
    
        let lineStartToEnd = Vector3D.sub(lineEnd, lineStart);
        let lineStartToIntersect = Vector3D.multiply(lineStartToEnd, t);
        let x = Vector3D.add(lineStart, lineStartToIntersect);
    
        return Vector3D.add(lineStart, lineStartToIntersect);
    }

    constructor(x=0, y=0, z=0, w=1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    toLog(){
        return "\n X:" + this.x + "\n Y:" + this.y + "\n Z:" + this.z;   
    }
}


class Triangle{

    static clipPlane(planePoint, planeNormal, tri){ //return liste triangle, vide, tri de base, 1 ou 2 nouveaux triangles
        planeNormal = Vector3D.normalise(planeNormal); //important normal
    
        //plus petite distance point, plan, SIGNÉ (+,-)
        function distance(p){
            return Vector3D.dotProduct(planeNormal, p) - Vector3D.dotProduct(planeNormal, planePoint);
        }
    
        let insidePoints = []; //derriere le plan (à afficher)
        let outsidePoints = []; //avant le plan (derriere le joueur)
    
        let distP0 = distance(tri.p[0]);
        let distP1 = distance(tri.p[1]);
        let distP2 = distance(tri.p[2]);
    
        //ordre important pour conserver le sens horaire de declaration des points du triangle
        //pour conserver direction de la normal
        if(distP0 >= 0){
            insidePoints.push(tri.p[0]);
        } else {
            outsidePoints.push(tri.p[0]);
        }
        if(distP1 >= 0){
            insidePoints.push(tri.p[1]);
        } else {
            outsidePoints.push(tri.p[1]);
        }
        if(distP2 >= 0){
            insidePoints.push(tri.p[2]);
        } else {
            outsidePoints.push(tri.p[2]);
        }
    
        //découpage des triangles
        let nombreOutsidePoints = outsidePoints.length;
        let nombreInsidePoints = insidePoints.length;
    
        if(nombreInsidePoints == 0){ //tout les points sont derriere, ne rien afficher
            return [];
        }
    
        if(nombreInsidePoints == 3){//tout les points sont devants, tout afficher, return le triangle original
            return [tri];
        }
    
        if( nombreInsidePoints == 1 && nombreOutsidePoints == 2){ //2 points derriere, a remplacer
            let tri1 = new Triangle();
            tri1.id = tri.id;
            tri1.color = tri.color;
            //remplacer les point interieur par eux meme sur le vecteur intersectant le plan
            tri1.p[0] = insidePoints[0];
            //insidePoints[0] to outisdePoints[1] forment une ligne entre les deux intersectant le plan
            tri1.p[1] = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[1]);
            tri1.p[2] = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
    
            return [tri1];
        }
    
        if(nombreInsidePoints == 2 && nombreOutsidePoints == 1 ){ //former 2 nouveaux triangles
            let tri1 = new Triangle();
            let tri2 = new Triangle();
    
            //nouveaux triangles conservent propriétes de l'ancien triangle
            tri1.id = tri.id;
            tri1.color = tri.color;
            tri2.id = tri.id;
            tri2.color = tri.color;
    
            //creation premier tri
            tri1.p[0] = insidePoints[0];
            tri1.p[1] = insidePoints[1];
    
            tri1.p[2] = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[0], outsidePoints[0]);
        
            //creation deuxieme tri
            tri2.p[0] = insidePoints[1];
            tri2.p[1] = tri1.p[2]; //nouveau point créer au dessus
    
            tri2.p[2] = Vector3D.intersectPlane(planePoint, planeNormal, insidePoints[1], outsidePoints[0]);
        
            return [tri1, tri2]; //2 nouveaux tri
        }
    }

    constructor(points=[null, null, null], color="white"){
        this.p = points; // [v1, v2, v3]                    //[[x0,y0,z0], [x1,y1,z1], [x2,y2,z2]]
        this.color = color;
        this.normal = null;
        this.id = null;
    }

    updateNormal(){
        let line1 = Vector3D.sub(this.p[1], this.p[0]);
        let line2 = Vector3D.sub(this.p[2], this.p[0]);
        this.normal = Vector3D.crossProduct(line1, line2);
    }

    setColor(color){
        this.color = color;
    }
}


class Matrix4x4{

    static multiplyVector(M, v){
        let newV = new Vector3D();
        newV.x = v.x*M.m[0][0] + v.y*M.m[1][0] + v.z*M.m[2][0] + v.w*M.m[3][0];
        newV.y = v.x*M.m[0][1] + v.y*M.m[1][1] + v.z*M.m[2][1] + v.w*M.m[3][1];
        newV.z = v.x*M.m[0][2] + v.y*M.m[1][2] + v.z*M.m[2][2] + v.w*M.m[3][2];
        newV.w = v.x*M.m[0][3] + v.y*M.m[1][3] + v.z*M.m[2][3] + v.w*M.m[3][3];
        return newV;
    }

    static getIdentity(){
        let M = new Matrix4x4();
        M.m[0][0] = 1.0;
        M.m[1][1] = 1.0;
        M.m[2][2] = 1.0;
        M.m[3][3] = 1.0;
        return M;
    }

    static rotation(X,Y,Z){
        let M = new Matrix4x4();
        let cX = Math.cos(X), sX = Math.sin(X);
        let cY = Math.cos(Y), sY = Math.sin(Y);
        let cZ = Math.cos(Z), sZ = Math.sin(Z);
        M.m = [
            [cZ*cY,  cZ*sY*sX-sZ*cX, cZ*sY*cX+sZ*sX, 0],
            [sZ*cY,  sZ*sY*sX+cZ*cX, sZ*sY*cX-cZ*sX, 0],
            [-sY,    cY*sX,          cY*cX,          0],
            [0,      0,              0,              1]
        ];
        return M;
    }

    static rotationX(angleRad){
		let M = new Matrix4x4();
		M.m[0][0] = 1.0;
		M.m[1][1] = Math.cos(angleRad);
		M.m[1][2] = Math.sin(angleRad);
		M.m[2][1] = -Math.sin(angleRad);
		M.m[2][2] = Math.cos(angleRad);
		M.m[3][3] = 1.0;
		return M;
	}

    static rotationY(angleRad){
		let M = new Matrix4x4();
		M.m[0][0] = Math.cos(angleRad);
		M.m[0][2] = Math.sin(angleRad);
		M.m[2][0] = -Math.sin(angleRad);
		M.m[1][1] = 1.0;
		M.m[2][2] = Math.cos(angleRad);
		M.m[3][3] = 1.0;
		return M;
	}

    static rotationZ(angleRad)
	{
		let M = new Matrix4x4();
		M.m[0][0] = Math.cos(angleRad);
		M.m[0][1] = Math.sin(angleRad);
		M.m[1][0] = -Math.sin(angleRad);
		M.m[1][1] = Math.cos(angleRad);
		M.m[2][2] = 1.0;
		M.m[3][3] = 1.0;
		return M;
	}

    static translation(x, y ,z){
        let M = Matrix4x4.getIdentity();
        M.m[3][0] = x;
        M.m[3][1] = y;
        M.m[3][2] = z;
        return M;
    }

    static makeProjection(FOVdegrees, aspectRatio, near, far){
        let FOVrad = 1/Math.tan(FOVdegrees * 0.5 * Math.PI /180); 
        let M = new Matrix4x4();
        M.m[0][0] = aspectRatio * FOVrad;
        M.m[1][1] = FOVrad;
        M.m[2][2] = far / (far - near);
        M.m[3][2] = (-far * near) / (far - near);
        M.m[2][3] = 1.0;
        M.m[3][3] = 0.0;
        return M;
    }

    static multiplyMatrix(M1, M2){
        let M = new Matrix4x4();
        for(let r=0; r<4; r++){
            for(let c=0; c<4; c++){
                M.m[r][c] = M1.m[r][0]*M2.m[0][c] + M1.m[r][1]*M2.m[1][c] + M1.m[r][2]*M2.m[2][c] + M1.m[r][3]*M2.m[3][c];
            }
        }
        return M;
    }

    static pointAt(pos, target, up){
        //forward de nouvelle direction
        let newForward = Vector3D.sub(target, pos);
        newForward = Vector3D.normalise(newForward);
    
        //up de nouvelle direction
        let a = Vector3D.multiply(newForward, Vector3D.dotProduct(up, newForward)); //difference entre new up et up, mutliplié par new forward pour etre normal
        let newUp = Vector3D.sub(up, a);
        newUp = Vector3D.normalise(newUp);
        
        //right de nouvelle direction
        let newRight = Vector3D.crossProduct(newUp, newForward);
    
        let M = new Matrix4x4();
        M.m = [
            [newRight.x,    newRight.y,     newRight.z,     0],
            [newUp.x,       newUp.y,        newUp.z,        0],
            [newForward.x,  newForward.y,   newForward.z,   0],
            [pos.x,         pos.y,          pos.z,          1]
        ];
        return M;
    }
    
    static quickInverse(M1){ //only for translation / rotation Matrix
        let M2 = new Matrix4x4();
        let A = new Vector3D(M1.m[0][0], M1.m[0][1], M1.m[0][2]);
        let B = new Vector3D(M1.m[1][0], M1.m[1][1], M1.m[1][2]);
        let C = new Vector3D(M1.m[2][0], M1.m[2][1], M1.m[2][2]);
        let T = new Vector3D(M1.m[3][0], M1.m[3][1], M1.m[3][2]); //translation Vector
        M2.m = [
            [A.x,    B.x,   C.x,    0],  
            [A.y,    B.y,   C.y,    0],  
            [A.z,    B.z,   C.z,    0],  
            [-Vector3D.dotProduct(T,A),    -Vector3D.dotProduct(T,B),     -Vector3D.dotProduct(T,C),    1]
        ];
        return M2;
    }

    constructor(values=Array.from(Array(4), () => Array(4).fill(0))){
        this.m = values;
    }
}


class Mesh{
    constructor(vertices, triangles, rotationSpeed = 0.75){
        this.tris = triangles;
        this.verts = vertices;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.rotationSpeed = rotationSpeed; 
        this.colors = [];
    }

    changeVertices(vertices){
        this.verts = vertices;
    }

    changeTriangles(triangles){
        this.tris = triangles;
    }

    update(controller){
        let k = controller.keys;
        let changeRotation = (rot, sign) => {
            return (rot + (this.rotationSpeed*sign) % (2*Math.PI));
        }
        if(k["ArrowLeft"]){
            this.rotY = changeRotation(this.rotY, -1);
        }
        if(k["ArrowRight"]){
            this.rotY = changeRotation(this.rotY, +1);
        }
        if (k["ArrowUp"]){
            this.rotX = changeRotation(this.rotX, +1);
        }
        if (k["ArrowDown"]){
            this.rotX = changeRotation(this.rotX, -1);
        }
    }
}

class Camera{
    constructor(movementSpeed, rotationSpeed){
        this.pos = new Vector3D(0, 0, 0);
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed
        this.yaw = 0; //Y angle
        this.lookDirection = new Vector3D(0, 0, 1); //init looking at Z ?
        this.locked = false; //is mouse locked in
    }
    
    initialize(){
        document.body.addEventListener('mousemove', (e) => { //fonction anonyme to keep this as controller camera
            console.log(this.locked);
            if(this.locked){
                this.updateAngles(e.movementX, e.movementY);
            }
        console.log("mousemove");
        });
    }

    updateAngles(x, y){
        let d = 500;
        this.yaw += x/d;
    }

    update(controller){
        let k = controller.keys;
        let changePosition = (pos, sign) => {
            return (pos + (this.movementSpeed*sign) % (2*Math.PI));
        }
        if(k["o"]){
            this.pos.y = changePosition(this.pos.y, +1);
        }
        if(k["l"]){
            this.pos.y = changePosition(this.pos.y, -1);
        }
        if(k["k"]){
            this.pos.x = changePosition(this.pos.x, -1);
        }
        if(k["m"]){
            this.pos.x = changePosition(this.pos.x, +1);
        }

        let forward = Vector3D.multiply(this.lookDirection, this.movementSpeed);
        if(k["q"]){
            this.yaw -= this.rotationSpeed
        }
        if(k["d"]){
            this.yaw += this.rotationSpeed
        }
        if(k["z"]){
            this.pos = Vector3D.add(this.pos, forward);
        }
        if(k["s"]){
            this.pos = Vector3D.sub(this.pos, forward);
        }
    }
}

export {Vector3D, Triangle, Matrix4x4, Mesh, Camera}