document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  // Initialisation du client Supabase
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
        const tdIntervention = document.createElement('td');
        tdIntervention.textContent = item.intervention;

        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        row.appendChild(tdIntervention);

        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Erreur chargement kilométrages :', error);
    }
  }

  await chargerKilometrages();
});

function calculerPeriodes() {
    const rows = Array.from(document.querySelectorAll("table tr")).slice(1); // Ignorer l'en-tête
    const interventionsMap = {};

    rows.forEach((row) => {
        const dateStr = row.cells[1].textContent.trim(); // DATE
        const kmStr = row.cells[2].textContent.trim().replace(/\s/g, '') || "0"; // KILOMÉTRAGE
        const intervention = row.cells[3].textContent.trim(); // INTERVENTION
        const remarqueCell = row.cells[4]; // REMARQUE

        const date = new Date(dateStr.split('/').reverse().join('-')); // "DD/MM/YYYY" → "YYYY-MM-DD"
        const km = parseInt(kmStr);

        if (interventionsMap[intervention]) {
            const prev = interventionsMap[intervention];

            const diffYears = date.getFullYear() - prev.date.getFullYear();
            const diffMonths = diffYears * 12 + (date.getMonth() - prev.date.getMonth());

            const diffKm = Math.abs(km - prev.km);

            remarqueCell.textContent = `${diffMonths} mois, ${diffKm.toLocaleString()} km depuis la dernière`;
        }

        // Stocker cette intervention comme la plus récente pour ce type
        interventionsMap[intervention] = { date, km };
    });
}

window.onload = calculerPeriodes;
