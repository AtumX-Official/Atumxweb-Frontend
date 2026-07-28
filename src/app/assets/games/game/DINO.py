from machine import Pin
import neopixel
import time
import urandom

# === Pin & Hardware Setup ===
LED_PIN = 12
NUM_LEDS = 35
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 50  # Max is 255

# LED layout mapping
led_map = [
    [34, 33, 32, 31, 30, 29, 28],
    [27, 26, 25, 24, 23, 22, 21],
    [20, 19, 18, 17, 16, 15, 14],
    [13, 12, 11, 10,  9,  8,  7],
    [ 6,  5,  4,  3,  2,  1,  0]
]

# Game state
dino_state = "stand"
isJumping = isCrouching = gameStarted = False
jump_timer = crouch_timer = last_obstacle_time = 0
obstacle_interval = 2000
game_speed = 0.2
frame = 0
score = 0
obstacles = []

brownShades = [
    (35, 17, 5), (40, 20, 10), (50, 33, 15),
    (55, 27, 7), (60, 50, 30), (45, 25, 5),
    (38, 19, 0), (25, 17, 8)
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

def apply_brightness(color):
    return tuple((c * BRIGHTNESS) // 255 for c in color)

# === Helper Functions ===
def clear_display():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 0))
    strip.write()

def get_pixel_index(row, col):
    if 0 <= row < 5 and 0 <= col < 7:
        return led_map[row][col]
    return -1

def draw_pixel(row, col, color):
    idx = get_pixel_index(row, col)
    if idx != -1:
        strip[idx] = apply_brightness(tuple(min(50, int(c)) for c in color))  # Brightness cap

def draw_digit(num, col_offset, color):
    if num not in digitBitmaps:
        return
    for row in range(5):
        row_bits = digitBitmaps[num][row]
        for col in range(3):
            if (row_bits >> (2 - col)) & 0x01:
                draw_pixel(row, col + col_offset, color)

def draw_dino():
    green = (0, 255, 0)
    if BUTTON_LEFT.value() == 0 and BUTTON_RIGHT.value() == 0:
        pixels = [(2,0), (2,1), (2,2)]  # Flat pose
    elif dino_state == "jump":
        pixels = [(1,0), (2,0), (0,1), (1,1), (2,1), (1,2), (2,2)]
    elif dino_state == "crouch":
        pixels = [(2,0), (3,0), (2,1), (3,1), (2,2), (3,2)]
    else:
        pixels = [(1,0), (3,0), (0,1), (1,1), (2,1), (1,2), (3,2)]
    for r, c in pixels:
        draw_pixel(r, c, green)

def draw_ground():
    for col in range(7):
        draw_pixel(4, col, brownShades[(frame + col) % 8])

def draw_all():
    clear_display()
    for obs in obstacles:
        draw_pixel(obs["row"], obs["col"], (255, 0, 0))
    draw_dino()
    draw_ground()
    strip.write()

def spawn_obstacle():
    if len(obstacles) >= 5: return
    row = urandom.choice([0, 1, 3])  # Avoid row 2 (middle) and 4 (ground)
    obstacles.append({"row": row, "col": 6})

def move_obstacles():
    global score, obstacles
    new_list = []
    for obs in obstacles:
        obs["col"] -= 1
        if obs["col"] >= 0:
            new_list.append(obs)
        else:
            score += 1
    obstacles = new_list

def update_buttons():
    global dino_state, jump_timer, crouch_timer
    if BUTTON_RIGHT.value() == 0 and dino_state == "stand":
        dino_state = "jump"
        jump_timer = time.ticks_ms()
    elif BUTTON_LEFT.value() == 0 and dino_state == "stand":
        dino_state = "crouch"
        crouch_timer = time.ticks_ms()

def check_collision():
    for obs in obstacles:
        row, col = obs["row"], obs["col"]
        if 0 <= col <= 2:
            if BUTTON_LEFT.value() == 0 and BUTTON_RIGHT.value() == 0:
                if row == 2:
                    return True
            elif dino_state == "stand" and 0 <= row <= 3:
                return True
            elif dino_state == "jump" and (row, col) in [(1,0), (2,0), (0,1), (1,1), (2,1), (1,2), (2,2)]:
                return True
            elif dino_state == "crouch" and 2 <= row <= 3:
                return True
    return False

def countdown():
    for i in range(3, 0, -1):
        clear_display()
        draw_digit(i, 2, (0, 0, 255))
        strip.write()
        BUZZER.on()
        time.sleep(0.1)
        BUZZER.off()
        time.sleep(0.4)

def game_over():
    for _ in range(3):
        for i in range(NUM_LEDS): strip[i] = apply_brightness((255, 0, 0))
        strip.write()
        time.sleep(0.3)
        clear_display()
        time.sleep(0.3)
    show_score()

def show_score():
    clear_display()
    left = (score // 10) % 10
    right = score % 10
    draw_digit(left, 0, (255, 255, 0))
    draw_digit(right, 4, (255, 255, 0))
    strip.write()
    while True:
        if BUTTON_LEFT.value() == 0:
            time.sleep(0.3)
            break

def reset_game():
    global dino_state, jump_timer, crouch_timer, score, obstacles, last_obstacle_time
    dino_state = "stand"
    score = 0
    jump_timer = crouch_timer = 0
    obstacles = []
    last_obstacle_time = time.ticks_ms()

def show_initial_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 80))
    strip.write()

# === Main Game Loop ===
show_initial_screen()
while True:
    if not gameStarted:
        if BUTTON_RIGHT.value() == 0:
            countdown()
            BUZZER.on()
            time.sleep(0.2)
            BUZZER.off()
            gameStarted = True
            reset_game()
        continue

    now = time.ticks_ms()
    update_buttons()

    if dino_state == "jump" and time.ticks_diff(now, jump_timer) > 800:
        dino_state = "stand"
    if dino_state == "crouch" and time.ticks_diff(now, crouch_timer) > 800:
        dino_state = "stand"

    if time.ticks_diff(now, last_obstacle_time) > obstacle_interval:
        spawn_obstacle()
        last_obstacle_time = now

    move_obstacles()
    draw_all()

    if check_collision():
        BUZZER.on()
        time.sleep(0.5)
        BUZZER.off()
        game_over()
        gameStarted = False
        show_initial_screen()

    frame += 1
    time.sleep(game_speed)
