const handleSearch = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch('/api/parse-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, cliente, empresa }),
    });
    
    const json = await res.json();
    if (json.data) {
      setQuoteData(json.data);
    } else {
      setError(json.error || 'No se recibieron datos de la cotización');
    }
  } catch (err: any) {
    setError('Error conectando con el servidor');
  } finally {
    setLoading(false); // <--- ESTO EVITA QUE SE QUEDE PEGADO
  }
};