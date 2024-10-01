#include <PID_v1.h>
#include "Adafruit_VL53L0X.h"
#include <ArduinoJson.h>


const int WINDOW_SIZE = 15;

// Arreglos para almacenar las últimas 10 lecturas
int ventanaA[WINDOW_SIZE];
int ventanaX[WINDOW_SIZE];
int ventanaY[WINDOW_SIZE];

// Variables para llevar el índice de las lecturas
int indice = 0;

bool flag50ms = false; 

// Pines de control del motor paso a paso (CNC shield usa estos pines para el motor)
int enablePin = 8;
const int stepPinZ = 4, dirPinZ = 7;
const int stepPinX = 2, dirPinX = 5;
const int stepPinY = 3, dirPinY = 6;
const int stepPinA = 14, dirPinA = 15;
const int servo = 44;

// Pines para finales de carreray
const int FinalCarreraMotorX = 9;
const int FinalCarreraMotorY = 10;
const int FinalCarreraMotorZ = 11;
const int FinalCarreraMotorA = 12;

// Variables para debouncing
unsigned long lastDebounceTimeZ = 0, lastDebounceTimeA = 0;
unsigned long lastDebounceTimeX = 0, lastDebounceTimeY = 0;
const unsigned long debounceDelay = 50;  // Tiempo de debounce en milisegundos

bool finalCarreraZActivado = false;
bool finalCarreraAActivado = false;
bool finalCarreraXActivado = false;
bool finalCarreraYActivado = false;

// Definición de las frecuencias iniciales para los motores
int FZ = 300, FX = 300, FY = 400, FA = 300;
int umbral = 80;

// Pines para sensores de posición angular
const int POT_MOTOR_A = A10;
const int POT_MOTOR_X = A9;
const int POT_MOTOR_Y = A8;

// Valores máximos y mínimos de los potenciómetros en el rango de movimiento deseado
const int ValminA = 575, ValmaxA = 658, AngMinA = 0, AngMaxA = 90;
const int ValminX = 793, ValmaxX = 880, AngMinX = 0, AngMaxX = 90;
const int ValminY = 500, ValmaxY = 594, AngMinY = 0, AngMaxY = 90;

// Variables para el sensor de distancia VL53L0X
float filteredDistance = 0, alpha = 0.4;
int distancia_Sensada_mm = 0;
Adafruit_VL53L0X lox = Adafruit_VL53L0X();

int  FiltradaA;
int  FiltradaX;
int  FiltradaY;

// Variables para el PID de los motores
double SetpointMotorX, InputX, OutputX;
double SetpointMotorA, InputA, OutputA;
double SetpointMotorY, InputY, OutputY;
double SetpointMotorZ, InputZ, OutputZ;
double SetpointMotorG, InputG, OutputG;


double posServo;

int cont = 0;

PID myPIDX(&InputX, &OutputX, &SetpointMotorX, 10, 0, 1.5, DIRECT);
PID myPIDY(&InputY, &OutputY, &SetpointMotorY, 6, 0, 0, DIRECT);
PID myPIDZ(&InputZ, &OutputZ, &SetpointMotorZ, 12, 0, 0, DIRECT);
PID myPIDA(&InputA, &OutputA, &SetpointMotorA, 2, 0.4, 0, DIRECT);

unsigned long timelast;

unsigned long timenow;


