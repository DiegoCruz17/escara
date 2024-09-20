import numpy as np

def algebraico(L,L3,L5,q1=45):
    
    numerador = (L*2 - L3**2 - L5*2)
    denominador = (2 * L3 * L5)
    fraccion = numerador / denominador

    theta2_radianes = np.arctan2(np.sqrt(1 - fraccion**2), fraccion)

    theta2_grados = np.degrees(theta2_radianes)

    theta1_radianes = np.deg2rad(q1)
      
    sen_theta1 = np.sin(theta1_radianes)
    cos_theta1 = np.cos(theta1_radianes)
    theta1_calculado_radianes = np.arctan2(sen_theta1, cos_theta1)
    theta1_calculado_grados = np.degrees(theta1_calculado_radianes)
    return theta1_calculado_grados,theta2_grados

