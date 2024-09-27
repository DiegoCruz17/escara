import numpy as np

def geometrica(L,L3,L5,X,Y):

    numerador = (L*2 - L3**2 - L5*2)
    denominador = (2 * L3 * L5)
    fraccion = numerador / denominador

    theta2_radianes = np.arctan2(np.sqrt(1 - fraccion**2), fraccion)

    theta2_grados = np.degrees(theta2_radianes)

    phi = np.deg2rad(45) 
    beta = np.deg2rad(10)

    theta1_simple_radianes = phi - beta
    theta1_simple_grados = np.degrees(theta1_simple_radianes)

    numerador = (-L5*2 + L**2 + L3*2)
    denominador = (2 * L * L3)
    fraccion = numerador / denominador

    theta1_complejo_radianes = np.arctan2(Y, X) - np.arctan2(np.sqrt(1 - fraccion**2), fraccion)
    theta1_complejo_grados = np.degrees(theta1_complejo_radianes)

    return theta2_grados,theta1_simple_grados,theta1_complejo_grados
