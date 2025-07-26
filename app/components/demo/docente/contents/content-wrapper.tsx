import ContentPreview from './content-preview';

export default function ContentWrapper() {
    const contentList = [
        { title: 'Partes de la Célula (I)', description: 'Contenido a tratar:\n\tCitoesqueleto\n\tOrganelos\n\tNúcleo' },
        { title: 'Contenido 2', description: 'Descripción del contenido 2' },
        { title: 'Contenido 3', description: 'Descripción del contenido 3' },
    ];
    return (
        <div className="p-4 flex flex-wrap gap-4">
            {contentList.map((content, index) => (
                <ContentPreview
                    key={index}
                    title={content.title}
                    description={content.description} />
            ))}
        </div>
    );
}