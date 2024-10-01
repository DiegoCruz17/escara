import numpy as np
import serial
import math
import websocket
import json
import threading
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


# Función que se ejecuta cuando se recibe un mensaje
def on_message(ws, message):
    print(f"Mensaje crudo recibido: {message}")
    try:
        # Parseamos el mensaje JSON y lo mostramos
        data = json.loads(message)
        print(f"X: {data['X']}, Y: {data['Y']}, Z: {data['Z']}, G: {data['G']}, O: {data['O']}")
    except json.JSONDecodeError:
        print("Error al decodificar el mensaje recibido")

# Función que se ejecuta cuando ocurre un error
def on_error(ws, error):
    print(f"Error: {error}")

# Función que se ejecuta cuando la conexión se cierra
def on_close(ws, close_status_code, close_msg):
    print("Conexión cerrada")

# Función que se ejecuta cuando la conexión se abre
def on_open(ws):
    print("Conexión establecida con el servidor WebSocket")

class Controlador:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print("Creating Controlador instance")
            cls._instance = super(Controlador, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        print("Initializing Controlador...")
        # Your existing initialization code here
        self.channel_layer = get_channel_layer()
        self.serial = self.inicializar_serial()
        self.is_listening = False
        self.listener_thread = None
        self.modos = ["geometrico","algebraico","mth","newton","gradiente"]
        self.serial_lock = threading.Lock()
        self.wireless_thread = None
        self.inicializar_control_inalambrico()

    def inicializar_control_inalinicializar_control_inalambricoambrico(self):
        websocket_url = "ws://192.168.43.72:81/"

        # Crear el WebSocket y asignar los callbacks
        ws = websocket.WebSocketApp(websocket_url,
                                    on_message=on_message,
                                    on_error=on_error,
                                    on_close=on_close)

        # Asignar la función que se ejecutará cuando se establezca la conexión
        ws.on_open = on_open

        # Iniciar la conexión
        ws.run_forever()

    
    def calcular_Z(self,z_obj):
        return z_obj+24.3-12.7
    
    def procesar_cinematica_inversa_mth(self,x, y, L3=228, L5=164):
        c2 = (x**2+y**2-L3**2-L5**2)/(2*L3*L5)
        s2 =  np.sqrt(1-c2**2)
        q2 = (np.arctan2(s2, c2))*180/np.pi

        c1 = (L5*c2*x+L3*x+L5*s2*y)/(x**2+y**2)
        s1 =  np.sqrt(1-c1**2)
        q1 = (np.arctan2(s1, c1))*180/np.pi

        return q1,q2

    def procesar_cinematica_inversa_geom(self,x, y, L3=228, L5=164):
        c2 = (x**2+y**2-L3**2-L5**2)/(2*L3*L5)
        s2a =  np.sqrt(1-c2**2)
        s2b = -np.sqrt(1-c2**2)
        # Solución 1:
        q2a = (np.arctan2(s2a, c2))*180/np.pi
        q1a = (np.arctan2(y,x) - np.arctan2(L5*s2a, L3+L5*c2))*180/np.pi
        # Solución 2:
        q2b = (np.arctan2(s2b, c2))*180/np.pi
        q1b = (np.arctan2(y,x) - np.arctan2(L5*s2b, L3+L5*c2))*180/np.pi
        # Retornar ambas soluciones
        return q1a, q2a

    def  procesar_cinematica_inversa_alg(self,x, y, L3 = 228, L5 = 164):
        c2 = (x**2+y**2-L3**2-L5**2)/(2*L3*L5)
        s2a =  np.sqrt(1-c2**2)
        s2b = -np.sqrt(1-c2**2)
        # Solución 1 
        q2a = (np.arctan2(s2a, c2))*180/np.pi
        A = np.array([[L3+L5*c2,  -L5*s2a],
                    [  L5*s2a, L3+L5*c2]])
        v = np.dot( np.linalg.inv(A), np.array([x,y]) )
        c1 = v[0]; s1 = v[1]
        q1a = (np.arctan2(s1, c1))*180/np.pi
        # Solución 2 
        q2b = (np.arctan2(s2b, c2))*180/np.pi
        A = np.array([[L3+L5*c2,  -L5*s2b],
                    [  L5*s2b, L3+L5*c2]])
        v = np.dot( np.linalg.inv(A), np.array([x,y]) )
        c1 = v[0]; s1 = v[1]
        q1b = (np.arctan2(s1, c1))*180/np.pi
        return q1a,q2a

    def procesar_cinematica_directa(self,base,z,segmento1,segmento2):
        mth0_1 = np.array([[math.cos(base*math.pi/180),-math.sin(base*math.pi/180),0,0],
                            [math.sin(base*math.pi/180),math.cos(base*math.pi/180),0,0],
                            [0,0,1,0],
                            [0,0,0,1]])@np.array([[1,0,0,0],
                                                    [0,1,0,0],
                                                    [0,0,1,104],
                                                    [0,0,0,1]])
        mth1_2 = np.array([[1,0,0,0],
                        [0,1,0,0],
                        [0,0,1,z],
                        [0,0,0,1]])@np.array([[1,0,0,228],
                                            [0,1,0,0],
                                            [0,0,1,0],
                                            [0,0,0,1]])
        mth2_3 = np.array([[math.cos(segmento1*math.pi/180),-math.sin(segmento1*math.pi/180),0,0],
                        [math.sin(segmento1*math.pi/180),math.cos(segmento1*math.pi/180),0,0],
                        [0,0,1,0],
                        [0,0,0,1]])@np.array([[1,0,0,0],
                                            [0,1,0,0],
                                            [0,0,1,-24],
                                            [0,0,0,1]])@np.array([[1,0,0,164],
                                                                [0,1,0,0],
                                                                [0,0,1,0],
                                                                [0,0,0,1]])
        mth3_4 = np.array([[math.cos(segmento2*math.pi/180),-math.sin(segmento2*math.pi/180),0,0],
                        [math.sin(segmento2*math.pi/180),math.cos(segmento2*math.pi/180),0,0],
                        [0,0,1,0],
                        [0,0,0,1]])@np.array([[1,0,0,0],
                                            [0,1,0,0],
                                            [0,0,1,-33.5],
                                            [0,0,0,1]])
        mth = mth0_1@mth1_2@mth2_3@mth3_4
        mth = np.round(mth,2)
        mth0_1 = np.round(mth0_1,2)
        mth1_2 = np.round(mth1_2,2)
        mth2_3 = np.round(mth2_3,2)
        mth3_4 = np.round(mth3_4,2)

        return mth,mth0_1,mth1_2,mth2_3,mth3_4


    def inicializar_control_inalambrico(self):
        websocket_url = "ws://192.168.43.72:81/"

        # Crear el WebSocket y asignar los callbacks
        ws = websocket.WebSocketApp(websocket_url,
                                    on_message=on_message,
                                    on_error=on_error,
                                    on_close=on_close)

        # Asignar la función que se ejecutará cuando se establezca la conexión
        ws.on_open = on_open

        # Iniciar la conexión
        ws.run_forever()

    def inicializar_serial(self, port="COM8"):
        try:
            ser = serial.Serial(port, baudrate=9600)
            print(f"Conexión establecida en el puerto {port}")
            return ser
        except Exception as e:
            print("No se ha podido establecer una conexión serial: " + str(e))
            return None

    def start_serial_listener(self):
        if self.serial and not self.is_listening:
            self.is_listening = True
            self.listener_thread = threading.Thread(target=self._serial_listener)
            self.listener_thread.daemon = True
            self.listener_thread.start()

    def _serial_listener(self):
        while self.is_listening:
            with self.serial_lock:
                if self.serial.in_waiting:
                    try:
                        data = self.serial.readline().decode('utf-8').strip()
                        self.handle_serial_data(data)
                    except Exception as e:
                        print(f"Error reading serial data: {str(e)}")

    def handle_serial_data(self, data):
        try:
            parsed_data = json.loads(data)
            zAxis = parsed_data.get('MotorZ')
            segmento2 = parsed_data.get('MotorA')
            base = parsed_data.get('MotorY')
            segmento1 = parsed_data.get('MotorX')
            gripper = parsed_data.get('Servo')
            data = {"zAxis":zAxis,"segmento2":segmento2,"base":base,"gripper":gripper,"segmento1":segmento1}
            self.send_scara_update(data)
        except json.JSONDecodeError:
            print(f"Received non-JSON data: {data}")

    def send_serial_data(self, base, segmento1, segmento2, zAxis, gripper):
        if self.serial:
            with self.serial_lock:
                try:
                    data = json.dumps({"base":base, "segmento1":segmento1, "segmento2":segmento2, "zAxis":zAxis, "gripper":gripper})
                    print(data)
                    self.serial.write(data.encode('utf-8'))
                    self.serial.write(b'\n')  # Add newline for proper reading on Arduino side
                    # self.serial.flush()  # Ensure all data is written
                except Exception as e:
                    print("Error sending data:", str(e))
        else:
            print("No serial conn available")
    def send_scara_update(self, data):
        async_to_sync(self.channel_layer.group_send)(
            "scara_updates",
            {
                "type": "scara_update",
                "data": data
            }
        )

    def stop_serial_listener(self):
        self.is_listening = False
        if self.listener_thread:
            self.listener_thread.join()


global_controlador = Controlador()
