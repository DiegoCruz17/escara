from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json, math, serial, time
import numpy as np
from .controlador import global_controlador


@csrf_exempt
def index(request):
    if request.method == "POST":
        data = json.loads(request.body)
        # print(data)
        if data.get('mode') not in global_controlador.modos:
            global_controlador.send_serial_data(data.get("base"),data.get("segmento1"),data.get("segmento2"),data.get("zAxis"),data.get("gripper"))
            mth,mth0_1,mth1_2,mth2_3,mth3_4 = global_controlador.procesar_cinematica_directa(data.get("base"),data.get("zAxis"),data.get("segmento1"),data.get("segmento2"))
            res = {"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
            global_controlador.send_scara_update(res)
            # print(res)
            return JsonResponse(res, status=200)
        else:
            match data.get('mode'):
                case "geometrico":
                    q1a,q2a = global_controlador.procesar_cinematica_inversa_geom(data.get("x"),data.get("y"))
                    mth,mth0_1,mth1_2,mth2_3,mth3_4 = global_controlador.procesar_cinematica_directa(q1a,data.get("zAxis"),q2a,data.get("segmento2"))
                    zAxis = global_controlador.calcular_Z(data.get("z"))
                    global_controlador.send_serial_data(q1a,q2a,data.get("segmento2"),zAxis,data.get("gripper"))
                    res = {"q1a":q1a,"q2a":q2a,"zAxis":zAxis,"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
                    # print(res)
                    return JsonResponse(res,status=200)
                case "algebraico":
                    q1a,q2a = global_controlador.procesar_cinematica_inversa_alg(data.get("x"),data.get("y"))
                    mth,mth0_1,mth1_2,mth2_3,mth3_4 = global_controlador.procesar_cinematica_directa(q1a,data.get("zAxis"),q2a,data.get("segmento2")) 
                    zAxis = global_controlador.calcular_Z(data.get("z"))
                    global_controlador.send_serial_data(q1a,q2a,data.get("segmento2"),zAxis,data.get("gripper"))
                    res = {"q1a":q1a,"q2a":q2a,"zAxis":zAxis,"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
                    # print(res)
                    return JsonResponse(res,status=200)
                case "mth":
                    q1a,q2a = global_controlador.procesar_cinematica_inversa_mth(data.get("x"),data.get("y"))
                    mth,mth0_1,mth1_2,mth2_3,mth3_4 = global_controlador.procesar_cinematica_directa(q1a,data.get("zAxis"),q2a,data.get("segmento2")) 
                    zAxis = global_controlador.calcular_Z(data.get("z"))
                    global_controlador.send_serial_data(q1a,q2a,data.get("segmento2"),zAxis,data.get("gripper"))
                    res = {"q1a":q1a,"q2a":q2a,"zAxis":zAxis,"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
                    # print(res)
                    return JsonResponse(res,status=200)
                case "newton":
                    pass
                case "gradiente":
                    pass
                case _:
                    pass
    # return JsonResponse({"error": "Invalid request method"}, status=400)
