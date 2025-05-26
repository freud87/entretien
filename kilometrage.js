document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  // Initialisation du client Supabase
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  // Fonction pour charger les kilométrages
  async function loadKilometrages() {
    try {
      const { data, error } = await supabase
        .from('kilometrage')
        .select('id, date, kilometrage')
        .order('date', { ascending: false });
      if (error) throw error;
      const tbody = document.getElementById('table-kilometrages');
      tbody.innerHTML = '';
      data.forEach(record => {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        idCell.className = 'hidden';
        idCell.textContent = record.id
          const dateCell = document.createElement('td');
        const formattedDate = new Date(record.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        dateCell.textContent = formattedDate;

        const kmCell = document.createElement('td');
        kmCell.textContent = new Intl.NumberFormat('fr-FR').format(record.kilometrage);

        row.append(idCell, dateCell, kmCell);
        tbody.appendChild(row);
      });
      calculerMoyenneKms();
    } catch (error) {
      console.error('Erreur de chargement:', error);
    }
  }

  // ✅ Appel initial
  await loadKilometrages();
const btnAddKm = document.getElementById('btn-add-km');
const btnKm = document.getElementById('btn-km');
const btnSaveKm = document.getElementById('btn-save-km');
const tbodyKm = document.getElementById('table-kilometrages');
// Sélection du bouton Annuler
const btnCancelKm = document.getElementById('btn-cncl-km');
// Gestion du clic sur Annuler
btnCancelKm.addEventListener('click', () => {
  // Supprime la ligne temporaire si elle existe
  const newRow = document.getElementById('new-km-row');
  if (newRow) {
    newRow.remove();
  }

  // Optionnel : masquer ou réinitialiser les champs
  const inputDate = document.getElementById('new-date');
  const inputKm = document.getElementById('new-km');
  if (inputDate) inputDate.value = '';
  if (inputKm) inputKm.value = '';

  // Remettre le bouton "+" visible/actif
  ////const btnKm = document.getElementById('btn-km'); // ou 'btn-add-km' selon ton HTML
  //if (btnKm) btnKm.style.display = 'inline';
  btnKm.style.display = 'none';
});
  
// Gestion du clic sur +
btnAddKm.addEventListener('click', () => {
  // Empêche l’ajout de plusieurs lignes
  if (document.getElementById('new-km-row')) return;

  const newRow = document.createElement('tr');
  newRow.id = 'new-km-row';
  newRow.style.backgroundColor = '#fff8e1'; // Couleur différente pour édition

  newRow.innerHTML = `
    <td class="hidden">-</td>
    <td><input type="text" id="new-date" placeholder="jj/mm/aaaa" style="width:100%; padding:4px;"></td>
    <td><input type="number" id="new-km" placeholder="km" style="width:100%; padding:4px;"></td>
  `;

  tbodyKm.insertBefore(newRow, tbodyKm.firstChild);
  btnKm.style.display = 'inline';
});

// Gestion du clic sur 💾
btnSaveKm.addEventListener('click', async () => {
  const dateStr = document.getElementById('new-date').value;
  const kmStr = document.getElementById('new-km').value;

  if (!dateStr || !kmStr) {
    alert('Veuillez remplir la date et le kilométrage.');
    return;
  }

  // Conversion jj/mm/aaaa → aaaa-mm-jj
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    alert('Format de date incorrect. Utilisez jj/mm/aaaa.');
    return;
  }

  const [jj, mm, aaaa] = parts;
  const formattedDate = `${aaaa}-${mm}-${jj}`;

  const kilometrage = parseInt(kmStr);
  if (isNaN(kilometrage)) {
    alert('Kilométrage invalide.');
    return;
  }

  // Envoi vers Supabase
  const { error } = await supabase.from('kilometrage').insert({ date: formattedDate, kilometrage });

  if (error) {
    console.error('Erreur Supabase :', error);
    alert("Erreur lors de l'ajout.");
    return;
  }

  // Nettoyage UI
  document.getElementById('new-km-row')?.remove();
  btnKm.style.display = 'none';
  await loadKilometrages();
});


});

function calculerMoyenneKms() {
  const tbody = document.getElementById('table-kilometrages');
  const rows = tbody.querySelectorAll('tr');

  let donnees = [];

  rows.forEach(row => {
    const tds = row.querySelectorAll('td');
    if (tds.length >= 3) {
      const dateText = tds[1].textContent.trim();
      const kmText = tds[2].textContent.trim();

      // Parser la date au format jj/mm/aaaa
      const [jour, mois, annee] = dateText.split('/');
      const date = new Date(annee, mois - 1, jour); // Mois commence à 0
      const km = parseInt(kmText.replace(/\s+/g, ''), 10);

      if (!isNaN(date.getTime()) && !isNaN(km)) {
        donnees.push({ date, km });
      }
    }
  });

  if (donnees.length < 2) {
    document.getElementById('moyenne').textContent = 'Données insuffisantes';
    return;
  }

  // Trier les données par date
  donnees.sort((a, b) => a.date - b.date);

  const premiere = donnees[0];
  const derniere = donnees[derniere.length - 1];

  // Calcul de la différence en mois
  const diffAnnees = derniere.date.getFullYear() - premiere.date.getFullYear();
  const diffMois = (derniere.date.getMonth() - premiere.date.getMonth()) + diffAnnees * 12;
  const differenceMois = diffMois + (derniere.date.getDate() >= premiere.date.getDate() ? 0 : -1);

  if (differenceMois === 0) {
    document.getElementById('moyenne').textContent = 'Période trop courte';
    return;
  }

  const differenceKms = derniere.km - premiere.km;
  const moyenne = Math.round(differenceKms / differenceMois);

  document.getElementById('moyenne').textContent = `${moyenne}`;
}
