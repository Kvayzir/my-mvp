# Chat Backend

## Setup
1. Create virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate virtual environment:
   ```bash
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python main.py
   ```

Server will run at: http://localhost:8000
API docs at: http://localhost:8000/docs

## ToDo's
- Crear chatbots en base a temas
   - Guardar temas en DB
   - Cargar temas en frontend
   - Crear chatbots en base al tema que se envía del frontend
- Mandar mensaje inicial
- Función para cargar la conversación
- Organizar base de datos
