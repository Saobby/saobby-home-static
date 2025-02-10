class Particle{
    constructor(src, auto_destroy, gravity, x, y, angle, v_x, v_y, v_r){
        this.img = document.createElement("img");
        this.img.src = src;
        this.img.style.position = "absolute";
        this.img.style.pointerEvents = "none";
        this.img.hidden = true;
        document.body.appendChild(this.img);
        this.x = x ? x: 0;
        this.y = y ? y: 0;
        this.angle = angle ? angle: 0;
        this.v_x = v_x ? v_x: 0;
        this.v_y = v_y ? v_y: 0;
        this.v_r = v_r ? v_r: 0;
        this.gravity = gravity ? gravity: 0;
        this.auto_destroy = auto_destroy;
        this.interval = setInterval(this.update.bind(this), 1/30);
    }

    set_size(width, height){
        this.img.width = width;
        this.img.height = height;
    }

    get_size(){
        return {"width": this.img.width, "height": this.img.height};
    }

    set_pos(x, y){
        this.img.style.left = `${x}px`;
        this.img.style.top = `${y}px`;
        this.x = x;
        this.y = y;
    }

    get_pos(){
        return {"x": this.x, "y": this.y};
    }

    set_v(v_x, v_y){
        this.v_x = v_x;
        this.v_y = v_y;
    }

    get_v(){
        return {"x": this.v_x, "y": this.v_y};
    }

    set_v_r(v_r){
        this.v_r = v_r;
    }

    get_v_r(){
        return this.v_r;
    }

    set_gravity(gravity){
        this.gravity = gravity;
    }

    get_gravity(){
        return this.gravity;
    }

    set_angle(angle){
        this.img.style.transform = `rotate(${angle}deg)`;
        this.angle = angle;
    }

    get_angle(){
        return this.angle;
    }

    set_visibility(visible){
        this.img.hidden = !visible;
    }

    is_visible(){
        return !this.img.hidden;
    }

    set_opacity(opacity){
        this.img.style.opacity = opacity;
    }

    get_opacity(){
        return parseFloat(this.img.style.opacity);
    }

    destroy_after(sec){
        this.destruction_timeout = setTimeout(this.destroy.bind(this), sec*1e3);
    }

    update(){
        this.v_y += this.gravity;
        this.x += this.v_x;
        this.y += this.v_y;
        this.angle += this.v_r;
        this.set_pos(this.x, this.y);
        this.set_angle(this.angle);
        if (this.auto_destroy && this.is_touching_border()){
            this.destroy();
        }
    }

    destroy(){
        this.img.remove();
        if (this.destruction_timeout){
            clearTimeout(this.destruction_timeout);
        }
        clearInterval(this.interval);
    }

    is_touching_border() {
        const rect = this.img.getBoundingClientRect();
        return (
            rect.top <= 0 ||
            rect.left <= 0 ||
            rect.bottom >= window.innerHeight ||
            rect.right >= window.innerWidth
        );
    }
}


function make_splash(){
    var pos = get_element_abs_pos_center(gebi("check-in-btn"));
    var assets_pool = [
        "/static/image/particle/tera.webp",
        "/static/image/particle/cat.webp",
        "/static/image/particle/giga.webp",
        "/static/image/particle/gobo.webp",
        "/static/image/particle/nano.webp",
        "/static/image/particle/pico.webp"
    ];
    for (var i=0; i<10; i++){
        var asset = assets_pool[gen_randint(0, assets_pool.length-1)];
        var particle = new Particle(asset, true, 0.02, pos.x, pos.y, gen_continuous_random(0, 360), gen_continuous_random(-1, 1), gen_continuous_random(-3, 0), gen_continuous_random(-2, 2));
        particle.set_size(32, 32);
        particle.set_visibility(true);
    }
}
