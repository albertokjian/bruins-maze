function UpdateVelocity(v0, a, dt){
    let v = v0 + a*dt;
    return v;
}

function UpdateLocation(x0, v0, a, dt){
    let x = x0 + v0*dt + .5*a*(dt*dt);
    return x;
}
