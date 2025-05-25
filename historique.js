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

      // Calculer les remarques/prochain une fois le tableau rempli
      calculerPeriodes();
      calculerProchain();

    } catch (error) {
      console.error('Erreur chargement kilométrages :', error);
    }
  }

  await chargerKilometrages();
});

function calculerPeriodes() {
  const tbody = document.getElementById("table-historique");
  const lignes = Array.from(tbody.querySelectorAll("tr"));

  // Dictionnaire pour stocker les interventions du même type
  const interventionMap = {};

  // 1. Lire toutes les lignes et les regrouper par type d'intervention
  lignes.forEach((tr) => {
    const tds = tr.querySelectorAll("td");

    const dateStr = tds[1].textContent;
    const kmStr = tds[2].textContent.replace(/\s/g, '');
    const intervention = tds[3].textContent.trim();

    const kilometrage = parseInt(kmStr, 10);
    const dateParts = dateStr.split("/");
    const dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // Date JS

    if (!interventionMap[intervention]) {
      interventionMap[intervention] = [];
    }

    interventionMap[intervention].push({
      tr,
      date: dateObj,
      kilometrage,
    });
  });

  // 2. Pour chaque type d'intervention
  Object.entries(interventionMap).forEach(([type, liste]) => {
    // Trier cette liste par date croissante (le plus ancien en premier)
    liste.sort((a, b) => a.date - b.date);

    const nbInterventions = liste.length;

    if (nbInterventions >= 2) {
      const derniere = liste[nbInterventions - 1]; // La plus récente
      const avantDerniere = liste[nbInterventions - 2]; // L'avant-dernière

      const diffMois = Math.round(
        (derniere.date.getTime() - avantDerniere.date.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );

      let remarque = "";

      if (diffMois > 0) {
        const diffKm = isNaN(derniere.kilometrage) || isNaN(avantDerniere.kilometrage)
          ? null
          : derniere.kilometrage - avantDerniere.kilometrage;

        if (diffKm !== null && diffKm > 0) {
          remarque = `${diffKm} km et ${diffMois} mois`;
        } else {
          remarque = `${diffMois} mois`;
        }
      } else {
        remarque = "Aucune donnée";
      }

      // On met à jour la ligne la plus récente → celle qui est en haut (ordre décroissant)
      const tds = derniere.tr.querySelectorAll("td");
      tds[4].textContent = remarque;
    } else {
      // Si une seule occurrence, mettre "Aucune donnée" sur cette ligne
      const tds = liste[0].tr.querySelectorAll("td");
      tds[4].textContent = "Aucune donnée";
    }
  });
}

function calculerProchain() {
  const lignes = Array.from(document.querySelectorAll("#table-historique tr"));

  // Lire le plan d’entretien depuis le tableau #table-plan
  const plan = {};
  const planRows = document.querySelectorAll("#table-plan tbody tr");
  planRows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const intervention = cells[1]?.textContent.trim(); // colonne 2 = intervention
    const kmStr = cells[2]?.textContent.replace(/\s/g, ''); // colonne 3 = périodicité km
    const km = parseInt(kmStr, 10);

    // On ne garde que les interventions avec une périodicité valide (> 0)
    if (intervention && !isNaN(km) && km > 0) {
      plan[intervention] = km;
    }
  });

  // Appliquer la périodicité à chaque ligne historique
  lignes.forEach(tr => {
    const tds = tr.querySelectorAll("td");
    const intervention = tds[3]?.textContent.trim(); // colonne 4 = intervention
    const kmStr = tds[2]?.textContent.replace(/\s/g, ''); // colonne 3 = kilométrage
    const km = parseInt(kmStr, 10);

    const periodicite = plan[intervention];
    
console.log(`→ Intervention: [${intervention}], Kilométrage: ${km}, Périodicité: ${periodicite}`);

    if (!isNaN(km) && periodicite) {
      // Calcul du prochain kilométrage, arrondi au millier supérieur
      const prochainKm = Math.round((km + periodicite) / 10000) * 10000;
      tds[5].textContent = `${prochainKm.toLocaleString("fr-FR")} km`;
    } else {
      tds[5].textContent = ''; // vide si aucune périodicité connue
    }
  });
}
