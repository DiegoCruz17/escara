from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json, math, serial, time
import numpy as np
from .controlador import Controlador
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

controlador = Controlador()
channel_layer = get_channel_layer()

@csrf_exempt
def index(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        if controlador.serial:
            try:
                controlador.serial.write(json.dumps(data).encode('utf-8'))
                print("Sent Data")
                # while True:
                #     if ser.in_waiting > 0:
                #         received_message = ser.readline().decode('utf-8').strip()
                #         print(f"received:{received_message}")
                #         break
            except Exception as e:
                print("error sending data",str(e))
        if data.get('mode') not in controlador.modos:
            mth,mth0_1,mth1_2,mth2_3,mth3_4 = controlador.procesar_cinematica_directa(data)
            res = {"setting_matrix":False,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
            print(res)
            return JsonResponse(res, status=200)
        else:
            match data.get('mode'):
                case "geometrico":
                    pass
                case "algebraico":
                    q1a,q2a = controlador.procesar_cinematica_inversa_alg(data.get("x"),data.get("y")) 
                    res = {"q1a":q1a,"q2a":q2a,"setting_matrix":False}
                    print(res)
                    return JsonResponse(res,status=200)
                case "mth":
                    pass
                case "newton":
                    pass
                case "gradiente":
                    pass
                case _:
                    pass
    # return JsonResponse({"error": "Invalid request method"}, status=400)
