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
                    keyword = '¿Dónde está?', 
                    content = 'El núcleo es una de las partes más evidentes de la célula, dada su posición en el centro de la misma.',
                    img = '(Imagen de la célula señalando el núcleo)'
                ),
                MaterialInfo(
                    keyword = '¿Qué guarda en su interior?', 
                    content = 'Contine todos los cromosomas de la célula, los cuales codifican el material genético. Debido a la importancia de los genes, el núcleo es una parte a proteger.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '¿Cómo se protege?', 
                    content = 'El núcleo tiene una membrana que lo rodea y que mantiene todos los cromosomas en el interior; separandolos del resto de organelos y componentes que quedan fuera.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '¿Se comunica con el exterior?', 
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

LEGALITY_TOPIC = TopicInformation(
    name = 'Cultura de la Legalidad y su relación con los derechos',
    ui = UIRender (icon='⚖️', color='blue', description='Fundamentos de la legalidad y su relación con los derechos humanos y el sistema jurídico en la sociedad contemporánea.'),
    contents = [
        ContentInformation(
            level = 2,
            title = 'Definición',
            ui = UIRender(icon='📚', color='purple', description='Concepto de cultura de la legalidad y su importancia en la sociedad.'),
            checklist = [
                MaterialInfo(
                    keyword = '¿Por qué es tan importante?',
                    content = 'La cultura de la legalidad es un pilar fundamental en toda sociedad democrática que aspira a garantizar el respeto y la protección de los derechos fundamentales. Se relaciona con el ejercicio y la protección de los derechos humanos y civilies. No obstante, no basta con que una sociedad posea normales legales para garantizar la existencia de una cultura de la legalidad.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '¿Qué entendemos por cultura de la legalidad?',
                    content = 'Es aquella forma de vida (conocimientos, costumbres, creencias, etc.) según la cual las personas y organizaciones valoran el cumplimiento de las normas y respetan a las instituciones que lo garantizan. No por obediencia ciega, sino porque reconocen en ellas un pilar fundamental para su existencia.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = '¿Cómo se instaura una cultura de la legalidad?',
                    content = 'A través del conocimiento de las normas y las instituciones democráticas, así como la comprensión de las razones de su importancia. Además, es necesario estar dispuestos a respetarlas. Implica, por supuesto, conocer y respetar los derechos de las personas, norma fundamental de toda sociedad democrática.',
                    img = ''
                ),
            ]
        ),
        ContentInformation(
            level = 1,
            title = 'Fundamentos de la Cultura de la Legalidad',
            ui = UIRender(icon = '🏛️', color='red', description = 'Definición y elementos'),
            checklist = [
                MaterialInfo(
                    keyword = 'Objetivo y representación',
                    content = 'La cultura de la legalidad promueve que la población crea en el Estado de Derecho, lo defienda y no tolere la ilegalidad. Representa el conjunto de creencias, valores, normas y acciones que cumplen este fin.',
                    img = ''
                ),
                MaterialInfo(
                    keyword = 'Elementos principales',
                    content = 'Conocimiento y comprensión de normas. \nVoluntad de respeto a las leyes. \nParticipación ciudadana activa. \nRechazo a la ilegalizad y a la corrupción',
                    img = ''
                )
            ]
        ),
    ]
)