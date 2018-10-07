function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

/* INSTANCE METHODS */

Vector.prototype = {
    negative: function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },
    add: function(v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else {
            this.x += v;
            this.y += v;
        }
        return this;
    },
    subtract: function(v) {
        if (v instanceof Vector) {
            this.x -= v.x || 0;
            this.y -= v.y || 0;
        } else {
            this.x -= v || 0;
            this.y -= v || 0;
        }
        return this;
    },
    multiply: function(v) {
        if (v instanceof Vector) {
            this.x *= v.x;
            this.y *= v.y;
        } else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    },
    div: function(v) {
        if (v instanceof Vector) {
            if(v.x != 0) this.x /= v.x;
            if(v.y != 0) this.y /= v.y;
        } else {
            if(v != 0) {
                this.x /= v;
                this.y /= v;
            }
        }
        return this;
    },
    equals: function(v) {
        return this.x == v.x && this.y == v.y;
    },
    dot: function(v) {
        return this.x * v.x + this.y * v.y;
    },
    cross: function(v) {
        return this.x * v.y - this.y * v.x
    },
    magSq: function() {
        return this.x*this.x + this.y*this.y;
    },
    mag: function() {
        return Math.sqrt(this.magSq());
    },
    normalize: function() {
        const len = this.mag();
        if (len !== 0) this.multiply(1 / len);
        return this;
    },
    min: function() {
        return Math.min(this.x, this.y);
    },
    max: function() {
        return Math.max(this.x, this.y);
    },
    toAngles: function() {
        return -Math.atan2(-this.y, this.x);
    },
    angleTo: function(a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    },
    toArray: function(n) {
        return [this.x, this.y].slice(0, n || 2);
    },
    copy: function() {
        return new Vector(this.x, this.y);
    },
    set: function(x, y) {
        this.x = x; this.y = y;
        return this;
    },
    limit: function(max) {
        const mSq = this.magSq();
        if (mSq > max * max) {
            this.div(Math.sqrt(mSq)) //normalize it
                .multiply(max);
        }
        return this;
    }
};

/* STATIC METHODS */
Vector.negative = function(v) {
    return new Vector(-v.x, -v.y);
};
Vector.add = function(a, b) {
    if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y);
    else return new Vector(a.x + v, a.y + v);
};
Vector.subtract = function(a, b) {
    if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y);
    else return new Vector(a.x - v, a.y - v);
};
Vector.multiply = function(a, b) {
    if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y);
    else return new Vector(a.x * v, a.y * v);
};
Vector.div = function(a, b) {
    if (b instanceof Vector) return new Vector(a.x / b.x, a.y / b.y);
    else return new Vector(a.x / v, a.y / v);
};
Vector.equals = function(a, b) {
    return a.x == b.x && a.y == b.y;
};
Vector.dot = function(a, b) {
    return a.x * b.x + a.y * b.y;
};
Vector.cross = function(a, b) {
    return a.x * b.y - a.y * b.x;
};
Vector.dist = function(a,b) {
    return b
        .copy()
        .subtract(a)
        .mag();
};
