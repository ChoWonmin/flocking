const Boid = function(g) {

    const renderer = g;
    const that = this;

    this.color = '#ff704f';

    this.position = new Vector(100,100);
    this.acceleration = new Vector(0,0);
    this.velocity = new Vector(Math.random()*10-1, Math.random()*10-1);

    const r = 10;
    const maxforce = 10;
    const maxspeed = 10.5;

    this.run = function(boids) {
        flock(boids);
        update();
        borders();
        render();
    };

    const seek = function(target) {
        const desired = Vector.subtract(target, that.position);  // A vector pointing from the position to the target
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired.multiply(maxspeed);
        // Steering = Desired minus Velocity
        const steer = Vector.subtract(desired, that.velocity);
        steer.limit(maxforce);  // Limit to maximum steering force
        return steer;
    };

    const flock = (boids) => {
        const seperate = function(boids) {
            const desiredseparation = 30;
            const steer = new Vector(0, 0);
            let count = 0;

            for (let i = 0; i < boids.length; i++) {
                const other = boids[ i ];

                const d = Vector.dist(that.position, other.position);
                // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)

                if ((d > 0) && (d < desiredseparation)) {
                    // Calculate vector pointing away from neighbor
                    const diff = Vector.subtract(that.position, other.position);
                    diff.normalize();
                    diff.div(d);        // Weight by distance
                    steer.add(diff);
                    count++;            // Keep track of how many
                }
            }
            // Average -- divide by how many
            if (count > 0) {
                steer.div(count);
            }

            // As long as the vector is greater than 0
            if (steer.mag() > 0) {
                // Implement Reynolds: Steering = Desired - Velocity
                steer.normalize();
                steer.multiply(maxspeed);
                steer.subtract(that.velocity);
                steer.limit(maxforce);

            }
            return steer;


        };
        const align = function(boids) {
            const neighbordist = 50;
            const sum = new Vector(0, 0);
            let count = 0;
            for (let i = 0; i < boids.length; i++) {
                const other = boids[i];
                const d = Vector.dist(that.position, other.position);
                if ((d > 0) && (d < neighbordist)) {
                    sum.add(other.velocity);
                    count++;
                }
            }
            if (count > 0) {
                sum.div(count);
                sum.normalize();
                sum.multiply(maxspeed);
                const steer = Vector.subtract(sum, that.velocity);
                steer.limit(maxforce);
                return steer;
            }
            else {
                return new Vector(0, 0);
            }
        };
        const cohesion = function(boids) {
            const neighbordist = 70;
            const sum = new Vector(0, 0);   // Start with empty vector to accumulate all positions
            let count = 0;
            for (let i = 0; i < boids.length; i++) {
                const other = boids[i];
                const d = Vector.dist(that.position, other.position);
                if ( ((d > 0) && (d < neighbordist)) && that.color === other.color) {
                    sum.add(other.position); // Add position
                    count++;
                }
            }
            if (count > 0) {
                sum.div(count);
                return seek(sum);  // Steer towards the position
            }
            else {
                return new Vector(0, 0);
            }
        };

        const sep = seperate(boids);
        const ali = align(boids);
        const coh = cohesion(boids);

        sep.multiply(2.0);
        ali.multiply(1.0);
        coh.multiply(0.8);

        that.acceleration.add(sep);
        that.acceleration.add(ali);
        that.acceleration.add(coh);

    };

    const update = function() {
        // Update velocity
        that.velocity.add(that.acceleration);
        // Limit speed
        that.velocity.limit(maxspeed);
        that.position.add(that.velocity);
        // Reset accelertion to 0 each cycle
        that.acceleration.multiply(0);
    };

    const borders = function() {
        // if (that.position.x < -r) that.position.x = 700+r;
        // if (that.position.y < -r) that.position.y = 700+r;
        // if (that.position.x > 700+r) that.position.x = -r;
        // if (that.position.y > 700+r) that.position.y = -r;

        if (that.position.x < -r) that.position.x = 700+r;
        if (that.position.y < -r) that.position.y = 700+r;
        if (that.position.x > 700+r) that.position.x = -r;
        if (that.position.y > 700+r) that.position.y = -r;
    };

    const render = function() {
        renderer.append('circle')
            .attr('cx', that.position.x)
            .attr('cy', that.position.y)
            .attr('r', r)
            .attr('stroke', that.color)
            .attr('fill', that.color);
    };

};