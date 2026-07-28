from machine import Pin
import neopixel
import time
import urandom

# Matrix config
PIN = 12
NUM_LEDS = 35
np = neopixel.NeoPixel(Pin(PIN), NUM_LEDS)
BRIGHTNESS = 50  # Max is 255

# Buttons & Buzzer
BUTTON_LEFT = Pin(1, Pin.IN, Pin.PULL_UP)
BUTTON_RIGHT = Pin(47, Pin.IN, Pin.PULL_UP)
BUZZER = Pin(2, Pin.OUT)

# LED Mapping
led_map = [
    [34,33,32,31,30,29,28],
    [27,26,25,24,23,22,21],
    [20,19,18,17,16,15,14],
    [13,12,11,10, 9, 8, 7],
    [ 6, 5, 4, 3, 2, 1, 0]
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

def clear():
    for i in range(NUM_LEDS):
        np[i] = apply_brightness((0,0,0))
    np.write()

def draw(x, y, color):
    if 0 <= x < 5 and 0 <= y < 7:
        np[led_map[x][y]] = tuple(min(50, c) for c in color)

def draw_score(num):
    bmp = digitBitmaps[num%10]
    for r in range(5):
        bits = bmp[r]
        for c in range(3):
            if bits & (1 << (2-c)):
                draw(r, c+2,  apply_brightness((255, 255, 0)))
    np.write()

def intro():
    for i in range(NUM_LEDS):
        np[i] = apply_brightness((0, 0, 50))
    np.write()

def countdown():
    for i in range(3, 0, -1):
        clear()
        draw_score(i)
        BUZZER.on()
        time.sleep(0.2)
        BUZZER.off()
        time.sleep(0.8)

def violet_flash():
    for i in range(NUM_LEDS):
        np[i] = apply_brightness((50, 0, 50))
    np.write()

def red_flash():
    for _ in range(3):
        for i in range(NUM_LEDS):
            np[i] = apply_brightness((50, 0, 0))
        np.write()
        BUZZER.on()
        time.sleep(0.2)
        BUZZER.off()
        clear()
        time.sleep(0.2)

def show_final_score(sc):
    clear()
    draw_score(sc)
    np.write()
    time.sleep(3)

# Game variables
car_pos = 2
obstacles = []
score = 0
frame = 0
gameStarted = False

def reset_game():
    global car_pos, obstacles, score, frame
    car_pos = 2
    obstacles = []
    score = 0
    frame = 0
    clear()

def spawn_obstacle():
    row = urandom.getrandbits(3) % 5
    obstacles.append([row, 6])

def move_obstacles():
    global score
    for obs in obstacles:
        obs[1] -= 1
    if obstacles and obstacles[0][1] < 0:
        obstacles.pop(0)
        score += 1

def draw_all():
    clear()
    draw(car_pos, 0, apply_brightness((0, 255, 0))
    for r,c in obstacles:
        draw(r, c, apply_brightness((255, 0, 0)))
    np.write()

def check_collision():
    for r,c in obstacles:
        if c == 0 and r == car_pos:
            return True
    return False

# Main Loop
intro()

while True:
    if not gameStarted:
        if BUTTON_RIGHT.value() == 0:
            countdown()
            BUZZER.on()
            time.sleep(0.2)
            BUZZER.off()
            reset_game()
            gameStarted = True
        continue

    # Move car
    if BUTTON_LEFT.value() == 0 and car_pos > 0:
        car_pos -= 1
        time.sleep(0.15)
    elif BUTTON_RIGHT.value() == 0 and car_pos < 4:
        car_pos += 1
        time.sleep(0.15)

    # Spawn & Move
    if frame % 5 == 0:
        spawn_obstacle()

    move_obstacles()
    draw_all()

    if check_collision():
        BUZZER.on()
        time.sleep(0.3)
        BUZZER.off()
        red_flash()
        show_final_score(score)
        violet_flash()
        gameStarted = False
        while BUTTON_LEFT.value() == 1:
            time.sleep(0.05)
        intro()
        continue

    frame += 1
    time.sleep(0.15)
