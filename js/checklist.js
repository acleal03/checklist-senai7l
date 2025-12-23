async function carregarChecklist() {

  const { data, error } = await window.supabaseClient
    .from("locais_ambiente")
    .select(`
      id,
      nome_exibicao,
      ambiente_itens:ambiente_itens!local_id (
        id,
        nome_item,
        quantidade,
        descricao
      )
    `)
    .eq("ambiente_id", ambienteId)
    .order("nome_exibicao", { ascending: true });

  if (error) {
    console.error("ERRO SUPABASE:", error);
    alert("Erro ao carregar checklist.");
    return;
  }

  console.log("CHECKLIST CARREGADO:", data);
  renderizar(data || []);
}
