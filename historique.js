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

        // Colonne Intervention
        const tdIntervention = document.createElement('td');
        tdIntervention.textContent = item.intervention;

        // Colonne Remarque (vide au départ, remplie plus tard)
        const tdRemarque = document.createElement('td');
        tdRemarque.textContent = ''; // vide pour être rempli ensuite

        // Ajouter les cellules à la ligne
        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        row.appendChild(tdIntervention);
        row.appendChild(tdRemarque);

        // Ajouter la ligne au tableau
        tbody.appendChild(row);
      });

      // Calculer les remarques une fois le tableau rempli
      calculerPeriodes();

    } catch (error) {
      console.error('Erreur chargement kilométrages :', error);
    }
  }

  await chargerKilometrages();
});

function calculerPeriodes() {
  const rows = Array.from(document.querySelectorAll("table tbody tr"));
  const interventionsMap = {};

  rows.forEach((row) => {
    const cells = row.cells;

    const dateStr = cells[1].textContent.trim();  // DATE (index 1)
    const kmStr = cells[2].textContent.trim().replace(/\s/g, '') || "0"; // KM (index 2)
    const intervention = cells[3].textContent.trim(); // INTERVENTION (index 3)
    const remarqueCell = cells[4]; // REMARQUE (index 4)

    const date = new Date(dateStr.split('/').reverse().join('-'));
    const km = parseInt(kmStr);

    if (interventionsMap[intervention]) {
      const prev = interventionsMap[intervention];

      const diffYears = prev.date.getFullYear() - date.getFullYear();
      const diffMonths = diffYears * 12 + (prev.date.getMonth() - date.getMonth());
      const diffKm = Math.abs(prev.km - km);

      remarqueCell.textContent = `${diffMonths} mois, ${diffKm.toLocaleString()} km depuis la dernière`;
    }

    // Stocker cette ligne comme la plus récente intervention de ce type
    interventionsMap[intervention] = { date, km };
  });
}

window.onload = calculerPeriodes;
