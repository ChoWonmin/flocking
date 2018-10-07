const Flocking = function() {

    const that = this;
    const root = d3.select('#renderer');
    const g = root.append('g');

    const boids = [];

    for (let i=0; i<30; i++) {
        const boid = new Boid(g);
        boid.position = new Vector(Math.random()*700,Math.random()*700);
        boids.push(boid);
    }

    this.animate = function() {
        requestAnimationFrame( that.animate );

        g.selectAll('*').remove();
        for (let i=0; i<boids.length; i++) {
            boids[i].run(boids);
        }
    }

}
const flocking = new Flocking();
flocking.animate();
