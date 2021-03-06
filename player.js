window.Player = window.classes.Player =
    class Player {
        constructor(px, pz) {
            this.position = {
                x: px,
                y: THICKNESS/2,
                z: pz
            };
            this.velocity = {
                x: 0,
                y: 0,
                z: 0
            };
            this.acceleration = {
                x: 0,
                y: 0,
                z: G
            }
            this.radius = BALL_RADIUS;
            this.model_transform = MODEL_TRANSFORM;
            this.update_model_transform();
            this.on_top_surface = false;
        }

        update_model_transform() {
            let pos = this.position;
            let r = this.radius;
            this.model_transform = MODEL_TRANSFORM;
            this.model_transform = this.model_transform.times(Mat4.translation([pos.x, pos.y, pos.z]));
            this.model_transform = this.model_transform.times(Mat4.scale([r, r, r]));
        }

        // https://gamedev.stackexchange.com/questions/69339/2d-aabbs-and-resolving-multiple-collisions
        // Move the player along the X axis.
        // Check for colliding tiles.
        // Resolve X collision.
        // Move the player along the Y axis.
        // Check for colliding tiles.
        // Resolve Y collision.
        update_player_location(dt) {
            // Update player location.
            [this.position.x, this.velocity.x, this.acceleration.x] = UpdateLocation(this.position.x, this.velocity.x, this.acceleration.x, dt);
            [this.position.z, this.velocity.z, this.acceleration.z] = UpdateLocation(this.position.z, this.velocity.z, this.acceleration.z, dt);
            this.velocity.x = this.velocity.x > 0 ? Math.min(this.velocity.x, SPEED_LIMIT_X) : Math.max(this.velocity.x, -SPEED_LIMIT_X);
            this.velocity.z = this.velocity.z > 0 ? Math.min(this.velocity.z, SPEED_LIMIT_Z) : Math.max(this.velocity.z, -SPEED_LIMIT_Z);
            this.update_model_transform();
        }

        // returns true if game finished
        move(current_direction, dt, walls, endbox) {
            // you can jump again after you reaches velocity 0 (at highest point of jumping or on surface)
            if(current_direction.up){
                if (this.on_top_surface || Math.abs(this.velocity.z) < SPEED_CUTOFF) {
                    this.velocity.z = SPEED_UP;
                    this.acceleration.z = G;
                    this.on_top_surface = false;
                }
            }
            if (current_direction.left) {
                this.velocity.x -= SPEED_SIDE;
                this.acceleration.z = G;
            }
            if (current_direction.right) {
                this.velocity.x += SPEED_SIDE;
                this.acceleration.z = G;
            }
            if (!(current_direction.right || current_direction.left || current_direction.up)){
                this.acceleration.z = G;
            }
            let is_on_surface = false;
            for (let wall of walls) {
                is_on_surface = is_on_surface | this.resolve_check_box_collision(wall, dt) & COLLISIONS.TOP;
            }
            this.on_top_surface = is_on_surface;
            this.update_player_location(dt);
            return CircleRect(this.position.x, this.position.z, this.radius, endbox)[0];
        }

        // every game_object has aabb
        // https://gamedev.stackexchange.com/questions/69339/2d-aabbs-and-resolving-multiple-collisions
        // Move the player along the X axis.
        // Check for colliding tiles.
        // Resolve X collision.
        // Move the player along the Y axis.
        // Check for colliding tiles.
        // Resolve Y collision.
        // ball to box collision
        resolve_check_box_collision(game_object, dt) {
            let [px, vx, ax] = UpdateLocation(this.position.x, this.velocity.x, this.acceleration.x, dt);
            let [pz, vz, az] = UpdateLocation(this.position.z, this.velocity.z, this.acceleration.z, dt);
            let collide_x = false;
            let collide_z = false;
            let status = COLLISIONS.STILL, tmp_status;
            [collide_x, tmp_status] = CircleRect(px, this.position.z, this.radius, game_object);
            status |= tmp_status;
            if (collide_x)
                this.velocity.x = -COLLISION_SPEED * this.velocity.x;
            [collide_z, tmp_status] = CircleRect(this.position.x, pz, this.radius, game_object);
            status |= tmp_status;
            if (collide_z) {
                this.velocity.z = -COLLISION_SPEED * this.velocity.z;
                if (status & COLLISIONS.TOP) {
                    if (Math.abs(this.velocity.z) < SPEED_CUTOFF) {
                        this.acceleration.z = 0;
                        this.velocity.z = 0;
                        this.on_top_surface = true;
                    } else this.acceleration.z = G;
                    this.velocity.x = ApplyFriction(this.velocity.x);
                } 
            }
            return status;
        }

        // ball to ball collision
        check_ball_collision(game_object) {

        }

        draw(graphics_state, shape, material) {
            shape.draw(graphics_state, this.model_transform, material);
        }
    }