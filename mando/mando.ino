#include <Ticker.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "Pablo";
const char* password = "123456789";

// WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Pines para el teclado y joystick
#define F1_PIN 4
#define F2_PIN 5
#define F3_PIN 18
#define F4_PIN 19
#define C1_PIN 13
#define C2_PIN 12
#define C3_PIN 14
#define C4_PIN 27
#define PE_PIN 23
#define INT_PIN 15

const int pinVRX = 33;
const int pinVRY = 32;
const int pinVRZ = 34;
const int pinVRG = 35;

const int thresholdMax = 4000;
const int thresholdMin = 100;

volatile int x_val = 0;
volatile int y_val = 0;
volatile int z_val = 0;
volatile int g_val = 0;
volatile int o_val = 0;

volatile int actualizar = 0;
volatile int ks;
volatile char N;
volatile int PEE;
volatile int SEL;
volatile int NEG;
volatile int WIFIFI;

Ticker timer;
LiquidCrystal_I2C lcd(0x27, 20, 4);

volatile int digitCount = 0;
volatile char digits[4];

volatile int activeColumn = -1;

void IRAM_ATTR handleColumn1();
void IRAM_ATTR handleColumn2();
void IRAM_ATTR handleColumn3();
void IRAM_ATTR handleColumn4();
void IRAM_ATTR PE();
void IRAM_ATTR INT();

void SCARA_Init();
void keypad_init();
void readJoystick();
void updateDisplay();
void clearRows();
void f1a();
void f2a();
void f3a();
void f4a();
void print_X();
void print_Y();
void print_Z();
void print_G();
void print_O();

void storeValue(char key);
void assignToVariable(char key);
void resetDigits();
void sendWifi();

void setup() {
  Serial.begin(115200);
  lcd.begin();
  lcd.clear();

  WiFi.begin(ssid, password);
  
  lcd.print("CONECTANDO...");
  while (WiFi.status() != WL_CONNECTED) {
    lcd.print(".");
    delay(300);
  }
  lcd.clear();

  lcd.print("CONECTADO");
  delay(1000);
  lcd.clear();

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  keypad_init();

  attachInterrupt(digitalPinToInterrupt(C1_PIN), handleColumn1, FALLING);
  attachInterrupt(digitalPinToInterrupt(C2_PIN), handleColumn2, FALLING);
  attachInterrupt(digitalPinToInterrupt(C3_PIN), handleColumn3, FALLING);
  attachInterrupt(digitalPinToInterrupt(C4_PIN), handleColumn4, FALLING);
  attachInterrupt(digitalPinToInterrupt(INT_PIN), INT, FALLING);
  attachInterrupt(digitalPinToInterrupt(PE_PIN), PE, CHANGE);

  pinMode(PE_PIN, INPUT_PULLUP);
  pinMode(INT_PIN, INPUT_PULLUP);

  timer.attach_ms(100, readJoystick);

  SCARA_Init();
}

void loop() {
  webSocket.loop();  

  while (actualizar == 0) {
    // Espera activación
  }

  for (int i = 0; i < 3; i++) {
    if (PEE == 1) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Stop Emergence");
      return;
    }

    updateDisplay(); 
    
    while (digitalRead(C1_PIN) == 0 || digitalRead(C2_PIN) == 0 || 
           digitalRead(C3_PIN) == 0 || digitalRead(C4_PIN) == 0) {
    }

    if (ks == 1) {
      switch (activeColumn) {
        case 1:
        case 2:
        case 3:
        case 4:
          Serial.println(N);
          storeValue(N);      
          if (N == 'A' || N == 'B' || N == 'C' || N == 'D' || N == '#') {
            assignToVariable(N);
          }
          break;
      }
      ks = 0;
    }

    if (WIFIFI == 1) {
      sendWifi();
    }

    WIFIFI = 0;
    actualizar = 0;
  }
}

// Función para manejar eventos del WebSocket
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    Serial.printf("Mensaje recibido: %s\n", payload);

    // Parsear el mensaje JSON para actualizar las variables desde Python
    String message = String((char*)payload);
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, message);
    actualizar = 1;

    if (doc.containsKey("X")) {
      x_val = doc["X"];
    }
    if (doc.containsKey("Y")) {
      y_val = doc["Y"];
    }
    if (doc.containsKey("Z")) {
      z_val = doc["Z"];
    }
    if (doc.containsKey("G")) {
      g_val = doc["G"];
    }
    if (doc.containsKey("O")) {
      o_val = doc["O"];
    }

    // Actualizar pantalla LCD inmediatamente cuando los valores se cambien desde Python
    updateDisplay();
  }
}

void sendWifi() {
  String message = String("{\"X\": ") + x_val + 
                   ", \"Y\": " + y_val + 
                   ", \"Z\": " + z_val + 
                   ", \"G\": " + g_val + 
                   ", \"O\": " + o_val + 
                   "}";
  webSocket.broadcastTXT(message);
}

