from machine import Pin
import neopixel
import time
import urandom

# === Pin & Hardware Setup ===
LED_PIN = 12
NUM_LEDS = 35
BUTTON_UP = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_DOWN = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
BRIGHTNESS = 50  # Max is 255

# LED layout mapping (row x col → NeoPixel index)
led_map = [
    [34, 33, 32, 31, 30, 29, 28],
    [27, 26, 25, 24, 23, 22, 21],
    [20, 19, 18, 17, 16, 15, 14],
    [13, 12, 11, 10,  9,  8,  7],
    [ 6,  5,  4,  3,  2,  1,  0]
]

# === Game State ===
player_row = 2
bullets = []
obstacles = []
score = 0
gameStarted = False
frame = 0
game_speed = 0.15
last_obstacle_time = 0
obstacle_interval = 1000
last_bullet_time = 0
bullet_interval = 300

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
        strip[idx] = apply_brightness(tuple(min(50, int(c)) for c in color))

def draw_all():
    clear_display()
    draw_pixel(player_row, 0, (0, 255, 0))  # player car

    for bullet in bullets:
        draw_pixel(bullet[0], bullet[1], (255, 255, 0))

    for obs in obstacles:
        draw_pixel(obs[0], obs[1], (255, 0, 0))

    strip.write()

def countdown():
    for i in range(3, 0, -1):
        clear_display()
        draw_digit(i, 2, (0, 0, 255))
        strip.write()
        BUZZER.on()
        time.sleep(0.1)
        BUZZER.off()
        time.sleep(0.4)

digitBitmaps = {
    0: [0b111, 0b101, 0b101, 0b101, 0b111],
    1: [0b010, 0b110, 0b010, 0b010, 0b111],
    2: [0b111, 0b001, 0b111, 0b100, 0b111],
    3: [0b111, 0b001, 0b111, 0b001, 0b111]
}

def draw_digit(num, col_offset, color):
    if num not in digitBitmaps:
        return
    for row in range(5):
        row_bits = digitBitmaps[num][row]
        for col in range(3):
            if (row_bits >> (2 - col)) & 0x01:
                draw_pixel(row, col + col_offset, color)

def game_over():
    for _ in range(3):
        for i in range(NUM_LEDS):
            strip[i] = apply_brightness((255, 0, 0))
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
    time.sleep(3)

def reset_game():
    global player_row, bullets, obstacles, score, last_obstacle_time, last_bullet_time
    player_row = 2
    bullets = []
    obstacles = []
    score = 0
    last_obstacle_time = time.ticks_ms()
    last_bullet_time = time.ticks_ms()

def show_initial_screen():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((0, 0, 80))
    strip.write()
    
def violet_flash():
    for i in range(NUM_LEDS):
        strip[i] = apply_brightness((50, 0, 50))
    strip.write()
    
def update_buttons():
    global player_row
    if BUTTON_UP.value() == 0 and player_row > 0:
        player_row -= 1
        time.sleep(0.15)
    elif BUTTON_DOWN.value() == 0 and player_row < 4:
        player_row += 1
        time.sleep(0.15)

def spawn_obstacle():
    row = urandom.getrandbits(2) % 5
    obstacles.append([row, 6])

def move_bullets():
    global bullets, obstacles, score
    new_bullets = []
    for b in bullets:
        b[1] += 1
        if b[1] < 7:
            hit = False
            for obs in obstacles:
                if obs[0] == b[0] and obs[1] == b[1]:
                    obstacles.remove(obs)
                    score += 1
                    hit = True
                    break
            if not hit:
                new_bullets.append(b)
    bullets = new_bullets

def move_obstacles():
    global obstacles
    new_obs = []
    for obs in obstacles:
        obs[1] -= 1
        if obs[1] >= 0:
            new_obs.append(obs)
    obstacles = new_obs

def check_collision():
    for obs in obstacles:
        if obs[0] == player_row and obs[1] == 0:
            return True
    return False

# === Main Loop ===
show_initial_screen()

while True:
    if not gameStarted:
        if BUTTON_DOWN.value() == 0:
            countdown()
            BUZZER.on()
            time.sleep(0.2)
            BUZZER.off()
            gameStarted = True
            reset_game()
        continue

    now = time.ticks_ms()
    update_buttons()

    if time.ticks_diff(now, last_obstacle_time) > obstacle_interval:
        spawn_obstacle()
        last_obstacle_time = now

    if time.ticks_diff(now, last_bullet_time) > bullet_interval:
        bullets.append([player_row, 1])
        last_bullet_time = now

    move_bullets()
    move_obstacles()
    draw_all()
        
    if check_collision():
        BUZZER.on()
        time.sleep(0.3)
        BUZZER.off()
        game_over()
        violet_flash()
        gameStarted = False
        while BUTTON_UP.value() == 1:
            time.sleep(0.05)
        show_initial_screen()
        continue

    frame += 1
    time.sleep(game_speed)
