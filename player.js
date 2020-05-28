let position = {x:0,y:0,z:0}
let velocity = {x:0,y:0,z:0}
let acceleration = {x:0,y:0,z:0}
window.Player = window.classes.Player =
    class Player {
        constructor() {
            this.position = position;
            this.velocity = velocity;
            this.acceleration = acceleration;
            this.init();
        }

        init() {
            this.position.x = -26;
            this.position.z = 30;
            this.acceleration.z = G;
            this.radius = 2;
        }

        getPlayerLModel() {
            let pos = this.position;
            let r = this.radius;
            let model = MODEL_TRANSFORM;
            model = model.times(Mat4.translation([pos.x,pos.y,pos.z]));
            model = model.times(Mat4.scale([r,r,r]));
            return model;
        }
        // resetSpeed(){
        //     this.velocity = velocity;
        // }
        updatePlayer(collision, in_collision, collide_on_surface, dt) {
            // Update player location.
            let nx = UpdateLocation(this.position.x, this.velocity.x, this.acceleration.x, dt);
            let nz = UpdateLocation(this.position.z, this.velocity.z, this.acceleration.z, dt);
            this.position.x = nx;
            this.position.z = nz;
            // Update on collision.
            let onSurface = collide_on_surface && Math.abs(this.velocity.z)<10;
            if(onSurface){
                console.log("surface!!!!!")
                this.velocity.z = 0;
                this.acceleration.z = 0;
                this.velocity.x = ApplyFriction(this.velocity.x);
            } else if (collision && !in_collision) {
                this.velocity = ApplyCollision(this.velocity);
            } else {
                // Update player speed.
                this.acceleration.z = G;
                let nvx = UpdateVelocity(this.velocity.x, this.acceleration.x, dt);
                let nvz =  UpdateVelocity(this.velocity.z, this.acceleration.z, dt);
                this.velocity.x = nvx;
                this.velocity.z = nvz;
            }

            // if(this.position.z <= -13){
            //     this.position.z = -13;
            //     this.velocity.z = 0;
            //     // this.acceleration.z = 0;
            // } else {
            //     this.acceleration.z = G;
            // }
        }
    }