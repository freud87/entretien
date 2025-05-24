document.addEventListener('DOMContentLoaded', async () => {
  //const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  //const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // remplace par ta vraie clé
  //const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  async function chargerKilometrages() {
    try {
      const { data, error } = await supabase
        .from('historique')
        .select('id, date, kilometrage, intervention')
        .order('date', { ascending: false });

      if (error) throw error;

      const tbody = document.getElementById('table-kilometrages');
      tbody.innerHTML = '';

      data.forEach((item) => {
        const row = document.createElement('tr');

        // Colonne ID (masquée)
        const tdId = document.createElement('td');
        tdId.textContent = item.id;
        tdId.classList.add('hidden');

        // Colonne Date
        const tdDate = document.createElement('td');
        const dateObj = new Date(item.date);
        tdDate.textContent = dateObj.toLocaleDateString('fr-FR');

        // Colonne Kilométrage
        const tdKm = document.createElement('td');
        tdKm.textContent = new Intl.NumberFormat('fr-FR').format(item.kilometrage);

        // Si tu veux aussi afficher l'intervention, ajoute cette colonne :
        // const tdIntervention = document.createElement('td');
        // tdIntervention.textContent = item.intervention;

        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        // row.appendChild(tdIntervention); // décommenter si tu ajoutes la colonne dans le HTML

        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Erreur chargement kilométrages :', error);
    }
  }

  await chargerKilometrages();
});
