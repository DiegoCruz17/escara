import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SCARAConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("scara_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("scara_updates", self.channel_name)

    async def scara_update(self, event):
        # This method should match the "type" key in your group_send call
        data = event['data']
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):
        # Handle any messages sent from the client, if needed
        pass