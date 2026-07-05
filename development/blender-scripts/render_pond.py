"""
Blender-Rendering für Pond-Hero mit:
- Animierte Wasseroberfläche (Ocean-Modifier oder Displace mit Wave-Textur)
- 12 unterschiedliche Seerosen (verschiedene Farben, verschiedene Formen)
- 2 grosse Lotus-Blätter (schwimmend, mit Wasser mitbewegend)
- 1 Glaskugel auf linkem Blatt
- Jede Blüte bewegt sich individuell mit Wasserwellen

Aufruf: blender -b -P render_pond.py -- <output_path>
"""

import bpy
import bmesh
import math
import random
import sys
from mathutils import Vector

# ============ HELPERS ============

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for c in bpy.data.collections:
        bpy.data.collections.remove(c)
    for m in bpy.data.materials:
        bpy.data.materials.remove(m)

def make_material(name, base_color, metallic=0.0, roughness=0.5, transmission=0.0, ior=1.45, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    # Blender 4.x: Transmission Weight
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    elif "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value = transmission
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = ior
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

# ============ WATER SURFACE ============

def make_water():
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    water = bpy.context.active_object
    water.name = "Water"
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.subdivide(number_cuts=80)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Multi-Wave für organische Wellen
    for i, (h, w, s, n) in enumerate([(0.025, 1.8, 0.35, 1.2), (0.02, 1.2, 0.5, 1.5), (0.015, 0.8, 0.7, 2.0)]):
        wave = water.modifiers.new(name=f"Wave{i}", type='WAVE')
        wave.height = h
        wave.width = w
        wave.speed = s
        wave.narrowness = n
        wave.lifetime = 0
        wave.time_offset = i * 5
    
    bpy.ops.object.shade_smooth()
    
    # Wasser-Material: dunkel-türkis, glass-artige Spiegelung
    mat = bpy.data.materials.new(name="WaterMat")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.08, 0.22, 0.28, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.08
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 0.85
    bsdf.inputs["IOR"].default_value = 1.33
    water.data.materials.append(mat)
    
    return water

# ============ LOTUS LEAF ============

def make_lotus_leaf(location, radius=1.8, name="LotusLeaf"):
    """Grosses rundes Lotus-Blatt: leicht schüsselförmig, mit welligem Rand."""
    bpy.ops.mesh.primitive_circle_add(vertices=48, radius=radius, location=location, fill_type='NGON')
    leaf = bpy.context.active_object
    leaf.name = name
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.subdivide(number_cuts=12)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Schüsselform: Rand leicht angehoben, Zentrum vertieft
    for v in leaf.data.vertices:
        # Distanz vom Zentrum (relativ)
        d = math.sqrt(v.co.x**2 + v.co.y**2) / radius
        # Rand leicht hoch (Schüssel), Zentrum leicht runter
        v.co.z += 0.15 * (d**2 - 0.15)
        # Wellige Kante
        angle = math.atan2(v.co.y, v.co.x)
        v.co.z += 0.04 * math.sin(angle * 8) * d
    
    solid = leaf.modifiers.new(name="Thick", type='SOLIDIFY')
    solid.thickness = 0.025
    
    wave = leaf.modifiers.new(name="LeafWave", type='WAVE')
    wave.height = 0.025
    wave.width = 1.8
    wave.speed = 0.35
    wave.narrowness = 2.0
    
    bpy.ops.object.shade_smooth()
    
    # Blatt-Material: sattgrün, matt, leicht wachsig
    mat = bpy.data.materials.new(name=f"LeafMat_{name}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.18, 0.42, 0.12, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.32
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.4
        bsdf.inputs["Coat Roughness"].default_value = 0.15
    leaf.data.materials.append(mat)
    
    return leaf

# ============ WATER LILY (SEEROSE) ============

def make_petal(size, curve_amount=0.4):
    """Ein einzelnes gekrümmtes Blütenblatt aus einer Plane mit Displace."""
    bpy.ops.mesh.primitive_plane_add(size=1)
    petal = bpy.context.active_object
    # Subdivide für Krümmung
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.subdivide(number_cuts=6)
    bpy.ops.object.mode_set(mode='OBJECT')
    # Zu Blütenblatt-Form: lang und schmal, spitz oben
    verts = petal.data.vertices
    for v in verts:
        # Y ist Längsachse, X Breite. Spitze oben bei y=+0.5
        y_norm = (v.co.y + 0.5)  # 0 unten, 1 oben
        # Breite verjüngt sich zur Spitze
        v.co.x *= (1.0 - y_norm * 0.85)
        # Blütenblatt-Länge
        v.co.y *= 1.4
        # Wolben nach aussen (Blütenblatt-Krümmung)
        v.co.z += curve_amount * math.sin(y_norm * math.pi) * (1.0 - abs(v.co.x) * 2)
    petal.scale = (size, size, size)
    bpy.ops.object.shade_smooth()
    return petal

def make_lily(location, color, petal_count=14, size=0.55, name="Lily"):
    """Realistische Seerose mit gekrümmten Blütenblättern in mehreren Schichten."""
    petals = []
    
    for layer in range(4):
        layer_size = size * (1.0 - layer * 0.15)
        layer_petals = petal_count - layer * 2
        offset_angle = layer * (math.pi / petal_count)
        z_offset = layer * 0.015
        # Seerose ist FLACH aufgefächert: äussere Blätter waagerecht, nur innere leicht aufrecht
        opening = -5 + layer * 12
        
        for i in range(layer_petals):
            angle = (i / layer_petals) * 2 * math.pi + offset_angle
            
            petal = make_petal(size=layer_size, curve_amount=0.12 + layer * 0.05)
            petal.name = f"{name}_petal_{layer}_{i}"
            
            # Radial nach aussen verschoben (Basis am Blütenzentrum)
            radius_out = layer_size * 0.1
            petal.location = (
                location[0] + math.cos(angle) * radius_out,
                location[1] + math.sin(angle) * radius_out,
                location[2] + z_offset,
            )
            # opening=0 wäre flach horizontal, opening=90 wäre senkrecht
            # Wir wollen Blüte die nach aussen aufsteigt: X-Rotation um -opening
            petal.rotation_euler = (
                math.radians(-opening),
                0,
                angle - math.pi/2,
            )
            petals.append(petal)
    
    # Verbinden
    bpy.ops.object.select_all(action='DESELECT')
    for p in petals:
        p.select_set(True)
    bpy.context.view_layer.objects.active = petals[0]
    bpy.ops.object.join()
    lily = bpy.context.active_object
    lily.name = name
    
    # Origin zur Blüten-Basis für spätere Animation
    bpy.context.scene.cursor.location = location
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    
    # Blüten-Material: satte Farbe, wenig SSS, kein Wash-Out
    mat = bpy.data.materials.new(name=f"LilyMat_{name}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    # Sättigung durch gamma-boost
    boosted = tuple(min(1.0, c ** 0.85) for c in color)
    bsdf.inputs["Base Color"].default_value = (*boosted, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.38
    if "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = 0.12
        bsdf.inputs["Subsurface Radius"].default_value = (0.08, 0.03, 0.03)
    lily.data.materials.append(mat)
    
    # Gelbes Zentrum (kleiner, klarer)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=size * 0.14, location=(location[0], location[1], location[2] + 0.06))
    center = bpy.context.active_object
    center.name = f"{name}_center"
    center.scale = (1, 1, 0.5)
    bpy.ops.object.shade_smooth()
    center_mat = make_material(f"CenterMat_{name}", (1.0, 0.82, 0.1), roughness=0.5, emission=(1.0, 0.65, 0.05), emission_strength=0.4)
    center.data.materials.append(center_mat)
    center.parent = lily
    
    return lily

# ============ GLASS SPHERE (Master-Orb) ============

def make_glass_sphere(location, radius=0.4):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=radius, location=location)
    ball = bpy.context.active_object
    ball.name = "MasterOrb"
    bpy.ops.object.shade_smooth()
    
    mat = make_material("GlassMat", (0.95, 0.98, 1.0), roughness=0.02, transmission=1.0, ior=1.52)
    ball.data.materials.append(mat)
    return ball

# ============ ANIMATION: Blüten bobben individuell ============

def animate_lily_bobbing(lily, seed, total_frames=192):
    """Jede Blüte hat individuelle Phase + Amplitude"""
    random.seed(seed)
    base_z = lily.location.z
    amp = random.uniform(0.02, 0.06)
    phase = random.uniform(0, 2 * math.pi)
    freq = random.uniform(0.4, 0.8)  # Zyklen über die 8 Sekunden
    tilt_amp = random.uniform(0.02, 0.05)
    tilt_phase = random.uniform(0, 2 * math.pi)
    
    for f in range(0, total_frames + 1, 4):
        t = f / total_frames
        lily.location.z = base_z + amp * math.sin(freq * 2 * math.pi * t + phase)
        lily.rotation_euler[0] = tilt_amp * math.sin(freq * 2 * math.pi * t + tilt_phase)
        lily.rotation_euler[1] = tilt_amp * math.cos(freq * 2 * math.pi * t + tilt_phase)
        lily.keyframe_insert(data_path="location", frame=f)
        lily.keyframe_insert(data_path="rotation_euler", frame=f)

# ============ SCENE SETUP ============

def setup_scene(test_mode=False):
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    # Test-Frame: sehr wenige Samples für Speed. Final: mehr Samples
    scene.cycles.samples = 16 if test_mode else 12
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPENIMAGEDENOISE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    # Test-Frame in halber Auflösung für Speed
    scene.render.resolution_percentage = 50 if test_mode else 100
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 192
    if test_mode:
        scene.render.image_settings.file_format = 'PNG'
    else:
        scene.render.image_settings.file_format = 'FFMPEG'
        scene.render.ffmpeg.format = 'MPEG4'
        scene.render.ffmpeg.codec = 'H264'
        scene.render.ffmpeg.constant_rate_factor = 'HIGH'
        scene.render.ffmpeg.audio_codec = 'NONE'

def setup_camera():
    # Kamera weiter zurück + weiteres FOV damit Blätter nicht abgeschnitten
    bpy.ops.object.camera_add(location=(0, -8.5, 4.5))
    cam = bpy.context.active_object
    cam.rotation_euler = (math.radians(66), 0, 0)
    cam.data.lens = 35  # weiter (mehr im Bild)
    bpy.context.scene.camera = cam
    return cam

def setup_light():
    # Hauptsonne: direktional, hell
    bpy.ops.object.light_add(type='SUN', location=(3, -3, 6))
    sun = bpy.context.active_object
    sun.data.energy = 4.0
    sun.data.color = (1.0, 0.95, 0.85)
    sun.data.angle = math.radians(2)
    sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(35))
    
    # Füll-Licht sanft von gegenüber
    bpy.ops.object.light_add(type='AREA', location=(-5, -5, 4))
    fill = bpy.context.active_object
    fill.data.energy = 200
    fill.data.size = 8
    fill.data.color = (0.7, 0.8, 1.0)
    fill.rotation_euler = (math.radians(60), math.radians(-15), 0)
    
    # Weltbackground: einfaches sanftes Grau-Blau (kein Nishita = kein Wash-Out)
    world = bpy.context.scene.world
    world.use_nodes = True
    nt = world.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    bg = nt.nodes.new('ShaderNodeBackground')
    output = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(bg.outputs['Background'], output.inputs['Surface'])
    bg.inputs['Color'].default_value = (0.35, 0.5, 0.65, 1.0)
    bg.inputs['Strength'].default_value = 0.5
    
    # Belichtung im Compositor reduzieren
    bpy.context.scene.view_settings.exposure = -0.5
    bpy.context.scene.view_settings.gamma = 1.0
    bpy.context.scene.view_settings.look = 'AgX - Medium High Contrast'

# ============ MAIN ============

def main():
    output_path = "/tmp/pond_render.mp4"
    test_mode = False
    if "--" in sys.argv:
        idx = sys.argv.index("--")
        args = sys.argv[idx + 1:]
        if args:
            output_path = args[0]
        if len(args) > 1 and args[1] == "test":
            test_mode = True
    
    clear_scene()
    setup_scene(test_mode=test_mode)
    setup_camera()
    setup_light()
    
    # Wasser
    make_water()
    
    # Zwei Lotus-Blätter
    leaf_left = make_lotus_leaf(location=(-1.8, -0.5, 0.1), radius=1.8, name="LeafLeft")
    leaf_right = make_lotus_leaf(location=(2.3, -0.3, 0.1), radius=1.7, name="LeafRight")
    
    # Master-Kugel auf linkem Blatt
    make_glass_sphere(location=(-1.8, -0.5, 0.55), radius=0.55)
    
    # 12 Blüten in unterschiedlichen Farben und Positionen im Hintergrund
    lily_configs = [
        # (x, y, z, color_rgb, size, name)
        (-4.5, 2.5, 0.05, (0.85, 0.15, 0.55), 0.55, "MagentaLily"),
        (-3.0, 3.5, 0.05, (0.98, 0.92, 0.2), 0.5, "YellowLily"),
        (-1.5, 2.8, 0.05, (1.0, 0.55, 0.4), 0.55, "CoralLily"),
        (0.5, 3.8, 0.05, (0.98, 0.98, 0.95), 0.6, "WhiteLily"),
        (2.5, 2.6, 0.05, (0.7, 0.5, 0.9), 0.5, "LavenderLily"),
        (4.0, 3.2, 0.05, (1.0, 0.5, 0.15), 0.55, "OrangeLily"),
        (-4.0, 4.5, 0.05, (0.85, 0.1, 0.15), 0.5, "CrimsonLily"),
        (-1.0, 4.8, 0.05, (0.98, 0.72, 0.8), 0.55, "PalePinkLily"),
        (2.0, 4.5, 0.05, (0.99, 0.85, 0.65), 0.5, "ChampagneLily"),
        (4.5, 4.8, 0.05, (0.95, 0.2, 0.65), 0.55, "FuchsiaLily"),
        (-2.5, 5.5, 0.05, (0.98, 0.55, 0.65), 0.5, "BlushLily"),
        (3.0, 5.5, 0.05, (1.0, 0.6, 0.45), 0.55, "SalmonLily"),
    ]
    
    print(f"Erzeuge {len(lily_configs)} Blüten...")
    for i, (x, y, z, color, size, name) in enumerate(lily_configs):
        lily = make_lily(location=(x, y, z), color=color, petal_count=10 + (i % 3), size=size, name=name)
        animate_lily_bobbing(lily, seed=i)
    
    # Render output
    bpy.context.scene.render.filepath = output_path
    print(f"Starte Render nach {output_path}, test_mode={test_mode}")
    if test_mode:
        bpy.context.scene.frame_set(60)  # Frame 60 = mitte der Animation
        bpy.ops.render.render(write_still=True)
    else:
        bpy.ops.render.render(animation=True)
    print("Render fertig")

if __name__ == "__main__":
    main()
