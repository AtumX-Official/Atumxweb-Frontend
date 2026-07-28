from machine import Pin
import neopixel
import time
import urandom

# === Setup ===
LED_PIN = 12
NUM_LEDS = 35
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 50  # Max is 255

# === LED Matrix Map (5x7) ===
led_map = [
    [34, 33, 32, 31, 30, 29, 28],
    [27, 26, 25, 24, 23, 22, 21],
    [20, 19, 18, 17, 16, 15, 14],
    [13, 12, 11, 10,  9,  8,  7],
    [ 6,  5,  4,  3,  2,  1,  0]
]

digitBitmaps = {
    0: [0b111, 0b101, 0b101, 0b101, 0b111],
    1: [0b010, 0b110, 0b010, 0b010, 0b111],
    2: [0b111, 0b001, 0b111, 0b100, 0b111],
    3: [0b111, 0b001, 0b111, 0b001, 0b111],
    4: [0b101, 0b101, 0b111, 0b001, 0b001],
    5: [0b111, 0b100, 0b111, 0b001, 0b111],
    6: [0b111, 0b100, 0b111, 0b101, 0b111],
    7: [0b111, 0b001, 0b010, 0b100, 0b100],
    8: [0b111, 0b101, 0b111, 0b101, 0b111],
    9: [0b111, 0b101, 0b111, 0b001, 0b111]
}

# === Game Variables ===
bird_y = 0
bird_x = 0
velocity = 0
gravity = 1
jump_power = -2
frame = 0
game_started = False
score = 0
obstacles = []

def apply_brightness(color):
    return tuple((c * BRIGHTNESS) // 255 for c in color)

# === Helper Functions ===
def clear():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 0))
    strip.write()

def draw_pixel(row, col, color):
    if 0 <= row < 5 and 0 <= col < 7:
        idx = led_map[row][col]
        strip[idx] = color

def buzzer_beep(duration=0.1):
    BUZZER.on()
    time.sleep(duration)
    BUZZER.off()

def draw_digit(num, color):
    clear()
    if num not in digitBitmaps:
        return
    pattern = digitBitmaps[num]
    for row in range(5):
        for col in range(3):
            if pattern[row] & (1 << (2 - col)):
                apply_brightness(draw_pixel(row, col + 2, color))
    strip.write()

def draw_bird():
    apply_brightness(draw_pixel(bird_y, bird_x, (0, 10, 0)))  # dim green

def draw_obstacles():
    for obs in obstacles:
        for row in range(5):
            if row < obs["gap_start"] or row >= obs["gap_start"] + 2:
                apply_brightness(draw_pixel(row, obs["col"], (10, 0, 0))  # dim red

def move_obstacles():
    global score
    for obs in obstacles:
        obs["col"] -= 1
    if obstacles and obstacles[0]["col"] < 0:
        obstacles.pop(0)
        score += 1

def add_obstacle():
    gap = urandom.getrandbits(2) % 4
    obstacles.append({"col": 6, "gap_start": gap})

def draw_all():
    clear()
    draw_obstacles()
    draw_bird()
    strip.write()

def check_collision():
    for obs in obstacles:
        if obs["col"] == bird_x:
            if bird_y < obs["gap_start"] or bird_y >= obs["gap_start"] + 2:
                return True
    return False

def show_initial_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 5))  # dim blue
    strip.write()

def show_end_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 5, 5))  # dim cyan
    strip.write()

def countdown():
    for i in [3, 2, 1]:
        draw_digit(i, (0, 0, 20))  # blue digit
        buzzer_beep(0.1)
        time.sleep(0.6)
    clear()

def game_over():
    for _ in range(2):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((10, 0, 0))  # dim red
        strip.write()
        time.sleep(0.2)
        clear()
        time.sleep(0.2)
    draw_digit(score if score < 10 else 9, (255, 255, 0))  # yellow score
    time.sleep(2)
    clear()

def reset_game():
    global bird_y, velocity, obstacles, score, frame
    bird_y = 0
    velocity = 0
    frame = 0
    obstacles.clear()
    score = 0

# === Main Loop ===
show_initial_screen()

while True:
    if not game_started:
        if BUTTON_RIGHT.value() == 0:
            countdown()
            game_started = True
            reset_game()
        continue

    if BUTTON_RIGHT.value() == 0:
        velocity = jump_power
        buzzer_beep(0.05)

    # Gravity physics
    velocity += gravity
    bird_y += velocity
    bird_y = max(0, min(4, bird_y))

    if frame % 10 == 0:
        add_obstacle()
    move_obstacles()
    draw_all()

    if check_collision():
        buzzer_beep(0.2)
        game_over()
        show_end_screen()
        # Wait for left button press
        while BUTTON_LEFT.value() == 1:
            time.sleep(0.1)
        game_started = False
        show_initial_screen()

    frame += 1
    time.sleep(0.25)
