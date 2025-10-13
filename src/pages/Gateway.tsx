import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const Gateway = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // Hash MD5 esperado para a senha "M7a64tl0"
      const expectedHash = "0e7517141fb53f21ee439b355b5a1d0a";
      
      // Verifica se há dados de POST
      const urlParams = new URLSearchParams(window.location.search);
      const providedHash = urlParams.get('hash');
      
      if (providedHash && providedHash.toLowerCase() === expectedHash) {
        // Gera um token único para esta sessão
        const sessionToken = CryptoJS.MD5(Date.now().toString() + Math.random().toString()).toString();
        sessionStorage.setItem('auth_token', sessionToken);
        sessionStorage.setItem('auth_time', Date.now().toString());
        
        // Redireciona para a página principal
        navigate('/', { replace: true });
      } else {
        // Acesso negado
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#666;">Acesso negado</div>';
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#666' }}>
      Verificando autenticação...
    </div>
  );
};

export default Gateway;
