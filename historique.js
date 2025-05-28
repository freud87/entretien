document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    async function chargerKilometrages() {
    try {
      const { data, error } = await supabase
        .from('historique')
        .select('id, date, kilometrage, intervention')
        .order('date', { ascending: false });

      if (error) throw error;

      const tbody = document.getElementById('table-historique');
      tbody.innerHTML = '';

      data.forEach((item) => {
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
        tdProchainkms.textContent = '';
        
        const tdProchaindate = document.createElement('td');
        tdProchaindate.textContent = '';

       

        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        row.appendChild(tdIntervention);
        row.appendChild(tdProchainkms);
        row.appendChild(tdProchaindate);

        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Erreur chargement kilométrages :', error);
    }
  }

  await chargerKilometrages();
});



// Fonction pour récupérer les données de la table "plan"
async function fetchPlanData() {
    const { data, error } = await supabase.from('plan').select('*');
    if (error) {
        console.error("Erreur Supabase : ", error);
        return [];
    }
    return data;
}

// Fonction principale pour mettre à jour le tableau
async function updateTable() {
    // Récupérer la moyenne depuis #moyenne
    const moyenneElement = document.getElementById('moyenne');
    if (!moyenneElement) {
        console.error("Élément #moyenne introuvable");
        return;
    }
    const moyenne = parseFloat(moyenneElement.value);
    if (isNaN(moyenne)) {
        console.error("La valeur de #moyenne n'est pas un nombre valide");
        return;
    }

    // Récupérer les données Supabase
    const planData = await fetchPlanData();

    // Sélectionner le tbody du tableau
    const tbody = document.getElementById('table-historique');
    if (!tbody) {
        console.error("Le tbody avec l'id 'table-historique' n'existe pas.");
        return;
    }

    // Parcourir chaque ligne du tableau
    Array.from(tbody.rows).forEach(row => {
        // Colonnes : Date | kilométrage | Intervention
        const dateText = row.cells[1].textContent.trim();
        const kmText = row.cells[2].textContent.trim();
        const intervention = row.cells[3].textContent.trim();

        const km = parseInt(kmText, 10);
        if (!km || isNaN(km)) return;

        // Trouver l'intervention correspondante dans planData
        const plan = planData.find(p => p.intervention === intervention);
        if (!plan) return;

        const cycle_km = plan.cycle_km;

        // Calcul Prochain (kms)
        const prochainKms = km + cycle_km;

        // Calcul Prochain (date)
        const date = new Date(dateText);
        const moisAjoutes = cycle_km / moyenne;
        const prochainDate = new Date(date);
        prochainDate.setDate(prochainDate.getDate() + Math.round(moisAjoutes * 30));

        // Remplir les colonnes
        row.cells[4].textContent = prochainKms; // Prochain (kms)
        row.cells[5].textContent = prochainDate.toLocaleDateString(); // Prochain (date)
    });
}

// Exécuter au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    updateTable();
});
