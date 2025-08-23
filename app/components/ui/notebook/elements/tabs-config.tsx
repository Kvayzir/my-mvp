import { NotesContent, TasksContent, IdeasContent } from './notebook-content';
import Resources from './resources/resources';
import { TabsConfigEntry  } from '@/app/lib/types';
import JourneyMap from '@/app/components/ui/journey-map/journey-map';

export const createTabsConfig = (props: TabsConfigEntry) => {  
  return [
  {
    id: 0,
    label: "Instructions",
    icon: "✅",
    content: <TasksContent />
  },
  {
    id: 1,
    label: "Journey",
    icon: "🗺️",
    content: <JourneyMap 
      updateLevel={props.mapProps.updateLevel} 
      state={props.mapProps.state} 
      clickedSequence={props.mapProps.clickedSequence} 
      updateAllIconPositions={props.mapProps.updateAllIconPositions} 
      handleIconClick={props.mapProps.handleIconClick} 
    >
      {props.mapProps.children}
    </JourneyMap>
  },
  {
    id: 2,
    label: "Recursos",
    icon: "📚",
    content: <Resources 
      contentList={[
          { group: "Citoesqueleto", name: "Citoesqueleto", isChecked: true, content: "Probando cómo se ve." }, 
          { group: "Citoesqueleto", name: "Microfilamentos", isChecked: false, content: "Probando cómo se ve." },
          { group: "Citoesqueleto", name: "Filamentos intermedios", isChecked: false, content: "Probando cómo se ve."},
          { group: "Citoesqueleto", name: "Microtúbulos", isChecked: true, content: "Estructuras huecas formadas por tubulina (proteína). Permiten modificar la forma de la célula y redistribuir los organelos" },
          { group: "Mitocondria", name: "Mitocondria", isChecked: true, content: "Organelo encargado de abastecer de energía a la célula" },
          { group: "Mitocondria", name: "ATP", isChecked: true, content: "Molécula que almacena gran cantidad de energía en sus enlaces moleculares. Cuando se requiere, la célula utiliza esta energía al romper estos enlaces." },
          { group: "Mitocondria", name: "Producción de energía", isChecked: true, content: "Las mitocondrias utilizan un proceso denominado 'respiración celular' para sintetizar las moléculas ATP. Durante este proceso, se utiliza glucosa para generar energía." },
      ]}
      img={{path: "/images/content/Citoesqueleto.png", alt: "Citoesqueleto" }} 
    />
  },
  {
    id: 3,
    label: "Report",
    icon: "📝",
    content: <NotesContent onCheck={props.onCheck} onSubmit={props.onSubmit} />
  },
  {
    id: 4,
    label: "Ideas",
    icon: "💡",
    content: <IdeasContent />
  }
];
}
