import { useState } from "react";

const Index = () => {
  // Estado da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const machinesPerPage = 12;

  // Dados fixos de máquinas (expandido para 3 páginas)
  const allMachines = [
    // Página 1
    { id: 1, name: "Workstation-01", online: true },
    { id: 2, name: "Workstation-02", online: true },
    { id: 3, name: "Server-Alpha", online: false },
    { id: 4, name: "Workstation-03", online: true },
    { id: 5, name: "Dev-Machine-01", online: true },
    { id: 6, name: "Workstation-04", online: true },
    { id: 7, name: "Server-Beta", online: true },
    { id: 8, name: "Workstation-05", online: false },
    { id: 9, name: "Design-Station", online: true },
    { id: 10, name: "Workstation-06", online: true },
    { id: 11, name: "Test-Machine", online: true },
    { id: 12, name: "Workstation-07", online: false },
    // Página 2
    { id: 13, name: "Workstation-08", online: true },
    { id: 14, name: "Server-Gamma", online: true },
    { id: 15, name: "Workstation-09", online: true },
    { id: 16, name: "Production-01", online: false },
    { id: 17, name: "Workstation-10", online: true },
    { id: 18, name: "Dev-Machine-02", online: true },
    { id: 19, name: "Workstation-11", online: true },
    { id: 20, name: "QA-Machine", online: true },
    { id: 21, name: "Workstation-12", online: false },
    { id: 22, name: "Server-Delta", online: true },
    { id: 23, name: "Workstation-13", online: true },
    { id: 24, name: "Workstation-14", online: true },
    // Página 3
    { id: 25, name: "Workstation-15", online: true },
    { id: 26, name: "Server-Epsilon", online: false },
    { id: 27, name: "Workstation-16", online: true },
    { id: 28, name: "Staging-01", online: true },
    { id: 29, name: "Workstation-17", online: true },
    { id: 30, name: "Dev-Machine-03", online: false },
    { id: 31, name: "Workstation-18", online: true },
    { id: 32, name: "Build-Server", online: true },
    { id: 33, name: "Workstation-19", online: true },
    { id: 34, name: "Workstation-20", online: true },
    { id: 35, name: "Server-Zeta", online: false },
    { id: 36, name: "Workstation-21", online: true },
  ];

  // Cálculos de paginação
  const totalPages = Math.ceil(allMachines.length / machinesPerPage);
  const indexOfLastMachine = currentPage * machinesPerPage;
  const indexOfFirstMachine = indexOfLastMachine - machinesPerPage;
  const currentMachines = allMachines.slice(indexOfFirstMachine, indexOfLastMachine);

  // Funções de navegação
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Monitoramento de Máquinas</h1>
        <p className="text-muted-foreground">
          {currentMachines.length} máquinas visualizadas | Página {currentPage} de {totalPages}
        </p>
      </header>

      {/* Grid de Máquinas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentMachines.map((machine) => (
          <article key={machine.id} className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors">
            {/* Preview da Tela */}
            <div className="aspect-video bg-[hsl(var(--screen-bg))] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simulação de conteúdo da tela */}
                <div className="w-full h-full p-4 space-y-2">
                  <div className="h-3 bg-[hsl(var(--screen-content))] rounded w-3/4"></div>
                  <div className="h-3 bg-[hsl(var(--screen-content))] rounded w-1/2"></div>
                  <div className="h-20 bg-[hsl(var(--screen-content))] rounded mt-4"></div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="h-16 bg-[hsl(var(--screen-content))] rounded"></div>
                    <div className="h-16 bg-[hsl(var(--screen-content))] rounded"></div>
                  </div>
                </div>
              </div>
              
              {/* Status Indicator Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div 
                  className={`w-2.5 h-2.5 rounded-full ${
                    machine.online 
                      ? 'bg-[hsl(var(--success))] shadow-[0_0_8px_hsl(var(--success))]' 
                      : 'bg-[hsl(var(--error))] shadow-[0_0_8px_hsl(var(--error))]'
                  }`}
                />
                <span className="text-xs font-medium text-white">
                  {machine.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Info da Máquina */}
            <div className="p-4">
              <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {machine.name}
              </h3>
            </div>
          </article>
        ))}
      </div>

      {/* Paginação */}
      <nav className="flex items-center justify-center gap-2" aria-label="Paginação">
        <button 
          className="px-4 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
          onClick={goToPreviousPage}
        >
          Anterior
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                currentPage === pageNumber
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-card-foreground hover:bg-secondary'
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <button 
          className="px-4 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
          onClick={goToNextPage}
        >
          Próximo
        </button>
      </nav>
    </div>
  );
};

export default Index;
