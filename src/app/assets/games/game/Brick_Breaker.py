from machine import Pin
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

