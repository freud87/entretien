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

        const tdRemarque = document.createElement('td');
        tdRemarque.textContent = '';

        const tdProchain = document.createElement('td');
        tdProchain.textContent = '';

        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        row.appendChild(tdIntervention);
        row.appendChild(tdRemarque);
        row.appendChild(tdProchain);

        tbody.appendChild(row);
      });

      calculerPeriodes();
      await calculerProchain();
      calculerProchainEntretien(); // <== ajout ici

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

async function calculerProchain() {
  try {
    const tbody = document.getElementById("table-historique");
    const lignes = Array.from(tbody.querySelectorAll("tr"));

    // Dictionnaire pour stocker le dernier kilométrage par intervention
    const derniersKm = {};

    // 1. Trouver le dernier kilométrage pour chaque type d'intervention
    lignes.forEach((tr) => {
      const tds = tr.querySelectorAll("td");

      const intervention = tds[3].textContent.trim(); // Colonne Intervention
      const kmText = tds[2].textContent.replace(/\s/g, ''); // Colonne Kilométrage
      const kilometrage = parseInt(kmText, 10);

      if (!isNaN(kilometrage)) {
        if (!derniersKm[intervention] || kilometrage > derniersKm[intervention]) {
          derniersKm[intervention] = kilometrage;
        }
      }
    });

    // 2. Récupérer les cycles kilométriques depuis la table Plan
    const { data: planData, error } = await supabase
      .from('plan')
      .select('intervention, cycle_km');

    if (error) throw error;

    // Créer un dictionnaire rapide pour accéder aux cycles
    const cycles = {};
    planData.forEach(item => {
      cycles[item.intervention] = item.cycle_km;
    });

    // 3. Mettre à jour la colonne "Prochain" dans chaque ligne
    lignes.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      const intervention = tds[3].textContent.trim(); // Intervention
      const tdProchain = tds[5]; // Prochain (6e colonne)

      const dernierKm = derniersKm[intervention];
      const cycleKm = cycles[intervention];

      if (dernierKm && cycleKm) {
        const prochainKm = dernierKm + cycleKm;
       // tdProchain.textContent = new Intl.NumberFormat('fr-FR').format(prochainKm);
        tdProchain.textContent = prochainKm;
      } else {
        tdProchain.textContent = "Aucune donnée";
      }
    });

  } catch (error) {
    console.error("Erreur lors du calcul du prochain kilométrage :", error);
  }
}

function calculerProchainEntretien() {
  const moyenne = parseInt(document.getElementById('moyenne')?.textContent || 0);
  if (!moyenne || moyenne <= 0) {
    console.warn("Moyenne invalide.");
    return;
  }

  const kmRows = Array.from(document.querySelectorAll('#table-kilometrages tr'));
  const derniersKm = kmRows.map(row => parseInt(row.children[2]?.textContent || 0)).filter(km => !isNaN(km));
  const kmActuel = Math.max(...derniersKm);

  const histoRows = Array.from(document.querySelectorAll('#table-historique tr'));

  let prochainEntretien = null;
  let kmCible = Infinity;

  histoRows.forEach(row => {
    const prochain = parseInt(row.children[5]?.textContent || 0);
    const intervention = row.children[3]?.textContent || '';
    const dateIntervStr = row.children[1]?.textContent || '';

    if (!isNaN(prochain) && prochain > kmActuel && prochain < kmCible) {
      kmCible = prochain;
      prochainEntretien = {
        intervention,
        kmProchain: prochain,
        dateIntervStr
      };
    }
  });

  if (!prochainEntretien) {
    console.log("Aucun entretien à prévoir au-dessus du kilométrage actuel.");
    return;
  }

  const { intervention, kmProchain, dateIntervStr } = prochainEntretien;
  const [jour, mois, annee] = dateIntervStr.split('/');
  const dateBase = new Date(`${annee}-${mois}-${jour}`);
  const ecartKm = kmProchain - kmActuel;
  const ecartMois = ecartKm / moyenne;

  const dateProchaine = new Date(dateBase);
  dateProchaine.setMonth(dateProchaine.getMonth() + ecartMois);

  const dateFormatee = dateProchaine.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const tbodyProchain = document.getElementById('table-prochain');
  tbodyProchain.innerHTML = '';

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${intervention}</td>
    <td>${kmProchain}</td>
    <td>${dateFormatee}</td>
  `;
  tbodyProchain.appendChild(row);
}
