import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserCircle } from "lucide-react";

interface Machine {
  id: number;
  name: string;
  online: boolean;
  role: string;
  hostport?: string;
}

const Index = () => {
  const navigate = useNavigate();
  
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

  // Verificar autenticação
  useEffect(() => {
    const authToken = sessionStorage.getItem('auth_token');
    const authTime = sessionStorage.getItem('auth_time');
    
    if (!authToken || !authTime) {
      navigate('/gateway', { replace: true });
      return;
    }
    
    // Verificar se o token não expirou (válido por 24 horas)
    const tokenAge = Date.now() - parseInt(authTime);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (tokenAge > twentyFourHours) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_time');
      navigate('/gateway', { replace: true });
    }
  }, [navigate]);

  // Buscar dados da API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        // Buscar configuração do device
        const configResponse = await fetch('/device.json');
        const config = await configResponse.json();
        const deviceId = config.device;
        
        // Buscar máquinas da API
        const response = await fetch(`https://painel.stratustelecom.com.br/main/controll/operacao/api_vnc.php?device=${deviceId}`);
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
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1 flex gap-4 items-center">
            <img src="https://painel.stratustelecom.com.br/images/stlogo.png" className="h-[52px]" />
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Monitoramento de Máquinas</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {currentMachines.length} máquinas | Página {currentPage}/{totalPages}
              </p>
            </div>
          </div>
          
          {/* Campo de Busca */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2 whitespace-nowrap">
            <UserCircle className="w-4 h-4" />
            Filtrar por função:
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedRole("todas");
                setCurrentPage(1);
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {currentMachines.map((machine) => (
          <article 
            key={machine.id} 
            className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer hover:scale-105"
            onClick={() => setSelectedMachine(machine)}
          >
            {/* Preview da Tela */}
            <div className="h-40 sm:h-48 bg-[hsl(var(--screen-bg))] relative overflow-hidden">
              <iframe
                src={`http://192.168.100.197:6080/vnc.html?autoconnect=true&path=?token=${machine.name}`}
                className="w-full h-full border-0 pointer-events-none scale-[0.4] origin-top-left"
                style={{ width: '250%', height: '250%' }}
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
      <nav className="flex items-center justify-center gap-2 flex-wrap" aria-label="Paginação">
        <button 
          className="px-3 sm:px-4 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          disabled={currentPage === 1}
          onClick={goToPreviousPage}
        >
          <span className="hidden sm:inline">Anterior</span>
          <span className="sm:hidden">Ant</span>
        </button>
        
        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
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
          className="px-3 sm:px-4 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          disabled={currentPage === totalPages}
          onClick={goToNextPage}
        >
          <span className="hidden sm:inline">Próximo</span>
          <span className="sm:hidden">Prox</span>
        </button>
      </nav>

      {/* Modal de Tela Cheia */}
      {selectedMachine && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setSelectedMachine(null)}
        >
          <div 
            className="bg-card rounded-xl border-2 border-border w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-secondary/50 sticky top-0 z-10">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-card-foreground truncate">{selectedMachine.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                        selectedMachine.online 
                          ? 'bg-[hsl(var(--success))] shadow-[0_0_8px_hsl(var(--success))]' 
                          : 'bg-[hsl(var(--error))] shadow-[0_0_8px_hsl(var(--error))]'
                      }`}
                    />
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {selectedMachine.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMachine(null)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview da Tela em Tamanho Grande */}
            <div className="p-3 sm:p-6">
              <div className="w-full h-[50vh] sm:h-[60vh] bg-[hsl(var(--screen-bg))] rounded-lg relative overflow-hidden border border-border">
                <iframe
                  src={`http://192.168.100.197:6080/vnc.html?autoconnect=true&path=?token=${selectedMachine.name}`}
                  className="w-full h-full border-0"
                  title={`VNC ${selectedMachine.name}`}
                />
              </div>
              
              {/* Info adicional */}
              <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-secondary/50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Função</p>
                  <p className="font-semibold text-sm sm:text-base text-foreground truncate">{selectedMachine.role}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">IP Address</p>
                  <p className="font-semibold text-sm sm:text-base text-foreground">192.168.1.{selectedMachine.id}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Última Conexão</p>
                  <p className="font-semibold text-sm sm:text-base text-foreground">
                    {selectedMachine.online ? 'Agora' : '2h atrás'}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Sistema</p>
                  <p className="font-semibold text-sm sm:text-base text-foreground">Windows 11</p>
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