void setup() {
  Serial.begin(9600);
  pinMode(servo, OUTPUT);


    for (int i = 0; i < WINDOW_SIZE; i++) {
    ventanaA[i] = 0;
    ventanaX[i] = 0;
    ventanaY[i] = 0;
  }

  // Iniciar el sensor de distancia
  if (!lox.begin()) {
    Serial.println(F("Error al iniciar VL53L0X"));
    while (1);
  }

  // Configurar los pines STEP, DIR y ENABLE de los motores
  pinMode(enablePin, OUTPUT);
  pinMode(stepPinZ, OUTPUT); pinMode(dirPinZ, OUTPUT);
  pinMode(stepPinX, OUTPUT); pinMode(dirPinX, OUTPUT);
  pinMode(stepPinY, OUTPUT); pinMode(dirPinY, OUTPUT);
  pinMode(stepPinA, OUTPUT); pinMode(dirPinA, OUTPUT);

  // Configurar los pines de los finales de carrera como entradas con resistencia pull-up
  pinMode(FinalCarreraMotorX, INPUT_PULLUP);
  pinMode(FinalCarreraMotorY, INPUT_PULLUP);
  pinMode(FinalCarreraMotorZ, INPUT_PULLUP);
  pinMode(FinalCarreraMotorA, INPUT_PULLUP);

  digitalWrite(enablePin, LOW);  // Habilitar motores
  digitalWrite(dirPinZ, LOW);  // Habilita el motor Z
  digitalWrite(dirPinX, LOW);  // Habilita el motor X
  digitalWrite(dirPinY, HIGH); // Habilita el motor Y
  digitalWrite(dirPinA, LOW);  // Habilita el motor A

  // Configurar el PID
  configPIDS();
  configTimers();
  setStepFrequency(FZ, FX, FY, FA);

  habilitaInterrupciones();
  timelast=millis();
}



void loop() {

  
  ActualizarSetpoint();
  timenow = millis();

  if(timenow-timelast>50){
    hacer();
    cont = cont+1;
    timelast = millis();

    
  }

  // Debouncing y actualización del estado de los finales de carrera
  if(cont == 20){
    StaticJsonDocument<200> doc;
    doc["MotorZ"] = InputZ;
    doc["MotorA"] = InputA;
    doc["MotorY"] = InputY;
    doc["MotorX"] = InputX;
    doc["Servo"] = posServo;

    // Serialize JSON to serial
    serializeJson(doc, Serial);

    // Print a newline character for easier parsing
    Serial.println();

    cont = 0;
  } 
}


int calcularPromedio(int ventana[], int tamano) {
  long suma = 0;
  for (int i = 0; i < tamano; i++) {
    suma += ventana[i];
  }
  return suma / tamano;
}

void Sensar(){
    // Leer valores de los sensores de posición angular
  int LecturaA = analogRead(POT_MOTOR_A);
  int LecturaX = analogRead(POT_MOTOR_X);
  int LecturaY = analogRead(POT_MOTOR_Y);


  VL53L0X_RangingMeasurementData_t measure;
  lox.rangingTest(&measure, false);
  distancia_Sensada_mm = measure.RangeMilliMeter ;
  filteredDistance = alpha * distancia_Sensada_mm + (1 - alpha) * filteredDistance;
  filteredDistance = (filteredDistance  < 230) ? filteredDistance : 230;

    // Almacenar las nuevas lecturas en la ventana
  ventanaA[indice] = LecturaA;
  ventanaX[indice] = LecturaX;
  ventanaY[indice] = LecturaY;
  
  // Incrementar el índice y resetearlo si llega al tamaño de la ventana
  indice = (indice + 1) % WINDOW_SIZE;

  // Calcular el promedio de las últimas 10 lecturas
  int promedioA = calcularPromedio(ventanaA, WINDOW_SIZE);
  int promedioX = calcularPromedio(ventanaX, WINDOW_SIZE);
  int promedioY = calcularPromedio(ventanaY, WINDOW_SIZE);



  // Mapear los valores de los potenciómetros
  InputA = map(LecturaA, ValminA, ValmaxA, 0, 90);
  InputX = map(promedioX, ValminX, ValmaxX, 0, 90);
  InputY = map(promedioY, ValminY, ValmaxY, 0, 90);
  InputZ = floor(filteredDistance);

}

void CalPID(){
  
  myPIDX.Compute();
  myPIDY.Compute();
  myPIDA.Compute();
  myPIDZ.Compute();
  //  Enviar las nuevas frecuencias

}



  // Función para actualizar los estados de los finales de carrera
void actualizarFinalesDeCarrera() {
  finalCarreraZActivado = (digitalRead(FinalCarreraMotorZ) == 1);
  finalCarreraAActivado = (digitalRead(FinalCarreraMotorA) == 1);
  finalCarreraXActivado = (digitalRead(FinalCarreraMotorX) == 1);
  finalCarreraYActivado = (digitalRead(FinalCarreraMotorY) == 1);
}



