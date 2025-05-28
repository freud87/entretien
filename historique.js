document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOi...'; // Clé inchangée
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  async function chargerKilometrages() {
    try {
      const { data: historiqueData, error: historiqueError } = await supabase
        .from('historique')
        .select('id, date, kilometrage, intervention')
        .order('date', { ascending: false });

      if (historiqueError) throw historiqueError;

      const { data: planData, error: planError } = await supabase
        .from('plan')
        .select('intervention, cycle_km');

      if (planError) throw planError;

      const moyenneElement = document.getElementById('moyenne');
      const moyenne = parseFloat(moyenneElement?.value);
      if (isNaN(moyenne)) throw new Error("Valeur moyenne invalide");

      const tbody = document.getElementById('table-historique');
      tbody.innerHTML = '';

      if (!historiqueData || historiqueData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">Aucune donnée disponible</td></tr>`;
        return;
      }

      historiqueData.forEach(item => {
        const row = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = item.id;
        tdId.classList.add('hidden');

        const tdDate = document.createElement('td');
        const parts = item.date.split('-'); // yyyy-mm-dd depuis Supabase
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        tdDate.textContent = dateObj.toLocaleDateString('fr-FR');

        const tdKm = document.createElement('td');
        tdKm.textContent = item.kilometrage;

        const tdIntervention = document.createElement('td');
        tdIntervention.textContent = item.intervention;

        const tdProchainkms = document.createElement('td');
        const tdProchaindate = document.createElement('td');

        const planItem = planData.find(p => p.intervention === item.intervention);
        if (planItem && !isNaN(item.kilometrage)) {
          const cycle_km = parseFloat(planItem.cycle_km);
          const prochainKms = item.kilometrage + cycle_km;
          tdProchainkms.textContent = prochainKms.toLocaleString('fr-FR');

          // Calcul date prochaine
          const joursAjoutes = Math.round((cycle_km / moyenne) * 30);
          const prochainDate = new Date(dateObj); // Clone
          prochainDate.setDate(prochainDate.getDate() + joursAjoutes);
          tdProchaindate.textContent = prochainDate.toLocaleDateString('fr-FR');
        }

        row.append(tdId, tdDate, tdKm, tdIntervention, tdProchainkms, tdProchaindate);
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Erreur :', error);
      alert("Une erreur est survenue.");
    }
  }

  await chargerKilometrages();
});
