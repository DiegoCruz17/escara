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
                    base,segmento1,segmento2,zAxis = global_controlador.procesar_cinematica_inversa_newton([data.get("x"),data.get("y"),data.get("z")],[data.get("base"),data.get("segmento1"),data.get("segmento2"),180],data.get("zAxis"))
                    mth,mth0_1,mth1_2,mth2_3,mth3_4 = global_controlador.procesar_cinematica_directa(base,zAxis,segmento1,segmento2)
                    global_controlador.send_serial_data(base,segmento1,segmento2,zAxis,data.get("gripper"))
                    res = {"q1a":base,"q2a":segmento1,"zAxis":zAxis,"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
                    # print(res)
                    return JsonResponse(res,status=200)
                case "gradiente":
                    base,segmento1,segmento2,zAxis = global_controlador.procesar_cinematica_inversa_gradiente([data.get("x"),data.get("y"),data.get("z")],[data.get("base"),data.get("segmento1"),data.get("segmento2"),180],data.get("zAxis"))
                    mth,mth0_1,mth1_2,mth2_3,mth3_4 = global_controlador.procesar_cinematica_directa(base,zAxis,segmento1,segmento2)
                    global_controlador.send_serial_data(base,segmento1,segmento2,zAxis,data.get("gripper"))
                    res = {"q1a":base,"q2a":segmento1,"zAxis":zAxis,"setting_matrix":True,"matrix":mth.tolist(),'matrix1':mth0_1.tolist(),'matrix2':mth1_2.tolist(),'matrix3':mth2_3.tolist(),'matrix4':mth3_4.tolist()}
                    # print(res)
                    return JsonResponse(res,status=200)
                case "frontal":
                    puntos = [
                        [-0.8, -0.5, 0.8],  # p1
                        [-0.8, -0.5, 0.4],  # p2
                        [-0.5, -0.5, 0.4],  # p3
                        [-0.5, -0.5, 0.8],  # p4
                        [-0.3, -0.5, 0.4],  # p5
                        [-0.3, -0.5, 0.8],  # p6
                        [0, -0.5, 0.8],     # p7
                        [0, -0.5, 0.4],     # p8
                        [-0.3, -0.5, 0.6],  # p9
                        [0, -0.5, 0.6],     # p10
                        [0.2, -0.5, 0.4],   # p11
                        [0.2, -0.5, 0.8],   # p12
                        [0.5, -0.5, 0.8],   # p13
                        [0.5, -0.5, 0.4]    # p14
                    ]
                    res =  None
                    for coordenada in puntos:
                        q1a,q2a = global_controlador.procesar_cinematica_inversa_geom(coordenada[0]*5+150,coordenada[1]*5-150)
                        zAxis = global_controlador.calcular_Z(coordenada[2]*5+200)
                        global_controlador.send_serial_data(q1a,q2a,data.get("segmento2"),zAxis,data.get("gripper"))
                        res = {"q1a":q1a,"q2a":q2a,"zAxis":zAxis,"coreo":True}
                        print(res)
                        global_controlador.send_scara_update(res)
                        time.sleep(1)
                    return JsonResponse(res,status=200)
                case "floor":
                    # puntos = [
                    #     [-150, 350, 0, 180],
                    #     [-150, 250, 0, 180],
                    #     [-70, 250, 0, 180],
                    #     [-70, 350, 0, 180],
                    #     [-60, 350, 50, 180],
                    #     [-50, 350, 0, 180],
                    #     [-50, 250, 0, 180],
                    #     [-30, 250, 50, 180],
                    #     [20, 250, 0, 180],
                    #     [20, 350, 0, 180],
                    #     [-50, 350, 0, 180],
                    #     [-50, 325, 50, 180],
                    #     [-50, 300, 0, 180],
                    #     [20, 300, 0, 180],
                    #     [20, 350, 50, 180],
                    #     [40, 350, 0, 180],
                    #     [40, 250, 0, 180],
                    #     [120, 250, 0, 180],
                    #     [120, 350, 0, 180],
                    #     [40, 350, 0, 180]
                    # ]
                    points = [
                        [300, 150, 0],  # A
                        [300, 50, 0],   # B
                        [400, 50, 0],   # C
                        [400, 150, 0],  # D
                        [450, 150, 100],# E
                        [450, 150, 0],  # F
                        [550, 150, 0],  # G
                        [450, 50, 0],   # H
                        [550, 50, 0],   # I
                        [450, 100, 0],  # J
                        [550, 100, 0],  # K
                        [600, 100, 100],# L
                        [600, 150, 0],  # M
                        [700, 150, 0],  # N
                        [700, 50, 0],   # O
                        [600, 50, 0]    # P
                    ]
                    info = [
                        [-5,185,88],
                        [-5,185,98],
                        [-5,185,103],
                        [-11,185,109],
                        [-13,185,112],
                        [-18,185,106],
                        [-17,185,98],
                        [-17,200,98],
                        [-22,200,114],
                        [-22,185,114],
                        [-22,185,111],
                        [-22,185,99],
                        [-25,185,102],
                        [-31,185,103],
                        [-33,185,109],
                        [-35,185,120],
                        [-35,200,120],
                        [-22,200,107],
                        [-22,185,107],
                        [-33,185,109],
                        [-33,200,109],
                        [-36,200,104],
                        [-36,185,104],
                        [-36,185,111],
                        [-39,185,123],
                        [-45,185,121],
                        [-48,185,123],
                        [-50,185,113],
                        [-45,185,102],
                        [-40,185,104],
                        [-34,185,103],
                        [-34,200,103],
                    ]
                    # info = [
                    #     [-82, 183, 30],
                    #     [-86, 183, 30],
                    #     [-89, 183, 49],
                    #     [-96, 183, 71],
                    #     [-102, 183, 73],
                    #     [-111, 183, 79],
                    #     [-105, 183, 66],
                    #     [-96, 183, 42],
                    #     [-96, 200, 42],
                    #     [-113, 200, 78],
                    #     [-113, 183, 78],
                    #     [-108, 183, 67],
                    #     [-101, 183, 42],
                    #     [-108, 183, 47],
                    #     [-118, 183, 66],
                    #     [-123, 183, 84],
                    #     [-123, 200, 84],
                    #     [-108, 200, 67],
                    #     [-108, 183, 67],
                    #     [-118, 183, 66],
                    #     [-118, 200, 66],
                    #     [-130, 200, 87],
                    #     [-130, 183, 87],
                    #     [-118, 183, 58],
                    #     [-124, 183, 53],
                    #     [-134, 183, 75],
                    #     [-130, 183, 87],
                    #     [-130, 200, 87],
                        
                    # ]
                    res =  None

                    # Factor de escala y desplazamientos en X y Y
                    scx = 1  # Cambia este valor para ajustar el tamaño de las letras
                    sc = 0.5
                    Yoffset = -200  # Desplazamiento en el eje Y
                    Xoffset = 250   # Desplazamiento en el eje X

                    # Puntos para la letra "U" con Z = 183, ajustados con el factor de escala y desplazamientos
                    U_smooth = [
                        [-300 * sc + Xoffset, 100 * scx + Yoffset, 200],
                        [-300 * sc + Xoffset, 100 * scx + Yoffset, 183],
                        [-240 * sc + Xoffset, 100 * scx + Yoffset, 183],
                        [-200 * sc + Xoffset, 100 * scx + Yoffset, 183],
                        [-160 * sc + Xoffset, 100 * scx + Yoffset, 183],
                        [-120 * sc + Xoffset, 100 * scx + Yoffset, 183],
                        [-100 * sc + Xoffset, 110 * scx + Yoffset, 183],
                        [-100 * sc + Xoffset, 130 * scx + Yoffset, 183],
                        [-100 * sc + Xoffset, 150 * scx + Yoffset, 183],
                        [-140 * sc + Xoffset, 150 * scx + Yoffset, 183],
                        [-180 * sc + Xoffset, 150 * scx + Yoffset, 183],
                        [-240 * sc + Xoffset, 150 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 150 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 150 * scx + Yoffset, 200]
                    ]


                    # Puntos para la letra "A" con Z = 183, ajustados con el factor de escala y desplazamientos
                    A_smooth = [
                        [-100 * sc + Xoffset, 175 * scx + Yoffset, 183],
                        [-120 * sc + Xoffset, 175 * scx + Yoffset, 183],
                        [-160 * sc + Xoffset, 175 * scx + Yoffset, 183],
                        [-200 * sc + Xoffset, 175 * scx + Yoffset, 183],
                        [-240 * sc + Xoffset, 175 * scx + Yoffset, 183],
                        [-280 * sc + Xoffset, 175 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 185 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 205 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 225 * scx + Yoffset, 183],
                        [-260 * sc + Xoffset, 225 * scx + Yoffset, 183],
                        [-220 * sc + Xoffset, 225 * scx + Yoffset, 183],
                        [-180 * sc + Xoffset, 225 * scx + Yoffset, 183],
                        [-140 * sc + Xoffset, 225 * scx + Yoffset, 183],
                        [-100 * sc + Xoffset, 225 * scx + Yoffset, 183],
                        [-100 * sc + Xoffset, 225 * scx + Yoffset, 200],
                        [-200 * sc + Xoffset, 175 * scx + Yoffset, 200],
                        [-200 * sc + Xoffset, 175 * scx + Yoffset, 183],
                        [-200 * sc + Xoffset, 195 * scx + Yoffset, 183],
                        [-200 * sc + Xoffset, 225 * scx + Yoffset, 183],
                        [-200 * sc + Xoffset, 225 * scx + Yoffset, 200]
                    ]

                    O_smooth = [
                        [-100 * sc + Xoffset, 250 * scx + Yoffset, 200],
                        [-100 * sc + Xoffset, 250 * scx + Yoffset, 183],
                        [-140 * sc + Xoffset, 250 * scx + Yoffset, 183],
                        [-180 * sc + Xoffset, 250 * scx + Yoffset, 183],
                        [-220 * sc + Xoffset, 250 * scx + Yoffset, 183],
                        [-260 * sc + Xoffset, 250 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 250 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 270 * scx + Yoffset, 183],
                        [-300 * sc + Xoffset, 290 * scx + Yoffset, 183],
                        [-280 * sc + Xoffset, 300 * scx + Yoffset, 183],
                        [-240 * sc + Xoffset, 300 * scx + Yoffset, 183],
                        [-200 * sc + Xoffset, 300 * scx + Yoffset, 183],
                        [-160 * sc + Xoffset, 300 * scx + Yoffset, 183],
                        [-120 * sc + Xoffset, 300 * scx + Yoffset, 183],
                        [-100 * sc + Xoffset, 250 * scx + Yoffset, 183],
                        [-100 * sc + Xoffset, 240 * scx + Yoffset, 200]
                    ]

                    puntos = U_smooth + A_smooth + O_smooth


                    for coordenada in puntos:
                        q1a,q2a = global_controlador.procesar_cinematica_inversa_geom(coordenada[0],coordenada[1])
                        zAxis = global_controlador.calcular_Z(coordenada[2])
                        # global_controlador.send_serial_data(coordenada[0],coordenada[2],data.get("segmento2"),coordenada[1],data.get("gripper"))
                        global_controlador.send_serial_data(q1a,q2a,data.get("segmento2"),zAxis,data.get("gripper"))
                        # res = {"q1a":coordenada[0],"q2a":coordenada[2],"zAxis":coordenada[1],"coreo":True}
                        res = {"q1a":q1a,"q2a":q2a,"zAxis":zAxis,"coreo":True}
                        print(res)
                        global_controlador.send_scara_update(res)
                        time.sleep(2)
                    return JsonResponse(res,status=200)

                case _:
                    pass
    # return JsonResponse({"error": "Invalid request method"}, status=400)