/*
// Obtener los valores objetivo a través del puerto serial por medio de la interfaz
void ActualizarSetpoint() {

  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    int commaIndex = data.indexOf(',');
    SetpointMotorY = data.substring(0, commaIndex).toFloat();

    int nextCommaIndex = data.indexOf(',', commaIndex + 1);
    SetpointMotorX = data.substring(commaIndex + 1, nextCommaIndex).toFloat();

    commaIndex = nextCommaIndex;
    nextCommaIndex = data.indexOf(',', commaIndex + 1);
    SetpointMotorA = data.substring(commaIndex + 1, nextCommaIndex).toFloat();

    commaIndex = nextCommaIndex;
    nextCommaIndex = data.indexOf(',', commaIndex + 1);
    SetpointMotorZ = data.substring(commaIndex + 1, nextCommaIndex).toFloat();

    // Recepción de la nueva variable posServo
    posServo = data.substring(nextCommaIndex + 1).toFloat();
  }
}

*/


//  Configura los valores de los los registros de los timers de 16 bits
void configTimers () {

  // Configuración Timer1: Motor Z
  TCCR1A = 0;  // Limpia los registros de control
  TCCR1B = 0;
  TCNT1  = 0;  // Reinicia el contador del Timer
  TCCR1B |= (1 << WGM12); // Establece el modo CTC (Clear Timer on Compare Match)
  TCCR1B |= (1 << CS11); // Configura el prescaler para el Timer (Prescaler de 8)

  // Configuración Timer3: Motor X
  TCCR3A = 0;  // Limpia los registros de control
  TCCR3B = 0;
  TCNT3  = 0;  // Reinicia el contador del Timer
  TCCR3B |= (1 << WGM32); // Establece el modo CTC (Clear Timer on Compare Match)
  TCCR3B |= (1 << CS31); // Configura el prescaler para el Timer (Prescaler de 8)

  // Configuración Timer4: Motor Y
  TCCR4A = 0;  // Limpia los registros de control
  TCCR4B = 0;
  TCNT4  = 0;  // Reinicia el contador del Timer
  TCCR4B |= (1 << WGM42); // Establece el modo CTC (Clear Timer on Compare Match)
  TCCR4B |= (1 << CS41); // Configura el prescaler para el Timer (Prescaler de 8)

  // Configuración Timer5: Motor A
  TCCR5A = 0;  // Limpia los registros de control
  TCCR5B = 0;
  TCNT5  = 0;  // Reinicia el contador del Timer
  TCCR5B |= (1 << WGM42); // Establece el modo CTC (Clear Timer on Compare Match)
  TCCR5B |= (1 << CS41); // Configura el prescaler para el Timer (Prescaler de 8)}



  // Habilitar interrupción por comparación con OCR0A

}



//  Habilita todas las interrupciones del código
void habilitaInterrupciones() {

  // Habilita la interrupción por comparación de los timers de 16 bits
  TIMSK1 |= (1 << OCIE1A);
  TIMSK3 |= (1 << OCIE3A);
  TIMSK4 |= (1 << OCIE4A);
  TIMSK5 |= (1 << OCIE5A);

  // Limpiar los flags de interrupciones de los timers
  TIFR1 = 0;
  TIFR3 = 0;
  TIFR4 = 0;
  TIFR5 = 0;
  TIFR2 = 0;
}