void readJoystick() {
  int xValue = analogRead(pinVRX);
  int yValue = analogRead(pinVRY);
  int zValue = analogRead(pinVRZ);
  int gValue = analogRead(pinVRG);
  int oValue = analogRead(pinVRG);

  if (xValue >= thresholdMax) { x_val--; WIFIFI = 1; actualizar = 1;} 
  if (xValue <= thresholdMin) { x_val++; WIFIFI = 1; actualizar = 1;}
  
  if (yValue >= thresholdMax) { y_val--; WIFIFI = 1; actualizar = 1;} 
  if (yValue <= thresholdMin) { y_val++; WIFIFI = 1; actualizar = 1;}
  
  if (zValue >= thresholdMax) { z_val--; WIFIFI = 1; actualizar = 1;} 
  if (zValue <= thresholdMin) { z_val++; WIFIFI = 1; actualizar = 1;}
  
  switch (SEL) {
    case 0:
      if (gValue >= thresholdMax) { g_val--; WIFIFI = 1; actualizar = 1;} 
      if (gValue <= thresholdMin) { g_val++; WIFIFI = 1; actualizar = 1;}
      break;
    case 1: 
      if (oValue >= thresholdMax) { o_val--; WIFIFI = 1; actualizar = 1;} 
      if (oValue <= thresholdMin) { o_val++; WIFIFI = 1; actualizar = 1;}
      break;
    default:
      break;
  }
}

// Función para almacenar los dígitos hasta 3
void storeValue(char key) {
  if (digitCount < 3 && key >= '0' && key <= '9') {
    digits[digitCount] = key;
    digitCount++;
    lcd.setCursor(digitCount - 1, 0); // Muestra el número en la primera línea del LCD
    lcd.print(key);
  } else if (key == '#') {  // El usuario puede confirmar el número con la tecla '#'
    assignToVariable(key);  // Asigna el valor a la variable correspondiente
  }
}

// Función para asignar el valor a la variable correcta
void assignToVariable(char key) {
  if (digitCount > 0) {  // Si hay al menos un dígito
    int value = atoi((const char*)digits);  // Convierte los dígitos a número

    if (NEG == 1) {
      value = -value;  // Convierte el valor a negativo si se presionó '*'
      NEG = 0;  // Resetea la bandera
    }

    switch (key) {
      case 'A':
        x_val = value;
        Serial.print("Valor asignado a X: ");
        Serial.println(x_val);
        WIFIFI = 1;
        break;
      case 'B':
        y_val = value;
        Serial.print("Valor asignado a Y: ");
        Serial.println(y_val);
        WIFIFI = 1;
        break;
      case 'C':
        z_val = value;
        Serial.print("Valor asignado a Z: ");
        Serial.println(z_val);
        WIFIFI = 1;
        break;
      case 'D':
        g_val = value;
        Serial.print("Valor asignado a G: ");
        Serial.println(g_val);
        WIFIFI = 1;
        break;
      case '#':  // Confirmar entrada para O
        o_val = value;
        Serial.print("Valor asignado a O: ");
        Serial.println(o_val);
        WIFIFI = 1;
        break;
    }
    resetDigits();  // Resetea los dígitos después de la asignación
  }
}

// Función para resetear los dígitos
void resetDigits() {
  digitCount = 0;
  for (int i = 0; i < 3; i++) {
    digits[i] = '\0';
  }
  lcd.clear();
}

// Funciones de interrupción para las columnas del teclado
void IRAM_ATTR handleColumn1() {
  actualizar = 1;
  ks = 1;
  activeColumn = 1;

  f1a();
  if (digitalRead(C1_PIN) == LOW) { N = '1'; }
  
  f2a();
  if (digitalRead(C1_PIN) == LOW) { N = '4'; }
  
  f3a();
  if (digitalRead(C1_PIN) == LOW) { N = '7'; }
  
  f4a();
  if (digitalRead(C1_PIN) == LOW) { N = '*'; NEG = 1; }

  clearRows();
}

void IRAM_ATTR handleColumn2() {
  actualizar = 1;
  ks = 1;
  activeColumn = 2;

  f1a();
  if (digitalRead(C2_PIN) == LOW) { N = '2'; }
  
  f2a();
  if (digitalRead(C2_PIN) == LOW) { N = '5'; }
  
  f3a();
  if (digitalRead(C2_PIN) == LOW) { N = '8'; }
  
  f4a();
  if (digitalRead(C2_PIN) == LOW) { N = '0'; }
  
  clearRows();
}

void IRAM_ATTR handleColumn3() {
  actualizar = 1;
  ks = 1;
  activeColumn = 3;

  f1a();
  if (digitalRead(C3_PIN) == LOW) { N = '3'; }
  
  f2a();
  if (digitalRead(C3_PIN) == LOW) { N = '6'; }
  
  f3a();
  if (digitalRead(C3_PIN) == LOW) { N = '9'; }
  
  f4a();
  if (digitalRead(C3_PIN) == LOW) { N = '#';  }

  clearRows();
}

