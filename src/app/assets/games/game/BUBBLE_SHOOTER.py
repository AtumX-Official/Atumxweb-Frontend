from machine import Pin
import neopixel
import time
import urandom

# === Constants and Hardware ===
LED_PIN = 12
NUM_LEDS = 35
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)

led_map = [
    [34, 33, 32, 31, 30, 29, 28],
    [27, 26, 25, 24, 23, 22, 21],
    [20, 19, 18, 17, 16, 15, 14],
    [13, 12, 11, 10,  9,  8,  7],
    [ 6,  5,  4,  3,  2,  1,  0]
]

COLORS = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]  # Red, Green, Blue

shooter_col = 3
shooter_color = COLORS[0]
next_color = COLORS[1]
bubbles = []
bullets = []
gameStarted = False
score = 0

# === Digit Bitmaps (3x5) ===
digits = {
    0: [(0,0), (0,1), (0,2), (1,0), (1,2), (2,0), (2,2), (3,0), (3,2), (4,0), (4,1), (4,2)],
    1: [(0,1), (1,1), (2,1), (3,1), (4,1)],
    2: [(0,0), (0,1), (0,2), (1,2), (2,1), (3,0), (4,0), (4,1), (4,2)],
    3: [(0,0), (0,1), (0,2), (1,2), (2,1), (3,2), (4,0), (4,1), (4,2)],
    4: [(0,2), (1,2), (2,0), (2,1), (2,2), (3,2), (4,2)],
    5: [(0,0), (0,1), (0,2), (1,0), (2,0), (2,1), (2,2), (3,2), (4,0), (4,1), (4,2)],
    6: [(0,1), (0,2), (1,0), (2,0), (2,1), (2,2), (3,0), (4,0), (4,1), (4,2)],
    7: [(0,0), (0,1), (0,2), (1,2), (2,1), (3,1), (4,1)],
    8: [(0,0), (0,1), (0,2), (1,0), (1,2), (2,1), (3,0), (3,2), (4,0), (4,1), (4,2)],
    9: [(0,0), (0,1), (0,2), (1,0), (1,2), (2,0), (2,1), (2,2), (3,2), (4,1)],
}

def clear_display():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 0))
    strip.write()

def get_index(r, c):
    if 0 <= r < 5 and 0 <= c < 7:
        return led_map[r][c]
    return -1

def draw_pixel(r, c, color):
    idx = get_index(r, c)
    if idx != -1:
        strip[idx] = color

def draw_all():
    clear_display()
    for b in bubbles:
        apply_brightness(draw_pixel(b[0], b[1], b[2]))
    for b in bullets:
        apply_brightness(draw_pixel(b[0], b[1], b[2]))
    apply_brightness(draw_pixel(4, shooter_col, shooter_color))
    apply_brightness(draw_pixel(4, 6, next_color)_
    strip.write()

def spawn_bubbles():
    for row in range(2):
        for col in range(7):
            color = COLORS[urandom.getrandbits(2) % 3]
            bubbles.append([row, col, color])

def shoot():
    global shooter_color, next_color
    bullets.append([3, shooter_col, shooter_color])
    shooter_color = next_color
    next_color = COLORS[urandom.getrandbits(2) % 3]

def move_bullets():
    global bullets
    new_bullets = []
    for b in bullets:
        b[0] -= 1
        if b[0] < 0:
            continue
        hit = False
        for bub in bubbles:
            if bub[0] == b[0] and bub[1] == b[1]:
                bubbles.append([b[0]+1, b[1], b[2]])
                check_and_pop(b[0]+1, b[1], b[2])
                hit = True
                break
        if not hit:
            if b[0] == 0:
                bubbles.append([b[0], b[1], b[2]])
                check_and_pop(b[0], b[1], b[2])
            else:
                new_bullets.append(b)
    bullets = new_bullets

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
                    stack.append((r+dr, c+dc))
    return connected

def check_and_pop(row, col, color):
    global bubbles, score
    connected = find_connected(row, col, color)
    if len(connected) >= 3:
        for b in connected:
            if b in bubbles:
                bubbles.remove(b)
        score += len(connected)
        BUZZER.on()
        time.sleep(0.1)
        BUZZER.off()

def check_game_over():
    return any(b[0] >= 3 for b in bubbles)

def check_win():
    return all(b[0] >= 4 for b in bubbles)

def show_number(num, color=(0, 0, 255)):
    clear_display()
    if num > 9: num = 9  # Clamp
    for (r, c) in digits[num]:
        apply_brightness(draw_pixel(r, c + 2, color))
    strip.write()

def show_score_and_wait():
    show_number(score)
    BUZZER.on()
    time.sleep(0.4)
    BUZZER.off()
    time.sleep(1)

def show_win():
    show_score_and_wait()
    win1 = [34,27,20,13,6,12,4,11,18,25,32]
    win2 = [3,10,17,24,31]
    win3 = [2,9,16,23,30,22,15,8,0,7,14,21,28]
    colors = [(0,255,0), (0,0,255), (255,0,0)]
    for _ in range(3):
        clear_display()
        for i in win1: strip[i] = colors[0]
        for i in win2: strip[i] = colors[1]
        for i in win3: strip[i] = colors[2]
        strip.write()
        BUZZER.on(); time.sleep(0.3); BUZZER.off()
        clear_display(); time.sleep(0.2)

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
        show_number(i, (0, 255, 255))
        BUZZER.on(); time.sleep(0.2); BUZZER.off()
        time.sleep(0.4)

def show_start():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 80))
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

    if BUTTON_LEFT.value() == 0 and BUTTON_RIGHT.value() == 1:
        shooter_col = max(0, shooter_col - 1)
        time.sleep(0.15)
    elif BUTTON_RIGHT.value() == 0 and BUTTON_LEFT.value() == 1:
        shooter_col = min(6, shooter_col + 1)
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
        show_win()
        gameStarted = False
        show_start()

    time.sleep(0.2)