// Función para establecer la frecuencia de pasos
void setStepFrequency(int freqZ, int freqX, int freqY, int freqA) {
  

  // Se establece el sentido de giro del motor Z
  int long compareValue1;
  if (freqZ < 0) {
    digitalWrite(dirPinZ, 0);
  } else {
    digitalWrite(dirPinZ, 1);
  }

  // Actualiza la frecuencia para Timer 1
  if(abs(freqZ) > (umbral *2)) {
    // Fórmula para calcular el valor de comparación del Timer1 para la frecuencia deseada
    compareValue1 = (16000000 / (2 * 8 * abs(freqZ))) - 1;
    OCR1A = compareValue1;
    TIMSK1 |= (1 << OCIE1A);
  } else {
    TIMSK1 &= ~(1 << OCIE1A);
    digitalWrite(stepPinZ,0);
  }


  // Se establece el sentido de giro del motor X
  int long compareValue2;
  if(freqX < 0){
    digitalWrite(dirPinX, 0);
  } else {
    digitalWrite(dirPinX, 1);
  }

  // Actualiza la frecuencia para Timer 3
  if(abs(freqX) > umbral*1.5) {
    // Fórmula para calcular el valor de comparación del Timer3 para la frecuencia deseada
    compareValue2 = (16000000 / (2 * 8 * abs(freqX))) - 1;
    OCR3A = compareValue2;
    TIMSK3 |= (1 << OCIE3A);
  } else {
    TIMSK3 &= ~(1 << OCIE3A);
    digitalWrite(stepPinX,0);
  }


  // Se establece el sentido de giro del motor Y
  int long compareValue3;
  if(freqY < 0) {
    digitalWrite(dirPinY, 0);
  } else {
    digitalWrite(dirPinY, 1);
  }

  // Actualiza la frecuencia para Timer 4
  if(abs(freqY) > umbral) {
    // Fórmula para calcular el valor de comparación del Timer4 para la frecuencia deseada
    compareValue3 = (16000000 / (2 * 8 * abs(freqY))) - 1;
    OCR4A = compareValue3;
    TIMSK4 |= (1 << OCIE4A);
  } else {
    TIMSK4 &= ~(1 << OCIE4A);
    digitalWrite(stepPinY,0);
  }
  
  
  // Se establece el sentido de giro del motor A
  int long compareValue4;
  if(freqA < 0) {
    digitalWrite(dirPinA, 0);
  } else {
    digitalWrite(dirPinA, 1);
  }
  
  // Actualiza la frecuencia para Timer 5
  if(abs(freqA) > 40) {
    // Fórmula para calcular el valor de comparación del Timer5 para la frecuencia deseada
    compareValue4 = (16000000 / (2 * 8 * abs(freqA))) - 1;
    OCR5A = compareValue4;
    TIMSK5 |= (1 << OCIE5A);
  } else {
    TIMSK5 &= ~(1 << OCIE5A);
    digitalWrite(stepPinA,0);
  }
}



void configPIDS() {

  int LecturaA = analogRead(POT_MOTOR_A);
  int LecturaX = analogRead(POT_MOTOR_X);
  int LecturaY = analogRead(POT_MOTOR_Y);



  VL53L0X_RangingMeasurementData_t measure;
  lox.rangingTest(&measure, false);
  distancia_Sensada_mm = measure.RangeMilliMeter ;

  InputA = map(LecturaA, ValminA, ValmaxA, 0, 90);
  InputX = map(LecturaX, ValminX, ValmaxX, 0, 90);
  InputY = map(LecturaY, ValminY, ValmaxY, 0, 90);

  //  Se inicializan los set points iniciales
  SetpointMotorX = InputX;
  SetpointMotorA = InputA;
  SetpointMotorY = InputY;
  SetpointMotorZ = distancia_Sensada_mm;


  // Se establecen los límites de velocidad de los controladores PID (frecuencia de pasos) para que pueda moverse en ambos sentidos controladamente
  myPIDX.SetMode(AUTOMATIC);
  myPIDX.SetOutputLimits(-800, 800); // (Velocidad hacia atrás, velocidad hacia delante)

  myPIDA.SetMode(AUTOMATIC);
  myPIDA.SetOutputLimits(-255, 255); // (Velocidad hacia atrás, velocidad hacia delante)

  myPIDY.SetMode(AUTOMATIC);
  myPIDY.SetOutputLimits(-600, 600); // (Velocidad hacia atrás, velocidad hacia delante)

  myPIDZ.SetMode(AUTOMATIC);
  myPIDZ.SetOutputLimits(-800, 800); // (Velocidad hacia atrás, velocidad hacia delante)
}


