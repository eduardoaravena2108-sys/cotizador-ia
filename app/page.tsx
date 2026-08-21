const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cliente: clientName, empresa: companyName }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      if (data.data) {
        setQuoteData(data.data);
      } else {
        setErrorMessage('La respuesta no contiene datos válidos.');
      }
    } catch (e: any) {
      console.error('Error al generar:', e);
      setErrorMessage(e.message || 'Ocurrió un error al conectar con la IA.');
    } finally {
      setLoading(false);
    }
  };