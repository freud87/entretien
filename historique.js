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
  const tbody = document.getElementById("table-historique");
  const lignes = Array.from(tbody.querySelectorAll("tr"));

  // Dictionnaire pour garder trace de la dernière date/km par type d'intervention
  const dernieresInterventions = {};

  lignes.forEach((tr) => {
    const tds = tr.querySelectorAll("td");

    const dateStr = tds[1].textContent;
    const kmStr = tds[2].textContent.replace(/\s/g, '');
    const intervention = tds[3].textContent.trim();

    const kilometrage = parseInt(kmStr, 10);
    const dateParts = dateStr.split("/");
    const dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // YYYY-MM-DD

    let remarque = "";

    if (dernieresInterventions[intervention]) {
      const derniereDate = dernieresInterventions[intervention].date;
      const diffMois = Math.round((dateObj - derniereDate) / (1000 * 60 * 60 * 24 * 30.44));

      if (diffMois > 0) {
        const diffKm = isNaN(kilometrage) || isNaN(derniereInterventions[intervention].kilometrage)
          ? null
          : kilometrage - dernieresInterventions[intervention].kilometrage;

        if (diffKm !== null && diffKm > 0) {
          remarque = `${diffKm} km et ${diffMois} mois`;
        } else {
          remarque = `${diffMois} mois`;
        }
      } else {
        remarque = "Aucune donnée";
      }

      // On met à jour la remarque uniquement sur cette ligne
      tds[4].textContent = remarque;
    } else {
      // Première fois qu'on voit ce type → aucune donnée
      tds[4].textContent = "Aucune donnée";
    }

    // On sauvegarde les données actuelles comme "dernière"
    dernieresInterventions[intervention] = {
      date: dateObj,
      kilometrage,
    };
  });
}
