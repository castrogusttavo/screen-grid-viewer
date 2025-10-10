import { useState, useEffect } from "react";
import { Search, UserCircle } from "lucide-react";

interface Machine {
  id: number;
  name: string;
  online: boolean;
  role: string;
  hostport?: string;
}

const Index = () => {
  // Estado da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const machinesPerPage = 12;
  
  // Estado da busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("todas");
  
  // Estado do modal de tela cheia
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  // Estado das máquinas da API
  const [allMachines, setAllMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados da API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('http://192.168.100.197:5000/api/vnc-tokens');
        const data = await response.json();
        
        const machines: Machine[] = data.map((item: { hostport: string; token: string }, index: number) => ({
          id: index + 1,
          name: item.token,
          online: true,
          role: "Funcionário",
          hostport: item.hostport
        }));
        
        setAllMachines(machines);
      } catch (error) {
        console.error('Erro ao buscar máquinas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  // Lista única de funções para o filtro
  const uniqueRoles = Array.from(new Set(allMachines.map(m => m.role)));

  // Filtrar máquinas pela busca e função
  const filteredMachines = allMachines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "todas" || machine.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredMachines.length / machinesPerPage);
  const indexOfLastMachine = currentPage * machinesPerPage;
  const indexOfFirstMachine = indexOfLastMachine - machinesPerPage;
  const currentMachines = filteredMachines.slice(indexOfFirstMachine, indexOfLastMachine);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando máquinas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Monitoramento de Máquinas</h1>
            <p className="text-muted-foreground">
              {currentMachines.length} máquinas visualizadas | Página {currentPage} de {totalPages}
            </p>
          </div>
          
          {/* Campo de Busca */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filtro de Função */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            Filtrar por função:
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedRole("todas");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRole === "todas"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-card-foreground hover:bg-secondary"
              }`}
            >
              Todas
            </button>
            {uniqueRoles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRole === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-card-foreground hover:bg-secondary"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Grid de Máquinas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentMachines.map((machine) => (
          <article 
            key={machine.id} 
            className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer hover:scale-105"
            onClick={() => setSelectedMachine(machine)}
          >
            {/* Preview da Tela */}
            <div className="aspect-video bg-[hsl(var(--screen-bg))] relative overflow-hidden">
              <iframe
                src={`http://192.168.100.197:6080/vnc.html?autoconnect=true&path=?token=${machine.name}`}
                className="w-full h-full border-0"
                title={`VNC ${machine.name}`}
              />
              
              {/* Status Indicator Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
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
              <h3 className="font-semibold text-card-foreground flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {machine.name}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <UserCircle className="w-3.5 h-3.5" />
                {machine.role}
              </p>
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

      {/* Modal de Tela Cheia */}
      {selectedMachine && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedMachine(null)}
        >
          <div 
            className="bg-card rounded-xl border-2 border-border w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">{selectedMachine.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        selectedMachine.online 
                          ? 'bg-[hsl(var(--success))] shadow-[0_0_8px_hsl(var(--success))]' 
                          : 'bg-[hsl(var(--error))] shadow-[0_0_8px_hsl(var(--error))]'
                      }`}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedMachine.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMachine(null)}
                className="w-10 h-10 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview da Tela em Tamanho Grande */}
            <div className="p-6">
              <div className="aspect-video bg-[hsl(var(--screen-bg))] rounded-lg relative overflow-hidden border border-border">
                <iframe
                  src={`http://192.168.100.197:6080/vnc.html?autoconnect=true&path=?token=${selectedMachine.name}`}
                  className="w-full h-full border-0"
                  title={`VNC ${selectedMachine.name}`}
                />
              </div>
              
              {/* Info adicional */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Função</p>
                  <p className="font-semibold text-foreground">{selectedMachine.role}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">IP Address</p>
                  <p className="font-semibold text-foreground">192.168.1.{selectedMachine.id}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Última Conexão</p>
                  <p className="font-semibold text-foreground">
                    {selectedMachine.online ? 'Agora' : '2 horas atrás'}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Sistema</p>
                  <p className="font-semibold text-foreground">Windows 11</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
