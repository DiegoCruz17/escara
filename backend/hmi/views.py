from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json,math,serial,time
import numpy as np

DEV = False
modos = ["geometrico","algebraico","mth","newton","gradiente"]
if not DEV:
    ser = serial.Serial(
        port='COM7',  # Replace with your serial port
        baudrate=9600
    )
    time.sleep(2)
    print("Serial Start")
@csrf_exempt
def index(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if not DEV:
            try:
                ser.write(json.dumps(data).encode('utf-8'))
                print("Sent Data")
                # while True:
                #     if ser.in_waiting > 0:
                #         received_message = ser.readline().decode('utf-8').strip()
                #         print(f"received:{received_message}")
                #         break
            except Exception as e:
                print("error sending data",str(e))
        if data.get('mode') not in modos:
            mth0_1 = np.array([[math.cos(data.get('base')*math.pi/180),-math.sin(data.get('base')*math.pi/180),0,0],
                            [math.sin(data.get('base')*math.pi/180),math.cos(data.get('base')*math.pi/180),0,0],
                            [0,0,1,0],
                            [0,0,0,1]])@np.array([[1,0,0,0],
                                                    [0,1,0,0],
                                                    [0,0,1,104],
                                                    [0,0,0,1]])
            mth1_2 = np.array([[1,0,0,0],
                            [0,1,0,0],
                            [0,0,1,data.get("zAxis")],
                            [0,0,0,1]])@np.array([[1,0,0,228],
                                                [0,1,0,0],
                                                [0,0,1,0],
                                                [0,0,0,1]])
            mth2_3 = np.array([[math.cos(data.get('segmento1')*math.pi/180),-math.sin(data.get('segmento1')*math.pi/180),0,0],
                            [math.sin(data.get('segmento1')*math.pi/180),math.cos(data.get('segmento1')*math.pi/180),0,0],
                            [0,0,1,0],
                            [0,0,0,1]])@np.array([[1,0,0,0],
                                                [0,1,0,0],
                                                [0,0,1,-24],
                                                [0,0,0,1]])@np.array([[1,0,0,164],
                                                                    [0,1,0,0],
                                                                    [0,0,1,0],
                                                                    [0,0,0,1]])
            mth3_4 = np.array([[math.cos(data.get('segmento2')*math.pi/180),-math.sin(data.get('segmento2')*math.pi/180),0,0],
                            [math.sin(data.get('segmento2')*math.pi/180),math.cos(data.get('segmento2')*math.pi/180),0,0],
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
            res = {"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
            print(res)
            return JsonResponse(res, status=200)
        else:
            match data.get('mode'):
                case "geometrico":
                    pass
                case "algebraico":
                    pass
                case "mth":
                    pass
                case "newton":
                    pass
                case "gradiente":
                    pass
                case _:
                    pass
    return JsonResponse({"error": "Invalid request method"}, status=400)
