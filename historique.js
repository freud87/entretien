document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase (à déplacer dans des variables d'environnement en production)
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  
  // Initialisation du client Supabase
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  async function chargerKilometrages() {
    try {
      // Vérification de l'élément cible
      const tbody = document.getElementById('table-historique');
      if (!tbody) {
        console.error("Élément #table-historique introuvable !");
        return;
      }

      // Chargement de l'historique
      const { data: historiqueData, error: historiqueError } = await supabase
        .from('historique')
        .select('id, date, kilometrage, intervention')
        .order('date', { ascending: false });

      if (historiqueError) {
        throw new Error(`Erreur historique: ${historiqueError.message}`);
      }

      // Chargement du plan d'entretien
      const { data: planData, error: planError } = await supabase
        .from('plan')
        .select('intervention, cycle_km');

      if (planError) {
        throw new Error(`Erreur plan: ${planError.message}`);
      }

      // Récupération de la moyenne kilométrique
      const moyenneElement = document.getElementById('moyenne');
      const moyenne = moyenneElement ? parseFloat(moyenneElement.value) : 0;
      if (isNaN(moyenne) || moyenne <= 0) {
        console.warn("Valeur de moyenne invalide, utilisation de 30 par défaut");
        moyenne = 30; // Valeur par défaut raisonnable
      }

      // Construction du tableau
      tbody.innerHTML = '';

      if (!historiqueData?.length) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6">Aucune donnée disponible</td>';
        tbody.appendChild(row);
        return;
      }

      historiqueData.forEach(item => {
        const row = document.createElement('tr');
        
        // Colonne ID (cachée)
        const tdId = document.createElement('td');
        tdId.textContent = item.id;
        tdId.classList.add('hidden');
        row.appendChild(tdId);

        // Colonne Date
        const tdDate = document.createElement('td');
        tdDate.textContent = new Date(item.date).toLocaleDateString('fr-FR');
        row.appendChild(tdDate);

        // Colonne Kilométrage
        const tdKm = document.createElement('td');
        tdKm.textContent = item.kilometrage ?? 'N/A';
        row.appendChild(tdKm);

        // Colonne Intervention
        const tdIntervention = document.createElement('td');
        tdIntervention.textContent = item.intervention ?? 'Non spécifiée';
        row.appendChild(tdIntervention);

        // Colonne Prochain kilométrage
        const tdProchainkms = document.createElement('td');
        // Colonne Prochaine date
        const tdProchaindate = document.createElement('td');

        if (item.kilometrage && !isNaN(item.kilometrage)) {
          const planItem = planData?.find(p => p.intervention === item.intervention);
          
          if (planItem) {
            // Calcul prochain kilométrage
            const prochainKms = Number(item.kilometrage) + Number(planItem.cycle_km);
            tdProchainkms.textContent = prochainKms;

            // Calcul prochaine date
            if (moyenne > 0) {
              const date = new Date(item.date);
              const joursAjoutes = Math.round((planItem.cycle_km / moyenne) * 30);
              date.setDate(date.getDate() + joursAjoutes);
              tdProchaindate.textContent = date.toLocaleDateString('fr-FR');
            } else {
              tdProchaindate.textContent = 'N/A';
            }
          } else {
            tdProchainkms.textContent = 'Cycle inconnu';
            tdProchaindate.textContent = 'N/A';
          }
        } else {
          tdProchainkms.textContent = 'Km invalide';
          tdProchaindate.textContent = 'N/A';
        }

        row.appendChild(tdProchainkms);
        row.appendChild(tdProchaindate);

        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`);
      
      // Afficher un message d'erreur dans le tableau
      const tbody = document.getElementById('table-historique');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="error">${error.message}</td></tr>`;
      }
    }
  }

  // Lancement du chargement
  await chargerKilometrages();
});
