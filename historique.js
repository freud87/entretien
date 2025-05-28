document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  async function chargerKilometrages() {
    try {
      // Charger historique
      const { data: historiqueData, error: historiqueError } = await supabase
        .from('historique')
        .select('id, date, kilometrage, intervention')
        .order('date', { ascending: false });

      if (historiqueError) {
        console.error("Erreur historique :", historiqueError);
        alert("Erreur : Impossible de charger l'historique");
        return;
      }

      // Charger plan
      const { data: planData, error: planError } = await supabase
        .from('plan')
        .select('intervention, cycle_km');

      if (planError) {
        console.error("Erreur plan :", planError);
        alert("Erreur : Impossible de charger les cycles");
        return;
      }

      // Lire la moyenne
      const moyenneElement = document.getElementById('moyenne');
      const moyenne = parseFloat(moyenneElement?.value);
      if (!moyenne || isNaN(moyenne)) {
        console.error("Valeur moyenne invalide !");
        return;
      }

      const tbody = document.getElementById('table-historique');
      tbody.innerHTML = '';

      if (!historiqueData || historiqueData.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.textContent = "Aucune donnée disponible";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
      }

      historiqueData.forEach((item) => {
        const row = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = item.id;
        tdId.classList.add('hidden');

        const tdDate = document.createElement('td');
        const parts = item.date.split('-'); // Format YYYY-MM-DD
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
          const cycleKm = parseFloat(planItem.cycle_km);
          const kilometrage = parseFloat(item.kilometrage);

          const prochainKms = kilometrage + cycleKm;
          tdProchainkms.textContent = prochainKms.toLocaleString('fr-FR');

          const joursAjoutes = Math.round((cycleKm / moyenne) * 30);
          const prochainDate = new Date(dateObj);
          prochainDate.setDate(prochainDate.getDate() + joursAjoutes);
          tdProchaindate.textContent = prochainDate.toLocaleDateString('fr-FR');
        } else {
          tdProchainkms.textContent = '';
          tdProchaindate.textContent = '';
        }

        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        row.appendChild(tdIntervention);
        row.appendChild(tdProchainkms);
        row.appendChild(tdProchaindate);

        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Erreur générale :', error);
      alert("Une erreur inattendue est survenue.");
    }
  }

  await chargerKilometrages();
});