void setServoAngle(int angle) {
  int pulseWidth; // Ancho de pulso para el servo

  // Calcular el ancho de pulso en milisegundos
  pulseWidth = map(angle, 0, 180, 544, 2400); // 544us a 2400us

  // Enviar el pulso PWM
  digitalWrite(servo, HIGH); // Iniciar el pulso
  delayMicroseconds(pulseWidth);  // Mantener el pulso durante el ancho de pulso
  digitalWrite(servo, LOW);   // Finalizar el pulso
  delay(20); // Esperar el período completo de 20ms para el siguiente pulso
}

void ActualizarSetpoint() {
  if (Serial.available() > 0) {
     // Read the incoming JSON string
    String jsonString = Serial.readStringUntil('\n');
    // Create a StaticJsonDocument object for parsing
    const size_t capacity = JSON_OBJECT_SIZE(3) + 40;
    StaticJsonDocument<capacity> doc;
    // Parse the JSON string
    DeserializationError error = deserializeJson(doc, jsonString);
    // Check if parsing was successful
    if (error) {
      Serial.print("Failed to parse JSON: ");
      Serial.println(error.c_str());
      return;
    }

    Serial.println(jsonString);

    // Access the data from the JSON
    SetpointMotorY = doc["base"];
    SetpointMotorX = doc["segmento1"];
    SetpointMotorA = doc["segmento2"];
    SetpointMotorZ = doc["zAxis"];
    SetpointMotorG = doc["gripper"];
    posServo = SetpointMotorG;


  }
}


void hacer(){
    //Serial.println(".");
  flag50ms = true;  // Activar la bandera cada 50 ms
  Sensar();
  
  setServoAngle(posServo);

  CalPID();


  actualizarFinalesDeCarrera();
/*
  FZ = (abs(SetpointMotorZ - InputZ) < 5) ? 0 : OutputZ;
  FA = (abs(SetpointMotorA - InputA) < 4) ? 0 : OutputA;
  FX = (abs(SetpointMotorX - InputX) < 4) ? 0 : OutputX;
  FY = (abs(SetpointMotorY - InputY) < 1) ? 0 : OutputY;*/

  // Control de los motores basado en finales de carrera
  FZ = (finalCarreraZActivado && OutputZ > 0) ? 0 : OutputZ;
  FA = (finalCarreraAActivado && OutputA > 0) ? 0 : OutputA;
  FX = (finalCarreraXActivado && OutputX > 0) ? 0 : OutputX;
  FY = (finalCarreraYActivado && OutputY > 0) ? 0 : OutputY;

  
  setStepFrequency(FZ, FX, FY, FA);
}



//  Interrupciones con Timers de 16 bits (1, 3, 4, 5)


// Interrupción del Timer1 para el motor Z
ISR(TIMER1_COMPA_vect) {

  
  //  Define una variable booleana estática para guardar el estado del pin STEP anterior
  static bool stepStateZ = false;

  //  Alterna el estado del pin STEP para generar un pulso que permite realizar un paso en el motor Z
  digitalWrite(stepPinZ, stepStateZ);
  stepStateZ = !stepStateZ;

}



// Interrupción del Timer3 para el motor X
ISR(TIMER3_COMPA_vect) {


  //  Define una variable booleana estática para guardar el estado del pin STEP anterior
  static bool stepStateX = false;

  //  Alterna el estado del pin STEP para generar un pulso que permite realizar un paso en el motor X
  digitalWrite(stepPinX, stepStateX);
  stepStateX = !stepStateX;
}


// Interrupción del Timer3 para el motor Y
ISR(TIMER4_COMPA_vect) {
  
  //  Define una variable booleana estática para guardar el estado del pin STEP anterior
  static bool stepStateY = false;

  //  Alterna el estado del pin STEP para generar un pulso que permite realizar un paso en el motor Y
  digitalWrite(stepPinY, stepStateY);
  stepStateY = !stepStateY;
}



// Interrupción del Timer3 para el motor A
ISR(TIMER5_COMPA_vect) {

  //  Define una variable booleana estática para guardar el estado del pin STEP anterior
  static bool stepStateA = false;

  //  Alterna el estado del pin STEP para generar un pulso que permite realizar un paso en el motor A
  digitalWrite(stepPinA, stepStateA);
  stepStateA = !stepStateA;
}

