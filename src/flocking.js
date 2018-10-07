const Flocking = function() {

    const that = this;
    const root = d3.select('#renderer');
    const g = root.append('g');

    const boids = [];
    const boids2 = [];
    const boids3 = [];

    for (let i=0; i<50; i++) {
        const boid = new Boid(g);
        boid.position = new Vector(Math.random()*700,Math.random()*700);
        if(i%3==1)
            boid.color = '#89c3ff';
        if(i%3==2)
            boid.color = '#ffcd05';
        boids.push(boid);

        // const boid2 = new Boid(g);
        // boid2.position = new Vector(Math.random()*700,Math.random()*700);
        // boid2.color='#89c3ff';
        // boids2.push(boid2);
        //
        // const boid3 = new Boid(g);
        // boid3.position = new Vector(Math.random()*700,Math.random()*700);
        // boid3.color='#ffcd05';
        // boids3.push(boid3);
    }

    this.animate = function() {
        requestAnimationFrame( that.animate );

        g.selectAll('*').remove();
        for (let i=0; i<boids.length; i++) {
            boids[i].run(boids);
            // boids2[i].run(boids2);
            // boids3[i].run(boids3);
        }
    }

}
const flocking = new Flocking();
flocking.animate();
