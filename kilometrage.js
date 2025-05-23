  document.addEventListener('DOMContentLoaded', async () => {
    // Configuration Supabase (à remplacer par vos variables d'environnement)
    const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8'; // À générer dans Supabase Dashboard
    
    // Initialisation du client Supabase
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // Fonction pour charger et afficher les kilométrages
    async function loadKilometrages() {
      try {
        // Récupération des données avec tri par date décroissante
        const { data, error } = await supabase
          .from('kilometrage')
          .select('id, date, kilometres')
          .order('date', { ascending: false });

        if (error) throw error;

        const tbody = document.getElementById('table-kilometrages');
        tbody.innerHTML = ''; // Réinitialisation du contenu

        // Formatage et affichage des données
        data.forEach(record => {
          const row = document.createElement('tr');
          
          // Cellule ID (cachée)
          const idCell = document.createElement('td');
          idCell.className = 'hidden';
          idCell.textContent = record.id;
          
          // Cellule Date (format français)
          const dateCell = document.createElement('td');
          const formattedDate = new Date(record.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          dateCell.textContent = formattedDate;
          
          // Cellule Kilométrage (format français avec espace comme séparateur)
          const kmCell = document.createElement('td');
          kmCell.textContent = new Intl.NumberFormat('fr-FR').format(record.kilometres);
          
          // Construction de la ligne
          row.append(idCell, dateCell, kmCell);
          tbody.appendChild(row);
        });

      } catch (error) {
        console.error('Erreur de chargement:', error);
        // Vous pourriez ajouter ici un message d'erreur pour l'utilisateur
      }
    }

  
