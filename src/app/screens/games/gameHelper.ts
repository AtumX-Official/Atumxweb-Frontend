const gameHelper: Record<string, string> = {
  brick_breaker: `from machine import Pin
import neopixel
import time
import urandom

# === Constants / Hardware ===
LED_PIN = 12
NUM_LEDS = 48            # 6 × 8
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)
BRIGHTNESS = 50

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)

# === LED map (6 rows × 8 cols) - from your board ===
led_map = [
    [47,46,45,44,43,42,41,40],
    [39,38,37,36,35,34,33,32],
    [31,30,29,28,27,26,25,24],
    [23,22,21,20,19,18,17,16],
    [15,14,13,12,11,10,9,8],
    [7,6,5,4,3,2,1,0]
]

ROWS = 6
COLS = 8

# === Digit bitmaps (5x3) ===
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

# === Game state ===
# tiles: top 2 rows, COLS columns
tile_hits = [[0 for _ in range(COLS)] for _ in range(2)]
paddle_col = (COLS - 3) // 2  # center paddle
ball = {'row': ROWS - 2, 'col': COLS // 2, 'dr': -1, 'dc': 1}
score = 0
gameStarted = False
frame = 0

# === Helpers ===
def apply_brightness(color):
    return tuple((c * BRIGHTNESS) // 255 for c in color)

# === LED control ===
def clear_display():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 0))
    strip.write()

def get_pixel_index(row, col):
    if 0 <= row < ROWS and 0 <= col < COLS:
        return led_map[row][col]
    return -1

def draw_pixel(row, col, color):
    idx = get_pixel_index(row, col)
    if idx != -1:
        r, g, b = color
        strip[idx] = apply_brightness((min(60, int(r)), min(60, int(g)), min(60, int(b))))

def draw_digit(num, col_offset, color):
    if num not in digitBitmaps:
        return
    for r in range(5):  # digits occupy rows 0..4
        bits = digitBitmaps[num][r]
        for c in range(3):
            if (bits >> (2 - c)) & 1:
                draw_pixel(r, c + col_offset, color)

# === Drawing ===
def draw_tiles():
    for r in range(2):
        for c in range(COLS):
            hits = tile_hits[r][c]
            if hits < 3:
                color = [(0, 255, 255), (255, 165, 0), (255, 0, 255)][hits]
                draw_pixel(r, c, color)

def draw_paddle():
    row = ROWS - 1
    for i in range(3):
        c = paddle_col + i
        if 0 <= c < COLS:
            draw_pixel(row, c, (0, 255, 0))

def draw_ball():
    draw_pixel(ball['row'], ball['col'], (255, 255, 255))

def draw_all():
    clear_display()
    draw_tiles()
    draw_paddle()
    draw_ball()
    strip.write()

# === Buttons ===
def update_buttons():
    global paddle_col
    if BUTTON_LEFT.value() == 0 and paddle_col > 0:
        paddle_col -= 1
        time.sleep(0.08)  # simple debounce / step delay
    if BUTTON_RIGHT.value() == 0 and paddle_col < (COLS - 3):
        paddle_col += 1
        time.sleep(0.08)

# === Ball movement ===
def random_dc():
    # MicroPython-safe random choice among -1,0,1
    v = urandom.getrandbits(2) % 3
    return -1 if v == 0 else (0 if v == 1 else 1)

def move_ball():
    global score
    # advance
    ball['row'] += ball['dr']
    ball['col'] += ball['dc']

    # left/right wall collision
    if ball['col'] < 0:
        ball['col'] = 0
        ball['dc'] *= -1
    elif ball['col'] > COLS - 1:
        ball['col'] = COLS - 1
        ball['dc'] *= -1

    # top collision
    if ball['row'] < 0:
        ball['row'] = 0
        ball['dr'] *= -1

    # tile hit (top 2 rows)
    if 0 <= ball['row'] <= 1:
        r, c = ball['row'], ball['col']
        if tile_hits[r][c] < 3:
            tile_hits[r][c] += 1
            score += 1
            ball['dr'] *= -1
            ball['dc'] = random_dc()
            # move ball away from tiles
            ball['row'] += ball['dr']

    # paddle collision or miss (bottom row)
    if ball['row'] == ROWS - 1:
        if paddle_col <= ball['col'] <= paddle_col + 2:
            ball['dr'] *= -1
            ball['dc'] = random_dc()
            ball['row'] = ROWS - 2
        else:
            return False  # missed paddle => game over

    return True

def all_tiles_destroyed():
    for r in range(2):
        for c in range(COLS):
            if tile_hits[r][c] < 3:
                return False
    return True

def reset_game():
    global paddle_col, ball, score, tile_hits
    paddle_col = (COLS - 3) // 2
    ball = {'row': ROWS - 2, 'col': COLS // 2, 'dr': -1, 'dc': 1}
    score = 0
    tile_hits = [[0 for _ in range(COLS)] for _ in range(2)]

# === Screens / UI ===
def show_initial_screen():
    clear_display()
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 80))
    strip.write()

def show_violet_screen():
    clear_display()
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((128, 0, 128))
    strip.write()

def show_score_screen():
    clear_display()
    left = (score // 10) % 10
    right = score % 10
    draw_digit(left, 0, (255, 255, 0))
    draw_digit(right, 5, (255, 255, 0))
    strip.write()

def show_end_screen():
    for _ in range(3):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((255, 0, 0))
        strip.write()
        time.sleep(0.2)
        clear_display()
        time.sleep(0.2)
    show_score_screen()
    time.sleep(2)
    show_violet_screen()

def show_win_screen():
    for _ in range(5):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((0, 255, 0))
        strip.write()
        BUZZER.on()
        time.sleep(0.1)
        BUZZER.off()
        time.sleep(0.1)
    show_score_screen()
    time.sleep(2)
    show_violet_screen()

def countdown():
    for i in range(3, 0, -1):
        clear_display()
        draw_digit(i, 2, (0, 0, 255))
        strip.write()
        BUZZER.on()
        time.sleep(0.15)
        BUZZER.off()
        time.sleep(0.35)

# === Main Loop ===
show_initial_screen()

while True:
    if not gameStarted:
        if BUTTON_RIGHT.value() == 0:
            countdown()
            BUZZER.on()
            time.sleep(0.12)
            BUZZER.off()
            reset_game()
            gameStarted = True
        else:
            time.sleep(0.05)
        continue

    update_buttons()
    alive = move_ball()
    draw_all()

    if all_tiles_destroyed():
        show_win_screen()
        # wait for left button to go back to menu
        while True:
            if BUTTON_LEFT.value() == 0:
                gameStarted = False
                show_initial_screen()
                break
            time.sleep(0.05)

    if not alive:
        BUZZER.on()
        time.sleep(0.4)
        BUZZER.off()
        show_end_screen()
        while True:
            if BUTTON_LEFT.value() == 0:
                gameStarted = False
                show_initial_screen()
                break
            time.sleep(0.05)

    frame += 1
    time.sleep(0.35)

`,
  bubble_shooter: `from machine import Pin
import neopixel
import time
import urandom

# === Constants and Hardware ===
LED_PIN = 12
ROWS = 6
COLS = 8
NUM_LEDS = 48

BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)

# === NEW 6×8 LED MAP ===
led_map = [
    [47,46,45,44,43,42,41,40],
    [39,38,37,36,35,34,33,32],
    [31,30,29,28,27,26,25,24],
    [23,22,21,20,19,18,17,16],
    [15,14,13,12,11,10, 9, 8],
    [ 7, 6, 5, 4, 3, 2, 1, 0]
]

COLORS = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]

shooter_col = 4   # CENTERED for 8 columns
shooter_color = COLORS[0]
next_color = COLORS[1]

bubbles = []
bullets = []
gameStarted = False
score = 0

# === Digit Bitmaps (3×5) ===
digits = {
    0:[(0,0),(0,1),(0,2),(1,0),(1,2),(2,0),(2,2),(3,0),(3,2),(4,0),(4,1),(4,2)],
    1:[(0,1),(1,1),(2,1),(3,1),(4,1)],
    2:[(0,0),(0,1),(0,2),(1,2),(2,1),(3,0),(4,0),(4,1),(4,2)],
    3:[(0,0),(0,1),(0,2),(1,2),(2,1),(3,2),(4,0),(4,1),(4,2)],
    4:[(0,2),(1,2),(2,0),(2,1),(2,2),(3,2),(4,2)],
    5:[(0,0),(0,1),(0,2),(1,0),(2,0),(2,1),(2,2),(3,2),(4,0),(4,1),(4,2)],
    6:[(0,1),(0,2),(1,0),(2,0),(2,1),(2,2),(3,0),(4,0),(4,1),(4,2)],
    7:[(0,0),(0,1),(0,2),(1,2),(2,1),(3,1),(4,1)],
    8:[(0,0),(0,1),(0,2),(1,0),(1,2),(2,1),(3,0),(3,2),(4,0),(4,1),(4,2)],
    9:[(0,0),(0,1),(0,2),(1,0),(1,2),(2,0),(2,1),(2,2),(3,2),(4,1)]
}

# === Helpers ===
def apply_brightness(color):
    return color  # If you need brightness control, apply here

def clear_display():
    for i in range(NUM_LEDS):
        strip[i] = (0, 0, 0)
    strip.write()

def get_index(r, c):
    if 0 <= r < ROWS and 0 <= c < COLS:
        return led_map[r][c]
    return -1

def draw_pixel(r, c, color):
    idx = get_index(r, c)
    if idx != -1:
        strip[idx] = color

def draw_all():
    clear_display()

    for b in bubbles:
        draw_pixel(b[0], b[1], b[2])

    for b in bullets:
        draw_pixel(b[0], b[1], b[2])

    draw_pixel(ROWS - 1, shooter_col, shooter_color)
    draw_pixel(ROWS - 1, COLS - 1, next_color)

    strip.write()

# === Setup starting bubbles (now 8 columns!) ===
def spawn_bubbles():
    for row in range(2):
        for col in range(COLS):
            color = COLORS[urandom.getrandbits(2) % 3]
            bubbles.append([row, col, color])

# === Shooting ===
def shoot():
    global shooter_color, next_color
    bullets.append([ROWS - 2, shooter_col, shooter_color])
    shooter_color = next_color
    next_color = COLORS[urandom.getrandbits(2) % 3]

# === Bullets movement ===
def move_bullets():
    global bullets, bubbles
    new_bullets = []

    for b in bullets:
        b[0] -= 1
        if b[0] < 0:
            continue

        hit = False
        for bub in bubbles:
            if bub[0] == b[0] and bub[1] == b[1]:
                bubbles.append([b[0] + 1, b[1], b[2]])
                check_and_pop(b[0] + 1, b[1], b[2])
                hit = True
                break

        if not hit:
            if b[0] == 0:
                bubbles.append([b[0], b[1], b[2]])
                check_and_pop(b[0], b[1], b[2])
            else:
                new_bullets.append(b)

    bullets = new_bullets

# === Cluster detection ===
def find_connected(row, col, color):
    visited = set()
    stack = [(row, col)]
    connected = []

    while stack:
        r, c = stack.pop()
        if (r, c) in visited:
            continue

        visited.add((r, c))

        for b in bubbles:
            if b[0] == r and b[1] == c and b[2] == color:
                connected.append(b)

                for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                    stack.append((r + dr, c + dc))

    return connected

def check_and_pop(row, col, color):
    global bubbles, score
    connected = find_connected(row, col, color)

    if len(connected) >= 3:
        for b in connected:
            if b in bubbles:
                bubbles.remove(b)

        score += len(connected)

        BUZZER.on(); time.sleep(0.1); BUZZER.off()

# === Conditions ===
def check_game_over():
    return any(b[0] >= ROWS - 3 for b in bubbles)

def check_win():
    return len(bubbles) == 0

# === Score display ===
def show_number(num, color=(0,0,255)):
    clear_display()
    if num > 9: num = 9

    offset = 2  # centered for 8 columns

    for (r, c) in digits[num]:
        draw_pixel(r, c + offset, color)

    strip.write()

def show_score_and_wait():
    show_number(score)
    BUZZER.on(); time.sleep(0.4); BUZZER.off()
    time.sleep(1)

# === Effects ===
def game_over():
    show_score_and_wait()
    for _ in range(3):
        for i in range(NUM_LEDS):
            strip[i] = (255, 0, 255)
        strip.write()
        time.sleep(0.3)
        clear_display()
        time.sleep(0.3)

def countdown():
    for i in range(3, 0, -1):
        show_number(i, (0,255,255))
        BUZZER.on(); time.sleep(0.2); BUZZER.off()
        time.sleep(0.4)

def show_start():
    for i in range(NUM_LEDS):
        strip[i] = (0, 0, 80)
    strip.write()

# === Game Loop ===
show_start()

while True:
    if not gameStarted:
        if BUTTON_RIGHT.value() == 0:
            countdown()
            gameStarted = True
            bubbles = []
            bullets = []
            spawn_bubbles()
            shooter_color = COLORS[0]
            next_color = COLORS[1]
            score = 0
            BUZZER.on(); time.sleep(0.2); BUZZER.off()
        continue

    # Movement
    if BUTTON_LEFT.value() == 0 and BUTTON_RIGHT.value() == 1:
        shooter_col = max(0, shooter_col - 1)
        time.sleep(0.15)

    elif BUTTON_RIGHT.value() == 0 and BUTTON_LEFT.value() == 1:
        shooter_col = min(COLS - 1, shooter_col + 1)
        time.sleep(0.15)

    elif BUTTON_LEFT.value() == 0 and BUTTON_RIGHT.value() == 0:
        shoot()
        time.sleep(0.2)

    move_bullets()
    draw_all()

    if check_game_over():
        BUZZER.on(); time.sleep(0.5); BUZZER.off()
        game_over()
        gameStarted = False
        show_start()

    if check_win():
        show_score_and_wait()
        gameStarted = False
        show_start()

    time.sleep(0.2)

`,
  car_game: `from machine import Pin
import neopixel
import time
import urandom

# === MATRIX CONFIG (NEW 6×8, 48 LEDs) ===
PIN = 12
NUM_LEDS = 48
np = neopixel.NeoPixel(Pin(PIN), NUM_LEDS)
BRIGHTNESS = 80  # Visible brightness

# === BUTTONS & BUZZER ===
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

# === NEW 6×8 LED MAP ===
led_map = [
    [47,46,45,44,43,42,41,40],
    [39,38,37,36,35,34,33,32],
    [31,30,29,28,27,26,25,24],
    [23,22,21,20,19,18,17,16],
    [15,14,13,12,11,10, 9, 8],
    [ 7, 6, 5, 4, 3, 2, 1, 0]
]

ROWS = 6
COLS = 8

# === 3×5 digit bitmaps ===
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

# === Helpers ===
def apply_brightness(color):
    return tuple((c * BRIGHTNESS)//255 for c in color)

def clear():
    for i in range(NUM_LEDS):
        np[i] = (0,0,0)
    np.write()

def draw(r, c, color):
    if 0 <= r < ROWS and 0 <= c < COLS:
        np[led_map[r][c]] = color

# === Score Drawing ===
def draw_score(num):
    bmp = digitBitmaps[num % 10]
    x_offset = 2  # center on 8 columns

    for r in range(5):
        row_bits = bmp[r]
        for c in range(3):
            if row_bits & (1 << (2-c)):
                draw(r, c + x_offset, apply_brightness((255, 255, 0)))

    np.write()

# === Intro ===
def intro():
    for i in range(NUM_LEDS):
        np[i] = apply_brightness((0, 0, 80))
    np.write()

def countdown():
    for i in range(3, 0, -1):
        clear()
        draw_score(i)
        BUZZER.on(); time.sleep(0.25); BUZZER.off()
        time.sleep(0.6)

def red_flash():
    for _ in range(3):
        for i in range(NUM_LEDS):
            np[i] = apply_brightness((255, 0, 0))
        np.write()
        BUZZER.on(); time.sleep(0.2); BUZZER.off()
        clear(); time.sleep(0.2)

def show_final_score(sc):
    clear()
    draw_score(sc)
    np.write()
    time.sleep(3)

def violet_flash():
    for i in range(NUM_LEDS):
        np[i] = apply_brightness((50, 0, 50))
    np.write()

# === GAME VARIABLES ===
car_row = ROWS // 2   # start centered (row 3)
obstacles = []
score = 0
frame = 0
gameStarted = False

def reset_game():
    global car_row, obstacles, score, frame
    car_row = ROWS // 2
    obstacles = []
    score = 0
    frame = 0
    clear()

# === Obstacle logic ===
def spawn_obstacle():
    row = urandom.getrandbits(3) % ROWS
    obstacles.append([row, COLS - 1])  # right side

def move_obstacles():
    global score
    for obs in obstacles:
        obs[1] -= 1
    if obstacles and obstacles[0][1] < 0:
        obstacles.pop(0)
        score += 1

def draw_all():
    clear()

    # car
    draw(car_row, 0, apply_brightness((0, 255, 0)))

    # obstacles
    for r,c in obstacles:
        draw(r, c, apply_brightness((255, 0, 0)))

    np.write()

def check_collision():
    for r,c in obstacles:
        if c == 0 and r == car_row:
            return True
    return False

# === MAIN LOOP ===
intro()

while True:
    if not gameStarted:
        if BUTTON_RIGHT.value() == 0:
            countdown()
            BUZZER.on(); time.sleep(0.2); BUZZER.off()
            reset_game()
            gameStarted = True
        continue

    # Car movement
    if BUTTON_LEFT.value() == 0 and car_row > 0:
        car_row -= 1
        time.sleep(0.15)
    elif BUTTON_RIGHT.value() == 0 and car_row < ROWS - 1:
        car_row += 1
        time.sleep(0.15)

    # Spawn obstacles
    if frame % 5 == 0:
        spawn_obstacle()

    move_obstacles()
    draw_all()

    if check_collision():
        BUZZER.on(); time.sleep(0.3); BUZZER.off()
        red_flash()
        show_final_score(score)
        violet_flash()
        gameStarted = False
        time.sleep(0.5)
        intro()
        continue

    frame += 1
    time.sleep(0.12)

`,
  dino: `from machine import Pin
import neopixel
import time
import urandom

# === Pin & Hardware Setup ===
LED_PIN = 12
NUM_LEDS = 48   # now 6×8
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 60  # slightly brighter for larger board

ROWS = 6
COLS = 8

# === NEW 6×8 LED MAP ===
led_map = [
    [47,46,45,44,43,42,41,40],
    [39,38,37,36,35,34,33,32],
    [31,30,29,28,27,26,25,24],
    [23,22,21,20,19,18,17,16],
    [15,14,13,12,11,10, 9, 8],
    [ 7, 6, 5, 4, 3, 2, 1, 0]
]

# === Game State ===
dino_state = "stand"
isJumping = isCrouching = gameStarted = False
jump_timer = crouch_timer = last_obstacle_time = 0
obstacle_interval = 2000
game_speed = 0.17
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

# === Helpers ===
def apply_brightness(color):
    return tuple((c * BRIGHTNESS) // 255 for c in color)

def clear_display():
    for i in range(NUM_LEDS):
        strip[i] = (0, 0, 0)
    strip.write()

def get_pixel_index(row, col):
    if 0 <= row < ROWS and 0 <= col < COLS:
        return led_map[row][col]
    return -1

def draw_pixel(row, col, color):
    idx = get_pixel_index(row, col)
    if idx != -1:
        strip[idx] = apply_brightness(color)

def draw_digit(num, col_offset, color):
    if num not in digitBitmaps:
        return
    for row in range(5):
        pattern = digitBitmaps[num][row]
        for col in range(3):
            if (pattern >> (2 - col)) & 1:
                draw_pixel(row, col + col_offset, color)

# === Dino Sprites (expanded for 6×8) ===
def draw_dino():
    green = (0, 255, 0)

    # pixel positions all relative to the left side
    if BUTTON_LEFT.value() == 0 and BUTTON_RIGHT.value() == 0:
        # Flat pose
        pixels = [(3,0), (3,1), (3,2)]
    elif dino_state == "jump":
        pixels = [(2,0),(3,0),(1,1),(2,1),(3,1),(2,2),(3,2)]
    elif dino_state == "crouch":
        pixels = [(4,0),(5,0),(4,1),(5,1),(4,2),(5,2)]
    else:
        # Standing pose
        pixels = [(2,0),(4,0),(1,1),(2,1),(3,1),(2,2),(4,2)]

    for r,c in pixels:
        draw_pixel(r, c, green)

def draw_ground():
    for col in range(COLS):
        draw_pixel(ROWS-1, col, brownShades[(frame + col) % len(brownShades)])

def draw_all():
    clear_display()

    for obs in obstacles:
        draw_pixel(obs["row"], obs["col"], (255, 0, 0))

    draw_dino()
    draw_ground()
    strip.write()

def spawn_obstacle():
    if len(obstacles) >= 6:
        return

    # Avoid row 5 (ground)
    row = urandom.choice([0, 1, 2, 3, 4])
    obstacles.append({"row": row, "col": COLS - 1})

def move_obstacles():
    global score, obstacles
    newlist = []
    for obs in obstacles:
        obs["col"] -= 1
        if obs["col"] >= 0:
            newlist.append(obs)
        else:
            score += 1
    obstacles = newlist

def update_buttons():
    global dino_state, jump_timer, crouch_timer

    if BUTTON_RIGHT.value() == 0 and dino_state == "stand":
        dino_state = "jump"
        jump_timer = time.ticks_ms()

    elif BUTTON_LEFT.value() == 0 and dino_state == "stand":
        dino_state = "crouch"
        crouch_timer = time.ticks_ms()

def check_collision():
    # collision area: dino occupies columns 0–2
    for obs in obstacles:
        row, col = obs["row"], obs["col"]
        if 0 <= col <= 2:  # same area as dino
            if dino_state == "stand" and row in [1,2,3,4]:
                return True
            if dino_state == "jump" and row in [2,3]:
                return True
            if dino_state == "crouch" and row in [4]:
                return True
    return False

def countdown():
    for i in range(3,0,-1):
        clear_display()
        draw_digit(i, 3, (0,0,255))
        strip.write()
        BUZZER.on()
        time.sleep(0.15)
        BUZZER.off()
        time.sleep(0.4)

def game_over():
    for _ in range(3):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((255,0,0))
        strip.write()
        time.sleep(0.25)
        clear_display()
        time.sleep(0.25)
    show_score()

def show_score():
    clear_display()
    left = (score // 10) % 10
    right = score % 10
    draw_digit(left, 1, (255,255,0))
    draw_digit(right, 5, (255,255,0))
    strip.write()

    while True:
        if BUTTON_LEFT.value() == 0:
            time.sleep(0.3)
            break

def reset_game():
    global dino_state, score, obstacles
    dino_state = "stand"
    score = 0
    obstacles = []

def show_initial_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0,0,50))
    strip.write()

# === MAIN LOOP ===
show_initial_screen()
last_obstacle_time = time.ticks_ms()

while True:
    if not gameStarted:
        if BUTTON_RIGHT.value() == 0:
            countdown()
            BUZZER.on()
            time.sleep(0.2)
            BUZZER.off()
            gameStarted = True
            reset_game()
            last_obstacle_time = time.ticks_ms()
        continue

    now = time.ticks_ms()

    update_buttons()

    # End of jump / crouch
    if dino_state == "jump" and time.ticks_diff(now, jump_timer) > 900:
        dino_state = "stand"
    if dino_state == "crouch" and time.ticks_diff(now, crouch_timer) > 900:
        dino_state = "stand"

    # Spawn obstacles
    if time.ticks_diff(now, last_obstacle_time) > obstacle_interval:
        spawn_obstacle()
        last_obstacle_time = now

    move_obstacles()
    draw_all()

    if check_collision():
        BUZZER.on(); time.sleep(0.5); BUZZER.off()
        game_over()
        gameStarted = False
        show_initial_screen()
        continue

    frame += 1
    time.sleep(game_speed)
`,
  flappy_bird: `from machine import Pin
import neopixel
import time
import urandom

# === Setup ===
LED_PIN = 12
NUM_LEDS = 48   # Updated for 8x6 matrix
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 50  # Max 255

# === LED Matrix Map (6x8) ===
led_map = [
    [47,46,45,44,43,42,41,40],
    [39,38,37,36,35,34,33,32],
    [31,30,29,28,27,26,25,24],
    [23,22,21,20,19,18,17,16],
    [15,14,13,12,11,10, 9, 8],
    [ 7, 6, 5, 4, 3, 2, 1, 0]
]

# Updated to support larger grid, centered on 8 columns
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
bird_x = 0   # Always left side
velocity = 0
gravity = 1
jump_power = -2
frame = 0
game_started = False
score = 0
obstacles = []

def apply_brightness(color):
    return tuple((c * BRIGHTNESS) // 255 for c in color)

# === LED Helper Functions ===
def clear():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 0))
    strip.write()

def draw_pixel(row, col, color):
    if 0 <= row < 6 and 0 <= col < 8:
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

    # Centered horizontally on 8 columns → start at col=2
    base_col = 2

    for row in range(5):
        for col in range(3):
            if pattern[row] & (1 << (2 - col)):
                draw_pixel(row, base_col + col, apply_brightness(color))
    strip.write()


# === Drawing Functions ===
def draw_bird():
    draw_pixel(int(bird_y), bird_x, apply_brightness((0, 10, 0)))  # dim green

def draw_obstacles():
    for obs in obstacles:
        for row in range(6):
            if not (obs["gap_start"] <= row < obs["gap_start"] + 2):
                draw_pixel(row, obs["col"], apply_brightness((10, 0, 0)))  # red

def move_obstacles():
    global score
    for obs in obstacles:
        obs["col"] -= 1
    if obstacles and obstacles[0]["col"] < 0:
        obstacles.pop(0)
        score += 1

def add_obstacle():
    gap = urandom.getrandbits(3) % 5   # fits 6 rows
    obstacles.append({"col": 7, "gap_start": gap})

def draw_all():
    clear()
    draw_obstacles()
    draw_bird()
    strip.write()

def check_collision():
    for obs in obstacles:
        if obs["col"] == bird_x:
            if not (obs["gap_start"] <= int(bird_y) < obs["gap_start"] + 2):
                return True
    return False


# === Screens ===
def show_initial_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 5))
    strip.write()

def show_end_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 5, 5))
    strip.write()

def countdown():
    for i in [3, 2, 1]:
        draw_digit(i, (0, 0, 20))
        buzzer_beep(0.1)
        time.sleep(0.6)
    clear()

def game_over():
    for _ in range(2):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((10, 0, 0))
        strip.write()
        time.sleep(0.2)
        clear()
        time.sleep(0.2)

    draw_digit(score if score < 10 else 9, (255, 255, 0))  # yellow
    time.sleep(2)
    clear()

def reset_game():
    global bird_y, velocity, obstacles, score, frame
    bird_y = 3  # Start center in 6-row grid
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

    # Physics ↓
    velocity += gravity
    bird_y += velocity
    bird_y = max(0, min(5, bird_y))

    if frame % 10 == 0:
        add_obstacle()

    move_obstacles()
    draw_all()

    if check_collision():
        buzzer_beep(0.2)
        game_over()
        show_end_screen()

        while BUTTON_LEFT.value() == 1:
            time.sleep(0.1)
        game_started = False
        show_initial_screen()

    frame += 1
    time.sleep(0.25)
`,
  shooting: `from machine import Pin
import neopixel
import time
import urandom

# === Pin & Hardware Setup ===
LED_PIN = 12
NUM_LEDS = 48
BUTTON_UP = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_DOWN = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 50  # 0-255

# === NEW 6×8 LED MAP (your board) ===
led_map = [
    [47,46,45,44,43,42,41,40],
    [39,38,37,36,35,34,33,32],
    [31,30,29,28,27,26,25,24],
    [23,22,21,20,19,18,17,16],
    [15,14,13,12,11,10, 9, 8],
    [ 7, 6, 5, 4, 3, 2, 1, 0]
]

ROWS = 6
COLS = 8

# === Game state ===
player_row = ROWS // 2   # start centered vertically
bullets = []             # list of [row, col]
obstacles = []           # list of [row, col]
score = 0
gameStarted = False
frame = 0

# timings (ms)
last_obstacle_time = 0
obstacle_interval = 900
last_bullet_time = 0
bullet_interval = 300

game_speed = 0.13  # loop sleep (s)

# 3x5 digit bitmaps (same as before)
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

# === Helpers ===
def apply_brightness(color):
    return tuple((c * BRIGHTNESS) // 255 for c in color)

def clear_display():
    off = apply_brightness((0,0,0))
    for i in range(NUM_LEDS):
        strip[i] = off
    strip.write()

def draw_pixel(row, col, color):
    if 0 <= row < ROWS and 0 <= col < COLS:
        idx = led_map[row][col]
        strip[idx] = apply_brightness(color)

def buzzer_beep(duration=0.1):
    BUZZER.on()
    time.sleep(duration)
    BUZZER.off()

# === Drawing / UI ===
def draw_digit(num, col_offset, color):
    if num not in digitBitmaps:
        return
    bmp = digitBitmaps[num]
    for r in range(5):
        bits = bmp[r]
        for c in range(3):
            if (bits >> (2 - c)) & 1:
                draw_pixel(r, col_offset + c, color)

def show_initial_screen():
    fill = apply_brightness((0,0,80))
    for i in range(NUM_LEDS):
        strip[i] = fill
    strip.write()

def show_violet_flash():
    fill = apply_brightness((50,0,50))
    for i in range(NUM_LEDS):
        strip[i] = fill
    strip.write()

def show_score_and_wait():
    clear_display()
    left = (score // 10) % 10
    right = score % 10
    # place digits at col 1 and col 5 (3-wide digits: cover 1-3 and 5-7)
    draw_digit(left, 1, (255,255,0))
    draw_digit(right, 5, (255,255,0))
    strip.write()
    buzzer_beep(0.25)
    time.sleep(1)

# === Game mechanics ===
def draw_all():
    clear_display()
    # player (left column 0)
    draw_pixel(player_row, 0, (0,255,0))
    # bullets
    for b in bullets:
        draw_pixel(b[0], b[1], (255,255,0))
    # obstacles
    for o in obstacles:
        draw_pixel(o[0], o[1], (255,0,0))
    strip.write()

def update_buttons():
    global player_row
    if BUTTON_UP.value() == 0 and player_row > 0:
        player_row -= 1
        time.sleep(0.12)
    elif BUTTON_DOWN.value() == 0 and player_row < ROWS - 1:
        player_row += 1
        time.sleep(0.12)

def spawn_obstacle():
    r = urandom.getrandbits(3) % ROWS
    obstacles.append([r, COLS - 1])  # spawn at rightmost column (7)

def move_bullets():
    global bullets, obstacles, score
    new_bullets = []
    for b in bullets:
        b[1] += 1
        if b[1] < COLS:
            hit = False
            # check hit against any obstacle at same cell
            for o in obstacles:
                if o[0] == b[0] and o[1] == b[1]:
                    try:
                        obstacles.remove(o)
                    except ValueError:
                        pass
                    score += 1
                    hit = True
                    break
            if not hit:
                new_bullets.append(b)
    bullets = new_bullets

def move_obstacles():
    global obstacles
    new_obs = []
    for o in obstacles:
        o[1] -= 1
        if o[1] >= 0:
            new_obs.append(o)
    obstacles = new_obs

def check_collision():
    for o in obstacles:
        if o[0] == player_row and o[1] == 0:
            return True
    return False

def countdown():
    for i in (3,2,1):
        clear_display()
        # center digit horizontally, start at col=2
        draw_digit(i, 2, (0,0,255))
        strip.write()
        buzzer_beep(0.12)
        time.sleep(0.6)
    clear_display()

def game_over_sequence():
    for _ in range(3):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((255,0,0))
        strip.write()
        time.sleep(0.25)
        clear_display()
        time.sleep(0.15)
    show_score_and_wait()
    show_violet_flash()

# === Game reset ===
def reset_game():
    global player_row, bullets, obstacles, score, last_obstacle_time, last_bullet_time, frame
    player_row = ROWS // 2
    bullets = []
    obstacles = []
    score = 0
    frame = 0
    last_obstacle_time = time.ticks_ms()
    last_bullet_time = time.ticks_ms()

# === Main Loop ===
show_initial_screen()

while True:
    if not gameStarted:
        if BUTTON_DOWN.value() == 0:   # start with DOWN button as original
            countdown()
            buzzer_beep(0.12)
            reset_game()
            gameStarted = True
        else:
            time.sleep(0.05)
        continue

    now = time.ticks_ms()

    update_buttons()

    # spawn obstacles (timed)
    if time.ticks_diff(now, last_obstacle_time) > obstacle_interval:
        spawn_obstacle()
        last_obstacle_time = now

    # automatic shooting cadence (timed)
    if time.ticks_diff(now, last_bullet_time) > bullet_interval:
        bullets.append([player_row, 1])  # start bullet at col 1
        last_bullet_time = now

    move_bullets()
    move_obstacles()
    draw_all()

    if check_collision():
        buzzer_beep(0.3)
        game_over_sequence()
        gameStarted = False
        # wait for UP press to go back to start screen (similar to original)
        while BUTTON_UP.value() == 1:
            time.sleep(0.05)
        show_initial_screen()
        continue

    frame += 1
    time.sleep(game_speed)
`,
  snake: `from machine import Pin
import neopixel
import time
import urandom

# === Setup ===
LED_PIN = 12
BUZZER_PIN = 2
NUM_LEDS = 48   # 6×8 matrix

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 50
BUZZER = Pin(BUZZER_PIN, Pin.OUT)

BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)

# === NEW 6 × 8 LED MAP ===
led_map = [
    [47,46,45,44,43,42,41,40],
    [39,38,37,36,35,34,33,32],
    [31,30,29,28,27,26,25,24],
    [23,22,21,20,19,18,17,16],
    [15,14,13,12,11,10,9,8],
    [7,6,5,4,3,2,1,0]
]

ROWS = 6
COLS = 8

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

UP, RIGHT, DOWN, LEFT = 0, 1, 2, 3

snake = [{"row": 2, "col": 3}]
snake_length = 1
direction = RIGHT
pending_turn = 0
food = {"row": 0, "col": 0}
last_button_time = 0
debounce_delay = 150
gameStarted = False

def apply_brightness(color):
    return tuple((c * BRIGHTNESS) // 255 for c in color)

# === Display ===
def get_pixel_index(row, col):
    if 0 <= row < ROWS and 0 <= col < COLS:
        return led_map[row][col]
    return -1

def draw_pixel(row, col, color):
    idx = get_pixel_index(row, col)
    if idx != -1:
        r, g, b = color
        strip[idx] = apply_brightness((min(40, r), min(40, g), min(40, b)))

def clear_display():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 0))
    strip.write()

def draw_digit(num, col_offset, color):
    if num not in digitBitmaps:
        return
    for row in range(5):
        bits = digitBitmaps[num][row]
        for col in range(3):
            if (bits >> (2 - col)) & 1:
                draw_pixel(row, col + col_offset, color)

def buzzer_beep(duration=0.1):
    BUZZER.on()
    time.sleep(duration)
    BUZZER.off()

def show_initial_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 80))
    strip.write()

def countdown():
    for i in range(3, 0, -1):
        clear_display()
        draw_digit(i, 2, (0, 0, 255))
        strip.write()
        buzzer_beep(0.1)
        time.sleep(0.5)
        clear_display()
        strip.write()
        time.sleep(0.2)

def show_score(length):
    clear_display()
    score = max(0, length - 1)
    left = (score // 10) % 10
    right = score % 10
    draw_digit(left, 1, (255, 255, 0))
    draw_digit(right, 5, (255, 255, 0))
    strip.write()
    while True:
        if BUTTON_LEFT.value() == 0:
            time.sleep(0.3)
            break

def red_flash():
    for _ in range(3):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((80, 0, 0))
        strip.write()
        buzzer_beep(0.15)
        time.sleep(0.2)
        clear_display()
        strip.write()
        time.sleep(0.2)

# === Game Logic ===
def spawn_food():
    global food
    while True:
        r = urandom.getrandbits(3) % ROWS
        c = urandom.getrandbits(4) % COLS
        if all(part["row"] != r or part["col"] != c for part in snake):
            food = {"row": r, "col": c}
            break

def read_buttons():
    global pending_turn, last_button_time
    now = time.ticks_ms()
    if time.ticks_diff(now, last_button_time) > debounce_delay:
        if not BUTTON_LEFT.value():
            pending_turn = -1
            last_button_time = now
        elif not BUTTON_RIGHT.value():
            pending_turn = 1
            last_button_time = now

def move_snake():
    global snake, snake_length, direction, pending_turn

    if pending_turn == -1:
        direction = (direction + 3) % 4
    elif pending_turn == 1:
        direction = (direction + 1) % 4
    pending_turn = 0

    head = dict(snake[0])
    if direction == UP:
        head["row"] = (head["row"] - 1) % ROWS
    elif direction == DOWN:
        head["row"] = (head["row"] + 1) % ROWS
    elif direction == LEFT:
        head["col"] = (head["col"] - 1) % COLS
    elif direction == RIGHT:
        head["col"] = (head["col"] + 1) % COLS

    if head in snake:
        red_flash()
        show_score(snake_length)
        return False
    snake.insert(0, head)

    if head["row"] == food["row"] and head["col"] == food["col"]:
        snake_length += 1
        buzzer_beep(0.05)
        if snake_length > NUM_LEDS:
            snake_length = NUM_LEDS
        spawn_food()
    else:
        snake[:] = snake[:snake_length]

    return True

def draw():
    clear_display()
    draw_pixel(food["row"], food["col"], (255, 0, 0))
    for part in snake:
        draw_pixel(part["row"], part["col"], (0, 255, 0))
    strip.write()

def reset_game():
    global snake, snake_length, direction, pending_turn
    snake = [{"row": 2, "col": 3}]
    snake_length = 1
    direction = RIGHT
    pending_turn = 0
    spawn_food()

# === Game Loop ===
while True:
    if not gameStarted:
        show_initial_screen()
        while BUTTON_RIGHT.value() == 1:
            time.sleep(0.1)
        countdown()
        reset_game()
        gameStarted = True

    read_buttons()
    if not move_snake():
        gameStarted = False
        continue
    draw()
    time.sleep(0.35)
`
}


export default gameHelper