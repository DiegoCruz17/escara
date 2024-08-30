## Uso del cliente de control del Robot SCARA

El cliente consta de la interfaz de control y del servidor encargado de mandar los comandos por serial.


### Requerimientos
- Nodejs (https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi)
- Python
- Instalar las dependencias de python:
```
cd backend
pip install -r requirements.txt
```

### Instalacion
1. Desplegar la intefaz:
```
cd frontend
npm run dev
```
2. Conectar al arduino
3. Desplegar el servidor:
```
cd backend
python manage.py runserver
```