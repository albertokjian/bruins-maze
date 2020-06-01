window.Player = window.classes.Player =
    class Player {
        constructor(px, pz) {
            this.position = {
                x: px,
                y: 5,
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

        move(current_direction, dt, walls, coins) {
            switch (current_direction) {
                case DIRECTIONS.UP:
                    if (this.on_top_surface && this.velocity.z == 0) {
                        this.velocity.z = SPEED_UP;
                        this.acceleration.z = G;
                        this.on_top_surface = false;
                    }
                    break;
                case DIRECTIONS.LEFT:
                    this.velocity.x -= SPEED_SIDE;
                    break;
                case DIRECTIONS.RIGHT:
                    this.velocity.x += SPEED_SIDE;
                default: // DIRECTIONS.STILL
                    this.acceleration.z = G;
                    break;
            }
            let is_on_surface = false;
            for (let wall of walls) {
                is_on_surface = is_on_surface | this.resolve_check_box_collision(wall, dt);
            }
            this.on_top_surface = is_on_surface;
            this.update_player_location(dt);
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
            let status;
            [collide_x, status] = CircleRect(px, this.position.z, this.radius, game_object);
            if (collide_x)
                this.velocity.x = -COLLISION_SPEED * this.velocity.x;
            [collide_z, status] = CircleRect(this.position.x, pz, this.radius, game_object);
            if (collide_z) {
                this.velocity.z = -COLLISION_SPEED * this.velocity.z;
                if (status & COLLISIONS.TOP) {
                    if (Math.abs(this.velocity.z) < SPEED_CUTOFF) {
                        this.acceleration.z = 0;
                        this.velocity.z = 0;
                        this.on_top_surface = true;
                    } else this.acceleration.z = G;
                    this.velocity.x = ApplyFriction(this.velocity.x);
                    if (Math.abs(this.velocity.x) < 1) {
                        this.velocity.x = 0;
                    }
                } 
            }
            return status & COLLISIONS.TOP;
        }

        // ball to ball collision
        check_ball_collision(game_object) {

        }

        draw(graphics_state, shapes, materials) {
            shapes.player.draw(graphics_state, this.model_transform, materials.player);
        }
    }