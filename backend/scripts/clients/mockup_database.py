from pydantic import BaseModel
from typing import List, Optional

class UIRender(BaseModel):
    icon: str
    color: str
    description: str

class MaterialInfo(BaseModel):
    keyword: str
    content: str
    img: Optional[str]

class ContentInformation(BaseModel):
    level: int
    title: str
    ui: UIRender
    checklist: List[MaterialInfo]

class TopicInformation(BaseModel):
    name: str
    ui: UIRender
    contents: List[ContentInformation]

CELLS_TOPIC = TopicInformation(
    name = 'celula',
    ui = UIRender(icon='🧿', color='green', description='Partes de la célula'),
    contents = [
        ContentInformation(
            level = 2, 
            title = 'core', 
            ui = UIRender(icon='🧿', color='purple', description='Motivación general a conocer el núcleo de la célula'),
            checklist = [
                MaterialInfo(
                    keyword = 'Ubicación', 
                    content = 'El núcleo es una de las partes más evidentes de la célula, dada su posición en el centro de la misma.',
                    img = '(Imagen de la célula señalando el núcleo)'
                ),
                MaterialInfo(
                    keyword = 'Contenido', 
                    content = 'Contine todos los cromosomas de la célula, los cuales codifican el material genético. Debido a la importancia de los genes, el núcleo es una parte a proteger.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Protección', 
                    content = 'El núcleo tiene una membrana que lo rodea y que mantiene todos los cromosomas en el interior; separandolos del resto de organelos y componentes que quedan fuera.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Intercambio de sustancias', 
                    content = 'Algunas sustancias, como el ARN, necesitan circular entre el núcleo y el citoplasma. Para ello, hay poros en esta envoltura nuclear que permiten que las moléculas entren y salgan del núcleo.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Nuevos descubrimientos', 
                    content = 'Antes se pensaba que la membrana nuclear sólo permitía la salida de las moléculas, pero ahora se sabe que también hay un proceso activo para introducir moléculas en el núcleo.',
                    img = ''
                ),
            ],
        ),
        ContentInformation(
            level  = 2,
            title = 'Ciudad', 
            ui= UIRender(color = 'teal', icon = '🏙️', description = 'Imagina una ciudad en miniatura: hay una planta eléctrica (mitocondria), una oficina de correos (aparato de Golgi), fábricas (ribosomas), centros de reciclaje (lisosomas), calles (citoplasma) y, por supuesto, un ayuntamiento con los planos de construcción: el núcleo.'),
            checklist = [
                MaterialInfo(
                    keyword = '¿Célula como ciudad?',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Planta eléctrica',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Fábricas',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Calles',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Ayuntamiento',
                    content = '',
                    img = ''
                ),
            ]
        ),
        ContentInformation(
            level  = 2,
            title = 'microscopio', 
            ui= UIRender(color = 'indigo', icon = '🛩️', description = 'Hoy haremos un viaje microscópico dentro de una célula. Prepárate para flotar por el citoplasma, explorar estructuras llenas de energía y llegar al lugar más protegido de todos: el núcleo, donde se guardan los secretos de la vida.'),
            checklist = [
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
            ]
        ),
        ContentInformation(
            level  = 1,
            title = 'energy', 
            ui= UIRender(color = 'yellow', icon = '🔋', description = 'Aquí hablamos de mitocondrias, cloroplastos, lisosomas, y vacuolas'),
            checklist = [
                MaterialInfo(
                    keyword = 'Mitocondrias',
                    content = 'La mitocondria es el organelo encargado de abastecer de energía a la célula.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'ATP',
                    content = 'Molécula que almacena gran cantidad de energía en sus enlaces moleculares. Cuando se requiere, la célula utiliza esta energía rompiendo estos enlaces.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Producción de energía',
                    content = "Las mitocondrias utilizan un proceso denominado 'respiración celular' para sintetizar las moléculas ATP. Durante este proceso, se utiliza glucosa para generar energía.",
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Cloroplastos',
                    content = '',
                    img = ''
                ),
            ]
        ),
        ContentInformation(
            level  = 1,
            title = 'sustances', 
            ui= UIRender(color = 'red', icon = '⚙️', description = 'Ribosomas, RER, REL, aparato de Golgi'),
            checklist = [
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
            ]
        ),
        ContentInformation(
            level  = 1,
            title = 'citoesqueleto', 
            ui= UIRender(color = 'green', icon = '🩻', description = 'Citoesqueleto: microfilamentos, filamentos intermedios y microtúbulos. Estos son los componentes que dan forma a la célula, como si fueran los huesos y músculos de un cuerpo.'),
            checklist = [
                MaterialInfo(
                    keyword = 'Citoesqueleto',
                    content = 'Probando funcionalidad',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Microfilamentes',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Filamentos intermedios',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Microtúbulos',
                    content = 'Estructuras huecas formadas por tubulina (proteína). Permiten modificar la forma de la célula y redistribuir los organelos',
                    img = ''
                ),
            ]
        ),
        ContentInformation(
            level  = 1,
            title = 'nucleo', 
            ui= UIRender(color = 'indigo', icon = '🧬', description = 'Forma, adn, genes, partes...'),
            checklist = [
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '',
                    content = '',
                    img = ''
                ),
            ]
        ),
        ContentInformation(
            level  = 0,
            title = 'goal', 
            ui= UIRender(color = 'purple', icon = '🎯', description = 'Aquí evaluamos al alumno.'),
            checklist=[
                MaterialInfo(
                    keyword='',
                    content='',
                    img=''
                    )
            ]
        ),
    ]
)
