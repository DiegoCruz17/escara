import numpy as np

def cinematica_inversa_alg(x, y, L3 = 228, L5 = 164):

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
    return ((q1a, q2a), (q1b, q2b))
