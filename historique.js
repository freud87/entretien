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

        // Colonne Prochain (vide au départ, remplie plus tard)
        const tdProchain = document.createElement('td');
        tdProchain.textContent = ''; // vide pour être rempli ensuite

        // Ajouter les cellules à la ligne
        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        row.appendChild(tdIntervention);
        row.appendChild(tdRemarque);
        row.appendChild(tdProchain);

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
  const tbody = document.getElementById("table-historique");
  const lignes = Array.from(tbody.querySelectorAll("tr"));

  const interventionMap = {};

  // 1. Regrouper les interventions par type
  lignes.forEach((tr) => {
    const tds = tr.querySelectorAll("td");

    const dateStr = tds[1].textContent;
    const kmStr = tds[2].textContent.replace(/\s/g, '');
    const intervention = tds[3].textContent.trim();

    const kilometrage = parseInt(kmStr, 10);
    const dateParts = dateStr.split("/");
    const dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

    if (!interventionMap[intervention]) {
      interventionMap[intervention] = [];
    }

    interventionMap[intervention].push({
      tr,
      date: dateObj,
      kilometrage,
    });
  });

  // 2. Calculer les remarques (différence entre les 2 dernières interventions similaires)
  Object.entries(interventionMap).forEach(([type, liste]) => {
    liste.sort((a, b) => a.date - b.date);

    const nbInterventions = liste.length;

    if (nbInterventions >= 2) {
      const derniere = liste[nbInterventions - 1];
      const avantDerniere = liste[nbInterventions - 2];

      const diffMois = Math.round(
        (derniere.date.getTime() - avantDerniere.date.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );

      const diffKm = isNaN(derniere.kilometrage) || isNaN(avantDerniere.kilometrage)
        ? null
        : derniere.kilometrage - avantDerniere.kilometrage;

      const remarque = (diffKm !== null && diffKm > 0)
        ? `${diffKm} km et ${diffMois} mois`
        : `${diffMois} mois`;

      const tds = derniere.tr.querySelectorAll("td");
      tds[4].textContent = remarque;
    } else {
      const tds = liste[0].tr.querySelectorAll("td");
      tds[4].textContent = "Aucune donnée";
    }
  });

  // 3. Lire le plan d'entretien
  const plan = {};
  const planRows = document.querySelectorAll("#table-plan tbody tr");
  planRows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const intervention = cells[1].textContent.trim(); // colonne 2 = nom
    const kmStr = cells[2].textContent.replace(/\s/g, ''); // colonne 3 = périodicité km
    const kmValue = parseInt(kmStr, 10) || 0;
    plan[intervention] = kmValue;
  });

  // 4. Calculer la colonne "Prochain"
  lignes.forEach(tr => {
    const tds = tr.querySelectorAll("td");
    const intervention = tds[3].textContent.trim();
    const kmStr = tds[2].textContent.replace(/\s/g, '');
    const km = parseInt(kmStr, 10);
    const periodiciteKm = plan[intervention];

    if (!isNaN(km) && periodiciteKm) {
      const prochainKm = Math.round((km + periodiciteKm) / 10000) * 10000;
      tds[5].textContent = `${prochainKm} km`;
    } else {
      tds[5].textContent = "";
    }
  });
}
