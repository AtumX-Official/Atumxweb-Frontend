from machine import Pin
import neopixel
import time
import urandom

# === Setup ===
LED_PIN = 12
BUZZER_PIN = 2
NUM_LEDS = 35

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 50  # Max is 255
BUZZER = Pin(BUZZER_PIN, Pin.OUT)
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)

led_map = [
    [34, 33, 32, 31, 30, 29, 28],
    [27, 26, 25, 24, 23, 22, 21],
    [20, 19, 18, 17, 16, 15, 14],
    [13, 12, 11, 10,  9,  8,  7],
    [6,  5,  4,  3,  2,  1,  0]
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
    if 0 <= row < 5 and 0 <= col < 7:
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
    if num not in digitBitmaps: return
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
    draw_digit(left, 0, (255, 255, 0))
    draw_digit(right, 4, (255, 255, 0))
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
        r = urandom.getrandbits(3) % 5
        c = urandom.getrandbits(3) % 7
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
        head["row"] = (head["row"] - 1) % 5
    elif direction == DOWN:
        head["row"] = (head["row"] + 1) % 5
    elif direction == LEFT:
        head["col"] = (head["col"] - 1) % 7
    elif direction == RIGHT:
        head["col"] = (head["col"] + 1) % 7

    if head in snake:
        red_flash()
        show_score(snake_length)
        return False  # Game over
    snake.insert(0, head)

    if head["row"] == food["row"] and head["col"] == food["col"]:
        snake_length += 1
        buzzer_beep(0.05)
        if snake_length > 35:
            snake_length = 35
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
    time.sleep(0.4)