void IRAM_ATTR handleColumn4() {
  actualizar = 1;
  ks = 1;
  activeColumn = 4;

  f1a();
  if (digitalRead(C4_PIN) == LOW) { N = 'A'; }
  
  f2a();
  if (digitalRead(C4_PIN) == LOW) { N = 'B';  }
  
  f3a();
  if (digitalRead(C4_PIN) == LOW) { N = 'C';}
  
  f4a();
  if (digitalRead(C4_PIN) == LOW) { N = 'D'; }

  clearRows();
}

void IRAM_ATTR PE() {
  actualizar = 1;

  if (digitalRead(PE_PIN) == HIGH) {
    PEE = 1;
  } else if (digitalRead(PE_PIN) == LOW) {
    PEE = 0;
  }
}

void IRAM_ATTR INT(){
  if(SEL == 0){SEL = 1;}
  else if (SEL == 1){SEL = 0;}
}

// Inicializa los pines del teclado
void keypad_init() {
  pinMode(F1_PIN, OUTPUT);
  pinMode(F2_PIN, OUTPUT);
  pinMode(F3_PIN, OUTPUT);
  pinMode(F4_PIN, OUTPUT);
  pinMode(C1_PIN, INPUT_PULLUP);
  pinMode(C2_PIN, INPUT_PULLUP);
  pinMode(C3_PIN, INPUT_PULLUP);
  pinMode(C4_PIN, INPUT_PULLUP);
  clearRows();
}

void clearRows() {
  digitalWrite(F1_PIN, LOW);
  digitalWrite(F2_PIN, LOW);
  digitalWrite(F3_PIN, LOW);
  digitalWrite(F4_PIN, LOW);
}

void f1a() {
  digitalWrite(F1_PIN, LOW);
  digitalWrite(F2_PIN, HIGH);
  digitalWrite(F3_PIN, HIGH);
  digitalWrite(F4_PIN, HIGH);
}

void f2a() {
  digitalWrite(F1_PIN, HIGH);
  digitalWrite(F2_PIN, LOW);
  digitalWrite(F3_PIN, HIGH);
  digitalWrite(F4_PIN, HIGH);
}

void f3a() {
  digitalWrite(F1_PIN, HIGH);
  digitalWrite(F2_PIN, HIGH);
  digitalWrite(F3_PIN, LOW);
  digitalWrite(F4_PIN, HIGH);
}

void f4a() {
  digitalWrite(F1_PIN, HIGH);
  digitalWrite(F2_PIN, HIGH);
  digitalWrite(F3_PIN, HIGH);
  digitalWrite(F4_PIN, LOW);
}

void print_X() { Serial.print("X: "); Serial.println(x_val); }
void print_Y() { Serial.print("\tY: "); Serial.println(y_val); }
void print_Z() { Serial.print("\tZ: "); Serial.println(z_val); }
void print_G() { Serial.print("\tG: "); Serial.println(g_val); }
void print_O() { Serial.print("\tO: "); Serial.println(o_val); }

void updateDisplay() {
  lcd.clear();
  
  lcd.setCursor(0, 0);
  lcd.print("X: ");
  lcd.print("     ");
  lcd.setCursor(3, 0);
  lcd.print(x_val);

  lcd.setCursor(0, 1);
  lcd.print("Y: ");
  lcd.print("     ");
  lcd.setCursor(3, 1);
  lcd.print(y_val);

  lcd.setCursor(0, 2);
  lcd.print("Z: ");
  lcd.print("     ");
  lcd.setCursor(3, 2);
  lcd.print(z_val);

  lcd.setCursor(0, 3);
  lcd.print("G: ");
  lcd.print("     ");
  lcd.setCursor(3, 3);
  lcd.print(g_val);

  lcd.setCursor(9, 0);
  lcd.print("O: ");
  lcd.print("     ");
  lcd.setCursor(12, 0);
  lcd.print(o_val);
}

void SCARA_Init() {
  lcd.clear();
  
  lcd.setCursor(3, 0);
  lcd.print("EN SERIO SIGUEN");
  lcd.setCursor(4, 1);
  lcd.print("EN EL CURSO?");
  delay(2000);
  
  lcd.clear();
  lcd.setCursor(3, 0);
  lcd.print("SEGUROS QUE");
  lcd.setCursor(1, 1);
  lcd.print("QUIEREN CONTINUAR?");
  delay(2000);
  
  lcd.clear();
  lcd.setCursor(7, 0);
  lcd.print("MEJOR");
  lcd.setCursor(6, 1);
  lcd.print("CANCELEN");
  delay(2000);
  
  lcd.clear();
  lcd.setCursor(8, 0);
  lcd.print("HOLA");
  delay(1000);
  lcd.setCursor(2, 1);
  lcd.print("SOY SCARA UAO");
  delay(1000);
  lcd.clear();
}