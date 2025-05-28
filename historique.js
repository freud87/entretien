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
        console.error("Erreur lors de la récupération de 'historique' :", historiqueError);
        alert("Erreur : Impossible de charger l'historique");
        return;
      }

      // Charger plan
      const { data: planData, error: planError } = await supabase
        .from('plan')
        .select('intervention, cycle_km');

      if (planError) {
        console.error("Erreur lors de la récupération de 'plan' :", planError);
        alert("Erreur : Impossible de charger les cycles");
        return;
      }

      // Récupérer #moyenne
      const moyenneElement = document.getElementById('moyenne');
      if (!moyenneElement) {
        console.error("Élément #moyenne introuvable !");
        return;
      }
      const moyenne = parseFloat(moyenneElement.value);
      if (isNaN(moyenne)) {
        console.error("La valeur de #moyenne n'est pas valide !");
        return;
      }

      // Remplir le tableau
      const tbody = document.getElementById('table-historique');
      if (!tbody) {
        console.error("tbody introuvable !");
        return;
      }

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
        const dateObj = new Date(item.date);
        tdDate.textContent = dateObj.toLocaleDateString('fr-FR');

        const tdKm = document.createElement('td');
        tdKm.textContent = item.kilometrage;

        const tdIntervention = document.createElement('td');
        tdIntervention.textContent = item.intervention;

        const tdProchainkms = document.createElement('td');
        const tdProchaindate = document.createElement('td');

        const planItem = planData.find(p => p.intervention === item.intervention);
        if (planItem && !isNaN(parseFloat(item.kilometrage))) {
          const cycle_km = parseFloat(planItem.cycle_km);
          const currentKm = parseFloat(item.kilometrage);
          const prochainKms = currentKm + cycle_km;
          tdProchainkms.textContent = prochainKms.toLocaleString('fr-FR');

          const joursAjoutes = Math.round((cycle_km / moyenne) * 30);
          const prochainDate = new Date(dateObj);
          prochainDate.setDate(prochainDate.getDate() + joursAjoutes);
          tdProchaindate.textContent = prochainDate.toLocaleDateString('fr-FR');
        } else {
          tdProchainkms.textContent = '-';
          tdProchaindate.textContent = '-';
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
