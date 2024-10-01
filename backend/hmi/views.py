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
            mth,mth0_1,mth1_2,mth2_3,mth3_4 = controlador.procesar_cinematica_directa(data.get("base"),data.get("zAxis"),data.get("segmento1"),data.get("segmento2"))
            res = {"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
            controlador.send_scara_update(res)
            print(res)
            return JsonResponse(res, status=200)
        else:
            match data.get('mode'):
                case "geometrico":
                    q1a,q2a = controlador.procesar_cinematica_inversa_geom(data.get("x"),data.get("y"))
                    mth,mth0_1,mth1_2,mth2_3,mth3_4 = controlador.procesar_cinematica_directa(q1a,data.get("zAxis"),q2a,data.get("segmento2"))
                    zAxis = controlador.calcular_Z(data.get("z"))
                    res = {"q1a":q1a,"q2a":q2a,"zAxis":zAxis,"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
                    print(res)
                    return JsonResponse(res,status=200)
                case "algebraico":
                    q1a,q2a = controlador.procesar_cinematica_inversa_alg(data.get("x"),data.get("y"))
                    mth,mth0_1,mth1_2,mth2_3,mth3_4 = controlador.procesar_cinematica_directa(q1a,data.get("zAxis"),q2a,data.get("segmento2")) 
                    zAxis = controlador.calcular_Z(data.get("z"))
                    res = {"q1a":q1a,"q2a":q2a,"zAxis":zAxis,"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
                    print(res)
                    return JsonResponse(res,status=200)
                case "mth":
                    controlador.send_scara_update(data)
                    return JsonResponse({"data":"hey"},status=200)
                case "newton":
                    pass
                case "gradiente":
                    pass
                case _:
                    pass
    # return JsonResponse({"error": "Invalid request method"}, status=400)
