attribute float scale;
attribute vec3 color;
attribute vec3 toPosition;
attribute float speed;
attribute float isParticle;
uniform float progress;
uniform float time;
varying vec3 vColor;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vColor = color;

    vec3 dis = toPosition - position;

    float percent = progress * speed;

    if (percent > 1.0) {
        percent = 1.0;
    }

    vec3 pos = position + dis * percent;

    float rnd = random(vec2(pos.x, pos.y));
    float rnd2 = random(vec2(pos.y, pos.z));
    if (rnd2 > 0.5) {
        rnd = -rnd;
    }
    float angle = -time * 2.0 * 3.1415926 / 60.0 * rnd;
    float x = cos(angle) * pos.x - sin(angle) * pos.z;
    float z = sin(angle) * pos.x + cos(angle) * pos.z;
    float y= sin(time * rnd * 0.02) * 10.0 + pos.y;

    vec3 transformed = vec3(0.0, 0.0, 0.0);
    if (isParticle == 1.0) {
        transformed = vec3(x, y, z);
    } else {
        transformed = pos + vec3(sin(time + speed * 4.5), cos(time * speed * 4.5), cos(time * speed * 4.5)) * 0.01;
    }

    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = scale;
    gl_PointSize *= 100. / -(modelViewMatrix * vec4(transformed, 1.0)).z;
}
